import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import api from "../../api/axios";

function Results() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchResults = async () => {
    try {
      setLoading(true);

      const response = await api.get("/submissions/my-results");

      setResults(response.data);
    } catch (error) {
      toast.error(
        error.response?.data?.detail || "Failed to load results"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResults();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-orange-600 text-lg">Loading results...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-orange-50 p-6">
      <div className="max-w-7xl mx-auto">

        <h1 className="text-3xl font-bold text-orange-600 mb-2">
          My Results
        </h1>

        <p className="text-gray-600 mb-8">
          View your submitted assessment scores.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">

          <div className="bg-white p-6 rounded-xl shadow border border-orange-200">
            <p className="text-gray-500">Total Submissions</p>
            <h2 className="text-3xl font-bold text-orange-600 mt-2">
              {results.length}
            </h2>
          </div>

          <div className="bg-white p-6 rounded-xl shadow border border-orange-200">
            <p className="text-gray-500">Average Score</p>
            <h2 className="text-3xl font-bold text-orange-600 mt-2">
              {results.length
                ? (
                    results.reduce(
                      (sum, item) =>
                        sum +
                        (item.total_marks > 0
                          ? (item.score / item.total_marks) * 100
                          : 0),
                      0
                    ) / results.length
                  ).toFixed(1) + "%"
                : "0%"}
            </h2>
          </div>

          <div className="bg-white p-6 rounded-xl shadow border border-orange-200">
            <p className="text-gray-500">Highest Score</p>
            <h2 className="text-3xl font-bold text-orange-600 mt-2">
              {results.length
                ? Math.max(
                    ...results.map((item) =>
                      item.total_marks > 0
                        ? (item.score / item.total_marks) * 100
                        : 0
                    )
                  ).toFixed(1) + "%"
                : "0%"}
            </h2>
          </div>

        </div>

        <div className="bg-white rounded-xl shadow border border-orange-200 p-6">

          <h2 className="text-xl font-bold text-orange-600 mb-5">
            Assessment History
          </h2>

          {results.length === 0 ? (
            <p className="text-center text-gray-500 py-10">
              No assessment results available.
            </p>
          ) : (
            <div className="overflow-x-auto">

              <table className="w-full text-left">

                <thead>
                  <tr className="bg-orange-50 text-orange-700">
                    <th className="p-3">Submission ID</th>
                    <th className="p-3">Assessment ID</th>
                    <th className="p-3">Score</th>
                    <th className="p-3">Total Marks</th>
                    <th className="p-3">Percentage</th>
                    <th className="p-3">Submitted Date</th>
                  </tr>
                </thead>

                <tbody>
                  {results.map((result) => {
                    const percentage =
                      result.total_marks > 0
                        ? (result.score / result.total_marks) * 100
                        : 0;

                    return (
                      <tr
                        key={result.id}
                        className="border-b border-orange-100"
                      >
                        <td className="p-3">{result.id}</td>

                        <td className="p-3">
                          {result.assessment_id}
                        </td>

                        <td className="p-3 font-semibold">
                          {result.score}
                        </td>

                        <td className="p-3">
                          {result.total_marks}
                        </td>

                        <td className="p-3">
                          <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full">
                            {percentage.toFixed(1)}%
                          </span>
                        </td>

                        <td className="p-3">
                          {new Date(
                            result.submitted_at
                          ).toLocaleDateString()}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>

              </table>

            </div>
          )}

        </div>

      </div>
    </div>
  );
}

export default Results;
