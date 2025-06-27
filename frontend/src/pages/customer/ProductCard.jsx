import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import StarRatingOverall from "../../components/modals/StarRatingOverall";
import AddToCartButton from "../../components/modals/AddToCartButton";


const IMAGE_BASE_URL = "http://localhost:8000/static/product_images/";

export default function ProductCard({
  product,
  isVertical,
  discountedPrice,
  showDiscountDetails,
  toggleDiscountVisibility,
  getImageUrl,
  handleImageLoad,
}) {
  const hasDiscount =
    discountedPrice !== undefined && discountedPrice < product.price;

  const [soldCount, setSoldCount] = useState(0);

  useEffect(() => {
    fetch(`http://localhost:8000/products/${product.id}/sold-count`)
      .then((res) => res.json())
      .then((data) => setSoldCount(data.sold_count || 0))
      .catch((err) => console.error("Failed to fetch sold count:", err));
  }, [product.id]);

  return (
    <div
      className={`product-card ${isVertical ? "vertical" : ""}`}
      style={{ position: "relative" }}
    >
      {/* Discount badge */}
      {hasDiscount && (
        <div
          className="discount-badge"
          onClick={(e) => {
            e.preventDefault();
            toggleDiscountVisibility(product.id);
          }}
          title="Click to toggle discount details"
          style={{
            position: "absolute",
            top: 8,
            right: 8,
            backgroundColor: "#e63946",
            color: "white",
            padding: "4px 8px",
            borderRadius: "12px",
            cursor: "pointer",
            userSelect: "none",
            fontWeight: "bold",
            fontSize: "0.85rem",
            zIndex: 10,
          }}
        >
          {Math.round(100 * (1 - discountedPrice / product.price))}% OFF
          {showDiscountDetails && (
            <div
              className="discount-details"
              style={{
                marginTop: 6,
                backgroundColor: "white",
                color: "#e63946",
                borderRadius: 8,
                padding: "6px 10px",
                fontSize: "0.75rem",
                fontWeight: "normal",
                boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
                whiteSpace: "nowrap",
              }}
            >
              Save {Math.round(100 * (1 - discountedPrice / product.price))}%
              on this product!
            </div>
          )}
        </div>
      )}

      <Link
        to={`/product-details/${product.id}`}
        className="product-link"
        style={{ textDecoration: "none", color: "inherit", display: "block" }}
      >
        <div className="image-wrap" style={{ position: "relative" }}>
          <img
            src={getImageUrl(product?.images[0]?.image_url)}
            alt={product.name || "Product image"}
            className="product-image"
            onLoad={(e) => handleImageLoad(e, product.id)}
          />

          {soldCount > 0 && (
            <div className="sold-count-badge">
             {soldCount} SOLD
           </div>

          )}


          {product.quantity === 0 && (
            <>
              <div className="gradient-overlay"></div>
              <div className="sold-out-banner">
                <small>OUT OF STOCK</small>
              </div>
            </>
          )}
        </div>

        <div className="product-info">
          <div className="product-title-wrapper">
            <h3 className="product-title">{product.name}</h3>
            <div className="product-title-tooltip">{product.name}</div>
          </div>

          <div className="rating-price">
            {hasDiscount ? (
              <>
                <p
                  className="product-price original-price"
                  style={{
                    textDecoration: "line-through",
                    marginRight: "8px",
                  }}
                >
                  {Number(product.price).toFixed(2)} KM
                </p>
                <p
                  className="product-price discounted-price"
                  style={{ fontWeight: "bold" }}
                >
                  {discountedPrice.toFixed(2)} KM
                </p>
              </>
            ) : (
              <p className="product-price">
                {Number(product.price).toFixed(2)} KM
              </p>
            )}
          </div>
        </div>
      </Link>

      <p className="product-rating">
        <StarRatingOverall productId={product.id} size={20} />
        <AddToCartButton
          productId={product.id}
          stock={product.quantity}
          iconOnly
        />
      </p>
    </div>
  );
}
