
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Navbar from "../components/Navbar";
import ProtectedRoute from "../components/ProtectedRoute";

import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";

import CourseListing from "../pages/courses/CourseListing";
import CourseDetails from "../pages/courses/CourseDetails";

import StudentDashboard from "../pages/student/StudentDashboard";
import MyCourses from "../pages/student/MyCourses";
import Results from "../pages/student/Results";
import AssessmentPage from "../pages/student/AssessmentPage";

import InstructorDashboard from "../pages/instructor/InstructorDashboard";
import ManageCourses from "../pages/instructor/ManageCourses";
import ManageAssessments from "../pages/instructor/ManageAssessments";
import CreateAssessment from "../pages/instructor/CreateAssessment";
import AssessmentResults from "../pages/instructor/AssessmentResults";

import AdminDashboard from "../pages/admin/AdminDashboard";
import ManageUsers from "../pages/admin/ManageUsers";
import AdminManageCourses from "../pages/admin/ManageCourses";
import Analytics from "../pages/admin/Analytics";

function AppRoutes() {
  return (
    <BrowserRouter>
      <Navbar />

      <Routes>
        <Route
          path="/"
          element={<Navigate to="/login" replace />}
        />

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        <Route
          path="/courses"
          element={<CourseListing />}
        />

        <Route
          path="/courses/:courseId"
          element={<CourseDetails />}
        />

        <Route
          element={<ProtectedRoute allowedRoles={["STUDENT"]} />}
        >
          <Route
            path="/student/dashboard"
            element={<StudentDashboard />}
          />

          <Route
            path="/student/my-courses"
            element={<MyCourses />}
          />

          <Route
            path="/student/results"
            element={<Results />}
          />

          <Route
            path="/student/assessment/:assessmentId"
            element={<AssessmentPage />}
          />
        </Route>

        <Route
          element={<ProtectedRoute allowedRoles={["INSTRUCTOR"]} />}
        >
          <Route
            path="/instructor/dashboard"
            element={<InstructorDashboard />}
          />

          <Route
            path="/instructor/manage-courses"
            element={<ManageCourses />}
          />

          <Route
            path="/instructor/manage-assessments"
            element={<ManageAssessments />}
          />

          <Route
            path="/instructor/create-assessment"
            element={<CreateAssessment />}
          />

          <Route
            path="/instructor/assessment-results"
            element={<AssessmentResults />}
          />
        </Route>

        <Route
          element={<ProtectedRoute allowedRoles={["ADMIN"]} />}
        >
          <Route
            path="/admin/dashboard"
            element={<AdminDashboard />}
          />

          <Route
            path="/admin/manage-users"
            element={<ManageUsers />}
          />

          <Route
            path="/admin/manage-courses"
            element={<AdminManageCourses />}
          />

          <Route
            path="/admin/analytics"
            element={<Analytics />}
          />
        </Route>

        <Route
          path="*"
          element={<Navigate to="/login" replace />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;
