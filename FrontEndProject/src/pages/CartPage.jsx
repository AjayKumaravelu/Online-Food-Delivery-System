import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Minus, ShoppingCart } from 'lucide-react';
import { useApp } from '../context/AppContext'; // Assuming useApp provides state, dispatch, and api

function CartPage() {
    const { state, dispatch, api } = useApp();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false); // For order placement
    const [error, setError] = useState(null); // For general API errors and order placement
    const [cartLoading, setCartLoading] = useState(true); // For initial cart fetch
    // NEW STATE: To store the fetched user's delivery address
    const [userDeliveryAddress, setUserDeliveryAddress] = useState(null);

    // Helper function to round price to 2 decimal places
    const roundPrice = (price) => {
        // Using Math.round for standard rounding, Math.ceil if you prefer always rounding up cents
        return Math.round(price * 100) / 100;
    };

    // --- NEW / MODIFIED: Fetch cart from backend, then fetch restaurant details, AND user address ---
    const fetchCartAndRestaurantDetails = useCallback(async () => {
        setCartLoading(true);
        setError(null); // Clear previous errors
        let fetchedRestaurantDetails = null;
        let fetchedUserAddress = null; // Initialize local variable for user address

        try {
            // STEP 1: Fetch Cart Data from your Order Service (backend)
            const cartResponse = await api.get('/cart');
            const cartData = cartResponse.data;
            console.log("CartPage - Fetched Cart Data from Backend:", cartData);

            // STEP 2: Conditionally Fetch Restaurant Details if a restaurantId is present
            if (cartData.restaurantId) {
                try {
                    const restaurantResponse = await api.get(`/restaurants/${cartData.restaurantId}`);
                    fetchedRestaurantDetails = restaurantResponse.data;
                    console.log("CartPage - Fetched Restaurant Details for ID", cartData.restaurantId, ":", fetchedRestaurantDetails);
                } catch (restaurantErr) {
                    console.error("CartPage - Failed to fetch restaurant details for ID:", cartData.restaurantId, restaurantErr);
                    fetchedRestaurantDetails = { id: cartData.restaurantId, name: "Unknown Restaurant (Failed to load details)", location: "N/A" };
                    setError(`Could not load details for restaurant ID ${cartData.restaurantId}.`);
                }
            } else {
                console.log("Cart is empty or has no associated restaurantId yet.");
            }

            // STEP 3 (NEW): Fetch User Details to get the delivery address
            try {
                const userResponse = await api.get('/customers/user');
                // Assuming the DTO from /customers/user has an 'address' field
                fetchedUserAddress = userResponse.data.address;
                console.log("CartPage - Fetched User Address:", fetchedUserAddress);
                setUserDeliveryAddress(fetchedUserAddress); // Set the state
            } catch (userErr) {
                console.error("CartPage - Failed to fetch user address:", userErr);
                setError((prev) => prev ? `${prev} And could not load your delivery address.` : 'Could not load your delivery address.');
                setUserDeliveryAddress(null); // Explicitly set to null if fetch fails
            }

            // IMPORTANT: Map backend items to frontend format
            const mappedCartItems = (cartData.items || []).map(item => ({
                id: item.id,
                menuItemId: item.menuItemId,
                name: item.itemName,
                price: item.price,
                quantity: item.quantity,
                description: item.description || 'No description available',
                isVeg: item.isVeg
            }));

            // STEP 4: Dispatch SET_CART with the mapped cart items and the (now enriched) restaurant data
            dispatch({
                type: 'SET_CART',
                payload: {
                    cartItems: mappedCartItems,
                    restaurant: fetchedRestaurantDetails
                }
            });
            console.log("CartPage - SET_CART dispatched with mapped items and restaurant data.");

        } catch (err) {
            console.error('Failed to fetch cart:', err);
            if (err.response) {
                if (err.response.status === 404) {
                    setError('Cart not found or session expired. Please add items to your cart.');
                    dispatch({ type: 'CLEAR_CART' });
                } else if (err.response.status === 500) {
                    setError('Server error loading cart. Please try again later. (Check backend logs for details)');
                } else {
                    setError(err.response.data?.message || 'Failed to load cart. Please try again.');
                }
            } else {
                setError('Network error or server unreachable. Please check your connection.');
            }
        } finally {
            setCartLoading(false);
        }
    }, [api, dispatch]);

    // Use the new fetching function in useEffect
    useEffect(() => {
        fetchCartAndRestaurantDetails();
    }, [fetchCartAndRestaurantDetails]);

    // --- handleAddToCart to interact with backend ---
    const handleAddToCart = async (item) => {
        setError(null); // Clear previous action errors

        const actualMenuItemId = item.menuItemId || item.id;

        if (!item || !actualMenuItemId) {
            console.error("CartPage - handleAddToCart: Item or menuItemId is missing or undefined:", item);
            setError("Cannot add item: item data is incomplete.");
            return;
        }

        // Optimistic UI update: update frontend state immediately for responsiveness
        dispatch({
            type: 'ADD_TO_CART',
            payload: { item: { ...item, menuItemId: actualMenuItemId }, restaurant: state.cartRestaurant }
        });

        try {
            const cartItemDTO = {
                menuItemId: actualMenuItemId,
                itemName: item.name,
                quantity: 1,
                price: item.price
            };
            console.log("CartPage - Sending CartItemDTO to backend (add/increment):", cartItemDTO);

            await api.post('/cart/items', cartItemDTO);

        } catch (err) {
            console.error('CartPage - Failed to add item to backend cart:', err.response?.data || err.message);
            setError(err.response?.data?.message || 'Failed to add item to cart. Please try again.');
            // Revert optimistic frontend state if backend call fails
            dispatch({
                type: 'REMOVE_FROM_CART',
                payload: { id: actualMenuItemId, quantity: 1 }
            });
        }
    };

    // --- handleRemoveFromCart to interact with backend ---
    const handleRemoveFromCart = async (item) => {
        setError(null); // Clear previous action errors

        const actualMenuItemId = item.menuItemId || item.id;

        if (!item || !actualMenuItemId) {
            console.error("CartPage - handleRemoveFromCart: Item or menuItemId is missing or undefined:", item);
            setError("Cannot remove item: item data is incomplete.");
            return;
        }

        const currentCartItem = state.cart.find(cartIt => cartIt.menuItemId === actualMenuItemId);
        if (!currentCartItem) {
            console.warn("CartPage - handleRemoveFromCart: Item not found in current state for removal:", item);
            return;
        }

        const isLastItem = currentCartItem.quantity === 1;

        // Optimistic UI update
        dispatch({
            type: 'REMOVE_FROM_CART',
            payload: { id: actualMenuItemId }
        });

        try {
            if (isLastItem) {
                await api.delete(`/cart/items/${actualMenuItemId}`);
                console.log("CartPage - Deleted item from backend with menuItemId:", actualMenuItemId);
            } else {
                const updatePayload = {
                    menuItemId: actualMenuItemId,
                    quantity: currentCartItem.quantity - 1
                };
                console.log("CartPage - Sending CartItemDTO to backend (update decrement):", updatePayload);
                await api.put(`/cart/items/${actualMenuItemId}`, updatePayload);
            }

        } catch (err) {
            console.error('CartPage - Failed to remove item from backend cart:', err.response?.data || err.message);
            setError(err.response?.data?.message || 'Failed to update cart. Please try again.');
            // Revert optimistic frontend state if backend call fails
            dispatch({
                type: 'ADD_TO_CART',
                payload: { item: { ...item, menuItemId: actualMenuItemId }, restaurant: state.cartRestaurant }
            });
        }
    };

    // --- Clear Cart functionality ---
    const handleClearCart = async () => {
        setError(null);
        if (state.cart.length === 0) return;

        // Optimistic UI update
        dispatch({ type: 'CLEAR_CART' });

        try {
            await api.delete('/cart');
            console.log("CartPage - Sent request to clear entire cart on backend.");
        } catch (err) {
            console.error('CartPage - Failed to clear cart on backend:', err.response?.data || err.message);
            setError(err.response?.data?.message || 'Failed to clear cart. Please try again.');
            fetchCartAndRestaurantDetails();
        }
    };

    // Calculate totals from current frontend state
    const subtotal = roundPrice(state.cart.reduce((total, item) => total + (item.price * item.quantity), 0));
    const deliveryFee = subtotal > 200 ? 0 : 30; // Assuming free delivery above 200
    const tax = roundPrice(subtotal * 0.05);
    const total = roundPrice(subtotal + deliveryFee + tax);

    // handlePlaceOrder (now relies on state.cartRestaurant AND userDeliveryAddress being populated)
    const handlePlaceOrder = async () => {
        // Added checks for cart not empty, restaurant ID, AND userDeliveryAddress
        if (state.cart.length === 0 || !state.cartRestaurant?.id || !userDeliveryAddress) {
            setError("Cannot place order: Cart is empty, restaurant details, or your delivery address is missing.");
            console.warn("Order placement prevented: Cart length:", state.cart.length, "Cart Restaurant ID:", state.cartRestaurant?.id, "User Delivery Address:", userDeliveryAddress);
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const orderPayload = {
                restaurantId: state.cartRestaurant.id,
                items: state.cart.map(item => ({
                    menuItemId: item.menuItemId,
                    quantity: item.quantity
                })),
                total,
                deliveryFee,
                tax,
                // Using the dynamically fetched userDeliveryAddress
                deliveryAddress: userDeliveryAddress
            };
            console.log("CartPage - Sending Order Payload:", orderPayload);
            console.log("state.cartRestaurant (before order):", state.cartRestaurant); // Detailed log

            const response = await api.post('/orders', orderPayload, {
                headers: {
                    'Idempotency-Key': `order-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
                }
            });
            const placedOrder=response.data;
            console.log("placed order",placedOrder);

            // Clear frontend cart immediately
            dispatch({ type: 'CLEAR_CART' });

            // Attempt to clear backend cart after a successful order

            dispatch({ type: 'ADD_ORDER', payload: response.data });
            navigate('/payment', { state: { order: response.data } });
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to place order');
            console.error('CartPage - Order placement error:', err.response?.data || err.message);
        } finally {
            setLoading(false);
        }
    };

    // Show loading state for initial cart fetch
    if (cartLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="spinner-border text-orange-500" role="status">
                    <span className="visually-hidden">Loading cart...</span>
                </div>
            </div>
        );
    }

    // Existing JSX for empty cart or cart with items
    if (state.cart.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50">
                <header className="bg-white shadow-sm">
                    <div className="container-fluid">
                        <div className="d-flex align-items-center py-3">
                            <Link to="/main" className="btn btn-link p-2 text-gray-600 text-decoration-none me-3" style={{ borderRadius: '0.5rem' }}>
                                <ArrowLeft size={24} />
                            </Link>
                            <h1 className="h3 fw-bold text-gray-900 mb-0">Your Cart</h1>
                        </div>
                    </div>
                </header>
                <div className="container-fluid py-5">
                    <div className="text-center">
                        <div className="text-gray-300 mb-4">
                            <ShoppingCart size={96} className="mx-auto" />
                        </div>
                        <h2 className="h3 fw-bold text-gray-900 mb-3">Your cart is empty</h2>
                        <p className="text-gray-600 mb-4">Add some delicious items to get started!</p>
                        <Link to="/main" className="btn btn-orange d-inline-flex align-items-center">
                            Browse Restaurants
                        </Link>
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
                        <Link to="/main" className="btn btn-link p-2 text-gray-600 text-decoration-none me-3" style={{ borderRadius: '0.5rem' }}>
                            <ArrowLeft size={24} />
                        </Link>
                        <h1 className="h3 fw-bold text-gray-900 mb-0">Your Cart</h1>
                        {state.cart.length > 0 && (
                            <button onClick={handleClearCart} className="btn btn-link text-danger text-decoration-none fw-medium ms-auto">
                                Clear Cart
                            </button>
                        )}
                    </div>
                </div>
            </header>

            <div className="container-fluid py-4">
                <div className="row g-4">
                    {/* Cart Items */}
                    <div className="col-lg-8">
                        {/* Display Restaurant Info ONLY if it exists in state */}
                        {state.cartRestaurant && (
                            <div className="bg-white rounded-xl shadow-custom p-4 mb-4">
                                <h2 className="h5 fw-bold text-gray-900 mb-2">
                                    Ordering from {state.cartRestaurant.name || 'Loading Restaurant Name...'}
                                </h2>
                                {/* Assuming 'location' field is what you want for address, otherwise change to .address */}
                                <p className="text-gray-600 mb-0">{state.cartRestaurant.location || state.cartRestaurant.address || 'Location not available'}</p>
                            </div>
                        )}
                        <div className="bg-white rounded-xl shadow-custom p-4 mb-4">
                            <h3 className="h5 fw-semibold text-gray-900 mb-3">Delivery Address</h3>
                            {userDeliveryAddress ? (
                                <p className="text-gray-600">{userDeliveryAddress}</p>
                            ) : (
                                <p className="text-danger">Delivery address not found. Please update your profile.</p>
                            )}
                            {/* You might want to add an "Edit Address" button here in a real app */}
                        </div>

                        <div className="bg-white rounded-xl shadow-custom p-4">
                            <h3 className="h5 fw-semibold text-gray-900 mb-3">Order Items</h3>
                            <div className="space-y-4">
                                {state.cart.map((item) => {
                                    console.log("Rendering CartItem with key:", item.id, "and menuItemId:", item.menuItemId);
                                    return (
                                        <div key={item.id || item.menuItemId} className="d-flex align-items-center justify-content-between py-3 border-bottom">
                                            <div className="flex-grow-1">
                                                <div className="d-flex align-items-center gap-2 mb-1">
                                                    <h6 className="fw-semibold text-gray-900 mb-0">{item.name}</h6>
                                                    {/* Display isVeg badge only if backend provides it */}
                                                    {item.isVeg !== undefined && (
                                                        <span className={`badge ${item.isVeg ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                            {item.isVeg ? '🟢' : '🔴'}
                                                        </span>
                                                    )}
                                                </div>
                                                {/* Display description only if backend provides it and it's not empty */}
                                                {item.description && item.description !== 'No description available' && (
                                                    <p className="text-gray-600 small mb-2">{item.description}</p>
                                                )}
                                                <p className="fw-semibold text-green-600 mb-0">₹{item.price}</p>
                                            </div>
                                            <div className="d-flex align-items-center">
                                                <div className="btn-group me-3" role="group">
                                                    <button onClick={() => handleRemoveFromCart(item)} className="btn btn-outline-orange">
                                                        <Minus size={16} />
                                                    </button>
                                                    <span className="btn btn-outline-orange fw-semibold" style={{ minWidth: '3rem' }}>
                                                        {item.quantity}
                                                    </span>
                                                    <button onClick={() => handleAddToCart(item)} className="btn btn-outline-orange">
                                                        <Plus size={16} />
                                                    </button>
                                                </div>
                                                <p className="fw-semibold text-gray-900 mb-0" style={{ minWidth: '4rem', textAlign: 'right' }}>
                                                    ₹{roundPrice(item.price * item.quantity)}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                    {/* Order Summary */}
                    <div className="col-lg-4">
                        <div className="bg-white rounded-xl shadow-custom p-4 sticky-top-custom">
                            <h3 className="h5 fw-semibold text-gray-900 mb-4">Order Summary</h3>
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
                            {deliveryFee > 0 && (
                                <div className="alert alert-info mb-4">
                                    <p className="small mb-0">
                                        Add ₹{roundPrice(200 - subtotal)} more to get free delivery!
                                    </p>
                                </div>
                            )}
                            {error && (
                                <div className="alert alert-danger text-center" role="alert">
                                    {error}
                                </div>
                            )}
                            {loading && (
                                <div className="text-center py-2">
                                    <div className="spinner-border text-orange-500" role="status">
                                        <span className="visually-hidden">Placing order...</span>
                                    </div>
                                </div>
                            )}
                            <button
                                onClick={handlePlaceOrder}
                                className="btn btn-orange w-100 fw-semibold transition-all transform-scale"
                                // Disable if no cart, no restaurant ID, or no user delivery address
                                disabled={loading || state.cart.length === 0 || !state.cartRestaurant?.id || !userDeliveryAddress}
                            >
                                Place Order • ₹{total}
                            </button>
                            <div className="mt-3 text-center">
                                {/* Link back to restaurant page. Ensure state.cartRestaurant.id is valid */}
                                <Link to={`/restaurant/${state.cartRestaurant?.id}`} className="text-orange-500 small text-decoration-none">
                                    Add more items
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CartPage;