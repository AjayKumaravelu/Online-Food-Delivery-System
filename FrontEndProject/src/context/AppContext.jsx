import React, { createContext, useContext, useReducer, useEffect } from 'react';
import axios from 'axios';
import {jwtDecode} from 'jwt-decode';
import { useLocation } from 'react-router-dom';

const AppContext = createContext();

// Helper to get JWT from localStorage
const getToken = () => {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem('jwt');
  } catch {
    return null;
  }
};

// Extract userId from JWT token
const getUserIdFromToken = () => {
  try {
    const token = getToken();
    if (!token) return null;
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    const decoded = JSON.parse(jsonPayload);
    // Debug log
    console.log('Decoded JWT payload:', decoded);
    return decoded.userId || null;
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
};

const initialState = {
  user:null,
  userId: getUserIdFromToken(),
  userType: null, // You can add userType extraction if needed
  cart: [],
  cartRestaurant: null,
  restaurants: [], // Will be fetched from backend
  orders: [], // Will be fetched from backend
  currentRestaurant: null,
  loading: false,
  error: null
};

function appReducer(state, action) {
  switch (action.type) {
    case 'LOGIN':
      return {
        ...state,
        //userId: action.payload.userId,
        user:action.payload.user,
        userType: action.payload.userType
      };
    case 'LOGOUT':
      return {
        ...state,
        user:null,
        userId: null,
        userType: null,
        cart: [],
        cartRestaurant: null
      };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_RESTAURANTS':
      return { ...state, restaurants: action.payload };
    case 'SET_ORDERS':
      return { ...state, orders: action.payload };
    case 'SET_USER_ID':
      return { ...state, userId: action.payload };
// AppContext.jsx - Inside your 'export const appReducer = (state, action) => { switch (action.type) { ... } };'

case 'SET_CART': {
  const { cartItems, restaurant } = action.payload;

  const sanitizedCartItems = (cartItems || []).map(item => ({
      id: item.id, // This is the unique ID for the cart_item record in the backend DB
      menuItemId: item.menuItemId, // This is the ID of the actual MenuItem (crucial for logic)
      name: item.itemName || item.name || 'Unknown Item', // Prioritize itemName if backend sends it
      price: item.price || 0,
      quantity: item.quantity || 0,
      description: item.description || '', // Default to empty string if not provided
      isVeg: item.isVeg !== undefined ? item.isVeg : false // Default to false if not provided
  }));

  return {
      ...state,
      cart: sanitizedCartItems,
      cartRestaurant: restaurant // Store the restaurant object
  };
}
case 'FETCH_CART_SUCCESS':
  return {
      ...state,
      cart: action.payload.items, // Assuming payload has 'items'
      cartRestaurant: {             // <-- Make sure you set this!
          id: action.payload.restaurantId, // Assuming backend sends restaurantId directly
          name: action.payload.restaurantName, // If backend sends name
          address: action.payload.restaurantAddress // If backend sends address
          // ... whatever relevant restaurant details your backend returns with the cart
      },
      // ... other cart-related state
      error: null,
      loading: false
  };
case 'ADD_TO_CART': {
  const { item, restaurant } = action.payload;

  // Use menuItemId for consistent identification
  const targetMenuItemId = item.menuItemId || item.id; // item.id here refers to the menuItem.id when adding from menu list

  // Guard against adding items from different restaurants
  if (state.cartRestaurant && restaurant && state.cartRestaurant.id !== restaurant.id) {
      console.warn("Attempted to add item from a different restaurant. Please clear existing cart first.");
      return state; // Do not modify state
  }

  const existingCartItemIndex = state.cart.findIndex(
      cartItem => cartItem.menuItemId === targetMenuItemId
  );

  if (existingCartItemIndex > -1) {
      // Item already in cart, increment quantity
      const updatedCart = state.cart.map((cartItem, index) =>
          index === existingCartItemIndex
              ? { ...cartItem, quantity: cartItem.quantity + 1 }
              : cartItem
      );
      return {
          ...state,
          cart: updatedCart,
          cartRestaurant: state.cartRestaurant || restaurant // Maintain or set restaurant context
      };
  } else {
      // Item not in cart, add as a new entry
      return {
          ...state,
          cart: [...state.cart, {
              // For a newly added item, 'id' (cart_item DB ID) will be null until backend confirms.
              // 'menuItemId' is the true identifier for this type of item.
              id: null, // Backend will assign this ID after successful POST
              menuItemId: targetMenuItemId,
              name: item.name,
              description: item.description || '', // Carry over from original menu item or default
              price: item.price,
              isVeg: item.isVeg !== undefined ? item.isVeg : false, // Carry over or default
              quantity: 1 // Initial quantity for a new item
          }],
          cartRestaurant: state.cartRestaurant || restaurant // Set restaurant for the cart
      };
  }
}

case 'REMOVE_FROM_CART': {
  // payload.id here should ALWAYS be the menuItemId for consistency
  const removedMenuItemId = action.payload.id;
  const quantityToRemove = action.payload.quantity || 1; // Default to 1 for single decrement

  const itemToRemoveIndex = state.cart.findIndex(
      cartItem => cartItem.menuItemId === removedMenuItemId
  );

  if (itemToRemoveIndex === -1) {
      console.warn("Attempted to remove item not found in cart state:", removedMenuItemId);
      return state; // Item not found, no change to state
  }

  const itemToUpdate = state.cart[itemToRemoveIndex];

  // If quantity after removal is 0 or less, filter the item out
  if (itemToUpdate.quantity <= quantityToRemove) {
      const updatedCart = state.cart.filter(
          cartItem => cartItem.menuItemId !== removedMenuItemId
      );
      return {
          ...state,
          cart: updatedCart,
          // If cart becomes empty, clear restaurant association
          cartRestaurant: updatedCart.length === 0 ? null : state.cartRestaurant
      };
  } else {
      // Decrement quantity without removing the item
      const updatedCart = state.cart.map((cartItem, index) =>
          index === itemToRemoveIndex
              ? { ...cartItem, quantity: cartItem.quantity - quantityToRemove }
              : cartItem
      );
      return { ...state, cart: updatedCart };
  }
}

case 'CLEAR_CART': {
  return {
      ...state,
      cart: [], // Empty the cart array
      cartRestaurant: null // Clear the associated restaurant
  };
}

    case 'ADD_ORDER':
      return {
        ...state,
        orders: [action.payload, ...state.orders]
      };
    case 'UPDATE_ORDER_STATUS':
      return {
        ...state,
        orders: state.orders.map(order =>
          order.id === action.payload.orderId
            ? { ...order, status: action.payload.status }
            : order
        )
      };
    case 'SET_CURRENT_RESTAURANT':
      return {
        ...state,
        currentRestaurant: action.payload
      };
    case 'ADD_MENU_ITEM':
      return {
        ...state,
        restaurants: state.restaurants.map(restaurant =>
          restaurant.id === action.payload.restaurantId
            ? {
                ...restaurant,
                menu: [...restaurant.menu, { ...action.payload.item, id: Date.now() }]
              }
            : restaurant
        )
      };
    case 'UPDATE_MENU_ITEM':
      return {
        ...state,
        restaurants: state.restaurants.map(restaurant =>
          restaurant.id === action.payload.restaurantId
            ? {
                ...restaurant,
                menu: restaurant.menu.map(item =>
                  item.id === action.payload.item.id ? action.payload.item : item
                )
              }
            : restaurant
        )
      };
    case 'DELETE_MENU_ITEM':
      return {
        ...state,
        restaurants: state.restaurants.map(restaurant =>
          restaurant.id === action.payload.restaurantId
            ? {
                ...restaurant,
                menu: restaurant.menu.filter(item => item.id !== action.payload.itemId)
              }
            : restaurant
        )
      };
    default:
      return state;
  }
}

// Helper to get user type from token
const getUserTypeFromToken = () => {
  try {
    const token = getToken();
    if (!token) return null;
    
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    
    const decoded = JSON.parse(jsonPayload);
    const roles = decoded.roles || [];
    
    if (roles.includes('RESTAURANT')) return 'restaurant';
    if (roles.includes('CUSTOMER')) return 'customer';
    return null;
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
};

// API base URL (should point to API Gateway)
const API_BASE = '/api';

// Create axios instance with default configuration
const api = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - redirect to login
      localStorage.removeItem('jwt');
     // window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Fetch restaurants from backend
  const fetchRestaurants = async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const response = await api.get('/restaurants');
      const restaurantData=response.data;
      const restaurantWithMenus=await Promise.all(
        restaurantData.map(async (restaurant)=>{
          try{
            const menu=await api.get(`/restaurants/${restaurant.id}`);
            console.log(menu);
            return {
              ...restaurant,
              menu: menu.data
            }
          } catch (menuErr) {
            console.error(`Failed to fetch menu for restaurant ID ${restaurant.id}:`, menuErr);
            // If fetching the menu fails for a specific restaurant, 
            // return the restaurant with an empty menu to avoid breaking the display.
            return { ...restaurant, menu: [] }; 
          }
        })
      );
      dispatch({ type: 'SET_RESTAURANTS', payload: response.data });
    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: err.response?.data?.message || err.message });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Fetch user orders from backend
  const fetchOrders = async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const response = await api.get('/orders/user');
      dispatch({ type: 'SET_ORDERS', payload: response.data });
    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: err.response?.data?.message || err.message });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Fetch user profile from backend
  const fetchUserProfile = async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const response = await api.get('/customers/user');
      dispatch({ type: 'SET_USER_ID', payload: response.data.id }); // Assuming response.data.id is the userId
    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: err.response?.data?.message || err.message });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // On mount, fetch restaurants if not loaded
  useEffect(() => {
    if (state.restaurants.length === 0) {
      fetchRestaurants();
    }
  }, []);
  useEffect(() => {
    const token = getToken();
    const path = window.location.pathname;
  
    const isResaurantRoute = path.startsWith('/restaurant')
    const isCustomerRoute = path.startsWith('/customer') || path.startsWith('/user-profile') || path.startsWith('/main');
  

    if(!token) return;

      try {
        const decoded = jwtDecode(token);
        const userId = decoded.userId;
        const roles = decoded.roles || [];
        const userType = roles[0]?.toLowerCase() || null;
        
        if((isResaurantRoute && userType === 'restaurant')||(isCustomerRoute && userType === 'customer')){
          dispatch({
          type: 'LOGIN',
          payload: {
            user: { id: userId },
            userType
          }
          
        });
  
        console.log('Restored customer user from token', { userId, userType });
      }
      } catch (err) {
        console.error('Failed to decode customer token', err);
        localStorage.removeItem('jwt');
      }
  }, []);

  return (
    <AppContext.Provider value={{ 
      state, 
      dispatch, 
      fetchRestaurants, 
      fetchOrders, 
      fetchUserProfile,
      api // Export api instance for use in components
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}