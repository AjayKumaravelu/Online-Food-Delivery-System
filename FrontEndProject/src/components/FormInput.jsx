import React from 'react';

// Reusable FormInput component
function FormInput({ 
  label, 
  type = 'text', 
  name, 
  value, 
  onChange, 
  placeholder, 
  required = false, 
  icon: Icon,
  rows 
}) 


{
  return (
    <div className="mb-3">
      <label className="form-label fw-medium text-gray-700">
        {label}
      </label>
      <div className="position-relative">
        {Icon && (
          <Icon 
            className="position-absolute text-gray-400" 
            size={20}
            style={{ left: '12px', top: '12px', zIndex: 5 }}
          />
        )}
        {type === 'textarea' ? (
          <textarea
            name={name}
            required={required}
            rows={rows || 3}
            className={`form-control resize-none ${Icon ? 'ps-5' : ''}`}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
          />
        ) : (
          <input
            type={type}
            name={name}
            required={required}
            className={`form-control ${Icon ? 'ps-5' : ''}`}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
          />
        )}
      </div>
    </div>
  );
}

export default FormInput;