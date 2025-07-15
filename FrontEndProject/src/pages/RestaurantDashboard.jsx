// import React, { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import { LogOut, Plus, Clock, ChefHat, Filter } from "lucide-react";
// import { useApp } from "../context/AppContext.jsx";
// import Header from "../components/Header.jsx";
// import Button from "../components/Button.jsx";
// import Modal from "../components/Modal.jsx";
// import FormInput from "../components/FormInput.jsx";
// import StatusBadge from "../components/StatusBadge.jsx";
// import MenuItemCard from "../components/MenuItemCard.jsx";

// function RestaurantDashboard() {
//   const { state, dispatch, api } = useApp();
//   const navigate = useNavigate();
//   const [showAddForm, setShowAddForm] = useState(false);
//   const [editingItem, setEditingItem] = useState(null);
//   const [dietFilter, setDietFilter] = useState("all");
//   const [newItem, setNewItem] = useState({
//     name: "",
//     isVeg: "yes",
//     price: "",
//     description: "",
//   });
//   const [orders, setOrders] = useState([]);
//   const [menu, setMenu] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const [restaurantDetails, setRestaurantDetails] = useState({
//     name: "Restaurant Dashboard",
//     location: "Location"
//   });

//   const restaurantId = state.userId; // Use userId directly from state

//   // Fetch restaurant details
//   const fetchRestaurantDetails = async () => {
//     if (!restaurantId) return;
    
//     try {
//       const response = await api.get(`/restaurants/${restaurantId}`);
//       const data = response.data;
//       setRestaurantDetails({
//         name: data.name || "Restaurant Dashboard",
//         location: data.location || "Location"
//       });
//     } catch (err) {
//       console.error('Error fetching restaurant details:', err);
//       // Keep default values if fetch fails
//     }
//   };

//   // Fetch menu and orders on component mount
//   useEffect(() => {
//     const fetchData = async () => {
//       if (!restaurantId) {
//         console.log('No restaurant ID available, skipping data fetch');
//         return;
//       }
      
//       setLoading(true);
//       setError(null);
//       try {
//         // Fetch restaurant details
//         await fetchRestaurantDetails();
        
//         // Fetch menu using the restaurant ID
//         const menuResponse = await api.get(`/menu/restaurant/${restaurantId}`);
//         const menuData = menuResponse.data;
//         console.log('Raw menu data:', menuData); // Debug log
        
//         const mappedMenu = menuData.map(item => ({
//           id: item.itemId,
//           name: item.itemName,
//           description: item.description,
//           price: item.price,
//           isVeg: item.isVegetarian ? 'yes' : 'no',
//         }));
//         console.log('Mapped menu:', mappedMenu); // Debug log
//         setMenu(mappedMenu);

//         // Fetch orders
//         const ordersResponse = await api.get("/orders/restaurant");
//         const ordersData = ordersResponse.data;
//         setOrders(ordersData);
//       } catch (err) {
//         console.error('Error fetching data:', err); // Debug log
//         setError(err.response?.data?.message || err.message);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchData();
//   }, [restaurantId, api]);

//   // Filter menu items based on diet preference
//   const filteredMenu = menu.filter((item) => {
//     if (dietFilter === "veg") return item.isVeg === 'yes';
//     if (dietFilter === "non-veg") return item.isVeg === 'no';
//     return true;
//   });

//   // Calculate counts correctly
//   const vegCount = menu.filter((item) => item.isVeg === 'yes').length;
//   const nonVegCount = menu.filter((item) => item.isVeg === 'no').length;

//   const handleLogout = () => {
//     dispatch({ type: "LOGOUT" });
//     navigate("/");
//   };

//   const handleAddItem = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setError(null);
//     try {
//       const response = await api.post("/menu/restaurant", {
//         itemName: newItem.name,
//         description: newItem.description,
//         price: parseFloat(newItem.price),
//         isVegetarian: newItem.isVeg === "yes",
//         restaurantId: restaurantId,
//       });

//       const added = response.data;
//       console.log('Added item response:', added); // Debug log
      
