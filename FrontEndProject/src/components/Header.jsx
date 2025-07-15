import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

function Header({ title, backTo, children }) {
  return (
    <header className="bg-white shadow-sm">
      <div className="container-fluid">
        <div className="d-flex align-items-center justify-content-between py-3">
          <div className="d-flex align-items-center">
            {backTo && (
              <Link 
                to={backTo} 
                className="btn btn-link p-2 text-gray-600 text-decoration-none me-3"
                style={{ borderRadius: '0.5rem' }}
              >
                <ArrowLeft size={24} />
              </Link>
            )}
            <h1 className="h2 fw-bold text-gray-900 mb-0">{title}</h1>
          </div>
          {children}
        </div>
      </div>
    </header>
  );
}

export default Header;