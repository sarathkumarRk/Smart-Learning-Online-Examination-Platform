import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import {
  RefreshCw,
  Users,
  BookOpen,
  GraduationCap,
  ClipboardList,
  TrendingUp,
  Award,
} from "lucide-react";
import { toast } from "react-toastify";
import api from "../../api/axios";

const CHART_COLORS = [
  "#ea580c",
  "#f97316",
  "#fb923c",
  "#fdba74",
  "#c2410c",
  "#9a3412",
];

function Analytics() {
  const [dashboard, setDashboard] = useState(null);
  const [courseAnalytics, setCourseAnalytics] = useState([]);
  const [assessmentAnalytics, setAssessmentAnalytics] = useState([]);
  const [topStudents, setTopStudents] = useState([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);

      const [
        dashboardResponse,
        coursesResponse,
        assessmentsResponse,
        studentsResponse,
      ] = await Promise.all([
        api.get("/analytics/dashboard"),
        api.get("/analytics/courses"),
        api.get("/analytics/assessments"),
        api.get("/analytics/top-students"),
      ]);

      setDashboard(dashboardResponse.data || {});

      setCourseAnalytics(
        Array.isArray(coursesResponse.data)
          ? coursesResponse.data
          : []
      );

      setAssessmentAnalytics(
        Array.isArray(assessmentsResponse.data)
          ? assessmentsResponse.data
          : []
      );

      setTopStudents(
        Array.isArray(studentsResponse.data)
          ? studentsResponse.data
          : []
      );
    } catch (error) {
      toast.error(
        error.response?.data?.detail ||
          "Failed to load analytics"
      );
    } finally {
      setLoading(false);
    }
  };

  const statistics = [
    {
      title: "Total Users",
      value: dashboard?.total_users ?? 0,
      icon: Users,
    },
    {
      title: "Total Courses",
      value: dashboard?.total_courses ?? 0,
      icon: BookOpen,
    },
    {
      title: "Total Enrollments",
      value: dashboard?.total_enrollments ?? 0,
      icon: GraduationCap,
    },
    {
      title: "Total Assessments",
      value: dashboard?.total_assessments ?? 0,
      icon: ClipboardList,
    },
  ];

  const getCourseName = (course) =>
    course.course_title ||
    course.title ||
    `Course ${course.course_id ?? course.id ?? ""}`;

  const getCourseEnrollments = (course) =>
    Number(
      course.total_enrollments ??
      course.enrollment_count ??
      course.enrollments ??
      0
    );

  const getAssessmentName = (assessment) =>
    assessment.assessment_title ||
    assessment.title ||
    `Assessment ${assessment.assessment_id ?? assessment.id ?? ""}`;

  const getAssessmentSubmissions = (assessment) =>
    Number(
      assessment.total_submissions ??
      assessment.submission_count ??
      assessment.submissions ??
      0
    );

  const courseChartData = courseAnalytics.map((course) => ({
    name: getCourseName(course),
    enrollments: getCourseEnrollments(course),
  }));

  const assessmentChartData = assessmentAnalytics.map(
    (assessment) => ({
      name: getAssessmentName(assessment),
      submissions: getAssessmentSubmissions(assessment),
    })
  );

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-orange-50">
        <div className="text-center">
          <RefreshCw className="mx-auto h-9 w-9 animate-spin text-orange-600" />
          <p className="mt-3 font-medium text-gray-600">
            Loading analytics...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-orange-50 px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl">

        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Platform Analytics
            </h1>

            <p className="mt-2 text-gray-600">
              Monitor users, courses, enrollments and assessment performance.
            </p>
          </div>

          <button
            onClick={fetchAnalytics}
            className="flex items-center justify-center gap-2 rounded-lg bg-orange-600 px-5 py-3 font-semibold text-white hover:bg-orange-700"
          >
            <RefreshCw size={18} />
            Refresh Analytics
          </button>
        </div>

        <div className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">

          {statistics.map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.title}
                className="rounded-xl border border-orange-100 bg-white p-6 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      {item.title}
                    </p>

                    <h2 className="mt-3 text-3xl font-bold text-gray-900">
                      {item.value}
                    </h2>
                  </div>

                  <div className="rounded-xl bg-orange-100 p-4 text-orange-600">
                    <Icon size={27} />
                  </div>
                </div>
              </div>
            );
          })}

        </div>

        <div className="mb-8 grid grid-cols-1 gap-6 xl:grid-cols-2">

          <div className="rounded-xl border border-orange-100 bg-white p-6 shadow-sm">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                Course Enrollment Analytics
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Enrollment count by course.
              </p>
            </div>

            {courseChartData.length === 0 ? (
              <div className="flex h-72 items-center justify-center text-gray-500">
                No course analytics available.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={courseChartData}
                  margin={{
                    top: 10,
                    right: 10,
                    left: 0,
                    bottom: 50,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />

                  <XAxis
                    dataKey="name"
                    angle={-25}
                    textAnchor="end"
                    interval={0}
                    height={75}
                    tick={{ fontSize: 11 }}
                  />

                  <YAxis allowDecimals={false} />

                  <Tooltip />

                  <Bar
                    dataKey="enrollments"
                    name="Enrollments"
                    fill="#ea580c"
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="rounded-xl border border-orange-100 bg-white p-6 shadow-sm">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                Assessment Analytics
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Student submissions by assessment.
              </p>
            </div>

            {assessmentChartData.length === 0 ? (
              <div className="flex h-72 items-center justify-center text-gray-500">
                No assessment analytics available.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={assessmentChartData}
                  margin={{
                    top: 10,
                    right: 10,
                    left: 0,
                    bottom: 50,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />

                  <XAxis
                    dataKey="name"
                    angle={-25}
                    textAnchor="end"
                    interval={0}
                    height={75}
                    tick={{ fontSize: 11 }}
                  />

                  <YAxis allowDecimals={false} />

                  <Tooltip />

                  <Bar
                    dataKey="submissions"
                    name="Submissions"
                    fill="#f97316"
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

        </div>

        <div className="mb-8 rounded-xl border border-orange-100 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900">
            Course Enrollment Distribution
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Compare enrollment distribution across courses.
          </p>

          {courseChartData.length === 0 ? (
            <div className="flex h-72 items-center justify-center text-gray-500">
              No course distribution data available.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={320}>
              <PieChart>
                <Pie
                  data={courseChartData}
                  dataKey="enrollments"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={110}
                  label
                >
                  {courseChartData.map((entry, index) => (
                    <Cell
                      key={`${entry.name}-${index}`}
                      fill={
                        CHART_COLORS[
                          index % CHART_COLORS.length
                        ]
                      }
                    />
                  ))}
                </Pie>

                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="rounded-xl border border-orange-100 bg-white p-6 shadow-sm">

          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-lg bg-orange-100 p-3 text-orange-600">
              <Award size={25} />
            </div>

            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Top Students
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Student performance ranking from Analytics Service.
              </p>
            </div>
          </div>

          {topStudents.length === 0 ? (
            <div className="py-10 text-center text-gray-500">
              No top student data available.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px] text-left">

                <thead>
                  <tr className="border-b border-gray-200 bg-orange-50">
                    <th className="px-4 py-4 text-sm font-semibold text-gray-700">
                      Rank
                    </th>

                    <th className="px-4 py-4 text-sm font-semibold text-gray-700">
                      Student
                    </th>

                    <th className="px-4 py-4 text-sm font-semibold text-gray-700">
                      Student ID
                    </th>

                    <th className="px-4 py-4 text-sm font-semibold text-gray-700">
                      Score
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {topStudents.map((student, index) => (
                    <tr
                      key={
                        student.student_id ??
                        student.id ??
                        index
                      }
                      className="border-b border-gray-100 hover:bg-orange-50"
                    >
                      <td className="px-4 py-4">
                        <span className="rounded-full bg-orange-100 px-3 py-1 text-sm font-bold text-orange-700">
                          #{index + 1}
                        </span>
                      </td>

                      <td className="px-4 py-4 text-sm font-semibold text-gray-800">
                        {student.name ||
                          student.student_name ||
                          "N/A"}
                      </td>

                      <td className="px-4 py-4 text-sm text-gray-600">
                        {student.student_id ??
                          student.id ??
                          "N/A"}
                      </td>

                      <td className="px-4 py-4 text-sm font-bold text-orange-700">
                        {student.average_score ??
                          student.total_score ??
                          student.score ??
                          "N/A"}
                      </td>
                    </tr>
                  ))}
                </tbody>

              </table>
            </div>
          )}

        </div>

        <div className="mt-6 rounded-lg border border-orange-200 bg-white p-4">
          <div className="flex items-start gap-3">
            <TrendingUp
              size={21}
              className="mt-0.5 text-orange-600"
            />

            <p className="text-sm leading-6 text-gray-600">
              Analytics are retrieved from the Analytics Service.
              The displayed charts and rankings depend on the data
              returned by the backend.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Analytics;
