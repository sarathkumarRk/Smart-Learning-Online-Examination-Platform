import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../../api/axios";

function CourseDetails() {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);

  const fetchCourse = async () => {
    try {
      setLoading(true);

      const response = await api.get(`/courses/${courseId}`);

      setCourse(response.data);
    } catch (error) {
      toast.error(
        error.response?.data?.detail || "Failed to load course details"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourse();
  }, [courseId]);

  const handleEnrollment = async () => {
    try {
      setEnrolling(true);

      await api.post("/enrollments/", {
        course_id: Number(courseId),
      });

      toast.success("Course enrollment successful!");

      navigate("/student/my-courses");
    } catch (error) {
      toast.error(
        error.response?.data?.detail || "Course enrollment failed"
      );
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-orange-600">Loading course details...</p>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-orange-600">Course not found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-orange-50 p-6">
      <div className="max-w-4xl mx-auto">

        <div className="bg-white rounded-xl shadow-md border border-orange-200 p-8">

          <h1 className="text-3xl font-bold text-orange-600 mb-4">
            {course.title}
          </h1>

          <p className="text-gray-600 leading-7 mb-6">
            {course.description}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

            <div className="bg-orange-50 p-5 rounded-lg">
              <p className="text-gray-500 text-sm">
                Course ID
              </p>
              <p className="text-orange-600 font-semibold mt-2">
                {course.id}
              </p>
            </div>

            <div className="bg-orange-50 p-5 rounded-lg">
              <p className="text-gray-500 text-sm">
                Category
              </p>
              <p className="text-orange-600 font-semibold mt-2">
                {course.category}
              </p>
            </div>

            <div className="bg-orange-50 p-5 rounded-lg">
              <p className="text-gray-500 text-sm">
                Duration
              </p>
              <p className="text-orange-600 font-semibold mt-2">
                {course.duration}
              </p>
            </div>

            <div className="bg-orange-50 p-5 rounded-lg">
              <p className="text-gray-500 text-sm">
                Course Status
              </p>
              <p className="text-orange-600 font-semibold mt-2">
                {course.is_published ? "Published" : "Unpublished"}
              </p>
            </div>

          </div>

          <button
            onClick={handleEnrollment}
            disabled={enrolling || !course.is_published}
            className="w-full mt-8 bg-orange-500 text-white p-3 rounded-lg hover:bg-orange-600 disabled:opacity-60"
          >
            {enrolling
              ? "Enrolling..."
              : "Enroll Now"}
          </button>

          <button
            onClick={() => navigate("/courses")}
            className="w-full mt-3 border border-orange-500 text-orange-600 p-3 rounded-lg hover:bg-orange-50"
          >
            Back to Courses
          </button>

        </div>
      </div>
    </div>
  );
}

export default CourseDetails;
