import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Plus, Minus, Star, MapPin, Clock, ShoppingCart, Filter } from 'lucide-react';
import { useApp } from '../context/AppContext';

function RestaurantPage() {
    const { id } = useParams();
    const { state, dispatch, api } = useApp();
    const [dietFilter, setDietFilter] = useState('all'); // 'all', 'veg', 'non-veg'
    const [menu, setMenu] = useState([]);
    const [menuLoading, setMenuLoading] = useState(false);
    const [menuError, setMenuError] = useState(null);
    const [cartActionError, setCartActionError] = useState(null); // For errors from add/remove cart actions

    const restaurant = state.restaurants.find(r => r.id === parseInt(id));
    const cartItemsCount = state.cart.reduce((total, item) => total + item.quantity, 0);

    // Helper function to round price to 2 decimal places
    const roundPrice = (price) => {
        return Math.ceil(price * 100) / 100;
    };

    // Fetch menu from backend
    useEffect(() => {
        const fetchMenu = async () => {
            // Only proceed if restaurant is found
            if (!restaurant) {
                console.log("Restaurant not found, skipping menu fetch.");
                return;
            }

            // Your original logic to potentially use cached menu if available in the restaurant object
            // This is a good optimization if you're pre-fetching menus with restaurant data.
            if (restaurant.menu && restaurant.menu.length > 0) {
                setMenu(restaurant.menu);
                console.log("Using cached menu for restaurant:", restaurant.name);
                return;
            }
            
            setMenuLoading(true);
            setMenuError(null);
            try {
                // REVERTED: Changed back to your original '/menu/restaurant/${restaurant.id}'
                // This assumes your Menu Service exposes endpoints without a top-level '/api' prefix
                // if it's running on a different port or gateway handles routing.
                const response = await api.get(`/menu/restaurant/${restaurant.id}`); 
                const menuData = response.data;
                const mappedMenu = menuData.map(item => ({
                    id: item.itemId, // This is the menuItemId from the backend
                    name: item.itemName,
                    description: item.description,
                    price: item.price,
                    isVeg: item.isVegetarian ? 'yes' : 'no', // Assuming backend sends isVegetarian boolean
                }));
                setMenu(mappedMenu);
                console.log("Successfully fetched menu for restaurant:", restaurant.name, mappedMenu);
            } catch (err) {
                console.error("Failed to fetch menu:", err.response?.data?.message || err.message);
                setMenuError(err.response?.data?.message || 'Failed to load menu. Please try again.');
            } finally {
                setMenuLoading(false);
            }
        };
        fetchMenu();
    }, [restaurant, api]); // Re-fetch if restaurant or api instance changes

    if (!restaurant) {
        return (
            <div className="min-h-screen d-flex align-items-center justify-content-center">
                <div className="text-center">
                    <h2 className="h3 fw-bold text-gray-900 mb-3">Restaurant not found</h2>
                    <Link to="/main" className="text-orange-500 text-decoration-none">
                        Go back to main page
                    </Link>
                </div>
            </div>
        );
    }

    // Filter menu items based on diet preference
    const filteredMenu = menu.filter(item => {
        if (dietFilter === 'veg') return item.isVeg === 'yes';
        if (dietFilter === 'non-veg') return item.isVeg === 'no';
        return true; // 'all'
    });

    // Get quantity of an item in the cart based on its menuItemId
    const getItemQuantity = (menuItemId) => {
        // Find the item in the global cart state by its menuItemId
        const cartItem = state.cart.find(item => item.menuItemId === menuItemId);
        return cartItem ? cartItem.quantity : 0;
    };

    const canAddToCart = (restaurant) => {
        // If cart is empty, or current cart is for this restaurant, allow adding.
        return !state.cartRestaurant || state.cartRestaurant.id === restaurant.id;
    };

    // --- MODIFIED: handleAddToCart to interact with backend ---
// In RestaurantPage.jsx
const handleAddToCart = async (menuItem) => {
  setCartActionError(null);

  if (!canAddToCart(restaurant)) {
      setCartActionError('You can only order from one restaurant at a time. Please clear your cart first.');
      console.warn('Attempted to add item from a different restaurant. Action blocked.');
      return;
  }

  try {
      const cartItemDTO = {
          menuItemId: menuItem.id, // This is the menuItemId from the backend
          itemName: menuItem.name,
          quantity: 1,
          price: menuItem.price
      };

      console.log("Restaurant Page - Sending CartItemDTO to backend (add):", cartItemDTO);

      const response = await api.post('/cart/items', cartItemDTO);

      // --- Verify this payload carefully ---
      const payloadItem = {
          id: response.data.id || menuItem.id, // Ensure response.data.id exists or menuItem.id is fallback
          menuItemId: menuItem.id,
          name: menuItem.name,
          description: menuItem.description,
          price: menuItem.price,
          isVeg: menuItem.isVeg,
          quantity: 1 // Quantity added is 1
      };
      console.log("Restaurant Page - Dispatching ADD_TO_CART with payload.item:", payloadItem);

      dispatch({
          type: 'ADD_TO_CART',
          payload: {
              item: payloadItem, // Ensure 'item' key holds the constructed object
              restaurant: restaurant
          }
      });
      console.log("Item added to cart successfully (frontend & backend synced).");

  } catch (err) {
      console.error('Restaurant Page - Failed to add item to cart:', err.response?.data || err.message);
      setCartActionError(err.response?.data?.message || 'Failed to add item to cart. Please try again.');
  }
};

    // --- MODIFIED: handleRemoveFromCart to interact with backend ---
    const handleRemoveFromCart = async (menuItem) => {
        setCartActionError(null); // Clear previous errors

        const currentQuantity = getItemQuantity(menuItem.id);
        if (currentQuantity === 0) return; // Should not happen if button is disabled

        try {
            if (currentQuantity === 1) {
                // If quantity is 1, completely remove the item from the backend cart
                // Assuming api.defaults.baseURL is 'http://localhost:9095/'
                await api.delete(`/cart/items/${menuItem.id}`); // Use menuItem.id for deletion
                console.log(`Restaurant Page - Deleted item with menuItemId ${menuItem.id} from backend.`);
            } else {
                // If quantity > 1, update the quantity on the backend
                const updatePayload = {
                    menuItemId: menuItem.id,
                    quantity: currentQuantity - 1 // Send the new absolute quantity
                };
                console.log("Restaurant Page - Sending CartItemDTO to backend (update):", updatePayload);
                // Assuming api.defaults.baseURL is 'http://localhost:9095/'
                await api.put(`/cart/items/${menuItem.id}`, updatePayload); // Use menuItem.id for path variable
                console.log(`Restaurant Page - Decremented quantity for menuItemId ${menuItem.id} on backend.`);
            }

            // After successful backend call, dispatch action to update frontend state
            dispatch({
                type: 'REMOVE_FROM_CART',
                payload: { id: menuItem.id } // Pass the menuItem.id for removal logic in reducer
            });
            console.log("Item removed/decremented from cart successfully (frontend & backend synced).");

        } catch (err) {
            console.error('Restaurant Page - Failed to remove item from cart:', err.response?.data || err.message);
            setCartActionError(err.response?.data?.message || 'Failed to update cart. Please try again.');
        }
    };

    const vegCount = menu.filter(item => item.isVeg === 'yes').length;
    const nonVegCount = menu.filter(item => item.isVeg === 'no').length;

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm sticky-top z-40">
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
                            <div>
                                <h1 className="h3 fw-bold text-gray-900 mb-0">{restaurant.name}</h1>
                                <div className="d-flex align-items-center text-gray-600">
                                    <MapPin size={16} className="me-1" />
                                    <span className="small">{restaurant.location}</span>
                                </div>
                            </div>
                        </div>

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
                    </div>
                </div>
            </header>

            {/* Restaurant Info */}
            <div className="bg-white border-bottom">
                <div className="container-fluid py-4">
                    <div className="d-flex align-items-center justify-content-between">
                        <div className="d-flex align-items-center space-x-6">
                            <div className="d-flex align-items-center me-4">
                                <Star className="text-warning me-1" size={20} />
                                <span className="fw-semibold">4.{Math.floor(Math.random() * 5) + 2}</span>
                                <span className="text-gray-500 ms-1">(500+ reviews)</span>
                            </div>
                            <div className="d-flex align-items-center text-gray-600 me-4">
                                <Clock size={20} className="me-1" />
                                <span>{Math.floor(Math.random() * 20) + 25}-{Math.floor(Math.random() * 20) + 35} mins</span>
                            </div>
                            <span className="text-green-600 fw-semibold">Free delivery</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Menu */}
            <main className="container-fluid py-4">
                {/* Loading/Error States for Menu */}
                {menuLoading && (
                    <div className="text-center py-5">
                        <div className="spinner-border text-orange-500" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                    </div>
                )}
                {menuError && (
                    <div className="alert alert-danger text-center" role="alert">
                        {menuError}
                    </div>
                )}
                {cartActionError && (
                    <div className="alert alert-danger text-center" role="alert">
                        {cartActionError}
                    </div>
                )}
                <div className="d-flex align-items-center justify-content-between mb-4">
                    <h2 className="h3 fw-bold text-gray-900">Menu</h2>
                    {/* Diet Filter */}
                    <div className="d-flex align-items-center">
                        <Filter size={20} className="text-gray-500 me-2" />
                        <div className="btn-group" role="group">
                            <input
                                type="radio"
                                className="btn-check"
                                name="dietFilter"
                                id="all"
                                checked={dietFilter === 'all'}
                                onChange={() => setDietFilter('all')}
                            />
                            <label className="btn btn-outline-secondary btn-sm" htmlFor="all">
                                All ({menu.length})
                            </label>
                            <input
                                type="radio"
                                className="btn-check"
                                name="dietFilter"
                                id="veg"
                                checked={dietFilter === 'veg'}
                                onChange={() => setDietFilter('veg')}
                            />
                            <label className="btn btn-outline-success btn-sm d-flex align-items-center" htmlFor="veg">
                                <span className="bg-success rounded-circle me-1" style={{ width: '12px', height: '12px' }}></span>
                                Veg ({vegCount})
                            </label>
                            <input
                                type="radio"
                                className="btn-check"
                                name="dietFilter"
                                id="non-veg"
                                checked={dietFilter === 'non-veg'}
                                onChange={() => setDietFilter('non-veg')}
                            />
                            <label className="btn btn-outline-danger btn-sm d-flex align-items-center" htmlFor="non-veg">
                                <span className="bg-danger rounded-circle me-1" style={{ width: '12px', height: '12px' }}></span>
                                Non-Veg ({nonVegCount})
                            </label>
                        </div>
                    </div>
                </div>
                <div className="row g-3">
                    {filteredMenu.length === 0 && !menuLoading && !menuError ? (
                        <div className="col-12">
                            <div className="text-center py-5">
                                <div className="text-gray-400 mb-3">
                                    <Filter size={64} className="mx-auto" />
                                </div>
                                <h3 className="h5 fw-semibold text-gray-700 mb-2">No items found</h3>
                                <p className="text-gray-500 mb-3">
                                    No {dietFilter === 'veg' ? 'vegetarian' : 'non-vegetarian'} items available
                                </p>
                                <button
                                    onClick={() => setDietFilter('all')}
                                    className="btn btn-link text-orange-500 text-decoration-none fw-medium"
                                >
                                    View all items
                                </button>
                            </div>
                        </div>
                    ) : (
                        filteredMenu.map((item) => {
                            const quantity = getItemQuantity(item.id); // item.id here is the menuItemId
                            const isFromDifferentRestaurant = state.cartRestaurant && state.cartRestaurant.id !== restaurant.id;
                            return (
                                <div key={item.id} className="col-12">
                                    <div className="bg-white rounded-xl shadow-custom p-4 transition-all">
                                        <div className="d-flex justify-content-between align-items-start">
                                            <div className="flex-grow-1">
                                                <div className="d-flex align-items-center gap-2 mb-2">
                                                    <h3 className="h5 fw-semibold text-gray-900 mb-0">{item.name}</h3>
                                                    <span className={`badge ${
                                                        item.isVeg === 'yes' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                    }`}>
                                                        {item.isVeg === 'yes' ? '🟢 Veg' : '🔴 Non-Veg'}
                                                    </span>
                                                </div>
                                                <p className="text-gray-600 mb-3">{item.description}</p>
                                                <p className="h4 fw-bold text-green-600 mb-0">₹{roundPrice(item.price)}</p>
                                            </div>

                                            <div className="ms-4">
                                                {quantity === 0 ? (
                                                    <button
                                                        onClick={() => handleAddToCart(item)}
                                                        disabled={isFromDifferentRestaurant}
                                                        className={`btn d-flex align-items-center fw-semibold transition-all ${
                                                            isFromDifferentRestaurant
                                                                ? 'btn-secondary disabled'
                                                                : 'btn-orange transform-scale'
                                                        }`}
                                                    >
                                                        <Plus size={20} className="me-2" />
                                                        Add
                                                    </button>
                                                ) : (
                                                    <div className="btn-group" role="group">
                                                        <button
                                                            onClick={() => handleRemoveFromCart(item)}
                                                            className="btn btn-orange"
                                                        >
                                                            <Minus size={20} />
                                                        </button>
                                                        <span className="btn btn-orange fw-semibold" style={{ minWidth: '3rem' }}>
                                                            {quantity}
                                                        </span>
                                                        <button
                                                            onClick={() => handleAddToCart(item)}
                                                            className="btn btn-orange"
                                                        >
                                                            <Plus size={20} />
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Restriction Notice */}
                {state.cartRestaurant && state.cartRestaurant.id !== restaurant.id && (
                    <div className="mt-4">
                        <div className="alert alert-warning d-flex align-items-center">
                            <div className="me-3">
                                <svg className="text-warning" width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div>
                                <p className="mb-0 small">
                                    You have items from <strong>{state.cartRestaurant.name}</strong> in your cart.
                                    You can only order from one restaurant at a time.
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </main>

            {/* Floating Cart Button */}
            {state.cart.length > 0 && state.cartRestaurant?.id === restaurant.id && (
                <div className="fixed-bottom-center">
                    <Link
                        to="/cart"
                        className="btn btn-orange shadow-lg d-flex align-items-center fw-semibold text-decoration-none"
                        style={{ borderRadius: '2rem' }}
                    >
                        <ShoppingCart size={20} className="me-2" />
                        <span>
                            View Cart ({cartItemsCount} items) • ₹{roundPrice(state.cart.reduce((total, item) => total + (item.price * item.quantity), 0))}
                        </span>
                    </Link>
                </div>
            )}
        </div>
    );
}

export default RestaurantPage;