//       const formatted = {
//         id: added.itemId,
//         name: added.itemName,
//         description: added.description,
//         price: added.price,
//         isVeg: added.isVegetarian ? 'yes' : 'no'
//       };

//       console.log('Formatted item:', formatted); // Debug log
//       setMenu((prev) => [...prev, formatted]);
      
//       setNewItem({
//         name: "",
//         isVeg: "yes",
//         price: "",
//         description: "",
//       });
//       setShowAddForm(false);
//     } catch (err) {
//       console.error('Error adding item:', err); // Debug log
//       setError(err.response?.data?.message || err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleEditItem = (item) => {
//     console.log('Editing item:', item); // Debug log
//     setEditingItem({
//       ...item,
//       isVeg: item.isVeg === 'yes' ? "yes" : "no",
//     });
//   };

//   const handleUpdateItem = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setError(null);
//     try {
//       const response = await api.put(`/menu/${editingItem.id}`, {
//         itemName: editingItem.name,
//         description: editingItem.description,
//         price: parseFloat(editingItem.price),
//         isVegetarian: editingItem.isVeg === "yes",
//         restaurantId,
//       });

//       const updated = response.data;
//       console.log('Updated item response:', updated); // Debug log
      
//       const formatted = {
//         id: updated.itemId,
//         name: updated.itemName,
//         description: updated.description,
//         price: updated.price,
//         isVeg: updated.isVegetarian ? 'yes' : 'no'
//       };

//       setMenu((prev) =>
//         prev.map((item) => (item.id === formatted.id ? formatted : item))
//       );
//       setEditingItem(null);
//     } catch (err) {
//       console.error('Error updating item:', err); // Debug log
//       setError(err.response?.data?.message || err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleDeleteItem = async (itemId) => {
//     if (!window.confirm("Are you sure you want to delete this item?")) return;
//     setLoading(true);
//     setError(null);
//     try {
//       await api.delete(`/menu/${itemId}`);
//       setMenu((prev) => prev.filter((item) => item.id !== itemId));
//     } catch (err) {
//       console.error('Error deleting item:', err); // Debug log
//       setError(err.response?.data?.message || err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleStatusChange = async (orderId, newStatus) => {
//     setLoading(true);
//     setError(null);
//     try {
//       await api.put("/orders/status", { orderId, status: newStatus });
//       setOrders((prev) =>
//         prev.map((order) =>
//           order.id === orderId ? { ...order, status: newStatus } : order
//         )
//       );
//     } catch (err) {
//       setError(err.response?.data?.message || err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleInputChange = (e, setState) => {
//     setState((prev) => ({
//       ...prev,
//       [e.target.name]: e.target.value,
//     }));
//   };

//   return (
//     <div className="min-h-screen bg-gray-50">
//       <header className="bg-white shadow-sm border-bottom">
//         <div className="container-fluid">
//           <div className="d-flex justify-content-between align-items-center py-3">
//             <div className="d-flex align-items-center">
//               <ChefHat className="text-green-500 me-3" size={32} />
//               <div>
//                 <h1 className="h3 fw-bold text-gray-900 mb-0">
//                   {restaurantDetails.name}
//                 </h1>
//                 <p className="text-gray-600 mb-0">
//                   {restaurantDetails.location}
//                 </p>
//               </div>
//             </div>
//             <Button onClick={handleLogout} variant="danger" icon={LogOut}>
//               Logout
//             </Button>
//           </div>
//         </div>
//       </header>
//       <div className="container-fluid py-4">
//         {error && <div className="alert alert-danger text-center">{error}</div>}

