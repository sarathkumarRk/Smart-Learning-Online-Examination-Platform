import { useEffect, useState } from "react";
import {
  Users,
  BookOpen,
  GraduationCap,
  ClipboardList,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";
import { toast } from "react-toastify";
import api from "../../api/axios";

function AdminDashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);

      const response = await api.get("/analytics/dashboard");

      setDashboard(response.data);
    } catch (error) {
      toast.error(
        error.response?.data?.detail ||
          "Failed to load dashboard"
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
      description: "Registered platform users",
    },
    {
      title: "Total Courses",
      value: dashboard?.total_courses ?? 0,
      icon: BookOpen,
      description: "Available platform courses",
    },
    {
      title: "Total Enrollments",
      value: dashboard?.total_enrollments ?? 0,
      icon: GraduationCap,
      description: "Student course enrollments",
    },
    {
      title: "Total Assessments",
      value: dashboard?.total_assessments ?? 0,
      icon: ClipboardList,
      description: "Platform assessments",
    },
  ];

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-orange-50">
        <div className="text-center">
          <RefreshCw className="mx-auto h-9 w-9 animate-spin text-orange-600" />
          <p className="mt-3 font-medium text-gray-600">
            Loading admin dashboard...
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
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-orange-100 p-3 text-orange-600">
                <ShieldCheck size={28} />
              </div>

              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Admin Dashboard
                </h1>

                <p className="mt-1 text-gray-600">
                  Monitor and manage your learning platform.
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={fetchDashboard}
            className="flex items-center justify-center gap-2 rounded-lg bg-orange-600 px-5 py-3 font-semibold text-white transition hover:bg-orange-700"
          >
            <RefreshCw size={18} />
            Refresh Dashboard
          </button>
        </div>

        <div className="mb-8 rounded-xl border border-orange-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900">
            Welcome, Administrator!
          </h2>

          <p className="mt-2 leading-7 text-gray-600">
            Manage users, courses and platform activities from
            this dashboard. Review the statistics below to
            understand the current platform status.
          </p>
        </div>

        <div className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">

          {statistics.map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.title}
                className="rounded-xl border border-orange-100 bg-white p-6 shadow-sm transition hover:shadow-md"
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

                <p className="mt-4 text-sm text-gray-500">
                  {item.description}
                </p>
              </div>
            );
          })}

        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

          <div className="rounded-xl border border-orange-100 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900">
              Platform Management
            </h2>

            <p className="mt-2 text-sm leading-6 text-gray-600">
              Use the administration pages to manage registered
              users, review courses and monitor platform analytics.
            </p>

            <div className="mt-5 space-y-3">
              <div className="flex items-center gap-3 rounded-lg bg-orange-50 p-4">
                <Users className="text-orange-600" size={22} />

                <div>
                  <p className="font-semibold text-gray-800">
                    User Management
                  </p>

                  <p className="text-sm text-gray-500">
                    View registered platform users.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-lg bg-orange-50 p-4">
                <BookOpen className="text-orange-600" size={22} />

                <div>
                  <p className="font-semibold text-gray-800">
                    Course Management
                  </p>

                  <p className="text-sm text-gray-500">
                    Review courses created by instructors.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-orange-100 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900">
              Dashboard Summary
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              Current platform statistics.
            </p>

            <div className="mt-5 space-y-4">

              {statistics.map((item) => (
                <div
                  key={item.title}
                  className="flex items-center justify-between border-b border-gray-100 pb-3 last:border-0"
                >
                  <span className="text-sm font-medium text-gray-600">
                    {item.title}
                  </span>

                  <span className="font-bold text-orange-700">
                    {item.value}
                  </span>
                </div>
              ))}

            </div>

            <p className="mt-4 text-xs text-gray-400">
              Statistics are loaded from the Analytics Service.
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}

export default AdminDashboard;
