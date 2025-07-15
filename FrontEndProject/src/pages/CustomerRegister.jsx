import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  User,
  Mail,
  Lock,
  Phone,
  MapPin,
  Utensils,
  ArrowLeft,
} from "lucide-react";
import { useApp } from "../context/AppContext";

function CustomerRegister() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phoneNumber: "",
    address: "",
  });
  const { dispatch } = useApp();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: Number(formData.phoneNumber), // ✅ rename key and ensure numeric
        address: formData.address,
      };

      const res = await fetch("/api/customers/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Registration failed");
      setSuccess("Registration successful! Redirecting to login...");
      setTimeout(() => navigate("/customer/login"), 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen gradient-orange d-flex align-items-center justify-content-center px-3 py-4">
      <div className="w-100" style={{ maxWidth: "28rem" }}>
        {/* Back Button */}
        <Link
          to="/"
          className="d-inline-flex align-items-center text-orange-600 text-decoration-none mb-4 transition-all"
        >
          <ArrowLeft className="me-2" size={20} />
          Back to Home
        </Link>

        <div className="bg-white rounded-2xl shadow-custom-xl p-4">
          {/* Header */}
          <div className="text-center mb-4">
            <div
              className="bg-orange-100 rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3"
              style={{ width: "80px", height: "80px" }}
            >
              <Utensils className="text-orange-500" size={40} />
            </div>
            <h2 className="h2 fw-bold text-gray-900">Join CraveCart</h2>
            <p className="text-gray-600 mt-2">Create your customer account</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="mb-3">
              <label className="form-label fw-medium text-gray-700">
                Full Name
              </label>
              <div className="position-relative">
                <User
                  className="position-absolute text-gray-400"
                  size={20}
                  style={{ left: "12px", top: "12px", zIndex: 5 }}
                />
                <input
                  type="text"
                  name="name"
                  required
                  className="form-control ps-5"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label fw-medium text-gray-700">
                Email Address
              </label>
              <div className="position-relative">
                <Mail
                  className="position-absolute text-gray-400"
                  size={20}
                  style={{ left: "12px", top: "12px", zIndex: 5 }}
                />
                <input
                  type="email"
                  name="email"
                  required
                  className="form-control ps-5"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label fw-medium text-gray-700">
                Password
              </label>
              <div className="position-relative">
                <Lock
                  className="position-absolute text-gray-400"
                  size={20}
                  style={{ left: "12px", top: "12px", zIndex: 5 }}
                />
                <input
                  type="password"
                  name="password"
                  required
                  className="form-control ps-5"
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label fw-medium text-gray-700">
                Phone Number
              </label>
              <div className="position-relative">
                <Phone
                  className="position-absolute text-gray-400"
                  size={20}
                  style={{ left: "12px", top: "12px", zIndex: 5 }}
                />
                <input
                  type="tel"
                  name="phoneNumber"
                  pattern="[0-9]{10}"
                  maxLength="10"
                  inputMode="numeric"
                  className="form-control ps-5"
                  placeholder="Enter your 10-digit phone number"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label fw-medium text-gray-700">
                Address
              </label>
              <div className="position-relative">
                <MapPin
                  className="position-absolute text-gray-400"
                  size={20}
                  style={{ left: "12px", top: "12px", zIndex: 5 }}
                />
                <textarea
                  name="address"
                  required
                  rows="3"
                  className="form-control ps-5 resize-none"
                  placeholder="Enter your delivery address"
                  value={formData.address}
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>
            </div>

            {error && (
              <div className="alert alert-danger text-center" role="alert">
                {error}
              </div>
            )}
            {success && (
              <div className="alert alert-success text-center" role="alert">
                {success}
              </div>
            )}
            {loading && (
              <div className="text-center py-2">
                <div className="spinner-border text-orange-500" role="status">
                  <span className="visually-hidden">Registering...</span>
                </div>
              </div>
            )}

            <button
              type="submit"
              className="btn btn-orange w-100 fw-semibold transition-all transform-scale"
              disabled={loading}
            >
              Create Account
            </button>
          </form>

          {/* Footer */}
          <div className="mt-4 text-center">
            <p className="text-gray-600">
              Already have an account?{" "}
              <Link
                to="/customer/login"
                className="text-orange-500 fw-semibold text-decoration-none"
              >
                Login here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CustomerRegister;
