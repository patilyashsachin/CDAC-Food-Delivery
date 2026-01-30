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
    </div>
  );
}

export default AdminDashboard;
