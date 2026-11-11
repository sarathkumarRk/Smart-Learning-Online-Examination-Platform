import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import api from "../../api/axios";
import { useNavigate } from "react-router-dom";

function CourseListing() {
  const navigate = useNavigate();

  const [courses, setCourses] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchCourses = async () => {
    try {
      setLoading(true);

      const response = await api.get("/courses/");

      setCourses(response.data);
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

  const categories = [
    ...new Set(courses.map((course) => course.category).filter(Boolean)),
  ];

  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      course.title?.toLowerCase().includes(search.toLowerCase()) ||
      course.description?.toLowerCase().includes(search.toLowerCase());

    const matchesCategory =
      !category || course.category === category;

    return matchesSearch && matchesCategory;
  });

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
            Explore Courses
          </h1>

          <p className="text-gray-600 mt-2">
            Discover courses and improve your skills.
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl shadow border border-orange-200 mb-8">

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            <input
              type="text"
              placeholder="Search courses..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full p-3 border border-orange-300 rounded-lg focus:outline-none focus:border-orange-500"
            />

            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full p-3 border border-orange-300 rounded-lg focus:outline-none focus:border-orange-500"
            >
              <option value="">All Categories</option>

              {categories.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}

            </select>

          </div>

        </div>

        <div className="flex justify-between items-center mb-5">
          <h2 className="text-xl font-bold text-orange-600">
            Available Courses
          </h2>

          <span className="text-gray-600">
            {filteredCourses.length} Courses
          </span>
        </div>

        {filteredCourses.length === 0 ? (
          <div className="bg-white p-10 rounded-xl shadow text-center">
            <p className="text-gray-500">
              No courses found.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

            {filteredCourses.map((course) => (
              <div
                key={course.id}
                className="bg-white rounded-xl shadow border border-orange-200 p-6"
              >

                <h3 className="text-xl font-bold text-gray-800 mb-3">
                  {course.title}
                </h3>

                <p className="text-gray-600 mb-4">
                  {course.description}
                </p>

                <div className="space-y-2 text-sm">

                  <p className="text-orange-600">
                    Category: {course.category}
                  </p>

                  <p className="text-gray-600">
                    Duration: {course.duration}
                  </p>

                </div>

                <button
                  onClick={() =>
                    navigate(`/courses/${course.id}`)
                  }
                  className="w-full mt-5 bg-orange-500 text-white p-3 rounded-lg hover:bg-orange-600"
                >
                  View Course
                </button>

              </div>
            ))}

          </div>
        )}

      </div>
    </div>
  );
}

export default CourseListing;
