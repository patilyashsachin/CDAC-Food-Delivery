import React from "react";
import { useWishlist } from "../context/WishlistContext";
import { useCart } from "../context/CartContext";
import ProductCard from "../components/ProductCard";
import "./ProductsPage.css"; // Reuse layout styles

const WishlistPage = () => {
    const { wishlist } = useWishlist();
    const { addToCart } = useCart();

    return (
        <div className="products-page">
            <div style={{ marginBottom: "30px", borderBottom: "1px solid #f0f0f0", paddingBottom: "10px" }}>
                <h2 style={{ fontSize: "24px", fontWeight: "700", color: "#3d4152" }}>My Wishlist</h2>
                <p style={{ color: "#686b78", fontSize: "14px" }}>Items you've favorited across all restaurants</p>
            </div>

            {wishlist.length === 0 ? (
                <div style={{ textAlign: "center", marginTop: "100px" }}>
                    <img
                        src="https://res.cloudinary.com/swiggy/image/upload/fl_lossy,f_auto,q_auto/2xempty_cart_ybi7ss"
                        alt="Empty Wishlist"
                        style={{ width: "200px", marginBottom: "20px", opacity: 0.6 }}
                    />
                    <h3>Your wishlist is empty</h3>
                    <p style={{ color: "#7e808c" }}>Save your favorite items here to order them later!</p>
                </div>
            ) : (
                <div className="products-container">
                    {wishlist.map((item, index) => (
                        <ProductCard
                            key={`${item.name}-${index}`}
                            name={item.name}
                            description={item.description}
                            price={item.price}
                            image={item.image || item.imageUrl}
                            onAddToCart={() => addToCart(item)}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default WishlistPage;
