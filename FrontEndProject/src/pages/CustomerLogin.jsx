import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Utensils, ArrowLeft } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { jwtDecode } from 'jwt-decode';

// CustomerLogin component for customer login functionality
function CustomerLogin() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const { dispatch } = useApp();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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
    try {
      const res = await fetch('/api/auth/customer/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (!res.ok) throw new Error('Invalid email or password');
      const data = await res.json();
      // Assume backend returns { token, user }
      localStorage.setItem('jwt', data.jwtToken);

      const decode = jwtDecode(data.jwtToken);

      const user ={
        id:decode.userId
      }

      const roles = decode.roles;
      const userType = roles?.[0]?.toLowerCase()||'unknown';

      dispatch({
        type: 'LOGIN',
        payload: {
          user: user,
          userType: userType
        }
      });
      navigate('/main');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen gradient-orange d-flex align-items-center justify-content-center px-3">
      <div className="w-100" style={{ maxWidth: '28rem' }}>
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
            <div className="bg-orange-100 rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3" 
                 style={{ width: '80px', height: '80px' }}>
              <Utensils className="text-orange-500" size={40} />
            </div>
            <h2 className="h2 fw-bold text-gray-900">Welcome Back!</h2>
            <p className="text-gray-600 mt-2">Login to your customer account</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
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
                  placeholder="Enter your password"
                  value={formData.password}
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
            {loading && (
              <div className="text-center py-2">
                <div className="spinner-border text-orange-500" role="status">
                  <span className="visually-hidden">Logging in...</span>
                </div>
              </div>
            )}

            <button
              type="submit"
              className="btn btn-orange w-100 fw-semibold transition-all transform-scale"
              disabled={loading}
            >
              Login
            </button>
          </form>

          {/* Footer */}
          <div className="mt-4 text-center">
            <p className="text-gray-600">
              Don't have an account?{' '}
              <Link to="/customer/register" className="text-orange-500 fw-semibold text-decoration-none">
                Register here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CustomerLogin;