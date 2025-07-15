import React from 'react';
import { Link } from 'react-router-dom';
import { ChefHat, Users, Utensils, Star } from 'lucide-react';
 
function LandingPage() {
  return (
    // The overall container, min-h-screen to ensure it takes full viewport height
    <div className="min-h-screen gradient-orange">
      {/* Header - Made fixed-top */}
      {/*
        - fixed-top: Positions the element fixed at the top of the viewport.
        - w-100: Ensures it spans the full width.
        - z-10: Sets a higher z-index to ensure it stays above other content.
        - py-2: Reduced vertical padding from py-3 to py-2 to make the navbar shorter.
      */}
      <header className="bg-white shadow-sm fixed-top w-100 z-10">
        <div className="container py-2"> {/* Changed py-3 to py-2 here */}
          <div className="d-flex align-items-center justify-content-center">
            <Utensils className="text-orange-500 me-2" size={32} />
            <h1 className="h2 fw-bold text-gray-900 mb-0">CraveCart</h1>
          </div>
        </div>
      </header>
 
      {/* Hero Section - Adjusted padding-top to ensure content is not hidden */}
      {/*
        - pt-16: Adjusted top padding to match the reduced navbar height.
                 This should push the content down sufficiently to clear the fixed navbar.
                 If still overlapping, you can try a custom style with more px, e.g., style={{paddingTop: '80px'}}.
      */}
      <div className="container py-5 pt-16"> {/* Changed pt-24 to pt-16 here */}
        <div className="text-center mb-5">
          <h2 className="display-4 fw-bold text-gray-900 mb-3">
            Delicious Food, <span className="text-orange-500">Delivered Fast</span>
          </h2>
          <p className="lead text-gray-600 mb-4">
            Join thousands of restaurants and customers on CraveCart
          </p>
          <div className="d-flex align-items-center justify-content-center space-x-8">
            <div className="d-flex align-items-center me-4">
              <Star className="text-warning me-1" size={20} />
              <span className="text-gray-700">4.8 Rating</span>
            </div>
            <div className="d-flex align-items-center me-4">
              <Users className="text-primary me-1" size={20} />
              <span className="text-gray-700">10K+ Users</span>
            </div>
            <div className="d-flex align-items-center">
              <ChefHat className="text-success me-1" size={20} />
              <span className="text-gray-700">500+ Restaurants</span>
            </div>
          </div>
        </div>
 
        {/* Main Content - Customer and Restaurant Sections */}
        <div className="row g-4 align-items-stretch">
          {/* Customer Section */}
          <div className="col-lg-6">
            <div className="bg-white rounded-2xl shadow-custom-xl p-3 h-100 transition-all d-flex flex-column">
              <div className="text-center">
                <div className="bg-orange-100 rounded-circle d-flex align-items-center justify-content-center mx-auto mb-4"
                     style={{ width: '80px', height: '80px' }}>
                  <Users className="text-orange-500" size={40} />
                </div>
                <h3 className="h3 fw-bold text-gray-900 mb-3">Order as Customer</h3>
                <p className="text-gray-600 mb-4 fs-6 flex-grow-1">
                  Discover amazing restaurants, browse delicious menus, and get your favorite food delivered right to your doorstep.
                </p>
 
                <div className="d-grid gap-3 mb-4">
                  <Link
                    to="/customer/login"
                    className="btn btn-orange fw-semibold transition-all transform-scale"
                    style={{ backgroundColor: '#F97316', borderColor: '#F97316', color: '#FFFFFF' }}
                    onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#EA580C'; e.currentTarget.style.borderColor = '#EA580C'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                    onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#F97316'; e.currentTarget.style.borderColor = '#F97316'; e.currentTarget.style.transform = 'translateY(0)'; }}
                  >
                    Login as Customer
                  </Link>
                  <Link
                    to="/customer/register"
                    className="btn btn-outline-orange fw-semibold transition-all"
                    style={{ borderColor: '#F97316', color: '#F97316' }}
                    onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#F97316'; e.currentTarget.style.color = '#FFFFFF'; }}
                    onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#F97316'; }}
                  >
                    Register as Customer
                  </Link>
                </div>
 
                <div className="row text-center mt-auto pt-3 border-top border-gray-200">
                  <div className="col-4">
                    <div className="h3 fw-bold text-orange-500">500+</div>
                    <div className="small text-gray-600">Restaurants</div>
                  </div>
                  <div className="col-4">
                    <div className="h3 fw-bold text-orange-500">30min</div>
                    <div className="small text-gray-600">Avg Delivery</div>
                  </div>
                  <div className="col-4">
                    <div className="h3 fw-bold text-orange-500">24/7</div>
                    <div className="small text-gray-600">Support</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
 
          {/* Restaurant Section */}
          <div className="col-lg-6">
            <div className="bg-white rounded-2xl shadow-custom-xl p-3 h-100 transition-all d-flex flex-column">
              <div className="text-center">
                <div className="bg-green-100 rounded-circle d-flex align-items-center justify-content-center mx-auto mb-4"
                     style={{ width: '80px', height: '80px' }}>
                  <ChefHat className="text-green-500" size={40} />
                </div>
                <h3 className="h3 fw-bold text-gray-900 mb-3">Join as Restaurant</h3>
                <p className="text-gray-600 mb-4 fs-6 flex-grow-1">
                  Expand your reach, manage orders efficiently, and grow your restaurant business with our powerful platform.
                </p>
 
                <div className="d-grid gap-3 mb-4">
                  <Link
                    to="/restaurant/login"
                    className="btn btn-green fw-semibold transition-all transform-scale"
                    style={{ backgroundColor: '#22C55E', borderColor: '#22C55E', color: '#FFFFFF' }}
                    onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#16A34A'; e.currentTarget.style.borderColor = '#16A34A'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                    onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#22C55E'; e.currentTarget.style.borderColor = '#22C55E'; e.currentTarget.style.transform = 'translateY(0)'; }}
                  >
                    Login as Restaurant
                  </Link>
                  <Link
                    to="/restaurant/register"
                    className="btn btn-outline-green fw-semibold transition-all"
                    style={{ borderColor: '#22C55E', color: '#22C55E' }}
                    onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#22C55E'; e.currentTarget.style.color = '#FFFFFF'; }}
                    onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#22C55E'; }}
                  >
                    Register as Restaurant
                  </Link>
                </div>
 
                <div className="row text-center mt-auto pt-3 border-top border-gray-200">
                  <div className="col-4">
                    <div className="h3 fw-bold text-green-500">0%</div>
                    <div className="small text-gray-600">Setup Fee</div>
                  </div>
                  <div className="col-4">
                    <div className="h3 fw-bold text-green-500">10K+</div>
                    <div className="small text-gray-600">Customers</div>
                  </div>
                  <div className="col-4">
                    <div className="h3 fw-bold text-green-500">Easy</div>
                    <div className="small text-gray-600">Management</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
 
        {/* Features Section */}
        <div className="mt-5 text-center">
          <h3 className="h2 fw-bold text-gray-900 mb-5">Why Choose CraveCart?</h3>
          <div className="row g-4">
            <div className="col-md-4">
              <div className="bg-white rounded-xl p-4 shadow-custom">
                <div className="bg-blue-100 rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3"
                     style={{ width: '64px', height: '64px' }}>
                  <Utensils className="text-blue-500" size={32} />
                </div>
                <h4 className="h5 fw-semibold mb-2">Wide Variety</h4>
                <p className="text-gray-600">From local favorites to international cuisine, find exactly what you're craving.</p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="bg-white rounded-xl p-4 shadow-custom">
                <div className="bg-purple-100 rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3"
                     style={{ width: '64px', height: '64px' }}>
                  <Users className="text-purple-500" size={32} />
                </div>
                <h4 className="h5 fw-semibold mb-2">Fast Delivery</h4>
                <p className="text-gray-600">Get your food delivered hot and fresh in under 30 minutes on average.</p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="bg-white rounded-xl p-4 shadow-custom">
                <div className="bg-red-100 rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3"
                     style={{ width: '64px', height: '64px' }}>
                  <Star className="text-red-500" size={32} />
                </div>
                <h4 className="h5 fw-semibold mb-2">Quality Assured</h4>
                <p className="text-gray-600">All our partner restaurants are verified and maintain high quality standards.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
 
export default LandingPage;
 
 
 