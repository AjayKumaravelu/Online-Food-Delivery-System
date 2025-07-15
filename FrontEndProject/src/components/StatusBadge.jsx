import React from 'react';
import { Clock, CheckCircle, XCircle, ChefHat, Truck } from 'lucide-react';

function StatusBadge({ status }) {
  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'accepted': return 'bg-blue-100 text-blue-800';
      case 'cooking': return 'bg-orange-100 text-orange-800';
      case 'ready': return 'bg-green-100 text-green-800';
      case 'out-for-delivery': return 'bg-purple-100 text-purple-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <Clock size={16} />;
      case 'accepted': return <CheckCircle size={16} />;
      case 'cooking': return <ChefHat size={16} />;
      case 'ready': return <CheckCircle size={16} />;
      case 'out-for-delivery': return <Truck size={16} />;
      case 'completed': return <CheckCircle size={16} />;
      case 'cancelled': return <XCircle size={16} />;
      default: return <Clock size={16} />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'Pending';
      case 'accepted': return 'Accepted';
      case 'cooking': return 'In Cooking';
      case 'ready': return 'Ready';
      case 'out-for-delivery': return 'Out for Delivery';
      case 'completed': return 'Completed';
      case 'cancelled': return 'Cancelled';
      default: return status;
    }
  };

  return (
    <span className={`badge d-inline-flex align-items-center ${getStatusColor(status)}`}>
      {getStatusIcon(status)}
      <span className="ms-1">{getStatusText(status)}</span>
    </span>
  );
}

export default StatusBadge;