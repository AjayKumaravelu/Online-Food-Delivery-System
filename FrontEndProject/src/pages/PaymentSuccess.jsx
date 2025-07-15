import React, { useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle, Home, Receipt, CreditCard, Smartphone, Banknote } from 'lucide-react';

function PaymentSuccess() {
  const location = useLocation();
  const navigate = useNavigate();
  const { orderId, total, paymentMethod } = location.state || {};

  useEffect(() => {
    if (!orderId) {
      navigate('/main');
    }
  }, [orderId, navigate]);

  if (!orderId) {
    return null;
  }

  const getPaymentMethodIcon = () => {
    switch (paymentMethod) {
      case 'card':
        return <CreditCard className="text-primary" size={24} />;
      case 'upi':
        return <Smartphone className="text-purple-500" size={24} />;
      case 'cod':
        return <Banknote className="text-success" size={24} />;
      default:
        return <CreditCard className="text-primary" size={24} />;
    }
  };

  const getPaymentMethodText = () => {
    switch (paymentMethod) {
      case 'card':
        return 'Credit/Debit Card';
      case 'upi':
        return 'UPI Payment';
      case 'cod':
        return 'Cash on Delivery';
      default:
        return 'Card Payment';
    }
  };

  const getPaymentStatusText = () => {
    switch (paymentMethod) {
      case 'cod':
        return 'Payment Pending (COD)';
      default:
        return 'Payment Completed';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 d-flex align-items-center justify-content-center px-3">
      <div className="w-100 bg-white rounded-2xl shadow-custom-xl p-4 text-center" style={{ maxWidth: '28rem' }}>
        {/* Success Icon */}
        <div className="bg-green-100 rounded-circle d-flex align-items-center justify-content-center mx-auto mb-4" 
             style={{ width: '80px', height: '80px' }}>
          <CheckCircle className="text-success" size={48} />
        </div>

        {/* Success Message */}
        <h1 className="h2 fw-bold text-gray-900 mb-3">
          {paymentMethod === 'cod' ? 'Order Placed Successfully!' : 'Payment Successful!'}
        </h1>
        <p className="text-gray-600 mb-4">
          {paymentMethod === 'cod' 
            ? 'Your order has been placed successfully. Payment will be collected upon delivery.'
            : 'Your order has been placed successfully and payment has been processed.'
          }
        </p>

        {/* Order Details */}
        <div className="bg-gray-50 rounded p-4 mb-4">
          <div className="d-flex align-items-center justify-content-center mb-3">
            <Receipt className="text-gray-500 me-2" size={24} />
            <h2 className="h5 fw-semibold text-gray-900 mb-0">Order Details</h2>
          </div>
          <div className="space-y-3">
            <div className="d-flex justify-content-between">
              <span className="text-gray-600">Order ID:</span>
              <span className="fw-medium text-gray-900">{orderId}</span>
            </div>
            <div className="d-flex justify-content-between">
              <span className="text-gray-600">Amount:</span>
              <span className="fw-bold text-green-600">₹{total}</span>
            </div>
            <div className="d-flex justify-content-between align-items-center">
              <span className="text-gray-600">Payment Method:</span>
              <div className="d-flex align-items-center">
                {getPaymentMethodIcon()}
                <span className="fw-medium text-gray-900 ms-2">{getPaymentMethodText()}</span>
              </div>
            </div>
            <div className="d-flex justify-content-between">
              <span className="text-gray-600">Status:</span>
              <span className="fw-medium text-orange-600">
                Order Confirmed
              </span>
            </div>
            <div className="d-flex justify-content-between">
              <span className="text-gray-600">Payment Status:</span>
              <span className={`fw-medium ${paymentMethod === 'cod' ? 'text-orange-600' : 'text-green-600'}`}>
                {getPaymentStatusText()}
              </span>
            </div>
          </div>
        </div>

        {/* Special COD Message */}
        {paymentMethod === 'cod' && (
          <div className="alert alert-warning d-flex align-items-center mb-4">
            <Banknote className="text-warning me-2" size={20} />
            <div>
              <div className="fw-medium text-warning-emphasis mb-1">Cash on Delivery</div>
              <p className="small text-warning-emphasis mb-0">
                Please keep ₹{total} ready in cash for payment upon delivery.
              </p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="d-grid gap-3">
          <Link
            to="/profile"
            className="btn btn-orange fw-semibold transition-all transform-scale"
          >
            Track Your Order
          </Link>
          <Link
            to="/main"
            className="btn btn-outline-secondary fw-semibold d-flex align-items-center justify-content-center transition-all"
          >
            <Home size={20} className="me-2" />
            Continue Shopping
          </Link>
        </div>

        {/* Thank You Message */}
        <div className="mt-4 text-center">
          <p className="small text-gray-500">
            Thank you for choosing CraveCart! Your food will be delivered soon.
          </p>
        </div>
      </div>
    </div>
  );
}

export default PaymentSuccess;