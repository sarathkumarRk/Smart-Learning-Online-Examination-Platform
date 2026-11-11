import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../../api/axios";

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "STUDENT",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (loading) return;

    const name = formData.name.trim();
    const email = formData.email.trim().toLowerCase();
    const password = formData.password;
    const role = formData.role;

    if (!name) {
      toast.error("Please enter your full name");
      return;
    }

    if (!email) {
      toast.error("Please enter your email");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    if (password.length < 3) {
      toast.error("Password must contain at least 3 characters");
      return;
    }

    if (!["STUDENT", "INSTRUCTOR", "ADMIN"].includes(role)) {
      toast.error("Please select a valid role");
      return;
    }

    const registerData = {
      name,
      email,
      password,
      role,
    };

    try {
      setLoading(true);

      await api.post("/auth/register", registerData);

      toast.success("Registration successful! Please login.");

      setFormData({
        name: "",
        email: "",
        password: "",
        role: "STUDENT",
      });

      navigate("/login");
    } catch (error) {
      console.error(
        "Registration error:",
        error.response?.data || error
      );

      const detail = error.response?.data?.detail;

      let errorMessage = "Registration failed. Please try again.";

      if (Array.isArray(detail)) {
        errorMessage = detail
          .map((item) => {
            const field = item.loc?.slice(1).join(".") || "Field";
            return `${field}: ${item.msg}`;
          })
          .join(", ");
      } else if (typeof detail === "string") {
        errorMessage = detail;
      } else if (typeof error.response?.data?.message === "string") {
        errorMessage = error.response.data.message;
      } else if (!error.response) {
        errorMessage = "Unable to connect to server. Check backend services.";
      }

      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-orange-50 px-4 py-8">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-md border border-orange-200">

        <h2 className="text-3xl font-bold text-orange-600 text-center mb-2">
          Create Account
        </h2>

        <p className="text-orange-500 text-center mb-6">
          Join Smart Learning Platform
        </p>

        <form onSubmit={handleSubmit}>

          <div className="mb-4">
            <label className="block text-orange-700 mb-2 font-medium">
              Full Name
            </label>

            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your name"
              className="w-full p-3 border border-orange-300 rounded-lg focus:outline-none focus:border-orange-500"
              autoComplete="name"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-orange-700 mb-2 font-medium">
              Email
            </label>

            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              className="w-full p-3 border border-orange-300 rounded-lg focus:outline-none focus:border-orange-500"
              autoComplete="email"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-orange-700 mb-2 font-medium">
              Password
            </label>

            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Minimum 3 characters"
              minLength={3}
              className="w-full p-3 border border-orange-300 rounded-lg focus:outline-none focus:border-orange-500"
              autoComplete="new-password"
              required
            />

            <p className="text-xs text-gray-500 mt-1">
              Password must contain at least 3 characters.
            </p>
          </div>

          <div className="mb-6">
            <label className="block text-orange-700 mb-2 font-medium">
              Select Role
            </label>

            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full p-3 border border-orange-300 rounded-lg focus:outline-none focus:border-orange-500"
              required
            >
              <option value="STUDENT">Student</option>
              <option value="INSTRUCTOR">Instructor</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-500 text-white p-3 rounded-lg font-semibold hover:bg-orange-600 transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Registering..." : "Register"}
          </button>

        </form>

        <p className="text-center text-orange-700 mt-5">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-orange-600 font-bold hover:underline"
          >
            Login
          </Link>
        </p>

      </div>
    </div>
  );
}

export default Register;