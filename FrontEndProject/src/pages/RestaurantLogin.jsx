
// import React, { useState } from 'react';
// import { Link, useNavigate } from 'react-router-dom';
// import { Mail, Lock, ChefHat, ArrowLeft } from 'lucide-react';
// import { useApp } from '../context/AppContext';

// function RestaurantLogin() {
//   const [formData, setFormData] = useState({
//     email: '',
//     password: ''
//   });
//   const { dispatch, api } = useApp();
//   const navigate = useNavigate();
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);

//   const handleChange = (e) => {
//     setFormData({
//       ...formData,
//       [e.target.name]: e.target.value
//     });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setError(null);
//     try {
//       const response = await api.post('/auth/restaurant/login', formData);
//       const data = response.data;
      
//       // Store JWT token
//       localStorage.setItem('jwt', data.jwtToken);
      
//       // Extract user ID and type from response
//       const userId = data.user?.id || null;
//       const userType = 'restaurant';
      
//       // Dispatch login with only userId and userType
//       dispatch({
//         type: 'LOGIN',
//         payload: {
//           userId: userId,
//           userType: userType
//         }
//       });
      
//       navigate('/restaurant/dashboard');
//     } catch (err) {
//       setError(err.response?.data?.message || err.message || 'Login failed');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen gradient-green d-flex align-items-center justify-content-center px-3">
//       <div className="w-100" style={{ maxWidth: '28rem' }}>
//         {/* Back Button */}
//         <Link 
//           to="/" 
//           className="d-inline-flex align-items-center text-green-600 text-decoration-none mb-4 transition-all"
//         >
//           <ArrowLeft className="me-2" size={20} />
//           Back to Home
//         </Link>

//         <div className="bg-white rounded-2xl shadow-custom-xl p-4">
//           {/* Header */}
//           <div className="text-center mb-4">
//             <div className="bg-green-100 rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3" 
//                  style={{ width: '80px', height: '80px' }}>
//               <ChefHat className="text-green-500" size={40} />
//             </div>
//             <h2 className="h2 fw-bold text-gray-900">Restaurant Login</h2>
//             <p className="text-gray-600 mt-2">Access your restaurant dashboard</p>
//           </div>

//           {/* Form */}
//           <form onSubmit={handleSubmit} className="space-y-6">
//             <div className="mb-3">
//               <label className="form-label fw-medium text-gray-700">
//                 Email Address
//               </label>
//               <div className="position-relative">
//                 <Mail className="position-absolute text-gray-400" size={20} style={{ left: '12px', top: '12px', zIndex: 5 }} />
//                 <input
//                   type="email"
//                   name="email"
//                   required
//                   className="form-control ps-5"
//                   placeholder="Enter your email"
//                   value={formData.email}
//                   onChange={handleChange}
//                   disabled={loading}
//                 />
//               </div>
//             </div>

//             <div className="mb-3">
//               <label className="form-label fw-medium text-gray-700">
//                 Password
//               </label>
//               <div className="position-relative">
//                 <Lock className="position-absolute text-gray-400" size={20} style={{ left: '12px', top: '12px', zIndex: 5 }} />
//                 <input
//                   type="password"
//                   name="password"
//                   required
//                   className="form-control ps-5"
//                   placeholder="Enter your password"
//                   value={formData.password}
//                   onChange={handleChange}
//                   disabled={loading}
//                 />
//               </div>
//             </div>

//             {error && (
//               <div className="alert alert-danger text-center" role="alert">
//                 {error}
//               </div>
//             )}
//             {loading && (
//               <div className="text-center py-2">
//                 <div className="spinner-border text-green-500" role="status">
//                   <span className="visually-hidden">Logging in...</span>
//                 </div>
//               </div>
//             )}

//             <button
//               type="submit"
//               className="btn btn-green w-100 fw-semibold transition-all transform-scale"
//               disabled={loading}
//             >
//               Login to Dashboard
//             </button>
//           </form>

//           {/* Footer */}
//           <div className="mt-4 text-center">
//             <p className="text-gray-600">
//               Don't have an account?{' '}
//               <Link to="/restaurant/register" className="text-green-500 fw-semibold text-decoration-none">
//                 Register here
//               </Link>
//             </p>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default RestaurantLogin;

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, ChefHat, ArrowLeft } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { jwtDecode } from 'jwt-decode';

function RestaurantLogin() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const { dispatch, api } = useApp();
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
      const response = await api.post('/auth/restaurant/login', formData);
      const data = response.data;
      
      // Store JWT token
      localStorage.setItem('jwt', data.jwtToken);

      const decode = jwtDecode(data.jwtToken)

      console.log("Decoded Token", decode)
      const user ={
        id:decode.userId
      }
      // Extract user ID and type from response
      //const user = data.user ;
      const roles = decode.roles;
      const userType = roles?.[0]?.toLowerCase()||'unknown';
      
      // Dispatch login with only userId and userType
      dispatch({
        type: 'LOGIN',
        payload: {
          user: user,
          userType: userType
        }
      });
      console.log("Dispached login with user :", user);

      navigate('/restaurant/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Login failed');
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
            <h2 className="h2 fw-bold text-gray-900">Restaurant Login</h2>
            <p className="text-gray-600 mt-2">Access your restaurant dashboard</p>
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
                <div className="spinner-border text-green-500" role="status">
                  <span className="visually-hidden">Logging in...</span>
                </div>
              </div>
            )}

            <button
              type="submit"
              className="btn btn-green w-100 fw-semibold transition-all transform-scale"
              disabled={loading}
            >
              Login to Dashboard
            </button>
          </form>

          {/* Footer */}
          <div className="mt-4 text-center">
            <p className="text-gray-600">
              Don't have an account?{' '}
              <Link to="/restaurant/register" className="text-green-500 fw-semibold text-decoration-none">
                Register here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RestaurantLogin;