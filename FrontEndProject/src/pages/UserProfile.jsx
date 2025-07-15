import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit2, LogOut, Clock, CheckCircle, User, Mail, Phone, MapPin } from 'lucide-react';
import { useApp } from '../context/AppContext';

function UserProfile() {
  const { state, dispatch, api } = useApp();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [userDetails, setUserDetails] = useState({});
  const [editedUser, setEditedUser] = useState({});
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Fetch user profile on mount
  
    const fetchProfile = async () => {
      // if (!state.userId) {
      //   setError('No user ID available');
      //   return;
      // }
      
      setLoading(true);
      setError(null);
      try {
        const response = await api.get('/customers/user');
        const userData = response.data;
        setUserDetails(userData);
        setEditedUser(userData);
      } catch (err) {
        setError('Failed to fetch user profile');
      } finally {
        setLoading(false);
      }
    };
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const response = await api.get('/orders/user');
        const orders = response.data;

        const enrichedOrders = await Promise.all(orders.map(async (order) => {
          let restaurantName = 'N/A';
          let paymentMethod = 'N/A';
          let agentName = 'NOT YET ASSIGNED';
          let agentPhone = 'NOT YET ASSIGNED';
    
          // Fetch restaurant name
          if (order.restaurantId) {
            try {
              const res = await api.get(`/restaurants/${order.restaurantId}`);
              restaurantName = res.data.name || 'N/A';
            } catch (e) {
              console.error(`Failed to fetch restaurant for order ${order.orderId}`);
            }
          }
          
          if(order.status==='OUT_FOR_DELIVERY' || order.status==='COMPLETED'){
            try {
              const agentres = await api.get(`delivery/order/${order.orderId}`);
              agentName = agentres.data.agentName || 'N/A';
              agentPhone = agentres.data.agentPhone || 'N/A';
            } catch (e) {
              console.error(`Failed to fetch agent details for order ${order.orderId}`);
            }
          }
          
          // Fetch payment method
          try {
            const paymentRes = await api.get(`/payments/order/${order.orderId}`);
            paymentMethod = paymentRes.data.paymentMethod || 'N/A';
          } catch (e) {
            console.error(`Failed to fetch payment for order ${order.orderId}`);
          }
    
          return {
            ...order,
            restaurantName,
            paymentMethod,
            agentName,
            agentPhone
          };
        }));
    
        dispatch({ type: 'SET_ORDERS', payload: enrichedOrders });
      } catch (err) {
        setError('Failed to fetch orders');
      } finally {
        setLoading(false);
      }
    };
  
    useEffect(() => {
      fetchProfile();
      fetchOrders(); // This must be called
    }, []);
  

  // Keep editedUser in sync with userDetails
  useEffect(() => {
    setEditedUser(userDetails);
  }, [userDetails]);

  const handleLogout = () => {
    localStorage.removeItem('jwt');
    dispatch({ type: 'LOGOUT' });
    navigate('/');
  };

  const handleSaveProfile = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const response = await api.put('/customers/user', editedUser);
      const data = response.data;
      setUserDetails(data);
      setSuccess('Profile updated successfully!');
      setIsEditing(false);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'accepted': return 'bg-blue-100 text-blue-800';
      case 'cooking': return 'bg-blue-100 text-blue-800';
      case 'out-for-delivery': return 'bg-purple-100 text-purple-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <Clock size={16} />;
      case 'accepted': return <Clock size={16} />;
      case 'cooking': return <Clock size={16} />;
      case 'out-for-delivery': return <Clock size={16} />;
      case 'completed': return <CheckCircle size={16} />;
      default: return <Clock size={16} />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'Pending';
      case 'accepted': return 'Accepted';
      case 'cooking': return 'Cooking';
      case 'out-for-delivery': return 'Out for Delivery';
      case 'completed': return 'Completed';
      case 'cancelled': return 'Cancelled';
      default: return status;
    }
  };

  // Helper function to round price to 2 decimal places
  const roundPrice = (price) => {
    return Math.ceil(price * 100) / 100;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container-fluid">
          <div className="d-flex align-items-center justify-content-between py-3">
            <div className="d-flex align-items-center">
              <Link 
                to="/main" 
                className="btn btn-link p-2 text-gray-600 text-decoration-none me-3"
                style={{ borderRadius: '0.5rem' }}
              >
                <ArrowLeft size={24} />
              </Link>
              <h1 className="h3 fw-bold text-gray-900 mb-0">My Profile</h1>
            </div>
            <button
              onClick={handleLogout}
              className="btn btn-outline-danger d-flex align-items-center"
            >
              <LogOut size={20} className="me-2" />
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="container-fluid py-4">
        <div className="row g-4">
          {/* Profile Section */}
          <div className="col-lg-6">
            <div className="bg-white rounded-xl shadow-custom p-4">
              <div className="d-flex align-items-center justify-content-between mb-4">
                <h2 className="h4 fw-bold text-gray-900 d-flex align-items-center mb-0">
                  <User className="text-orange-500 me-2" size={24} />
                  Profile Information
                </h2>
                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="btn btn-link p-2 text-orange-500 text-decoration-none"
                    title="Edit Profile"
                    style={{ borderRadius: '0.5rem' }}
                  >
                    <Edit2 size={20} />
                  </button>
                )}
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
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              )}

              {isEditing ? (
                <div className="space-y-4">
                  <div className="mb-3">
                    <label className="form-label fw-medium text-gray-700">
                      Full Name
                    </label>
                    <div className="position-relative">
                      <User className="position-absolute text-gray-400" size={20} style={{ left: '12px', top: '12px', zIndex: 5 }} />
                      <input
                        type="text"
                        className="form-control ps-5"
                        value={editedUser.name || ''}
                        onChange={(e) => setEditedUser({...editedUser, name: e.target.value})}
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
                        className="form-control ps-5"
                        value={editedUser.email || ''}
                        onChange={(e) => setEditedUser({...editedUser, email: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-medium text-gray-700">
                      Phone Number
                    </label>
                    <div className="position-relative">
                      <Phone className="position-absolute text-gray-400" size={20} style={{ left: '12px', top: '12px', zIndex: 5 }} />
                      <input
                        type="tel"
                        className="form-control ps-5"
                        value={editedUser.phone || ''}
                        onChange={(e) => setEditedUser({...editedUser, phone: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-medium text-gray-700">
                      Address
                    </label>
                    <div className="position-relative">
                      <MapPin className="position-absolute text-gray-400" size={20} style={{ left: '12px', top: '12px', zIndex: 5 }} />
                      <textarea
                        className="form-control ps-5"
                        rows="3"
                        value={editedUser.address || ''}
                        onChange={(e) => setEditedUser({...editedUser, address: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="d-flex gap-2">
                    <button
                      onClick={handleSaveProfile}
                      className="btn btn-orange fw-semibold"
                      disabled={loading}
                    >
                      {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button
                      onClick={() => {
                        setIsEditing(false);
                        setEditedUser(userDetails);
                      }}
                      className="btn btn-outline-secondary"
                      disabled={loading}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="d-flex align-items-center">
                    <User className="text-gray-400 me-3" size={20} />
                    <div>
                      <p className="text-gray-500 small mb-0">Full Name</p>
                      <p className="fw-semibold text-gray-900 mb-0">{userDetails?.name || 'Not provided'}</p>
                    </div>
                  </div>

                  <div className="d-flex align-items-center">
                    <Mail className="text-gray-400 me-3" size={20} />
                    <div>
                      <p className="text-gray-500 small mb-0">Email Address</p>
                      <p className="fw-semibold text-gray-900 mb-0">{userDetails?.email || 'Not provided'}</p>
                    </div>
                  </div>

                  <div className="d-flex align-items-center">
                    <Phone className="text-gray-400 me-3" size={20} />
                    <div>
                      <p className="text-gray-500 small mb-0">Phone Number</p>
                      <p className="fw-semibold text-gray-900 mb-0">{userDetails?.phone || 'Not provided'}</p>
                    </div>
                  </div>

                  <div className="d-flex align-items-start">
                    <MapPin className="text-gray-400 me-3 mt-1" size={20} />
                    <div>
                      <p className="text-gray-500 small mb-0">Address</p>
                      <p className="fw-semibold text-gray-900 mb-0">{userDetails?.address || 'Not provided'}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Order History */}
          <div className="col-lg-6">
            <div className="bg-white rounded-xl shadow-custom p-4">
              <h2 className="h4 fw-bold text-gray-900 d-flex align-items-center mb-4">
                <Clock className="text-orange-500 me-2" size={24} />
                Order History
              </h2>

              {state.orders.length === 0 ? (
                <div className="text-center py-4">
                  <div className="text-gray-300 mb-3">
                    <Clock size={64} className="mx-auto" />
                  </div>
                  <h3 className="h5 fw-semibold text-gray-700 mb-2">No orders yet</h3>
                  <p className="text-gray-500 mb-3">Start ordering delicious food to see your order history here!</p>
                  <Link
                    to="/main"
                    className="btn btn-orange d-inline-flex align-items-center"
                  >
                    Browse Restaurants
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {state.orders.map((order) => (
                    <div key={order.id} className="border rounded p-3">
                      <div className="d-flex justify-content-between align-items-start mb-3">
                        <div>
                          <h6 className="fw-semibold text-gray-900 mb-1">Order #{order.orderId }</h6>
                          <p className="text-gray-600 small mb-0">
                            {new Date(order.orderDate || Date.now()).toLocaleDateString()}
                          </p>
                        </div>
                        <span className={`badge d-flex align-items-center ${getStatusColor(order.status)}`}>
                          {getStatusIcon(order.status)}
                          <span className="ms-1">{getStatusText(order.status)}</span>
                        </span>
                      </div>
                      
                      <div className="mb-3">
                        <p className="small text-gray-600 mb-1">Items:</p>
                        <ul className="small ps-3 mb-0">
                          {order.items?.map((item, idx) => (
                            <li key={idx}>{item.itemName} × {item.quantity}</li>
                          ))}
                        </ul>
                      </div>
                      
                      <div className="d-flex justify-content-between align-items-center">
                        <span className="fw-semibold text-success">
                          ₹{roundPrice(order.totalAmount || 0)}
                        </span>
                        <button
                          onClick={() => setSelectedOrderId(selectedOrderId === order.orderId ? null : order.orderId)}
                          className="btn btn-link text-orange-500 small text-decoration-none p-0"
                        >
                          {selectedOrderId === order.id ? 'Hide Details' : 'View Details'}
                        </button>
                      </div>

                      {selectedOrderId === order.orderId && (
                        <div className="mt-3 pt-3 border-top">
                          <div className="row g-2 small">
                            <div className="col-6">
                              <span className="text-gray-500">Restaurant:</span>
                              <p className="mb-0 fw-medium">{order.restaurantName || 'N/A'}</p>
                            </div>
                            <div className="col-6">
                              <span className="text-gray-500">Payment Method:</span>
                              <p className="mb-0 fw-medium">{order.paymentMethod || 'N/A'}</p>
                            </div>
                            <div className="col-6">
                              <span className="text-gray-500">Delivery Address:</span>
                              <p className="mb-0 fw-medium">{order.deliveryAddress || 'N/A'}</p>
                            </div>
                            <div className="col-6">
                              <span className="text-gray-500">Agent Name:</span>
                              <p className="mb-0 fw-medium">{order.agentName || 'NOT YET ASSIGNED'}</p>
                            </div>
                            <div className="col-6">
                              <span className="text-gray-500">Agent Phone:</span>
                              <p className="mb-0 fw-medium">{order.agentPhone || 'NOT YET ASSIGNED'}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserProfile;