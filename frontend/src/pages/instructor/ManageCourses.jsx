
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import api from "../../api/axios";

function ManageCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const initialForm = {
    title: "",
    description: "",
    category: "",
    duration: ""
  };

  const [formData, setFormData] = useState(initialForm);

  const fetchCourses = async () => {
    try {
      setLoading(true);

      const response = await api.get("/courses/my-courses");

      setCourses(Array.isArray(response.data) ? response.data : []);
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

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const duration = Number(formData.duration);

    if (!Number.isInteger(duration) || duration <= 0) {
      toast.error("Duration must be a positive whole number of weeks.");
      return;
    }

    const payload = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      category: formData.category.trim(),
      duration
    };

    try {
      setSaving(true);

      if (editingId !== null) {
        await api.put(`/courses/${editingId}`, payload);
        toast.success("Course updated successfully!");
      } else {
        await api.post("/courses/", payload);
        toast.success("Course created successfully!");
      }

      setFormData(initialForm);
      setEditingId(null);

      await fetchCourses();
    } catch (error) {
      const detail = error.response?.data?.detail;

      toast.error(
        typeof detail === "string"
          ? detail
          : "Course operation failed. Please check the submitted details."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (course) => {
    setEditingId(course.id);

    setFormData({
      title: course.title || "",
      description: course.description || "",
      category: course.category || "",
      duration: String(course.duration ?? "")
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  const handleDelete = async (courseId) => {
    if (!window.confirm("Are you sure you want to delete this course?")) {
      return;
    }

    try {
      await api.delete(`/courses/${courseId}`);

      toast.success("Course deleted successfully!");

      if (editingId === courseId) {
        setEditingId(null);
        setFormData(initialForm);
      }

      await fetchCourses();
    } catch (error) {
      const detail = error.response?.data?.detail;

      toast.error(
        typeof detail === "string"
          ? detail
          : "Failed to delete course"
      );
    }
  };

  const handlePublish = async (course) => {
    try {
      const endpoint = course.is_published
        ? `/courses/${course.id}/unpublish`
        : `/courses/${course.id}/publish`;

      await api.patch(endpoint);

      toast.success(
        course.is_published
          ? "Course unpublished successfully!"
          : "Course published successfully!"
      );

      await fetchCourses();
    } catch (error) {
      const detail = error.response?.data?.detail;

      toast.error(
        typeof detail === "string"
          ? detail
          : "Failed to update course status"
      );
    }
  };

  const handleCancel = () => {
    setFormData(initialForm);
    setEditingId(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-orange-600">Loading courses...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-orange-50 p-6">
      <div className="max-w-7xl mx-auto">

        <h1 className="text-3xl font-bold text-orange-600 mb-2">
          Manage Courses
        </h1>

        <p className="text-gray-600 mb-8">
          Create and manage your courses.
        </p>

        <div className="bg-white p-6 rounded-xl shadow border border-orange-200 mb-8">

          <h2 className="text-xl font-bold text-orange-600 mb-5">
            {editingId !== null ? "Update Course" : "Create New Course"}
          </h2>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

              <div>
                <label className="block text-gray-700 mb-2">
                  Course Title
                </label>

                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Enter course title"
                  className="w-full p-3 border border-orange-300 rounded-lg focus:outline-none focus:border-orange-500"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2">
                  Category
                </label>

                <input
                  type="text"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  placeholder="Enter category"
                  className="w-full p-3 border border-orange-300 rounded-lg focus:outline-none focus:border-orange-500"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2">
                  Duration (Weeks)
                </label>

                <input
                  type="number"
                  name="duration"
                  value={formData.duration}
                  onChange={handleChange}
                  placeholder="Example: 12"
                  min="1"
                  step="1"
                  className="w-full p-3 border border-orange-300 rounded-lg focus:outline-none focus:border-orange-500"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2">
                  Description
                </label>

                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Enter course description"
                  rows="3"
                  className="w-full p-3 border border-orange-300 rounded-lg focus:outline-none focus:border-orange-500"
                  required
                />
              </div>

            </div>

            <div className="flex gap-3 mt-6">

              <button
                type="submit"
                disabled={saving}
                className="bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 disabled:opacity-60"
              >
                {saving
                  ? "Saving..."
                  : editingId !== null
                    ? "Update Course"
                    : "Create Course"}
              </button>

              {editingId !== null && (
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={saving}
                  className="border border-orange-500 text-orange-600 px-6 py-3 rounded-lg hover:bg-orange-50"
                >
                  Cancel
                </button>
              )}

            </div>
          </form>
        </div>

        <div className="bg-white p-6 rounded-xl shadow border border-orange-200">

          <h2 className="text-xl font-bold text-orange-600 mb-5">
            My Courses ({courses.length})
          </h2>

          {courses.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No courses created yet.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">

                <thead>
                  <tr className="bg-orange-50 text-orange-700">
                    <th className="p-3">ID</th>
                    <th className="p-3">Title</th>
                    <th className="p-3">Category</th>
                    <th className="p-3">Duration</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {courses.map((course) => (
                    <tr
                      key={course.id}
                      className="border-b border-orange-100"
                    >
                      <td className="p-3">{course.id}</td>

                      <td className="p-3 font-medium">
                        {course.title}
                      </td>

                      <td className="p-3">
                        {course.category}
                      </td>

                      <td className="p-3">
                        {course.duration} Weeks
                      </td>

                      <td className="p-3">
                        <span
                          className={`px-3 py-1 rounded-full text-sm ${
                            course.is_published
                              ? "bg-green-100 text-green-700"
                              : "bg-orange-100 text-orange-700"
                          }`}
                        >
                          {course.is_published ? "Published" : "Draft"}
                        </span>
                      </td>

                      <td className="p-3">
                        <div className="flex flex-wrap gap-2">

                          <button
                            type="button"
                            onClick={() => handleEdit(course)}
                            className="bg-orange-500 text-white px-3 py-2 rounded-lg hover:bg-orange-600"
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            onClick={() => handlePublish(course)}
                            className="border border-orange-500 text-orange-600 px-3 py-2 rounded-lg hover:bg-orange-50"
                          >
                            {course.is_published ? "Unpublish" : "Publish"}
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDelete(course.id)}
                            className="bg-red-500 text-white px-3 py-2 rounded-lg hover:bg-red-600"
                          >
                            Delete
                          </button>

                        </div>
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

export default ManageCourses;