//         {loading && (
//           <div className="text-center py-2">
//             <div className="spinner-border text-green-500"></div>
//           </div>
//         )}
//         <div className="row g-4">
//           {/* Orders */}
//           <div className="col-lg-6">
//             <div className="bg-white rounded-xl shadow-custom p-4">
//               <h2 className="h4 fw-bold mb-4 d-flex align-items-center">
//                 <Clock className="text-primary me-2" size={24} /> Active Orders
//               </h2>
//               {orders.length === 0 ? (
//                 <div className="text-center py-4">
//                   <p className="text-muted">No active orders</p>
//                 </div>
//               ) : (
//                 <div className="space-y-4">
//                   {orders.map((order) => (
//                     <div key={order.id} className="border rounded p-3">
//                       <div className="d-flex justify-content-between mb-3">
//                         <div>
//                           <h6 className="fw-semibold">Order #{order.id}</h6>
//                           <p className="text-muted">
//                             {order.customerName || order.customer?.name}
//                           </p>
//                         </div>
//                         <StatusBadge status={order.status} />
//                       </div>
//                       <div>
//                         <p className="small">Items:</p>
//                         <ul className="small ps-3">
//                           {order.items.map((item, idx) => (
//                             <li key={idx}>• {item.name || item}</li>
//                           ))}
//                         </ul>
//                       </div>
//                       <div className="d-flex justify-content-between align-items-center">
//                         <span className="fw-semibold text-success">
//                           ₹{order.total}
//                         </span>
//                         <select
//                           className="form-select form-select-sm"
//                           style={{ width: "auto" }}
//                           value={order.status}
//                           onChange={(e) =>
//                             handleStatusChange(order.id, e.target.value)
//                           }
//                         >
//                           <option value="pending">Pending</option>
//                           <option value="accepted">Accept</option>
//                           <option value="cooking">In Cooking</option>
//                           <option value="ready">Ready</option>
//                           <option value="out-for-delivery">
//                             Out for Delivery
//                           </option>
//                           <option value="completed">Completed</option>
//                           <option value="cancelled">Cancel</option>
//                         </select>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </div>
//           </div>

//           {/* Menu */}
//           <div className="col-lg-6">
//             <div className="bg-white rounded-xl shadow-custom p-4">
//               <div className="d-flex justify-content-between mb-4">
//                 <h2 className="h4 fw-bold d-flex align-items-center">
//                   <ChefHat className="text-green-500 me-2" size={24} /> Menu
//                   Items ({menu.length})
//                 </h2>
//                 <Button
//                   onClick={() => setShowAddForm(true)}
//                   variant="primary"
//                   icon={Plus}
//                 >
//                   Add Item
//                 </Button>
//               </div>

//               {/* Filters */}
//               <div className="d-flex align-items-center mb-3">
//                 <Filter size={20} className="me-2" />
//                 <div className="btn-group">
//                   <input
//                     type="radio"
//                     className="btn-check"
//                     name="dietFilter"
//                     id="all"
//                     checked={dietFilter === "all"}
//                     onChange={() => setDietFilter("all")}
//                   />
//                   <label
//                     className="btn btn-outline-secondary btn-sm"
//                     htmlFor="all"
//                   >
//                     All ({menu.length})
//                   </label>
//                   <input
//                     type="radio"
//                     className="btn-check"
//                     name="dietFilter"
//                     id="veg"
//                     checked={dietFilter === "veg"}
//                     onChange={() => setDietFilter("veg")}
//                   />
//                   <label
//                     className="btn btn-outline-success btn-sm"
//                     htmlFor="veg"
//                   >
//                     <span
//                       className="bg-success rounded-circle me-1"
//                       style={{ width: "12px", height: "12px" }}
//                     ></span>{" "}
//                     Veg ({vegCount})
//                   </label>
//                   <input
//                     type="radio"
//                     className="btn-check"
//                     name="dietFilter"
//                     id="non-veg"
//                     checked={dietFilter === "non-veg"}
//                     onChange={() => setDietFilter("non-veg")}
//                   />
//                   <label
//                     className="btn btn-outline-danger btn-sm"
//                     htmlFor="non-veg"
//                   >
//                     <span
//                       className="bg-danger rounded-circle me-1"
//                       style={{ width: "12px", height: "12px" }}
//                     ></span>{" "}
//                     Non-Veg ({nonVegCount})
//                   </label>
//                 </div>
//               </div>

