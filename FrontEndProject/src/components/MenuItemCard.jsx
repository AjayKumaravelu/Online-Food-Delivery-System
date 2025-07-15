import React from 'react';
import { Edit, Trash2 } from 'lucide-react';

function MenuItemCard({ item, onEdit, onDelete, showActions = true }) {
  // Handle both boolean and string representations of isVeg
  const isVegetarian = item.isVeg === true || item.isVeg === 'yes';
  
  return (
    <div className="border border-gray-200 rounded p-3">
      <div className="d-flex justify-content-between align-items-start">
        <div className="flex-grow-1">
          <div className="d-flex align-items-center gap-2 mb-1">
            <h6 className="fw-semibold text-gray-900 mb-0">{item.name}</h6>
            <span className={`badge ${
              isVegetarian ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`} style={{ fontSize: '0.75rem' }}>
              {isVegetarian ? '🟢 Veg' : '🔴 Non-Veg'}
            </span>
          </div>
          <p className="text-gray-600 small mb-2">{item.description}</p>
          <p className="fw-semibold text-green-600 mb-0">₹{item.price}</p>
        </div>
        {showActions && (
          <div className="d-flex gap-2">
            <button
              onClick={() => onEdit(item)}
              className="btn btn-sm btn-link p-2 text-blue-600"
              style={{ borderRadius: '0.5rem' }}
              title="Edit item"
            >
              <Edit size={16} />
            </button>
            <button
              onClick={() => onDelete(item.id)}
              className="btn btn-sm btn-link p-2 text-red-600"
              style={{ borderRadius: '0.5rem' }}
              title="Delete item"
            >
              <Trash2 size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default MenuItemCard;