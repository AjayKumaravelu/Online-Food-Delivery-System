import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, CreditCard, CheckCircle, Smartphone, Banknote } from 'lucide-react';
import { useApp } from '../context/AppContext';

function PaymentPage() {
  const { api } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  const [agreed, setAgreed] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [upiId, setUpiId] = useState('');
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [currentOrder, setCurrentOrder] = useState(null);

  useEffect(() => {
    const orderFromState = location.state?.order;

    // --- CRITICAL CHANGE HERE: Check for orderFromState.orderId instead of orderFromState.id ---
    if (orderFromState && orderFromState.orderId && orderFromState.items && orderFromState.items.length > 0 && orderFromState.paymentId) {
      setCurrentOrder(orderFromState);
      console.log("PaymentPage: Displaying order from CartPage with paymentId:", orderFromState);
    } else {
      console.warn("PaymentPage: No valid order or missing paymentId found in navigation state. Redirecting to cart.");
      // You might want to display a more user-friendly error message before redirecting
      navigate('/cart', { replace: true }); 
    }
  }, [location.state, navigate]);

  const roundPrice = (price) => {
    return Math.ceil(price * 100) / 100;
  };

  const subtotal = currentOrder ? roundPrice(currentOrder.items.reduce((total, item) => total + (item.price * item.quantity), 0)) : 0;
  const deliveryFee = subtotal > 200 ? 0 : 30;
  const tax = roundPrice(subtotal * 0.05);
  const total = roundPrice(subtotal + deliveryFee + tax);

  const handlePayment = async () => {
    if (!agreed) {
      alert('Please agree to the terms and conditions.');
      return;
    }

    // --- CRITICAL CHANGE HERE: Check for currentOrder.orderId ---
    if (!currentOrder || !currentOrder.orderId || !currentOrder.paymentId) {
      setError('Order or payment details are missing. Please go back to cart and try again.');
      return;
    }

    // Client-side validation for decoy fields (for user experience only)
    if (paymentMethod === 'card') {
      if (!cardDetails.cardNumber || !cardDetails.expiryDate || !cardDetails.cvv || !cardDetails.cardholderName) {
        alert('Please fill in all card details.');
        return;
      }
    } else if (paymentMethod === 'upi') {
      if (!upiId) {
        alert('Please enter your UPI ID.');
        return;
      }
    }

    setLoading(true);
    setError(null);

    try {
      const confirmPayload = { 
        orderId: currentOrder.orderId, // --- CRITICAL CHANGE HERE: Use currentOrder.orderId ---
        paymentId: currentOrder.paymentId 
      };

      console.log("PaymentPage: Attempting to call /payments/confirm with payload:", confirmPayload);
      await api.put('/payments/confirm', confirmPayload);
      console.log("PaymentPage: /payments/confirm call successful.");
      
      navigate('/payment/success', { 
        state: { 
          orderId: currentOrder.orderId, // --- CRITICAL CHANGE HERE: Use currentOrder.orderId ---
          total, 
          paymentMethod 
        } 
      });

    } catch (err) {
      console.error("PaymentPage: Error during payment confirmation:", err.response?.data || err.message);
      setError(err.response?.data?.message || 'Failed to confirm payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCardInputChange = (e) => {
    setCardDetails({
      ...cardDetails,
      [e.target.name]: e.target.value
    });
  };

  if (!currentOrder) {
    return (
      <div className="min-h-screen bg-gray-50 d-flex align-items-center justify-content-center">
        <div className="text-center">
          <h2 className="h3 fw-bold text-gray-900 mb-3">Loading order details...</h2>
          <div className="spinner-border text-orange-500" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="container-fluid">
          <div className="d-flex align-items-center py-3">
            <Link 
              to="/cart" 
              className="btn btn-link p-2 text-gray-600 text-decoration-none me-3"
              style={{ borderRadius: '0.5rem' }}
            >
              <ArrowLeft size={24} />
            </Link>
            <h1 className="h3 fw-bold text-gray-900 mb-0">Payment</h1>
          </div>
        </div>
      </header>

      <div className="container py-4" style={{ maxWidth: '80rem' }}>
        <div className="row g-4">
          <div className="col-lg-8">
            <div className="bg-white rounded-xl shadow-custom p-4">
              <h2 className="h4 fw-bold text-gray-900 mb-4">Payment Method</h2>
              <div className="space-y-4 mb-4">
                <div className={`border rounded p-3 cursor-pointer transition-all ${
                  paymentMethod === 'card' ? 'border-orange-500 bg-orange-50' : 'border-gray-200'
                }`} onClick={() => setPaymentMethod('card')} style={{ cursor: 'pointer' }}>
                  <div className="d-flex align-items-center">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="card"
                      checked={paymentMethod === 'card'}
                      onChange={() => setPaymentMethod('card')}
                      className="form-check-input me-3"
                    />
                    <CreditCard className="text-primary me-2" size={24} />
                    <div>
                      <h6 className="fw-semibold text-gray-900 mb-0">Credit/Debit Card</h6>
                      <p className="small text-gray-600 mb-0">Pay securely with your card</p>
                    </div>
                  </div>
                </div>
                <div className={`border rounded p-3 cursor-pointer transition-all ${
                  paymentMethod === 'upi' ? 'border-orange-500 bg-orange-50' : 'border-gray-200'
                }`} onClick={() => setPaymentMethod('upi')} style={{ cursor: 'pointer' }}>
                  <div className="d-flex align-items-center">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="upi"
                      checked={paymentMethod === 'upi'}
                      onChange={() => setPaymentMethod('upi')}
                      className="form-check-input me-3"
                    />
                    <Smartphone className="text-purple-500 me-2" size={24} />
                    <div>
                      <h6 className="fw-semibold text-gray-900 mb-0">UPI Payment</h6>
                      <p className="small text-gray-600 mb-0">Pay using UPI ID or QR code</p>
                    </div>
                  </div>
                </div>
                <div className={`border rounded p-3 cursor-pointer transition-all ${
                  paymentMethod === 'cod' ? 'border-orange-500 bg-orange-50' : 'border-gray-200'
                }`} onClick={() => setPaymentMethod('cod')} style={{ cursor: 'pointer' }}>
                  <div className="d-flex align-items-center">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cod"
                      checked={paymentMethod === 'cod'}
                      onChange={() => setPaymentMethod('cod')}
                      className="form-check-input me-3"
                    />
                    <Banknote className="text-success me-2" size={24} />
                    <div>
                      <h6 className="fw-semibold text-gray-900 mb-0">Cash on Delivery</h6>
                      <p className="small text-gray-600 mb-0">Pay when your order arrives</p>
                    </div>
                  </div>
                </div>
              </div>
              {paymentMethod === 'card' && (
                <div className="border rounded p-4 mb-4">
                  <h6 className="fw-semibold text-gray-900 mb-3">Card Details</h6>
                  <div className="row g-3">
                    <div className="col-12">
                      <label className="form-label">Card Number</label>
                      <input
                        type="text"
                        name="cardNumber"
                        value={cardDetails.cardNumber}
                        onChange={handleCardInputChange}
                        className="form-control"
                        placeholder="1234 5678 9012 3456"
                        maxLength="19"
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Expiry Date</label>
                      <input
                        type="text"
                        name="expiryDate"
                        value={cardDetails.expiryDate}
                        onChange={handleCardInputChange}
                        className="form-control"
                        placeholder="MM/YY"
                        maxLength="5"
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">CVV</label>
                      <input
                        type="text"
                        name="cvv"
                        value={cardDetails.cvv}
                        onChange={handleCardInputChange}
                        className="form-control"
                        placeholder="123"
                        maxLength="4"
                      />
                    </div>
                    <div className="col-12">
                      <label className="form-label">Cardholder Name</label>
                      <input
                        type="text"
                        name="cardholderName"
                        value={cardDetails.cardholderName}
                        onChange={handleCardInputChange}
                        className="form-control"
                        placeholder="John Doe"
                      />
                    </div>
                  </div>
                </div>
              )}
              {paymentMethod === 'upi' && (
                <div className="border rounded p-4 mb-4">
                  <h6 className="fw-semibold text-gray-900 mb-3">UPI Details</h6>
                  <div className="mb-3">
                    <label className="form-label">UPI ID</label>
                    <input
                      type="text"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      className="form-control"
                      placeholder="yourname@upi"
                    />
                  </div>
                </div>
              )}
              <div className="mb-4">
                <div className="form-check">
                  <input
                    type="checkbox"
                    id="terms"
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                    className="form-check-input"
                  />
                  <label className="form-check-label" htmlFor="terms">
                    I agree to the <a href="#" className="text-orange-500">Terms and Conditions</a> and{' '}
                    <a href="#" className="text-orange-500">Privacy Policy</a>
                  </label>
                </div>
              </div>
              {error && (
                <div className="alert alert-danger text-center" role="alert">
                  {error}
                </div>
              )}
              <button
                onClick={handlePayment}
                className="btn btn-orange w-100 fw-semibold transition-all transform-scale"
                disabled={loading || !agreed}
              >
                {loading ? (
                  <div className="d-flex align-items-center justify-content-center">
                    <div className="spinner-border spinner-border-sm me-2" role="status">
                      <span className="visually-hidden">Processing...</span>
                    </div>
                    Processing Payment...
                  </div>
                ) : (
                  `Pay ₹${total}`
                )}
              </button>
            </div>
          </div>
          <div className="col-lg-4">
            <div className="bg-white rounded-xl shadow-custom p-4 sticky-top-custom">
              <h3 className="h5 fw-semibold text-gray-900 mb-4">Order Summary</h3>
              {currentOrder && (
                <>
                  {currentOrder.restaurantName && (
                    <div className="mb-3">
                      <h6 className="fw-semibold text-gray-900 mb-1">Ordering from {currentOrder.restaurantName}</h6>
                      {currentOrder.restaurantLocation && <p className="small text-gray-600 mb-0">{currentOrder.restaurantLocation}</p>}
                    </div>
                  )}
                  <div className="space-y-3 mb-4">
                    <div className="d-flex justify-content-between text-gray-600">
                      <span>Subtotal</span>
                      <span>₹{subtotal}</span>
                    </div>
                    <div className="d-flex justify-content-between text-gray-600">
                      <span>Delivery Fee</span>
                      <span className={deliveryFee === 0 ? 'text-green-600' : ''}>
                        {deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}
                      </span>
                    </div>
                    <div className="d-flex justify-content-between text-gray-600">
                      <span>Tax & Fees</span>
                      <span>₹{tax}</span>
                    </div>
                    <div className="border-top pt-3">
                      <div className="d-flex justify-content-between h5 fw-bold text-gray-900">
                        <span>Total</span>
                        <span>₹{total}</span>
                      </div>
                    </div>
                  </div>
                  <div className="border-top pt-3">
                    <h6 className="fw-semibold text-gray-900 mb-2">Order Items</h6>
                    <div className="space-y-2">
                      {currentOrder.items.map((item) => (
                        <div key={item.id} className="d-flex justify-content-between small">
                          <span>{item.itemName} × {item.quantity}</span> {/* Changed item.name to item.itemName */}
                          <span>₹{roundPrice(item.price * item.quantity)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PaymentPage;