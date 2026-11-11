import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../../api/axios";

function AssessmentPage() {
  const { assessmentId } = useParams();
  const navigate = useNavigate();

  const [assessment, setAssessment] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const fetchAssessment = async () => {
    try {
      setLoading(true);

      const [assessmentResponse, questionResponse] =
        await Promise.all([
          api.get(`/assessments/${assessmentId}`),
          api.get(`/assessments/${assessmentId}/questions`),
        ]);

      setAssessment(assessmentResponse.data);
      setQuestions(questionResponse.data);

    } catch (error) {
      toast.error(
        error.response?.data?.detail ||
        "Failed to load assessment"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssessment();
  }, [assessmentId]);

  const handleAnswerChange = (questionId, option) => {
    setAnswers((previousAnswers) => ({
      ...previousAnswers,
      [questionId]: option,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (Object.keys(answers).length !== questions.length) {
      toast.error("Please answer all questions");
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to submit this assessment?"
    );

    if (!confirmed) return;

    try {
      setSubmitting(true);

      const response = await api.post(
        `/submissions/${assessmentId}`,
        { answers }
      );

      toast.success("Assessment submitted successfully!");

      navigate("/student/results", {
        state: { result: response.data },
      });

    } catch (error) {
      toast.error(
        error.response?.data?.detail ||
        "Assessment submission failed"
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-orange-600">Loading assessment...</p>
      </div>
    );
  }

  if (!assessment) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-orange-600">
          Assessment not found.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-orange-50 p-6">
      <div className="max-w-4xl mx-auto">

        <div className="bg-white p-6 rounded-xl shadow border border-orange-200 mb-6">

          <h1 className="text-3xl font-bold text-orange-600">
            {assessment.title}
          </h1>

          <p className="text-gray-600 mt-3">
            {assessment.description}
          </p>

          <div className="grid grid-cols-2 gap-4 mt-6">

            <div className="bg-orange-50 p-4 rounded-lg">
              <p className="text-gray-500 text-sm">
                Duration
              </p>
              <p className="text-orange-600 font-bold">
                {assessment.duration_minutes} Minutes
              </p>
            </div>

            <div className="bg-orange-50 p-4 rounded-lg">
              <p className="text-gray-500 text-sm">
                Total Marks
              </p>
              <p className="text-orange-600 font-bold">
                {assessment.total_marks}
              </p>
            </div>

          </div>
        </div>

        <form onSubmit={handleSubmit}>

          {questions.length === 0 ? (
            <div className="bg-white p-6 rounded-xl shadow text-center">
              <p className="text-gray-500">
                No questions available.
              </p>
            </div>
          ) : (
            questions.map((question, index) => (
              <div
                key={question.id}
                className="bg-white p-6 rounded-xl shadow border border-orange-200 mb-5"
              >

                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  {index + 1}. {question.question_text}
                </h3>

                <p className="text-sm text-orange-600 mb-4">
                  Marks: {question.marks}
                </p>

                <div className="space-y-3">

                  {["A", "B", "C", "D"].map((option) => {
                    const optionValue =
                      question[`option_${option.toLowerCase()}`];

                    return (
                      <label
                        key={option}
                        className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer ${
                          answers[question.id] === option
                            ? "border-orange-500 bg-orange-50"
                            : "border-gray-200"
                        }`}
                      >

                        <input
                          type="radio"
                          name={`question_${question.id}`}
                          value={option}
                          checked={answers[question.id] === option}
                          onChange={() =>
                            handleAnswerChange(
                              question.id,
                              option
                            )
                          }
                          className="accent-orange-500"
                        />

                        <span className="font-medium text-gray-700">
                          {option}. {optionValue}
                        </span>

                      </label>
                    );
                  })}

                </div>

              </div>
            ))
          )}

          {questions.length > 0 && (
            <div className="bg-white p-6 rounded-xl shadow border border-orange-200">

              <p className="text-gray-600 mb-4">
                Answered: {Object.keys(answers).length} / {questions.length}
              </p>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-orange-500 text-white p-3 rounded-lg hover:bg-orange-600 disabled:opacity-60"
              >
                {submitting ? "Submitting..." : "Submit Assessment"}
              </button>

            </div>
          )}

        </form>

      </div>
    </div>
  );
}

export default AssessmentPage;
