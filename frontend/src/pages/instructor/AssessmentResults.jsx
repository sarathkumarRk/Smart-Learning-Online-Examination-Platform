import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ClipboardList,
  Users,
  Award,
  TrendingUp,
  RefreshCw,
  Search,
} from "lucide-react";
import { toast } from "react-toastify";
import api from "../../api/axios";

function AssessmentResults() {
  const navigate = useNavigate();

  const [assessments, setAssessments] = useState([]);
  const [selectedAssessment, setSelectedAssessment] = useState("");
  const [results, setResults] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loadingAssessments, setLoadingAssessments] = useState(true);
  const [loadingResults, setLoadingResults] = useState(false);

  useEffect(() => {
    fetchAssessments();
  }, []);

  useEffect(() => {
    if (selectedAssessment) {
      fetchResults(selectedAssessment);
    } else {
      setResults([]);
    }
  }, [selectedAssessment]);

  const fetchAssessments = async () => {
    try {
      setLoadingAssessments(true);

      const response = await api.get("/assessments/my-assessments");

      const data = Array.isArray(response.data)
        ? response.data
        : [];

      setAssessments(data);

      if (data.length > 0) {
        setSelectedAssessment(String(data[0].id));
      }
    } catch (error) {
      toast.error(
        error.response?.data?.detail ||
          "Failed to load assessments"
      );
    } finally {
      setLoadingAssessments(false);
    }
  };

  const fetchResults = async (assessmentId) => {
    try {
      setLoadingResults(true);

      const response = await api.get(
        `/submissions/assessment/${assessmentId}/results`
      );

      setResults(
        Array.isArray(response.data) ? response.data : []
      );
    } catch (error) {
      setResults([]);

      toast.error(
        error.response?.data?.detail ||
          "Failed to load assessment results"
      );
    } finally {
      setLoadingResults(false);
    }
  };

  const filteredResults = useMemo(() => {
    return results.filter((result) =>
      String(result.student_id)
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    );
  }, [results, searchTerm]);

  const averageScore = results.length
    ? (
        results.reduce(
          (total, result) => total + Number(result.score || 0),
          0
        ) / results.length
      ).toFixed(2)
    : "0.00";

  const highestScore = results.length
    ? Math.max(
        ...results.map((result) => Number(result.score || 0))
      )
    : 0;

  const selected = assessments.find(
    (assessment) =>
      String(assessment.id) === String(selectedAssessment)
  );

  const formatDate = (dateValue) => {
    if (!dateValue) return "N/A";

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) return "N/A";

    return date.toLocaleString();
  };

  if (loadingAssessments) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-orange-50">
        <RefreshCw className="h-8 w-8 animate-spin text-orange-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-orange-50 px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl">

        <button
          onClick={() =>
            navigate("/instructor/manage-assessments")
          }
          className="mb-6 flex items-center gap-2 font-medium text-orange-700 hover:text-orange-800"
        >
          <ArrowLeft size={19} />
          Back to Assessments
        </button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Assessment Results
          </h1>

          <p className="mt-2 text-gray-600">
            View student performance for your assessments.
          </p>
        </div>

        <div className="mb-8 rounded-xl border border-orange-100 bg-white p-6 shadow-sm">
          <label className="mb-2 block text-sm font-semibold text-gray-700">
            Select Assessment
          </label>

          <select
            value={selectedAssessment}
            onChange={(event) =>
              setSelectedAssessment(event.target.value)
            }
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 outline-none focus:border-orange-500 md:max-w-xl"
          >
            <option value="">Select an assessment</option>

            {assessments.map((assessment) => (
              <option
                key={assessment.id}
                value={assessment.id}
              >
                {assessment.title}
              </option>
            ))}
          </select>

          {assessments.length === 0 && (
            <p className="mt-3 text-sm text-gray-500">
              You have not created any assessments yet.
            </p>
          )}
        </div>

        {selected && (
          <>
            <div className="mb-6 rounded-xl border border-orange-100 bg-white p-5 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900">
                {selected.title}
              </h2>

              <p className="mt-2 text-sm text-gray-600">
                Total Marks: {selected.total_marks}
              </p>
            </div>

            <div className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">

              <div className="rounded-xl border border-orange-100 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">
                      Total Submissions
                    </p>

                    <h2 className="mt-2 text-3xl font-bold text-gray-900">
                      {results.length}
                    </h2>
                  </div>

                  <Users className="text-orange-600" size={27} />
                </div>
              </div>

              <div className="rounded-xl border border-orange-100 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">
                      Average Score
                    </p>

                    <h2 className="mt-2 text-3xl font-bold text-orange-600">
                      {averageScore}
                    </h2>
                  </div>

                  <TrendingUp className="text-orange-600" size={27} />
                </div>
              </div>

              <div className="rounded-xl border border-orange-100 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">
                      Highest Score
                    </p>

                    <h2 className="mt-2 text-3xl font-bold text-green-600">
                      {highestScore}
                    </h2>
                  </div>

                  <Award className="text-green-600" size={27} />
                </div>
              </div>

              <div className="rounded-xl border border-orange-100 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">
                      Total Marks
                    </p>

                    <h2 className="mt-2 text-3xl font-bold text-gray-900">
                      {selected.total_marks}
                    </h2>
                  </div>

                  <ClipboardList className="text-orange-600" size={27} />
                </div>
              </div>

            </div>

            <div className="rounded-xl border border-orange-100 bg-white p-6 shadow-sm">

              <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <h2 className="text-xl font-bold text-gray-900">
                  Student Submissions
                </h2>

                <div className="flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2">
                  <Search size={18} className="text-gray-400" />

                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(event) =>
                      setSearchTerm(event.target.value)
                    }
                    placeholder="Search student ID"
                    className="w-full outline-none sm:w-48"
                  />
                </div>
              </div>

              {loadingResults ? (
                <div className="flex justify-center py-12">
                  <RefreshCw className="h-7 w-7 animate-spin text-orange-600" />
                </div>
              ) : filteredResults.length === 0 ? (
                <div className="py-12 text-center">
                  <ClipboardList
                    size={45}
                    className="mx-auto text-orange-400"
                  />

                  <h3 className="mt-3 font-semibold text-gray-800">
                    No Results Found
                  </h3>

                  <p className="mt-1 text-sm text-gray-500">
                    No student submissions match your search.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[650px] text-left">
                    <thead>
                      <tr className="border-b border-gray-200 bg-orange-50">
                        <th className="px-4 py-4 text-sm font-semibold text-gray-700">
                          Submission ID
                        </th>

                        <th className="px-4 py-4 text-sm font-semibold text-gray-700">
                          Student ID
                        </th>

                        <th className="px-4 py-4 text-sm font-semibold text-gray-700">
                          Score
                        </th>

                        <th className="px-4 py-4 text-sm font-semibold text-gray-700">
                          Total Marks
                        </th>

                        <th className="px-4 py-4 text-sm font-semibold text-gray-700">
                          Submitted At
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {filteredResults.map((result) => (
                        <tr
                          key={result.id}
                          className="border-b border-gray-100 hover:bg-orange-50"
                        >
                          <td className="px-4 py-4 text-sm text-gray-700">
                            #{result.id}
                          </td>

                          <td className="px-4 py-4 text-sm font-medium text-gray-800">
                            {result.student_id}
                          </td>

                          <td className="px-4 py-4 text-sm font-bold text-orange-700">
                            {result.score}
                          </td>

                          <td className="px-4 py-4 text-sm text-gray-700">
                            {result.total_marks}
                          </td>

                          <td className="px-4 py-4 text-sm text-gray-600">
                            {formatDate(result.submitted_at)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

            </div>
          </>
        )}

      </div>
    </div>
  );
}

export default AssessmentResults;
