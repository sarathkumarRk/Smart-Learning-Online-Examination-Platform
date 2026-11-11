import { useEffect, useMemo, useState } from "react";
import {
  BookOpen,
  Search,
  RefreshCw,
  GraduationCap,
  Clock,
  Layers,
  Eye,
  EyeOff,
} from "lucide-react";
import { toast } from "react-toastify";
import api from "../../api/axios";

function ManageCourses() {
  const [courses, setCourses] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);

      const response = await api.get("/courses/all");

      setCourses(
        Array.isArray(response.data) ? response.data : []
      );
    } catch (error) {
      toast.error(
        error.response?.data?.detail ||
          "Failed to load courses"
      );
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    ...new Set(
      courses
        .map((course) => course.category)
        .filter(Boolean)
    ),
  ];

  const filteredCourses = useMemo(() => {
    return courses.filter((course) => {
      const matchesSearch =
        (course.title || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        (course.description || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        String(course.instructor_id || "").includes(searchTerm);

      const matchesCategory =
        categoryFilter === "ALL" ||
        course.category === categoryFilter;

      return matchesSearch && matchesCategory;
    });
  }, [courses, searchTerm, categoryFilter]);

  const publishedCount = courses.filter(
    (course) => course.is_published
  ).length;

  const unpublishedCount = courses.length - publishedCount;

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-orange-50">
        <div className="text-center">
          <RefreshCw className="mx-auto h-8 w-8 animate-spin text-orange-600" />
          <p className="mt-3 font-medium text-gray-600">
            Loading courses...
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
              Manage Courses
            </h1>

            <p className="mt-2 text-gray-600">
              View and monitor all courses on the platform.
            </p>
          </div>

          <button
            onClick={fetchCourses}
            className="flex items-center justify-center gap-2 rounded-lg bg-orange-600 px-5 py-3 font-semibold text-white transition hover:bg-orange-700"
          >
            <RefreshCw size={18} />
            Refresh Courses
          </button>
        </div>

        <div className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-3">

          <div className="rounded-xl border border-orange-100 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Total Courses
                </p>

                <h2 className="mt-2 text-3xl font-bold text-gray-900">
                  {courses.length}
                </h2>
              </div>

              <div className="rounded-lg bg-orange-100 p-3 text-orange-600">
                <BookOpen size={26} />
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-orange-100 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Published Courses
                </p>

                <h2 className="mt-2 text-3xl font-bold text-green-600">
                  {publishedCount}
                </h2>
              </div>

              <div className="rounded-lg bg-green-100 p-3 text-green-600">
                <Eye size={26} />
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-orange-100 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Unpublished Courses
                </p>

                <h2 className="mt-2 text-3xl font-bold text-yellow-600">
                  {unpublishedCount}
                </h2>
              </div>

              <div className="rounded-lg bg-yellow-100 p-3 text-yellow-600">
                <EyeOff size={26} />
              </div>
            </div>
          </div>

        </div>

        <div className="rounded-xl border border-orange-100 bg-white p-6 shadow-sm">

          <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

            <h2 className="text-xl font-bold text-gray-900">
              All Courses
            </h2>

            <div className="flex flex-col gap-3 sm:flex-row">

              <div className="flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2">
                <Search size={18} className="text-gray-400" />

                <input
                  type="text"
                  value={searchTerm}
                  onChange={(event) =>
                    setSearchTerm(event.target.value)
                  }
                  placeholder="Search courses..."
                  className="w-full outline-none sm:w-56"
                />
              </div>

              <select
                value={categoryFilter}
                onChange={(event) =>
                  setCategoryFilter(event.target.value)
                }
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 outline-none focus:border-orange-500"
              >
                <option value="ALL">All Categories</option>

                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>

            </div>
          </div>

          {filteredCourses.length === 0 ? (
            <div className="py-12 text-center">
              <BookOpen
                size={45}
                className="mx-auto text-orange-400"
              />

              <h3 className="mt-3 font-semibold text-gray-800">
                No Courses Found
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                No courses match your search or selected category.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">

              {filteredCourses.map((course) => (
                <div
                  key={course.id}
                  className="rounded-xl border border-orange-100 bg-white p-5 shadow-sm transition hover:shadow-md"
                >
                  <div className="mb-4 flex items-start justify-between gap-3">
                    <div className="rounded-lg bg-orange-100 p-3 text-orange-600">
                      <BookOpen size={24} />
                    </div>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        course.is_published
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {course.is_published
                        ? "Published"
                        : "Unpublished"}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-gray-900">
                    {course.title}
                  </h3>

                  <p className="mt-2 min-h-12 text-sm leading-6 text-gray-600">
                    {course.description ||
                      "No description available"}
                  </p>

                  <div className="mt-5 space-y-3 border-t border-gray-100 pt-4">

                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Layers
                        size={17}
                        className="text-orange-600"
                      />

                      <span>
                        Category: {course.category || "N/A"}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock
                        size={17}
                        className="text-orange-600"
                      />

                      <span>
                        Duration: {course.duration || "N/A"}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <GraduationCap
                        size={17}
                        className="text-orange-600"
                      />

                      <span>
                        Instructor ID: {course.instructor_id}
                      </span>
                    </div>

                    <div className="text-sm text-gray-500">
                      Course ID: #{course.id}
                    </div>

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

export default ManageCourses;