//               {/* Debug Info */}
//               {process.env.NODE_ENV === 'development' && (
//                 <div className="alert alert-info small mb-3">
//                   <strong>Debug Info:</strong> 
//                   <br />
//                   Restaurant ID: {restaurantId || 'Not available'}
//                   <br />
//                   User Type: {state.userType || 'Not available'}
//                   <br />
//                   Total Menu Items: {menu.length}, Veg: {vegCount}, Non-Veg: {nonVegCount}, Filtered: {filteredMenu.length}
//                   <br />
//                   API Base URL: {api.defaults.baseURL}
//                 </div>
//               )}

//               {/* Menu List */}
//               {filteredMenu.length === 0 ? (
//                 <div className="text-center py-4">
//                   <p className="text-muted">
//                     {menu.length === 0 
//                       ? "No menu items found. Add your first item!" 
//                       : `No ${dietFilter === 'veg' ? 'vegetarian' : 'non-vegetarian'} items found.`
//                     }
//                   </p>
//                 </div>
//               ) : (
//                 <div className="row g-3">
//                   {filteredMenu.map((item) => (
//                     <div key={item.id} className="col-12">
//                       <MenuItemCard
//                         item={item}
//                         onEdit={() => handleEditItem(item)}
//                         onDelete={() => handleDeleteItem(item.id)}
//                         showActions={true}
//                       />
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>

//         {/* Add/Edit Modal */}
//         <Modal
//           isOpen={showAddForm || editingItem}
//           onClose={() => {
//             setShowAddForm(false);
//             setEditingItem(null);
//           }}
//         >
//           <form onSubmit={editingItem ? handleUpdateItem : handleAddItem}>
//             <h5 className="fw-bold mb-3">
//               {editingItem ? "Edit Menu Item" : "Add Menu Item"}
//             </h5>
//             <FormInput
//               label="Name"
//               name="name"
//               value={editingItem ? editingItem.name : newItem.name}
//               onChange={(e) =>
//                 handleInputChange(e, editingItem ? setEditingItem : setNewItem)
//               }
//               required
//             />
//             <FormInput
//               label="Description"
//               name="description"
//               value={
//                 editingItem ? editingItem.description : newItem.description
//               }
//               onChange={(e) =>
//                 handleInputChange(e, editingItem ? setEditingItem : setNewItem)
//               }
//               required
//             />
//             <FormInput
//               label="Price"
//               name="price"
//               type="number"
//               step="0.01"
//               min="0.01"
//               value={editingItem ? editingItem.price : newItem.price}
//               onChange={(e) =>
//                 handleInputChange(e, editingItem ? setEditingItem : setNewItem)
//               }
//               required
//             />
//             <div className="mb-3">
//               <label className="form-label">Type</label>
//               <select
//                 className="form-select"
//                 name="isVeg"
//                 value={editingItem ? editingItem.isVeg : newItem.isVeg}
//                 onChange={(e) =>
//                   handleInputChange(
//                     e,
//                     editingItem ? setEditingItem : setNewItem
//                   )
//                 }
//                 required
//               >
//                 <option value="yes">Vegetarian</option>
//                 <option value="no">Non-Vegetarian</option>
//               </select>
//             </div>
//             <div className="d-flex gap-2">
//               <Button type="submit" variant="primary" disabled={loading}>
//                 {editingItem ? "Update" : "Add"}
//               </Button>
//               <Button
//                 type="button"
//                 variant="secondary"
//                 onClick={() => {
//                   setShowAddForm(false);
//                   setEditingItem(null);
//                 }}
//               >
//                 Cancel
//               </Button>
//             </div>
//           </form>
//         </Modal>
//       </div>
//     </div>
//   );
// }

