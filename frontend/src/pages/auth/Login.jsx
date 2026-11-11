import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../../api/axios";

function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const response = await api.post("/auth/login", formData);

      const { access_token, user } = response.data;

      if (!access_token || !user || !user.role) {
        toast.error("Invalid login response from server");
        return;
      }

      localStorage.setItem("access_token", access_token);
      localStorage.setItem("user", JSON.stringify(user));

      // Update Navbar immediately after login
      window.dispatchEvent(new Event("storage"));

      toast.success("Login successful!");

      if (user.role === "STUDENT") {
        navigate("/student/dashboard");
      } else if (user.role === "INSTRUCTOR") {
        navigate("/instructor/dashboard");
      } else if (user.role === "ADMIN") {
        navigate("/admin/dashboard");
      } else {
        localStorage.removeItem("access_token");
        localStorage.removeItem("user");

        window.dispatchEvent(new Event("storage"));

        toast.error("Invalid user role");
        navigate("/login");
      }

    } catch (error) {
      toast.error(
        error.response?.data?.detail ||
          "Invalid email or password"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-orange-50 px-4">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-md border border-orange-200">

        <h2 className="text-3xl font-bold text-orange-600 text-center mb-2">
          Welcome Back
        </h2>

        <p className="text-orange-500 text-center mb-6">
          Login to Smart Learning Platform
        </p>

        <form onSubmit={handleSubmit}>

          <div className="mb-4">
            <label className="block text-orange-700 mb-2">
              Email
            </label>

            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              className="w-full p-3 border border-orange-300 rounded-lg focus:outline-none focus:border-orange-500"
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-orange-700 mb-2">
              Password
            </label>

            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              className="w-full p-3 border border-orange-300 rounded-lg focus:outline-none focus:border-orange-500"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-500 text-white p-3 rounded-lg hover:bg-orange-600 disabled:opacity-60"
          >
            {loading ? "Logging in..." : "Login"}
          </button>

        </form>

        <p className="text-center text-orange-700 mt-5">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="text-orange-600 font-bold hover:underline"
          >
            Register
          </Link>
        </p>

      </div>
    </div>
  );
}

export default Login;
