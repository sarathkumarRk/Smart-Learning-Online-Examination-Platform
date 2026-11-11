import logging

from app.clients.auth_client import get_all_users
from app.clients.course_client import (
    get_all_courses,
    get_course_assessments
)
from app.clients.enrollment_client import get_all_enrollments
from app.clients.assessment_client import get_all_submissions


logger = logging.getLogger(__name__)


def get_analytics_data(token: str):
    logger.info("Analytics: Fetching users")
    users = get_all_users(token) or []
    logger.info("Analytics: Users fetched: %s", len(users))

    logger.info("Analytics: Fetching courses")
    courses = get_all_courses(token) or []
    logger.info("Analytics: Courses fetched: %s", len(courses))

    logger.info("Analytics: Fetching enrollments")
    enrollments = get_all_enrollments(token) or []
    logger.info("Analytics: Enrollments fetched: %s", len(enrollments))

    logger.info("Analytics: Fetching submissions")
    submissions = get_all_submissions(token) or []
    logger.info("Analytics: Submissions fetched: %s", len(submissions))

    return users, courses, enrollments, submissions


def get_assessments_by_course(courses, token):
    assessments_by_course = {}

    for course in courses:
        course_id = course.get("id")

        if course_id is None:
            continue

        logger.info(
            "Analytics: Fetching assessments for course %s",
            course_id
        )

        assessments = get_course_assessments(
            course_id,
            token
        ) or []

        logger.info(
            "Analytics: Assessments fetched for course %s: %s",
            course_id,
            len(assessments)
        )

        assessments_by_course[course_id] = assessments

    return assessments_by_course


def get_dashboard_analytics(token: str):
    users, courses, enrollments, submissions = get_analytics_data(token)

    assessments_by_course = get_assessments_by_course(
        courses,
        token
    )

    total_students = sum(
        1 for user in users
        if user.get("role") == "STUDENT"
    )

    total_courses = len(courses)

    active_enrollments = [
        enrollment
        for enrollment in enrollments
        if enrollment.get("status") == "ACTIVE"
    ]

    total_enrollments = len(active_enrollments)

    total_submissions = len(submissions)

    total_assessments = sum(
        len(assessments)
        for assessments in assessments_by_course.values()
    )

    expected_submissions = 0

    for course in courses:
        course_id = course.get("id")

        assessments = assessments_by_course.get(course_id, [])

        active_students = sum(
            1 for enrollment in active_enrollments
            if enrollment.get("course_id") == course_id
        )

        expected_submissions += (
            active_students * len(assessments)
        )

    completed_submissions = len({
        (
            submission.get("student_id"),
            submission.get("assessment_id")
        )
        for submission in submissions
        if submission.get("student_id") is not None
        and submission.get("assessment_id") is not None
    })

    completion_rate = 0

    if expected_submissions > 0:
        completion_rate = round(
            min(completed_submissions, expected_submissions)
            / expected_submissions * 100,
            2
        )

    percentages = []

    for submission in submissions:
        score = submission.get("score", 0)
        total_marks = submission.get("total_marks", 0)

        if total_marks and total_marks > 0:
            percentages.append(
                score / total_marks * 100
            )

    average_score = 0

    if percentages:
        average_score = round(
            sum(percentages) / len(percentages),
            2
        )

    return {
        "total_students": total_students,
        "total_courses": total_courses,
        "total_enrollments": total_enrollments,
        "total_assessments": total_assessments,
        "total_submissions": total_submissions,
        "assessment_completion_rate": completion_rate,
        "average_score_percentage": average_score
    }


def get_course_statistics(token: str):
    users, courses, enrollments, submissions = get_analytics_data(token)

    assessments_by_course = get_assessments_by_course(
        courses,
        token
    )

    result = []

    for course in courses:
        course_id = course.get("id")

        active_enrollments = [
            enrollment
            for enrollment in enrollments
            if enrollment.get("course_id") == course_id
            and enrollment.get("status") == "ACTIVE"
        ]

        assessments = assessments_by_course.get(course_id, [])

        assessment_ids = {
            assessment.get("id")
            for assessment in assessments
            if assessment.get("id") is not None
        }

        course_submissions = [
            submission
            for submission in submissions
            if submission.get("assessment_id") in assessment_ids
        ]

        expected = len(active_enrollments) * len(assessments)

        completed = len({
            (
                submission.get("student_id"),
                submission.get("assessment_id")
            )
            for submission in course_submissions
            if submission.get("student_id") is not None
        })

        completion_rate = 0

        if expected > 0:
            completion_rate = round(
                min(completed, expected) / expected * 100,
                2
            )

        result.append({
            "course_id": course_id,
            "course_title": course.get("title", "Untitled Course"),
            "total_enrollments": len(active_enrollments),
            "total_assessments": len(assessments),
            "total_submissions": len(course_submissions),
            "completion_rate": completion_rate
        })

    return result


def get_assessment_statistics(token: str):
    users, courses, enrollments, submissions = get_analytics_data(token)

    assessments_by_course = get_assessments_by_course(
        courses,
        token
    )

    result = []

    for course in courses:
        course_id = course.get("id")

        assessments = assessments_by_course.get(course_id, [])

        active_students = sum(
            1 for enrollment in enrollments
            if enrollment.get("course_id") == course_id
            and enrollment.get("status") == "ACTIVE"
        )

        for assessment in assessments:
            assessment_id = assessment.get("id")

            assessment_submissions = [
                submission
                for submission in submissions
                if submission.get("assessment_id") == assessment_id
            ]

            completed_students = len({
                submission.get("student_id")
                for submission in assessment_submissions
                if submission.get("student_id") is not None
            })

            completion_rate = 0

            if active_students > 0:
                completion_rate = round(
                    min(completed_students, active_students)
                    / active_students * 100,
                    2
                )

            result.append({
                "assessment_id": assessment_id,
                "assessment_title": assessment.get(
                    "title",
                    "Untitled Assessment"
                ),
                "course_id": course_id,
                "course_title": course.get(
                    "title",
                    "Untitled Course"
                ),
                "total_students": active_students,
                "completed_students": completed_students,
                "completion_rate": completion_rate
            })

    return result


def get_top_students(token: str):
    users, courses, enrollments, submissions = get_analytics_data(token)

    student_users = {
        user["id"]: user
        for user in users
        if user.get("role") == "STUDENT"
        and user.get("id") is not None
    }

    latest_submissions = {}

    for submission in submissions:
        student_id = submission.get("student_id")
        assessment_id = submission.get("assessment_id")

        if student_id is None or assessment_id is None:
            continue

        key = (student_id, assessment_id)

        previous = latest_submissions.get(key)

        if (
            previous is None
            or submission.get("id", 0) > previous.get("id", 0)
        ):
            latest_submissions[key] = submission

    student_scores = {}

    for submission in latest_submissions.values():
        student_id = submission["student_id"]

        if student_id not in student_users:
            continue

        score = submission.get("score", 0)
        total_marks = submission.get("total_marks", 0)

        if not total_marks or total_marks <= 0:
            continue

        percentage = score / total_marks * 100

        student_scores.setdefault(student_id, []).append(
            percentage
        )

    result = []

    for student_id, scores in student_scores.items():
        average = round(
            sum(scores) / len(scores),
            2
        )

        result.append({
            "student_id": student_id,
            "student_name": student_users[student_id].get(
                "name",
                "Unknown"
            ),
            "average_score_percentage": average,
            "completed_assessments": len(scores)
        })

    result.sort(
        key=lambda student: student["average_score_percentage"],
        reverse=True
    )

    return result[:5]