import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, MapPin, ChefHat, ArrowLeft } from 'lucide-react';
import { useApp } from '../context/AppContext';

function RestaurantRegister() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    location: ''
  });
  const { dispatch } = useApp();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch('/api/restaurants/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (!res.ok) throw new Error('Registration failed');
      setSuccess('Registration successful! Redirecting to login...');
      setTimeout(() => navigate('/restaurant/login'), 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen gradient-green d-flex align-items-center justify-content-center px-3">
      <div className="w-100" style={{ maxWidth: '28rem' }}>
        {/* Back Button */}
        <Link 
          to="/" 
          className="d-inline-flex align-items-center text-green-600 text-decoration-none mb-4 transition-all"
        >
          <ArrowLeft className="me-2" size={20} />
          Back to Home
        </Link>

        <div className="bg-white rounded-2xl shadow-custom-xl p-4">
          {/* Header */}
          <div className="text-center mb-4">
            <div className="bg-green-100 rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3" 
                 style={{ width: '80px', height: '80px' }}>
              <ChefHat className="text-green-500" size={40} />
            </div>
            <h2 className="h2 fw-bold text-gray-900">Join as Restaurant</h2>
            <p className="text-gray-600 mt-2">Register your restaurant</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="mb-3">
              <label className="form-label fw-medium text-gray-700">
                Restaurant Name
              </label>
              <div className="position-relative">
                <User className="position-absolute text-gray-400" size={20} style={{ left: '12px', top: '12px', zIndex: 5 }} />
                <input
                  type="text"
                  name="name"
                  required
                  className="form-control ps-5"
                  placeholder="Enter restaurant name"
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
                <Mail className="position-absolute text-gray-400" size={20} style={{ left: '12px', top: '12px', zIndex: 5 }} />
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
                <Lock className="position-absolute text-gray-400" size={20} style={{ left: '12px', top: '12px', zIndex: 5 }} />
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
                Location
              </label>
              <div className="position-relative">
                <MapPin className="position-absolute text-gray-400" size={20} style={{ left: '12px', top: '12px', zIndex: 5 }} />
                <input
                  type="text"
                  name="location"
                  required
                  className="form-control ps-5"
                  placeholder="Enter restaurant location"
                  value={formData.location}
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
                <div className="spinner-border text-green-500" role="status">
                  <span className="visually-hidden">Registering...</span>
                </div>
              </div>
            )}

            <button
              type="submit"
              className="btn btn-green w-100 fw-semibold transition-all transform-scale"
              disabled={loading}
            >
              Register Restaurant
            </button>
          </form>

          {/* Footer */}
          <div className="mt-4 text-center">
            <p className="text-gray-600">
              Already have an account?{' '}
              <Link to="/restaurant/login" className="text-green-500 fw-semibold text-decoration-none">
                Login here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RestaurantRegister;