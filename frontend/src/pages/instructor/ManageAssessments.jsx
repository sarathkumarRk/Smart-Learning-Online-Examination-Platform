import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  ClipboardList,
  Clock,
  Award,
  BookOpen,
  Eye,
  EyeOff,
  Trash2,
  RefreshCw,
} from "lucide-react";
import { toast } from "react-toastify";
import api from "../../api/axios";

function ManageAssessments() {
  const navigate = useNavigate();

  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    fetchAssessments();
  }, []);

  const fetchAssessments = async () => {
    try {
      setLoading(true);

      const response = await api.get("/assessments/my-assessments");

      setAssessments(
        Array.isArray(response.data) ? response.data : []
      );
    } catch (error) {
      toast.error(
        error.response?.data?.detail ||
          "Failed to load assessments"
      );
    } finally {
      setLoading(false);
    }
  };

  const togglePublish = async (assessment) => {
    try {
      setActionLoading(assessment.id);

      if (assessment.is_published) {
        await api.patch(
          `/assessments/${assessment.id}/unpublish`
        );

        toast.success("Assessment unpublished successfully");
      } else {
        await api.patch(
          `/assessments/${assessment.id}/publish`
        );

        toast.success("Assessment published successfully");
      }

      fetchAssessments();
    } catch (error) {
      toast.error(
        error.response?.data?.detail ||
          "Failed to update assessment status"
      );
    } finally {
      setActionLoading(null);
    }
  };

  const deleteAssessment = async (assessmentId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this assessment?"
    );

    if (!confirmed) return;

    try {
      setActionLoading(assessmentId);

      await api.delete(`/assessments/${assessmentId}`);

      setAssessments((previous) =>
        previous.filter(
          (assessment) => assessment.id !== assessmentId
        )
      );

      toast.success("Assessment deleted successfully");
    } catch (error) {
      toast.error(
        error.response?.data?.detail ||
          "Failed to delete assessment"
      );
    } finally {
      setActionLoading(null);
    }
  };

  const publishedCount = assessments.filter(
    (assessment) => assessment.is_published
  ).length;

  const draftCount = assessments.length - publishedCount;

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-orange-50">
        <div className="text-center">
          <RefreshCw className="mx-auto h-8 w-8 animate-spin text-orange-600" />
          <p className="mt-3 font-medium text-gray-600">
            Loading assessments...
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
              Manage Assessments
            </h1>

            <p className="mt-2 text-gray-600">
              Create and manage your course assessments.
            </p>
          </div>

          <button
            onClick={() =>
              navigate("/instructor/create-assessment")
            }
            className="flex items-center justify-center gap-2 rounded-lg bg-orange-600 px-5 py-3 font-semibold text-white transition hover:bg-orange-700"
          >
            <Plus size={20} />
            Create Assessment
          </button>
        </div>

        <div className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-3">

          <div className="rounded-xl border border-orange-100 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Total Assessments
                </p>

                <h2 className="mt-2 text-3xl font-bold text-gray-900">
                  {assessments.length}
                </h2>
              </div>

              <div className="rounded-lg bg-orange-100 p-3 text-orange-600">
                <ClipboardList size={25} />
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-orange-100 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Published
                </p>

                <h2 className="mt-2 text-3xl font-bold text-green-600">
                  {publishedCount}
                </h2>
              </div>

              <div className="rounded-lg bg-green-100 p-3 text-green-600">
                <Eye size={25} />
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-orange-100 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Unpublished
                </p>

                <h2 className="mt-2 text-3xl font-bold text-yellow-600">
                  {draftCount}
                </h2>
              </div>

              <div className="rounded-lg bg-yellow-100 p-3 text-yellow-600">
                <EyeOff size={25} />
              </div>
            </div>
          </div>

        </div>

        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">
            My Assessments
          </h2>

          <button
            onClick={fetchAssessments}
            className="flex items-center gap-2 rounded-lg border border-orange-200 bg-white px-4 py-2 text-sm font-medium text-orange-700 hover:bg-orange-100"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>

        {assessments.length === 0 ? (
          <div className="rounded-xl border border-orange-100 bg-white px-6 py-16 text-center shadow-sm">
            <ClipboardList
              size={50}
              className="mx-auto text-orange-400"
            />

            <h3 className="mt-4 text-xl font-bold text-gray-800">
              No Assessments Found
            </h3>

            <p className="mt-2 text-gray-500">
              You have not created any assessments yet.
            </p>

            <button
              onClick={() =>
                navigate("/instructor/create-assessment")
              }
              className="mt-5 rounded-lg bg-orange-600 px-5 py-2.5 font-semibold text-white hover:bg-orange-700"
            >
              Create Your First Assessment
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">

            {assessments.map((assessment) => (
              <div
                key={assessment.id}
                className="rounded-xl border border-orange-100 bg-white p-6 shadow-sm transition hover:shadow-md"
              >
                <div className="flex flex-col justify-between gap-3 sm:flex-row">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      {assessment.title}
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-gray-600">
                      {assessment.description ||
                        "No description available"}
                    </p>
                  </div>

                  <span
                    className={`h-fit whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold ${
                      assessment.is_published
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {assessment.is_published
                      ? "Published"
                      : "Unpublished"}
                  </span>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-4 border-y border-gray-100 py-4">

                  <div className="flex items-center gap-2">
                    <BookOpen
                      size={18}
                      className="text-orange-600"
                    />

                    <div>
                      <p className="text-xs text-gray-500">
                        Course ID
                      </p>

                      <p className="font-semibold text-gray-800">
                        {assessment.course_id}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Clock
                      size={18}
                      className="text-orange-600"
                    />

                    <div>
                      <p className="text-xs text-gray-500">
                        Duration
                      </p>

                      <p className="font-semibold text-gray-800">
                        {assessment.duration_minutes} minutes
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Award
                      size={18}
                      className="text-orange-600"
                    />

                    <div>
                      <p className="text-xs text-gray-500">
                        Total Marks
                      </p>

                      <p className="font-semibold text-gray-800">
                        {assessment.total_marks}
                      </p>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">
                      Retakes
                    </p>

                    <p className="font-semibold text-gray-800">
                      {assessment.allow_retakes
                        ? "Allowed"
                        : "Not Allowed"}
                    </p>
                  </div>

                </div>

                <div className="mt-5 flex flex-wrap gap-3">

                  <button
                    onClick={() => togglePublish(assessment)}
                    disabled={actionLoading === assessment.id}
                    className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60 ${
                      assessment.is_published
                        ? "bg-yellow-600 hover:bg-yellow-700"
                        : "bg-green-600 hover:bg-green-700"
                    }`}
                  >
                    {assessment.is_published ? (
                      <>
                        <EyeOff size={16} />
                        Unpublish
                      </>
                    ) : (
                      <>
                        <Eye size={16} />
                        Publish
                      </>
                    )}
                  </button>

                  <button
                    onClick={() =>
                      deleteAssessment(assessment.id)
                    }
                    disabled={actionLoading === assessment.id}
                    className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-red-600 px-3 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <Trash2 size={16} />
                    Delete
                  </button>

                </div>
              </div>
            ))}

          </div>
        )}

      </div>
    </div>
  );
}

export default ManageAssessments;
