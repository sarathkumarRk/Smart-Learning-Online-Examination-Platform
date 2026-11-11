import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import api from "../../api/axios";

function InstructorDashboard() {
  const [courses, setCourses] = useState([]);
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const fetchDashboard = async () => {
    try {
      setLoading(true);

      const [courseResponse, assessmentResponse] =
        await Promise.all([
          api.get("/courses/my-courses"),
          api.get("/assessments/my-assessments"),
        ]);

      setCourses(courseResponse.data);
      setAssessments(assessmentResponse.data);

    } catch (error) {
      toast.error(
        error.response?.data?.detail ||
        "Failed to load instructor dashboard"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-orange-600 text-lg">
          Loading dashboard...
        </p>
      </div>
    );
  }

  const publishedCourses = courses.filter(
    (course) => course.is_published
  ).length;

  const publishedAssessments = assessments.filter(
    (assessment) => assessment.is_published
  ).length;

  return (
    <div className="min-h-screen bg-orange-50 p-6">
      <div className="max-w-7xl mx-auto">

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-orange-600">
            Instructor Dashboard
          </h1>

          <p className="text-gray-600 mt-2">
            Welcome back, {user.name || "Instructor"}!
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">

          <div className="bg-white p-6 rounded-xl shadow border border-orange-200">
            <p className="text-gray-500">Total Courses</p>
            <h2 className="text-3xl font-bold text-orange-600 mt-2">
              {courses.length}
            </h2>
          </div>

          <div className="bg-white p-6 rounded-xl shadow border border-orange-200">
            <p className="text-gray-500">Published Courses</p>
            <h2 className="text-3xl font-bold text-orange-600 mt-2">
              {publishedCourses}
            </h2>
          </div>

          <div className="bg-white p-6 rounded-xl shadow border border-orange-200">
            <p className="text-gray-500">Total Assessments</p>
            <h2 className="text-3xl font-bold text-orange-600 mt-2">
              {assessments.length}
            </h2>
          </div>

        </div>

        <div className="bg-white p-6 rounded-xl shadow border border-orange-200 mb-8">

          <h2 className="text-xl font-bold text-orange-600 mb-5">
            My Courses
          </h2>

          {courses.length === 0 ? (
            <p className="text-gray-500">
              You have not created any courses yet.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">

                <thead>
                  <tr className="bg-orange-50 text-orange-700">
                    <th className="p-3">Course ID</th>
                    <th className="p-3">Title</th>
                    <th className="p-3">Category</th>
                    <th className="p-3">Duration</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>

                <tbody>
                  {courses.map((course) => (
                    <tr
                      key={course.id}
                      className="border-b border-orange-100"
                    >
                      <td className="p-3">{course.id}</td>
                      <td className="p-3">{course.title}</td>
                      <td className="p-3">{course.category}</td>
                      <td className="p-3">{course.duration}</td>
                      <td className="p-3">
                        <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm">
                          {course.is_published
                            ? "Published"
                            : "Draft"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>

              </table>
            </div>
          )}

        </div>

        <div className="bg-white p-6 rounded-xl shadow border border-orange-200">

          <h2 className="text-xl font-bold text-orange-600 mb-5">
            My Assessments
          </h2>

          {assessments.length === 0 ? (
            <p className="text-gray-500">
              No assessments created yet.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">

              {assessments.map((assessment) => (
                <div
                  key={assessment.id}
                  className="border border-orange-200 rounded-lg p-5"
                >
                  <h3 className="text-lg font-bold text-gray-800">
                    {assessment.title}
                  </h3>

                  <p className="text-gray-600 mt-2">
                    {assessment.description}
                  </p>

                  <p className="text-sm text-orange-600 mt-3">
                    Duration: {assessment.duration_minutes} minutes
                  </p>

                  <p className="text-sm text-gray-600 mt-2">
                    Total Marks: {assessment.total_marks}
                  </p>

                  <span className="inline-block mt-3 bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm">
                    {assessment.is_published
                      ? "Published"
                      : "Draft"}
                  </span>
                </div>
              ))}

            </div>
          )}

        </div>

      </div>
    </div>
  );
}

export default InstructorDashboard;
