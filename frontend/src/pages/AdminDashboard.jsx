import React, { useState, useEffect } from "react";
import "./AdminDashboard.css";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import { toast } from "react-toastify";

function AdminDashboard() {
  const { logout } = useAuth();
  const [activeTab, setActiveTab] = useState("orders");
  const [loading, setLoading] = useState(false);

  const [orders, setOrders] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [users, setUsers] = useState([]);
  const [insights, setInsights] = useState({
    totalOrders: 0,
    totalRestaurants: 0,
    totalUsers: 0,
    totalRevenue: 0
  });

  const [showAddModal, setShowAddModal] = useState(false);
  const [newRestaurant, setNewRestaurant] = useState({
    name: "",
    cuisine: "",
    address: "",
    price: "",
    rating: "0.0",
    imageUrl: ""
  });

  // Menu Management State
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [filteredMenuItems, setFilteredMenuItems] = useState([]);
  const [menuSearchTerm, setMenuSearchTerm] = useState("");
  const [showMenuModal, setShowMenuModal] = useState(false);
  const [showAddMenuModal, setShowAddMenuModal] = useState(false);
  const [showEditMenuModal, setShowEditMenuModal] = useState(false);
  const [currentMenuItem, setCurrentMenuItem] = useState(null);
  const [newMenuItem, setNewMenuItem] = useState({
    name: "",
    description: "",
    price: "",
    imageUrl: "",
    category: "",
    foodType: "VEG",
    isAvailable: true
  });

  const API_BASE = "http://localhost:5189/api/admin";
  const token = localStorage.getItem("token");

  const axiosConfig = {
    headers: { Authorization: `Bearer ${token}` }
  };

  // Fetch data based on active tab
  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      switch (activeTab) {
        case "orders":
          await fetchOrders();
          break;
        case "restaurants":
          await fetchRestaurants();
          break;
        case "users":
          await fetchUsers();
          break;
        case "insights":
          await fetchInsights();
          break;
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    const response = await axios.get(`${API_BASE}/orders`, axiosConfig);
    console.log("Fetched Orders Data:", response.data);
    setOrders(response.data);
  };

  const fetchRestaurants = async () => {
    const response = await axios.get(`${API_BASE}/restaurants`, axiosConfig);
    setRestaurants(response.data);
  };

  const fetchUsers = async () => {
    const response = await axios.get(`${API_BASE}/users`, axiosConfig);
    setUsers(response.data);
  };

  const fetchInsights = async () => {
    const response = await axios.get(`${API_BASE}/insights`, axiosConfig);
    setInsights(response.data);
  };

  const handleAddRestaurant = async (e) => {
    if (e) e.preventDefault();
    try {
      await axios.post(`${API_BASE}/restaurants`, {
        ...newRestaurant,
        price: parseInt(newRestaurant.price) || 0,
        rating: parseFloat(newRestaurant.rating) || 0.0
      }, axiosConfig);
      toast.success("Restaurant added successfully");
      setShowAddModal(false);
      setNewRestaurant({ name: "", cuisine: "", address: "", price: "", imageUrl: "" });
      fetchRestaurants();
    } catch (error) {
      console.error("Error adding restaurant:", error);
      toast.error("Failed to add restaurant");
    }
  };

  const handleDeleteRestaurant = async (id) => {
    if (!window.confirm("Are you sure you want to delete this restaurant?")) {
      return;
    }

    try {
      await axios.delete(`${API_BASE}/restaurants/${id}`, axiosConfig);
      toast.success("Restaurant deleted successfully");
      fetchRestaurants();
    } catch (error) {
      console.error("Error deleting restaurant:", error);
      toast.error("Failed to delete restaurant");
    }
  };

  const handleUpdateRestaurant = async (id) => {
    const restaurant = restaurants.find(r => r.id === id);
    if (!restaurant) return;

    const updatedName = prompt("Enter new restaurant name:", restaurant.name);
    if (!updatedName) return;

    try {
      await axios.put(`${API_BASE}/restaurants/${id}`, {
        ...restaurant,
        name: updatedName
      }, axiosConfig);
      toast.success("Restaurant updated successfully");
      fetchRestaurants();
    } catch (error) {
      console.error("Error updating restaurant:", error);
      toast.error("Failed to update restaurant");
    }
  };

  const handleUpdateOrderStatus = async (id, currentStatus) => {
    const statuses = ["Placed", "Preparing", "Out for Delivery", "Delivered"];
    const currentIndex = statuses.indexOf(currentStatus);
    const nextStatus = statuses[Math.min(currentIndex + 1, statuses.length - 1)];

    try {
      await axios.put(`${API_BASE}/orders/${id}/status`, {
        status: nextStatus
      }, axiosConfig);
      toast.success("Order status updated");
      fetchOrders();
    } catch (error) {
      console.error("Error updating order status:", error);
      toast.error("Failed to update order status");
    }
  };

  // ==================== MENU MANAGEMENT ====================

  const handleManageMenu = async (restaurant) => {
    setSelectedRestaurant(restaurant);
    setMenuSearchTerm("");
    setLoading(true);
    try {
      console.log(`Fetching menu for restaurant ID: ${restaurant.id}`);
      console.log(`API URL: ${API_BASE}/restaurants/${restaurant.id}/menu`);
      console.log(`Token: ${token ? 'Present' : 'Missing'}`);

      const response = await axios.get(`${API_BASE}/restaurants/${restaurant.id}/menu`, axiosConfig);
      console.log("Menu items response:", response.data);
      setMenuItems(response.data);
      setFilteredMenuItems(response.data);
      setShowMenuModal(true);
    } catch (error) {
      console.error("Error fetching menu items:", error);
      console.error("Error response:", error.response?.data);
      console.error("Error status:", error.response?.status);
      console.error("Error message:", error.message);
      toast.error(`Failed to load menu items: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMenuItem = async (e) => {
    if (e) e.preventDefault();
    try {
      console.log("Adding menu item for restaurant:", selectedRestaurant.id);
      console.log("Menu item data:", {
        ...newMenuItem,
        price: parseInt(newMenuItem.price) || 0
      });

      const response = await axios.post(`${API_BASE}/restaurants/${selectedRestaurant.id}/menu`, {
        ...newMenuItem,
        price: parseInt(newMenuItem.price) || 0
      }, axiosConfig);

      console.log("Menu item added successfully:", response.data);
      toast.success("Menu item added successfully");
      setShowAddMenuModal(false);
      setNewMenuItem({
        name: "",
        description: "",
        price: "",
        imageUrl: "",
        category: "",
        foodType: "VEG",
        isAvailable: true
      });
      // Refresh menu items
      const menuResponse = await axios.get(`${API_BASE}/restaurants/${selectedRestaurant.id}/menu`, axiosConfig);
      setMenuItems(menuResponse.data);
      setFilteredMenuItems(menuResponse.data);
    } catch (error) {
      console.error("Error adding menu item:", error);
      console.error("Error response data:", error.response?.data);
      console.error("Error response status:", error.response?.status);
      console.error("Error response headers:", error.response?.headers);
      console.error("Full error:", JSON.stringify(error.response, null, 2));

      const errorMessage = error.response?.data?.message
        || error.response?.data?.title
        || error.response?.data
        || error.message;

      toast.error(`Failed to add menu item: ${errorMessage}`);
    }
  };

  const handleEditMenuItem = (item) => {
    setCurrentMenuItem(item);
    setNewMenuItem({
      name: item.name,
      description: item.description || "",
      price: item.price.toString(),
      imageUrl: item.imageUrl || "",
      category: item.category || "",
      foodType: item.foodType || "VEG",
      isAvailable: item.isAvailable
    });
    setShowEditMenuModal(true);
  };

  const handleUpdateMenuItem = async (e) => {
    if (e) e.preventDefault();
    try {
      await axios.put(`${API_BASE}/menu/${currentMenuItem.id}`, {
        ...newMenuItem,
        price: parseInt(newMenuItem.price) || 0
      }, axiosConfig);
      toast.success("Menu item updated successfully");
      setShowEditMenuModal(false);
      setCurrentMenuItem(null);
      setNewMenuItem({
        name: "",
        description: "",
        price: "",
        imageUrl: "",
        category: "",
        foodType: "VEG",
        isAvailable: true
      });
      // Refresh menu items
      const response = await axios.get(`${API_BASE}/restaurants/${selectedRestaurant.id}/menu`, axiosConfig);
      setMenuItems(response.data);
      setFilteredMenuItems(response.data);
    } catch (error) {
      console.error("Error updating menu item:", error);
      toast.error("Failed to update menu item");
    }
  };

  const handleDeleteMenuItem = async (id) => {
    if (!window.confirm("Are you sure you want to delete this menu item?")) {
      return;
    }

    try {
      await axios.delete(`${API_BASE}/menu/${id}`, axiosConfig);
      toast.success("Menu item deleted successfully");
      // Refresh menu items
      const response = await axios.get(`${API_BASE}/restaurants/${selectedRestaurant.id}/menu`, axiosConfig);
      setMenuItems(response.data);
      setFilteredMenuItems(response.data);
    } catch (error) {
      console.error("Error deleting menu item:", error);
      toast.error("Failed to delete menu item");
    }
  };

  // Filter menu items based on search term
  const handleMenuSearch = (searchTerm) => {
    setMenuSearchTerm(searchTerm);
    if (!searchTerm.trim()) {
      setFilteredMenuItems(menuItems);
      return;
    }
    const filtered = menuItems.filter(item =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.category && item.category.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredMenuItems(filtered);
  };

  return (
    <div className="admin-page">
      <header className="admin-header">
        <div className="header-top">
          <h1>Admin Dashboard</h1>
          <button className="logout-btn" onClick={logout}>Logout</button>
        </div>
        <p>Food Delivery Management</p>
      </header>

      {/* Navigation Tabs */}
      <nav className="tabs">
        <button className={activeTab === "orders" ? "active" : ""} onClick={() => setActiveTab("orders")}>
          Orders
        </button>
        <button className={activeTab === "restaurants" ? "active" : ""} onClick={() => setActiveTab("restaurants")}>
          Restaurants
        </button>
        <button className={activeTab === "users" ? "active" : ""} onClick={() => setActiveTab("users")}>
          Users
        </button>
        <button className={activeTab === "insights" ? "active" : ""} onClick={() => setActiveTab("insights")}>
          Insights
        </button>
      </nav>

      <section className="content">
        {loading ? (
          <div className="loading">Loading...</div>
        ) : (
          <>
            {activeTab === "orders" && (
              <div className="grid">
                {orders.length === 0 ? (
                  <p>No orders found</p>
                ) : (
                  orders.map(o => {
                    const deliveryAddr = o.deliveryAddress || o.DeliveryAddress || "N/A";
                    const customerInfo = o.customerName || o.CustomerName || o.userEmail || o.UserEmail || "Unknown";
                    const orderItems = o.items || o.Items || [];
                    const orderAmount = o.totalAmount || o.TotalAmount || 0;
                    const orderStatus = o.status || o.Status || "Placed";

                    return (
                      <div className="card" key={o.id || o.Id}>
                        <h3>Order #{o.id || o.Id}</h3>
                        <p><strong>Customer:</strong> {customerInfo}</p>
                        <p><strong>Amount:</strong> ₹{orderAmount}</p>
                        <p><strong>Address:</strong> {deliveryAddr}</p>

                        {orderItems && orderItems.length > 0 && (
                          <div className="order-items-list" style={{ marginTop: "10px", fontSize: "0.9em", color: "#555" }}>
                            <strong>Items:</strong>
                            <ul style={{ margin: "5px 0", paddingLeft: "20px" }}>
                              {orderItems.map((item, idx) => (
                                <li key={idx}>
                                  {item.name || item.Name} (x{item.quantity || item.Quantity})
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        <span className="badge">{orderStatus}</span>
                        <div className="card-actions">
                          <button
                            className="update"
                            onClick={() => handleUpdateOrderStatus(o.id || o.Id, orderStatus)}
                            disabled={orderStatus === "Delivered"}
                          >
                            Update Status
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {activeTab === "restaurants" && (
              <>
                <div className="section-header">
                  <h2>Restaurants</h2>
                  <button className="add-btn" onClick={() => setShowAddModal(true)}>＋ Add Restaurant</button>
                </div>

                <div className="grid">
                  {restaurants.length === 0 ? (
                    <p>No restaurants found</p>
                  ) : (
                    restaurants.map(r => (
                      <div className="card restaurant-card" key={r.id}>
                        <div>
                          <h3>{r.name}</h3>
                          <p>{r.address || r.city || "No location"}</p>
                          <p><small>{r.cuisine || "Multi-Cuisine"}</small></p>
                          <span className="badge">₹{r.price}</span>
                        </div>

                        <div className="card-actions">
                          <button className="update" onClick={() => handleManageMenu(r)}>Manage Menu</button>
                          <button className="update" onClick={() => handleUpdateRestaurant(r.id)}>Update</button>
                          <button className="delete" onClick={() => handleDeleteRestaurant(r.id)}>Delete</button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </>
            )}

            {activeTab === "users" && (
              <div className="grid">
                {users.length === 0 ? (
                  <p>No users found</p>
                ) : (
                  users.map(u => (
                    <div className="card" key={u.id}>
                      <h3>{u.name}</h3>
                      <p><strong>Email:</strong> {u.email}</p>
                      <p><strong>Role:</strong> {u.role}</p>
                      <p><strong>Phone:</strong> {u.phone || "N/A"}</p>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === "insights" && (
              <div className="grid">
                <div className="card insight">📦 {insights.totalOrders} Orders</div>
                <div className="card insight">🍽 {insights.totalRestaurants} Restaurants</div>
                <div className="card insight">👥 {insights.totalUsers} Users</div>
                <div className="card insight">💰 ₹{insights.totalRevenue?.toLocaleString() || 0} Revenue</div>
              </div>
            )}
          </>
        )}
      </section>

      {/* Add Restaurant Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="admin-modal">
            <div className="modal-header">
              <h2>Add New Restaurant</h2>
              <button className="close-btn" onClick={() => setShowAddModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleAddRestaurant} className="modal-form">
              <div className="form-group">
                <label>Restaurant Name</label>
                <input
                  type="text"
                  required
                  value={newRestaurant.name}
                  onChange={(e) => setNewRestaurant({ ...newRestaurant, name: e.target.value })}
                  placeholder="e.g. Spice Hub"
                />
              </div>
              <div className="form-group">
                <label>Cuisine</label>
                <input
                  type="text"
                  required
                  value={newRestaurant.cuisine}
                  onChange={(e) => setNewRestaurant({ ...newRestaurant, cuisine: e.target.value })}
                  placeholder="e.g. Indian, Chinese"
                />
              </div>
              <div className="form-group">
                <label>Location / Address</label>
                <input
                  type="text"
                  required
                  value={newRestaurant.address}
                  onChange={(e) => setNewRestaurant({ ...newRestaurant, address: e.target.value })}
                  placeholder="e.g. MG Road, Pune"
                />
              </div>
              <div className="form-group">
                <label>Average Price (₹)</label>
                <input
                  type="number"
                  required
                  value={newRestaurant.price}
                  onChange={(e) => setNewRestaurant({ ...newRestaurant, price: e.target.value })}
                  placeholder="e.g. 500"
                />
              </div>
              <div className="form-group">
                <label>Initial Rating (0-5)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="5"
                  required
                  value={newRestaurant.rating}
                  onChange={(e) => setNewRestaurant({ ...newRestaurant, rating: e.target.value })}
                  placeholder="e.g. 4.5"
                />
              </div>
              <div className="form-group">
                <label>Image URL</label>
                <input
                  type="url"
                  value={newRestaurant.imageUrl}
                  onChange={(e) => setNewRestaurant({ ...newRestaurant, imageUrl: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                />
              </div>
              <div className="modal-footer">
                <button type="button" className="cancel-btn" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="save-btn">Save Restaurant</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Menu Management Modal */}
      {showMenuModal && selectedRestaurant && (
        <div className="modal-overlay">
          <div className="admin-modal" style={{ maxWidth: "900px" }}>
            <div className="modal-header">
              <h2>Menu - {selectedRestaurant.name}</h2>
              <button className="close-btn" onClick={() => setShowMenuModal(false)}>&times;</button>
            </div>
            <div style={{ padding: "20px" }}>
              <button className="add-btn" onClick={() => setShowAddMenuModal(true)} style={{ marginBottom: "20px" }}>＋ Add Menu Item</button>

              {menuItems.length === 0 ? (
                <p className="no-menu-items">No menu items found. Add your first item!</p>
              ) : (
                <>
                  <input
                    type="text"
                    className="menu-search-box"
                    placeholder="🔍 Search menu items by name, category, or description..."
                    value={menuSearchTerm}
                    onChange={(e) => handleMenuSearch(e.target.value)}
                  />
                  {filteredMenuItems.length === 0 ? (
                    <p className="no-menu-items">No menu items match your search.</p>
                  ) : (
                    <div className="grid">
                      {filteredMenuItems.map(item => (
                        <div className="card menu-item-card" key={item.id}>
                          {item.imageUrl ? (
                            <img src={item.imageUrl} alt={item.name} className="menu-item-image" onError={(e) => e.target.style.display = 'none'} />
                          ) : (
                            <div className="menu-item-placeholder">📷 No Image</div>
                          )}
                          <h3>{item.name}</h3>
                          <p><strong>Price:</strong> ₹{item.price}</p>
                          {item.description && <p><small>{item.description}</small></p>}
                          <p><strong>Category:</strong> {item.category || "N/A"}</p>
                          <span className="badge" style={{
                            background: item.foodType === "VEG" ? "#4caf50" : item.foodType === "VEGAN" ? "#8bc34a" : "#f44336"
                          }}>{item.foodType}</span>
                          <span className="badge" style={{ marginLeft: "5px" }}>
                            {item.isAvailable ? "Available" : "Unavailable"}
                          </span>
                          <div className="card-actions" style={{ marginTop: "10px" }}>
                            <button className="update" onClick={() => handleEditMenuItem(item)}>Edit</button>
                            <button className="delete" onClick={() => handleDeleteMenuItem(item.id)}>Delete</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add Menu Item Modal */}
      {showAddMenuModal && (
        <div className="modal-overlay">
          <div className="admin-modal">
            <div className="modal-header">
              <h2>Add Menu Item</h2>
              <button className="close-btn" onClick={() => setShowAddMenuModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleAddMenuItem} className="modal-form">
              <div className="form-group">
                <label>Item Name</label>
                <input
                  type="text"
                  required
                  value={newMenuItem.name}
                  onChange={(e) => setNewMenuItem({ ...newMenuItem, name: e.target.value })}
                  placeholder="e.g. Paneer Tikka"
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={newMenuItem.description}
                  onChange={(e) => setNewMenuItem({ ...newMenuItem, description: e.target.value })}
                  placeholder="Brief description of the item"
                  rows="3"
                />
              </div>
              <div className="form-group">
                <label>Price (₹)</label>
                <input
                  type="number"
                  required
                  value={newMenuItem.price}
                  onChange={(e) => setNewMenuItem({ ...newMenuItem, price: e.target.value })}
                  placeholder="e.g. 250"
                />
              </div>
              <div className="form-group">
                <label>Category</label>
                <input
                  type="text"
                  value={newMenuItem.category}
                  onChange={(e) => setNewMenuItem({ ...newMenuItem, category: e.target.value })}
                  placeholder="e.g. Appetizers, Main Course, Desserts"
                />
              </div>
              <div className="form-group">
                <label>Food Type</label>
                <select
                  value={newMenuItem.foodType}
                  onChange={(e) => setNewMenuItem({ ...newMenuItem, foodType: e.target.value })}
                >
                  <option value="VEG">Vegetarian</option>
                  <option value="NON_VEG">Non-Vegetarian</option>
                  <option value="VEGAN">Vegan</option>
                </select>
              </div>
              <div className="form-group">
                <label>Image URL</label>
                <input
                  type="url"
                  value={newMenuItem.imageUrl}
                  onChange={(e) => setNewMenuItem({ ...newMenuItem, imageUrl: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                />
                {newMenuItem.imageUrl && (
                  <img
                    src={newMenuItem.imageUrl}
                    alt="Preview"
                    className="image-preview"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      toast.error("Invalid image URL");
                    }}
                  />
                )}
              </div>
              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    checked={newMenuItem.isAvailable}
                    onChange={(e) => setNewMenuItem({ ...newMenuItem, isAvailable: e.target.checked })}
                  />
                  {" "}Available
                </label>
              </div>
              <div className="modal-footer">
                <button type="button" className="cancel-btn" onClick={() => setShowAddMenuModal(false)}>Cancel</button>
                <button type="submit" className="save-btn">Add Item</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Menu Item Modal */}
      {showEditMenuModal && currentMenuItem && (
        <div className="modal-overlay">
          <div className="admin-modal">
            <div className="modal-header">
              <h2>Edit Menu Item</h2>
              <button className="close-btn" onClick={() => setShowEditMenuModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleUpdateMenuItem} className="modal-form">
              <div className="form-group">
                <label>Item Name</label>
                <input
                  type="text"
                  required
                  value={newMenuItem.name}
                  onChange={(e) => setNewMenuItem({ ...newMenuItem, name: e.target.value })}
                  placeholder="e.g. Paneer Tikka"
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={newMenuItem.description}
                  onChange={(e) => setNewMenuItem({ ...newMenuItem, description: e.target.value })}
                  placeholder="Brief description of the item"
                  rows="3"
                />
              </div>
              <div className="form-group">
                <label>Price (₹)</label>
                <input
                  type="number"
                  required
                  value={newMenuItem.price}
                  onChange={(e) => setNewMenuItem({ ...newMenuItem, price: e.target.value })}
                  placeholder="e.g. 250"
                />
              </div>
              <div className="form-group">
                <label>Category</label>
                <input
                  type="text"
                  value={newMenuItem.category}
                  onChange={(e) => setNewMenuItem({ ...newMenuItem, category: e.target.value })}
                  placeholder="e.g. Appetizers, Main Course, Desserts"
                />
              </div>
              <div className="form-group">
                <label>Food Type</label>
                <select
                  value={newMenuItem.foodType}
                  onChange={(e) => setNewMenuItem({ ...newMenuItem, foodType: e.target.value })}
                >
                  <option value="VEG">Vegetarian</option>
                  <option value="NON_VEG">Non-Vegetarian</option>
                  <option value="VEGAN">Vegan</option>
                </select>
              </div>
              <div className="form-group">
                <label>Image URL</label>
                <input
                  type="url"
                  value={newMenuItem.imageUrl}
                  onChange={(e) => setNewMenuItem({ ...newMenuItem, imageUrl: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                />
                {newMenuItem.imageUrl && (
                  <img
                    src={newMenuItem.imageUrl}
                    alt="Preview"
                    className="image-preview"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      toast.error("Invalid image URL");
                    }}
                  />
                )}
              </div>
              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    checked={newMenuItem.isAvailable}
                    onChange={(e) => setNewMenuItem({ ...newMenuItem, isAvailable: e.target.checked })}
                  />
                  {" "}Available
                </label>
              </div>
              <div className="modal-footer">
                <button type="button" className="cancel-btn" onClick={() => setShowEditMenuModal(false)}>Cancel</button>
                <button type="submit" className="save-btn">Update Item</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
