import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Trash2, Save, Send } from "lucide-react";
import { toast } from "react-toastify";
import api from "../../api/axios";

const emptyQuestion = {
  question_text: "",
  option_a: "",
  option_b: "",
  option_c: "",
  option_d: "",
  correct_option: "A",
  marks: 1,
};

function CreateAssessment() {
  const navigate = useNavigate();

  const [courses, setCourses] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [assessment, setAssessment] = useState({
    title: "",
    description: "",
    course_id: "",
    duration_minutes: 30,
    total_marks: 10,
    allow_retakes: false,
    deadline: "",
  });

  const [questions, setQuestions] = useState([
    { ...emptyQuestion },
  ]);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await api.get("/courses/my-courses");

      const publishedOrOwnedCourses = Array.isArray(response.data)
        ? response.data
        : [];

      setCourses(publishedOrOwnedCourses);
    } catch (error) {
      toast.error(
        error.response?.data?.detail ||
          "Failed to load your courses"
      );
    } finally {
      setLoadingCourses(false);
    }
  };

  const handleAssessmentChange = (event) => {
    const { name, value, type, checked } = event.target;

    setAssessment((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleQuestionChange = (index, event) => {
    const { name, value } = event.target;

    setQuestions((previous) =>
      previous.map((question, questionIndex) =>
        questionIndex === index
          ? { ...question, [name]: value }
          : question
      )
    );
  };

  const addQuestion = () => {
    setQuestions((previous) => [
      ...previous,
      { ...emptyQuestion },
    ]);
  };

  const removeQuestion = (index) => {
    if (questions.length === 1) {
      toast.warning("At least one question is required");
      return;
    }

    setQuestions((previous) =>
      previous.filter((_, questionIndex) => questionIndex !== index)
    );
  };

  const validateForm = () => {
    if (!assessment.title.trim()) {
      toast.error("Assessment title is required");
      return false;
    }

    if (!assessment.course_id) {
      toast.error("Please select a course");
      return false;
    }

    if (
      !Number.isInteger(Number(assessment.duration_minutes)) ||
      Number(assessment.duration_minutes) <= 0
    ) {
      toast.error("Enter a valid assessment duration");
      return false;
    }

    if (
      !Number.isInteger(Number(assessment.total_marks)) ||
      Number(assessment.total_marks) <= 0
    ) {
      toast.error("Enter valid total marks");
      return false;
    }

    for (let index = 0; index < questions.length; index++) {
      const question = questions[index];

      if (!question.question_text.trim()) {
        toast.error(`Question ${index + 1} is required`);
        return false;
      }

      const options = [
        question.option_a,
        question.option_b,
        question.option_c,
        question.option_d,
      ];

      if (options.some((option) => !option.trim())) {
        toast.error(
          `Please fill all four options for question ${index + 1}`
        );
        return false;
      }

      if (
        !Number.isInteger(Number(question.marks)) ||
        Number(question.marks) <= 0
      ) {
        toast.error(
          `Enter valid marks for question ${index + 1}`
        );
        return false;
      }
    }

    const questionMarks = questions.reduce(
      (total, question) => total + Number(question.marks),
      0
    );

    if (questionMarks !== Number(assessment.total_marks)) {
      toast.error(
        `Question marks total (${questionMarks}) must equal assessment total marks (${assessment.total_marks})`
      );
      return false;
    }

    return true;
  };

  const createAssessment = async (publishAfterCreate) => {
    if (!validateForm()) return;

    try {
      setSubmitting(true);

      const assessmentPayload = {
        title: assessment.title.trim(),
        description: assessment.description.trim(),
        course_id: Number(assessment.course_id),
        duration_minutes: Number(assessment.duration_minutes),
        total_marks: Number(assessment.total_marks),
        allow_retakes: assessment.allow_retakes,
        deadline: assessment.deadline
          ? new Date(assessment.deadline).toISOString()
          : null,
      };

      const assessmentResponse = await api.post(
        "/assessments/",
        assessmentPayload
      );

      const assessmentId = assessmentResponse.data.id;

      for (const question of questions) {
        const questionPayload = {
          question_text: question.question_text.trim(),
          option_a: question.option_a.trim(),
          option_b: question.option_b.trim(),
          option_c: question.option_c.trim(),
          option_d: question.option_d.trim(),
          correct_option: question.correct_option,
          marks: Number(question.marks),
        };

        await api.post(
          `/assessments/${assessmentId}/questions`,
          questionPayload
        );
      }

      if (publishAfterCreate) {
        await api.patch(
          `/assessments/${assessmentId}/publish`
        );

        toast.success("Assessment created and published successfully");
      } else {
        toast.success("Assessment saved successfully");
      }

      navigate("/instructor/manage-assessments");
    } catch (error) {
      toast.error(
        error.response?.data?.detail ||
          "Failed to create assessment"
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingCourses) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-orange-50">
        <p className="font-medium text-orange-700">
          Loading your courses...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-orange-50 px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-5xl">

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
            Create Assessment
          </h1>

          <p className="mt-2 text-gray-600">
            Create an assessment and add questions for your course.
          </p>
        </div>

        <div className="space-y-8">

          <section className="rounded-xl border border-orange-100 bg-white p-6 shadow-sm">
            <h2 className="mb-6 text-xl font-bold text-gray-900">
              Assessment Details
            </h2>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Assessment Title
                </label>

                <input
                  type="text"
                  name="title"
                  value={assessment.title}
                  onChange={handleAssessmentChange}
                  placeholder="Enter assessment title"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Description
                </label>

                <textarea
                  name="description"
                  value={assessment.description}
                  onChange={handleAssessmentChange}
                  rows="3"
                  placeholder="Enter assessment description"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Select Course
                </label>

                <select
                  name="course_id"
                  value={assessment.course_id}
                  onChange={handleAssessmentChange}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 outline-none focus:border-orange-500"
                >
                  <option value="">Select your course</option>

                  {courses.map((course) => (
                    <option
                      key={course.id}
                      value={course.id}
                    >
                      {course.title}
                    </option>
                  ))}
                </select>

                {courses.length === 0 && (
                  <p className="mt-2 text-sm text-red-600">
                    You need to create a course before creating an assessment.
                  </p>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Duration (Minutes)
                </label>

                <input
                  type="number"
                  name="duration_minutes"
                  min="1"
                  value={assessment.duration_minutes}
                  onChange={handleAssessmentChange}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Total Marks
                </label>

                <input
                  type="number"
                  name="total_marks"
                  min="1"
                  value={assessment.total_marks}
                  onChange={handleAssessmentChange}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-orange-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Deadline
                </label>

                <input
                  type="datetime-local"
                  name="deadline"
                  value={assessment.deadline}
                  onChange={handleAssessmentChange}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-orange-500"
                />

                <p className="mt-1 text-xs text-gray-500">
                  Optional. Leave empty if there is no deadline.
                </p>
              </div>

              <div className="md:col-span-2">
                <label className="flex cursor-pointer items-center gap-3">
                  <input
                    type="checkbox"
                    name="allow_retakes"
                    checked={assessment.allow_retakes}
                    onChange={handleAssessmentChange}
                    className="h-5 w-5 accent-orange-600"
                  />

                  <span className="text-sm font-medium text-gray-700">
                    Allow students to retake this assessment
                  </span>
                </label>
              </div>

            </div>
          </section>

          <section className="rounded-xl border border-orange-100 bg-white p-6 shadow-sm">
            <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Assessment Questions
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Add questions with four options and select the correct answer.
                </p>
              </div>

              <button
                onClick={addQuestion}
                className="flex items-center justify-center gap-2 rounded-lg bg-orange-100 px-4 py-2.5 font-semibold text-orange-700 hover:bg-orange-200"
              >
                <Plus size={18} />
                Add Question
              </button>
            </div>

            <div className="space-y-6">

              {questions.map((question, index) => (
                <div
                  key={index}
                  className="rounded-xl border border-gray-200 p-5"
                >
                  <div className="mb-5 flex items-center justify-between">
                    <h3 className="font-bold text-gray-900">
                      Question {index + 1}
                    </h3>

                    <button
                      onClick={() => removeQuestion(index)}
                      className="flex items-center gap-1 text-sm font-medium text-red-600 hover:text-red-700"
                    >
                      <Trash2 size={17} />
                      Remove
                    </button>
                  </div>

                  <div className="space-y-4">

                    <div>
                      <label className="mb-2 block text-sm font-semibold text-gray-700">
                        Question
                      </label>

                      <textarea
                        name="question_text"
                        value={question.question_text}
                        onChange={(event) =>
                          handleQuestionChange(index, event)
                        }
                        rows="2"
                        placeholder="Enter your question"
                        className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-orange-500"
                      />
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                      {["a", "b", "c", "d"].map((option) => (
                        <div key={option}>
                          <label className="mb-2 block text-sm font-semibold text-gray-700">
                            Option {option.toUpperCase()}
                          </label>

                          <input
                            type="text"
                            name={`option_${option}`}
                            value={question[`option_${option}`]}
                            onChange={(event) =>
                              handleQuestionChange(index, event)
                            }
                            placeholder={`Enter option ${option.toUpperCase()}`}
                            className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-orange-500"
                          />
                        </div>
                      ))}

                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                      <div>
                        <label className="mb-2 block text-sm font-semibold text-gray-700">
                          Correct Option
                        </label>

                        <select
                          name="correct_option"
                          value={question.correct_option}
                          onChange={(event) =>
                            handleQuestionChange(index, event)
                          }
                          className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 outline-none focus:border-orange-500"
                        >
                          <option value="A">Option A</option>
                          <option value="B">Option B</option>
                          <option value="C">Option C</option>
                          <option value="D">Option D</option>
                        </select>
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-semibold text-gray-700">
                          Marks
                        </label>

                        <input
                          type="number"
                          name="marks"
                          min="1"
                          value={question.marks}
                          onChange={(event) =>
                            handleQuestionChange(index, event)
                          }
                          className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-orange-500"
                        />
                      </div>

                    </div>

                  </div>
                </div>
              ))}

            </div>
          </section>

          <div className="flex flex-col justify-end gap-3 sm:flex-row">

            <button
              onClick={() => createAssessment(false)}
              disabled={submitting || courses.length === 0}
              className="flex items-center justify-center gap-2 rounded-lg border border-orange-600 px-6 py-3 font-semibold text-orange-700 hover:bg-orange-100 disabled:opacity-50"
            >
              <Save size={18} />
              Save Assessment
            </button>

            <button
              onClick={() => createAssessment(true)}
              disabled={submitting || courses.length === 0}
              className="flex items-center justify-center gap-2 rounded-lg bg-orange-600 px-6 py-3 font-semibold text-white hover:bg-orange-700 disabled:opacity-50"
            >
              <Send size={18} />
              {submitting ? "Creating..." : "Create & Publish"}
            </button>

          </div>

        </div>
      </div>
    </div>
  );
}

export default CreateAssessment;
