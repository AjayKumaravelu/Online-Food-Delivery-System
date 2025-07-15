import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ShoppingCart, User, Utensils, Star, MapPin } from 'lucide-react';
import { useApp } from '../context/AppContext';

function MainPage() {
  const { state } = useApp();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  const categories = [
    { id: 1, name: 'Biryani', image: 'https://images.pexels.com/photos/1624487/pexels-photo-1624487.jpeg?auto=compress&cs=tinysrgb&w=300' },
    { id: 2, name: 'Pizza', image: 'https://images.pexels.com/photos/315755/pexels-photo-315755.jpeg?auto=compress&cs=tinysrgb&w=300' },
    { id: 3, name: 'Burger', image: 'https://images.pexels.com/photos/1556698/pexels-photo-1556698.jpeg?auto=compress&cs=tinysrgb&w=300' },
    { id: 4, name: 'Indian', image: 'https://images.pexels.com/photos/4871119/pexels-photo-4871119.jpeg?auto=compress&cs=tinysrgb&w=300' },
    { id: 5, name: 'Chinese', image: 'https://images.pexels.com/photos/2456435/pexels-photo-2456435.jpeg?auto=compress&cs=tinysrgb&w=300' },
    { id: 6, name: 'Desserts', image: 'https://images.pexels.com/photos/291528/pexels-photo-291528.jpeg?auto=compress&cs=tinysrgb&w=300' }
  ];

  const filteredRestaurants = state.restaurants.filter(restaurant =>
    restaurant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (restaurant.menu || []).some(item =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const cartItemsCount = state.cart.reduce((total, item) => total + item.quantity, 0);

  // Helper function to get minimum price from restaurant menu
  // Keeping this function as-is, as it might be used elsewhere or in future functionality,
  // but its output won't be displayed on the main page.
  const getMinPrice = (restaurant) => {
    if (!restaurant.menu || !Array.isArray(restaurant.menu) || restaurant.menu.length === 0) return 0;
    const prices = restaurant.menu.map(item => Number(item.price)).filter(price => price > 0);
    console.log(prices);
    return prices.length > 0 ? Math.min(...prices) : 0;
  };

  // Helper function to get delivery time range
  const getDeliveryTime = () => {
    const min = Math.floor(Math.random() * 20) + 25;
    const max = Math.floor(Math.random() * 20) + 35;
    return `${min}-${max} mins`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky-top z-40">
        <div className="container-fluid">
          <div className="d-flex align-items-center justify-content-between py-3">
            {/* Logo */}
            <div className="d-flex align-items-center">
              <Utensils className="text-orange-500 me-2" size={32} />
              <h1 className="h3 fw-bold text-gray-900 mb-0">CraveCart</h1>
            </div>

            {/* Search Bar */}
            <div className="flex-grow-1 mx-4" style={{ maxWidth: '32rem' }}>
              <div className="position-relative">
                <Search className="position-absolute text-gray-400" size={20} style={{ left: '12px', top: '8px', zIndex: 5 }} />
                <input
                  type="text"
                  placeholder="Search for restaurants or dishes..."
                  className="form-control ps-5"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* Navigation */}
            <div className="d-flex align-items-center space-x-4">
              <Link
                to="/cart"
                className="btn btn-link position-relative p-2 text-gray-600 text-decoration-none"
                style={{ borderRadius: '0.5rem' }}
              >
                <ShoppingCart size={24} />
                {cartItemsCount > 0 && (
                  <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-orange-500">
                    {cartItemsCount}
                  </span>
                )}
              </Link>
              <Link
                to="/profile"
                className="btn btn-link p-2 text-gray-600 text-decoration-none"
                style={{ borderRadius: '0.5rem' }}
              >
                <User size={24} />
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container-fluid py-4">
        {/* Categories */}
        <section className="mb-5">
          <h2 className="h3 fw-bold text-gray-900 mb-4">What's on your mind?</h2>
          <div className="row g-3">
            {categories.map((category) => (
              <div key={category.id} className="col-6 col-md-4 col-lg-2">
                <div
                  className="text-center p-3 rounded-xl transition-all cursor-pointer"
                  onClick={() => setSearchTerm(category.name)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="mx-auto mb-2 rounded-circle overflow-hidden transition-all"
                       style={{ width: '80px', height: '80px' }}>
                    <img
                      src={category.image}
                      alt={category.name}
                      className="w-100 h-100 object-fit-cover"
                    />
                  </div>
                  <p className="fw-semibold text-gray-700 mb-0">
                    {category.name}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Loading/Error States */}
        {state.loading && (
          <div className="text-center py-5">
            <div className="spinner-border text-orange-500" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        )}
        {state.error && (
          <div className="alert alert-danger text-center" role="alert">
            {state.error}
          </div>
        )}

        {/* Restaurants */}
        <section>
          <h2 className="h3 fw-bold text-gray-900 mb-4">
            {searchTerm ? `Results for "${searchTerm}"` : 'Popular Restaurants'}
          </h2>
          <div className="row g-4">
            {filteredRestaurants.map((restaurant) => {
              // const minPrice = getMinPrice(restaurant); // No longer needed for display
              const deliveryTime = getDeliveryTime();

              return (
                <div key={restaurant.id} className="col-md-6 col-lg-4">
                  <div
                    className="bg-white rounded-xl shadow-custom transition-all h-100 overflow-hidden cursor-pointer"
                    onClick={() => navigate(`/restaurant/${restaurant.id}`)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="position-relative" style={{ height: '12rem', background: 'linear-gradient(135deg, #f97316 0%, #ef4444 100%)' }}>
                      <div className="position-absolute inset-0" style={{ backgroundColor: 'rgba(0,0,0,0.2)' }} />
                      <div className="position-absolute bottom-0 start-0 p-3 text-white">
                        <h3 className="h5 fw-bold">{restaurant.name}</h3>
                        <div className="d-flex align-items-center mt-1">
                          <MapPin size={16} className="me-1" />
                          <span className="small">{restaurant.location}</span>
                        </div>
                      </div>
                      <div className="position-absolute top-0 end-0 p-3">
                        <div className="bg-white bg-opacity-25 backdrop-blur rounded p-1">
                          <div className="d-flex align-items-center text-white small">
                            <Star size={16} className="me-1" />
                            <span>4.{Math.floor(Math.random() * 5) + 2}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-3">
                      <div className="d-flex align-items-center justify-content-between mb-2">
                        {/* This part was showing the menu items. Keep it as is to avoid breaking other functionality. */}
                        <p className="text-gray-600 mb-0 small">
                          {(restaurant.menu || []).slice(0, 3).map(item => item.name).join(', ')}
                          {(restaurant.menu || []).length > 3 && '...'}
                        </p>
                        {/* --- REMOVED: Starting from price section --- */}
                        {/* Original code:
                        <div className="text-end">
                          <p className="small text-gray-500 mb-0">Starting from</p>
                          <p className="fw-semibold text-green-600 mb-0">
                            ₹{minPrice > 0 ? minPrice : 'N/A'}
                          </p>
                        </div>
                        */}
                        {/* --- END REMOVED --- */}
                      </div>

                      <div className="d-flex align-items-center justify-content-between small text-gray-500">
                        <span>{deliveryTime}</span>
                        <span>Free delivery</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredRestaurants.length === 0 && searchTerm && !state.loading && (
            <div className="text-center py-5">
              <div className="text-gray-400 mb-3">
                <Search size={64} className="mx-auto" />
              </div>
              <h3 className="h5 fw-semibold text-gray-700 mb-2">No results found</h3>
              <p className="text-gray-500">Try searching for something else</p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default MainPage;