import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import api from "../../api/axios";

function StudentDashboard() {
  const [courses, setCourses] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const fetchDashboard = async () => {
    try {
      setLoading(true);

      const [courseResponse, resultResponse] = await Promise.all([
        api.get("/enrollments/my-courses"),
        api.get("/submissions/my-results"),
      ]);

      setCourses(courseResponse.data);
      setResults(resultResponse.data);

    } catch (error) {
      toast.error(
        error.response?.data?.detail || "Failed to load dashboard"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const averageScore = results.length
    ? (
        results.reduce(
          (total, result) =>
            total + (
              result.total_marks > 0
                ? (result.score / result.total_marks) * 100
                : 0
            ),
          0
        ) / results.length
      ).toFixed(1)
    : 0;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-orange-600 text-lg">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-orange-50 p-6">

      <div className="max-w-7xl mx-auto">

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-orange-600">
            Student Dashboard
          </h1>

          <p className="text-gray-600 mt-2">
            Welcome back, {user.name || "Student"}!
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">

          <div className="bg-white p-6 rounded-xl shadow border border-orange-200">
            <h3 className="text-gray-500">Enrolled Courses</h3>
            <p className="text-3xl font-bold text-orange-600 mt-2">
              {courses.length}
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow border border-orange-200">
            <h3 className="text-gray-500">Total Submissions</h3>
            <p className="text-3xl font-bold text-orange-600 mt-2">
              {results.length}
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow border border-orange-200">
            <h3 className="text-gray-500">Average Score</h3>
            <p className="text-3xl font-bold text-orange-600 mt-2">
              {averageScore}%
            </p>
          </div>

        </div>

        <div className="bg-white p-6 rounded-xl shadow border border-orange-200 mb-8">

          <h2 className="text-xl font-bold text-orange-600 mb-5">
            My Enrolled Courses
          </h2>

          {courses.length === 0 ? (
            <p className="text-gray-500">
              You have not enrolled in any courses yet.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">

              {courses.map((course) => (
                <div
                  key={course.id}
                  className="border border-orange-200 rounded-lg p-5"
                >
                  <h3 className="text-lg font-bold text-gray-800">
                    {course.title}
                  </h3>

                  <p className="text-gray-600 mt-2">
                    {course.description}
                  </p>

                  <p className="text-sm text-orange-600 mt-3">
                    Category: {course.category}
                  </p>

                  <p className="text-sm text-gray-500 mt-2">
                    Duration: {course.duration}
                  </p>

                  <span className="inline-block mt-3 px-3 py-1 rounded-full bg-orange-100 text-orange-700 text-sm">
                    {course.enrollment_status}
                  </span>
                </div>
              ))}

            </div>
          )}

        </div>

        <div className="bg-white p-6 rounded-xl shadow border border-orange-200">

          <h2 className="text-xl font-bold text-orange-600 mb-5">
            My Assessment Results
          </h2>

          {results.length === 0 ? (
            <p className="text-gray-500">
              No assessment results available.
            </p>
          ) : (
            <div className="overflow-x-auto">

              <table className="w-full text-left">

                <thead>
                  <tr className="border-b border-orange-200 text-orange-700">
                    <th className="p-3">Assessment ID</th>
                    <th className="p-3">Score</th>
                    <th className="p-3">Total Marks</th>
                    <th className="p-3">Percentage</th>
                    <th className="p-3">Submitted At</th>
                  </tr>
                </thead>

                <tbody>
                  {results.map((result) => (
                    <tr
                      key={result.id}
                      className="border-b border-gray-100"
                    >
                      <td className="p-3">
                        {result.assessment_id}
                      </td>

                      <td className="p-3">
                        {result.score}
                      </td>

                      <td className="p-3">
                        {result.total_marks}
                      </td>

                      <td className="p-3 text-orange-600 font-semibold">
                        {result.total_marks > 0
                          ? `${(
                              (result.score / result.total_marks) * 100
                            ).toFixed(1)}%`
                          : "N/A"}
                      </td>

                      <td className="p-3 text-sm">
                        {new Date(result.submitted_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>

              </table>

            </div>
          )}

        </div>

      </div>

    </div>
  );
}

export default StudentDashboard;
