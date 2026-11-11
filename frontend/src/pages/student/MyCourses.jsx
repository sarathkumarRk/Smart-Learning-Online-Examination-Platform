
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../../api/axios";

function MyCourses() {
  const navigate = useNavigate();

  const [courses, setCourses] = useState([]);
  const [assessments, setAssessments] = useState({});
  const [loading, setLoading] = useState(true);
  const [assessmentLoading, setAssessmentLoading] = useState({});

  const fetchAssessments = async (courseId) => {
    try {
      setAssessmentLoading((prev) => ({
        ...prev,
        [courseId]: true
      }));

      const response = await api.get(
        `/assessments/course/${courseId}`
      );

      setAssessments((prev) => ({
        ...prev,
        [courseId]: Array.isArray(response.data)
          ? response.data
          : []
      }));
    } catch (error) {
      console.error(
        `Failed to load assessments for course ${courseId}:`,
        error.response?.data || error.message
      );

      setAssessments((prev) => ({
        ...prev,
        [courseId]: []
      }));
    } finally {
      setAssessmentLoading((prev) => ({
        ...prev,
        [courseId]: false
      }));
    }
  };

  const fetchCourses = async () => {
    try {
      setLoading(true);

      const response = await api.get("/enrollments/my-courses");

      const enrolledCourses = Array.isArray(response.data)
        ? response.data
        : [];

      setCourses(enrolledCourses);

      await Promise.all(
        enrolledCourses.map((course) =>
          fetchAssessments(course.id)
        )
      );
    } catch (error) {
      toast.error(
        error.response?.data?.detail || "Failed to load courses"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const formatDeadline = (deadline) => {
    if (!deadline) {
      return "No deadline";
    }

    const date = new Date(deadline);

    if (Number.isNaN(date.getTime())) {
      return deadline;
    }

    return date.toLocaleString();
  };

  const handleAttendTest = (assessmentId) => {
    navigate(`/student/assessment/${assessmentId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-orange-600 text-lg">
          Loading courses...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-orange-50 p-6">
      <div className="max-w-7xl mx-auto">

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-orange-600">
            My Courses
          </h1>

          <p className="text-gray-600 mt-2">
            View your enrolled courses and available assessments.
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md border border-orange-200">

          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-orange-600">
              Enrolled Courses
            </h2>

            <span className="bg-orange-100 text-orange-700 px-4 py-2 rounded-lg">
              Total: {courses.length}
            </span>
          </div>

          {courses.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">
                You have not enrolled in any courses yet.
              </p>
            </div>
          ) : (
            <div className="space-y-6">

              {courses.map((course) => (
                <div
                  key={course.id}
                  className="border border-orange-200 rounded-xl p-5 hover:shadow-md transition"
                >
                  <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-3">

                    <div>
                      <h3 className="text-xl font-bold text-gray-800 mb-3">
                        {course.title}
                      </h3>

                      <p className="text-gray-600 mb-4">
                        {course.description}
                      </p>

                      <div className="space-y-2 text-sm">
                        <p>
                          <span className="font-semibold text-gray-700">
                            Course ID:
                          </span>{" "}
                          {course.id}
                        </p>

                        <p>
                          <span className="font-semibold text-gray-700">
                            Category:
                          </span>{" "}
                          {course.category}
                        </p>

                        <p>
                          <span className="font-semibold text-gray-700">
                            Duration:
                          </span>{" "}
                          {course.duration} Weeks
                        </p>
                      </div>
                    </div>

                    <span className="inline-block bg-orange-100 text-orange-700 px-4 py-2 rounded-full text-sm font-medium">
                      {course.enrollment_status}
                    </span>

                  </div>

                  <div className="mt-6 border-t border-orange-100 pt-5">

                    <div className="flex justify-between items-center mb-4">
                      <h4 className="text-lg font-bold text-orange-600">
                        Published Assessments
                      </h4>

                      <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm">
                        {assessments[course.id]?.length || 0} Available
                      </span>
                    </div>

                    {assessmentLoading[course.id] ? (
                      <p className="text-gray-500 py-4">
                        Loading assessments...
                      </p>
                    ) : assessments[course.id]?.length > 0 ? (

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                        {assessments[course.id].map((assessment) => (
                          <div
                            key={assessment.id}
                            className="border border-orange-200 rounded-lg p-4 bg-orange-50"
                          >
                            <h5 className="font-bold text-gray-800 text-lg mb-2">
                              {assessment.title}
                            </h5>

                            <p className="text-gray-600 text-sm mb-4">
                              {assessment.description}
                            </p>

                            <div className="space-y-2 text-sm text-gray-700">

                              <p>
                                <span className="font-semibold">
                                  Assessment ID:
                                </span>{" "}
                                {assessment.id}
                              </p>

                              <p>
                                <span className="font-semibold">
                                  Duration:
                                </span>{" "}
                                {assessment.duration_minutes} Minutes
                              </p>

                              <p>
                                <span className="font-semibold">
                                  Total Marks:
                                </span>{" "}
                                {assessment.total_marks}
                              </p>

                              <p>
                                <span className="font-semibold">
                                  Deadline:
                                </span>{" "}
                                {formatDeadline(assessment.deadline)}
                              </p>

                            </div>

                            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">

                              <span className="inline-block bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                                Published
                              </span>

                              <button
                                type="button"
                                onClick={() =>
                                  handleAttendTest(assessment.id)
                                }
                                className="bg-orange-500 text-white px-5 py-2 rounded-lg font-medium hover:bg-orange-600 transition"
                              >
                                Attend Test
                              </button>

                            </div>
                          </div>
                        ))}

                      </div>

                    ) : (
                      <div className="bg-orange-50 rounded-lg p-5 text-center">
                        <p className="text-gray-500">
                          No published assessments available for this course.
                        </p>
                      </div>
                    )}

                  </div>

                </div>
              ))}

            </div>
          )}

        </div>
      </div>
    </div>
  );
}

export default MyCourses;