// export default RestaurantDashboard;
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, Plus, Clock, ChefHat, Filter } from "lucide-react";
import { useApp } from "../context/AppContext.jsx";
import Header from "../components/Header.jsx";
import Button from "../components/Button.jsx";
import Modal from "../components/Modal.jsx";
import FormInput from "../components/FormInput.jsx";
import StatusBadge from "../components/StatusBadge.jsx";
import MenuItemCard from "../components/MenuItemCard.jsx";
import { toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css'

function RestaurantDashboard() {
  const { state, dispatch, api } = useApp();
  const navigate = useNavigate();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [dietFilter, setDietFilter] = useState("all");
  const [newItem, setNewItem] = useState({
    name: "",
    isVeg: "yes",
    price: "",
    description: "",
  });
  const [orders, setOrders] = useState([]);
  const [menu, setMenu] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [restaurantDetails, setRestaurantDetails] = useState({
    name: "Restaurant Dashboard",
    location: "Location"
  });

  const restaurantId = state.user?.id; // Use userId directly from state
  console.log("state user: ",state.user);
  console.log("RestaurantId:",restaurantId);

  // Fetch restaurant details
  const fetchRestaurantDetails = async () => {
    if (!restaurantId) return;
    
    try {
      const response = await api.get(`/restaurants/${restaurantId}`);
      const data = response.data;
      setRestaurantDetails({
        name: data.name || "Restaurant Dashboard",
        location: data.location || "Location"
      });
    } catch (err) {
      console.error('Error fetching restaurant details:', err);
      // Keep default values if fetch fails
    }
  };

  const fetchMenu = async () => {
    if (!restaurantId) return;
    try {
      const response = await api.get(`/menu/restaurant/${restaurantId}`);
      const data = response.data;
  
      const mappedMenu = data.map(item => ({
        id: item.itemId,
        name: item.itemName,
        description: item.description,
        price: item.price,
        isVeg: item.isVegetarian ? 'yes' : 'no',
      }));
      setMenu(mappedMenu);
    } catch (err) {
      console.error('Error fetching menu:', err);
      setError(err.response?.data?.message || err.message);
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await api.get("/orders/restaurant");
      setOrders(response.data);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError(err.response?.data?.message || err.message);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!restaurantId) {
        console.log('No restaurant ID available, skipping data fetch');
        return;
      }
  
      setLoading(true);
      setError(null);
  
      try {
        await fetchRestaurantDetails(); // restaurant name & location
        await fetchMenu();              // now separated
        await fetchOrders();            // now separated
      } catch (err) {
        console.error('Error during data fetch:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
  
    fetchData();
  }, [restaurantId, api]);

  // Filter menu items based on diet preference
  const filteredMenu = menu.filter((item) => {
    if (dietFilter === "veg") return item.isVeg === 'yes';
    if (dietFilter === "non-veg") return item.isVeg === 'no';
    return true;
  });

  // Calculate counts correctly
  const vegCount = menu.filter((item) => item.isVeg === 'yes').length;
  const nonVegCount = menu.filter((item) => item.isVeg === 'no').length;

  const handleLogout = () => {
    localStorage.removeItem('jwt');
    dispatch({ type: "LOGOUT" });
    navigate("/");
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await api.post("/menu/restaurant", {
        itemName: newItem.name,
        description: newItem.description,
        price: parseFloat(newItem.price),
        isVegetarian: newItem.isVeg === "yes",
        restaurantId: restaurantId,
      });

      const added = response.data;
      console.log('Added item response:', added); // Debug log
      
      const formatted = {
        id: added.itemId,
        name: added.itemName,
        description: added.description,
        price: added.price,
        isVeg: added.isVegetarian ? 'yes' : 'no'
      };

      console.log('Formatted item:', formatted); // Debug log
      //setMenu((prev) => [...prev, formatted]);
      await fetchMenu();
      
      setNewItem({
        name: "",
        isVeg: "yes",
        price: "",
        description: "",
      });
      setShowAddForm(false);
    } catch (err) {
      console.error('Error adding item:', err); // Debug log
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEditItem = (item) => {
    console.log('Editing item:', item); // Debug log
    setEditingItem({
      ...item,
      isVeg: item.isVeg === 'yes' ? "yes" : "no",
    });
  };

  const handleUpdateItem = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await api.put(`/menu/${editingItem.id}`, {
        itemName: editingItem.name,
        description: editingItem.description,
        price: parseFloat(editingItem.price),
        isVegetarian: editingItem.isVeg === "yes",
        restaurantId,
      });

      const updated = response.data;
      console.log('Updated item response:', updated); // Debug log
      
      const formatted = {
        id: updated.itemId,
        name: updated.itemName,
        description: updated.description,
        price: updated.price,
        isVeg: updated.isVegetarian ? 'yes' : 'no'
      };

      // setMenu((prev) =>
      //   prev.map((item) => (item.id === formatted.id ? formatted : item))
      // );
      await fetchMenu();

      setEditingItem(null);
    } catch (err) {
      console.error('Error updating item:', err); // Debug log
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteItem = async (itemId) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;
    setLoading(true);
    setError(null);
    try {
      await api.delete(`/menu/${itemId}`);
      //setMenu((prev) => prev.filter((item) => item.id !== itemId));
      await fetchMenu();
    } catch (err) {
      console.error('Error deleting item:', err); // Debug log
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (order, newStatus) => {
    setLoading(true);
    setError(null);
    if(!order||!order.id&&!order.orderId){
      console.error("Invalid order: ",order);
    }
    try {
      const payload ={
        orderId: order.orderId,
        status: newStatus.toUpperCase(),
        restaurantId: restaurantId
      };

      await api.put("/orders/status", payload);
      toast.success("Order status updated!!");
      // setOrders((prev) =>
      //   prev.map((order) =>
      //     order.id === orderId ? { ...order, status: newStatus } : order
      //   )
      // );
      await fetchOrders();
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e, setState) => {
    setState((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-bottom">
        <div className="container-fluid">
          <div className="d-flex justify-content-between align-items-center py-3">
            <div className="d-flex align-items-center">
              <ChefHat className="text-green-500 me-3" size={32} />
              <div>
                <h1 className="h3 fw-bold text-gray-900 mb-0">
                  {restaurantDetails.name}
                </h1>
                <p className="text-gray-600 mb-0">
                  {restaurantDetails.location}
                </p>
              </div>
            </div>
            <Button onClick={handleLogout} variant="danger" icon={LogOut}>
              Logout
            </Button>
          </div>
        </div>
      </header>
      <div className="container-fluid py-4">
        {error && <div className="alert alert-danger text-center">{error}</div>}

        {loading && (
          <div className="text-center py-2">
            <div className="spinner-border text-green-500"></div>
          </div>
        )}
        <div className="row g-4">
          {/* Orders */}
          <div className="col-lg-6">
            <div className="bg-white rounded-xl shadow-custom p-4">
              <h2 className="h4 fw-bold mb-4 d-flex align-items-center">
                <Clock className="text-primary me-2" size={24} /> Active Orders
              </h2>
              {orders.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-muted">No active orders</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div key={order.id||order.orderId} className="border rounded p-3">
                      <div className="d-flex justify-content-between mb-3">
                        <div>
                          <h6 className="fw-semibold">Order #{order.orderId}</h6>
                          <p className="text-muted">
                            {order.customerName || order.customer?.name}
                          </p>
                        </div>
                        <StatusBadge status={order.status} />
                      </div>
                      <div>
                        <p className="small">Items:</p>
                        <ul className="small ps-3">
                          {order.items.map((item,idx) => (
                            <li key={`${item.menuItemId}-${idx}`}>
                            {item.itemName} x {item.quantity} - ₹{item.price}
                          </li>
                          ))}
                        </ul>
                      </div>
                      <div className="d-flex justify-content-between align-items-center">
                        <span className="fw-semibold text-success">
                          ₹{order.totalAmount}
                        </span>
                        <select
                          className="form-select form-select-sm"
                          style={{ width: "auto" }}
                          value={order.status}
                          onChange={(e) =>
                            handleStatusChange(order, e.target.value)
                          }
                        >
                          <option value="pending">Pending</option>
                          <option value="accepted">Accept</option>
                          <option value="in_cooking">In Cooking</option>
                          <option value="out_for_delivery">
                            Out for Delivery
                          </option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancel</option>
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Menu */}
          <div className="col-lg-6">
            <div className="bg-white rounded-xl shadow-custom p-4">
              <div className="d-flex justify-content-between mb-4">
                <h2 className="h4 fw-bold d-flex align-items-center">
                  <ChefHat className="text-green-500 me-2" size={24} /> Menu
                  Items ({menu.length})
                </h2>
                <Button
                  onClick={() => setShowAddForm(true)}
                  variant="primary"
                  icon={Plus}
                >
                  Add Item
                </Button>
              </div>

              {/* Filters */}
              <div className="d-flex align-items-center mb-3">
                <Filter size={20} className="me-2" />
                <div className="btn-group">
                  <input
                    type="radio"
                    className="btn-check"
                    name="dietFilter"
                    id="all"
                    checked={dietFilter === "all"}
                    onChange={() => setDietFilter("all")}
                  />
                  <label
                    className="btn btn-outline-secondary btn-sm"
                    htmlFor="all"
                  >
                    All ({menu.length})
                  </label>
                  <input
                    type="radio"
                    className="btn-check"
                    name="dietFilter"
                    id="veg"
                    checked={dietFilter === "veg"}
                    onChange={() => setDietFilter("veg")}
                  />
                  <label
                    className="btn btn-outline-success btn-sm"
                    htmlFor="veg"
                  >
                    <span
                      className="bg-success rounded-circle me-1"
                      style={{ width: "12px", height: "12px" }}
                    ></span>{" "}
                    Veg ({vegCount})
                  </label>
                  <input
                    type="radio"
                    className="btn-check"
                    name="dietFilter"
                    id="non-veg"
                    checked={dietFilter === "non-veg"}
                    onChange={() => setDietFilter("non-veg")}
                  />
                  <label
                    className="btn btn-outline-danger btn-sm"
                    htmlFor="non-veg"
                  >
                    <span
                      className="bg-danger rounded-circle me-1"
                      style={{ width: "12px", height: "12px" }}
                    ></span>{" "}
                    Non-Veg ({nonVegCount})
                  </label>
                </div>
              </div>

              {/* Menu List */}
              {filteredMenu.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-muted">
                    {menu.length === 0 
                      ? "No menu items found. Add your first item!" 
                      : `No ${dietFilter === 'veg' ? 'vegetarian' : 'non-vegetarian'} items found.`
                    }
                  </p>
                </div>
              ) : (
                <div className="row g-3">
                  {filteredMenu.map((item) => (
                    <div key={item.id} className="col-12">
                      <MenuItemCard
                        item={item}
                        onEdit={() => handleEditItem(item)}
                        onDelete={() => handleDeleteItem(item.id)}
                        showActions={true}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Add/Edit Modal */}
        <Modal
          isOpen={showAddForm || editingItem}
          onClose={() => {
            setShowAddForm(false);
            setEditingItem(null);
          }}
        >
          <form onSubmit={editingItem ? handleUpdateItem : handleAddItem}>
            <h5 className="fw-bold mb-3">
              {editingItem ? "Edit Menu Item" : "Add Menu Item"}
            </h5>
            <FormInput
              label="Name"
              name="name"
              value={editingItem ? editingItem.name : newItem.name}
              onChange={(e) =>
                handleInputChange(e, editingItem ? setEditingItem : setNewItem)
              }
              required
            />
            <FormInput
              label="Description"
              name="description"
              value={
                editingItem ? editingItem.description : newItem.description
              }
              onChange={(e) =>
                handleInputChange(e, editingItem ? setEditingItem : setNewItem)
              }
              required
            />
            <FormInput
              label="Price"
              name="price"
              type="number"
              step="0.01"
              min="0.01"
              value={editingItem ? editingItem.price : newItem.price}
              onChange={(e) =>
                handleInputChange(e, editingItem ? setEditingItem : setNewItem)
              }
              required
            />
            <div className="mb-3">
              <label className="form-label">Type</label>
              <select
                className="form-select"
                name="isVeg"
                value={editingItem ? editingItem.isVeg : newItem.isVeg}
                onChange={(e) =>
                  handleInputChange(
                    e,
                    editingItem ? setEditingItem : setNewItem
                  )
                }
                required
              >
                <option value="yes">Vegetarian</option>
                <option value="no">Non-Vegetarian</option>
              </select>
            </div>
            <div className="d-flex gap-2">
              <Button type="submit" variant="primary" disabled={loading}>
                {editingItem ? "Update" : "Add"}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setShowAddForm(false);
                  setEditingItem(null);
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </div>
  );
}

export default RestaurantDashboard;

