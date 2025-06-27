import React, { useEffect, useState } from "react";
import axios from "axios";
import "./ProductModal.css";

export default function ProductModal({ product, onClose }) {
  const [fullProduct, setFullProduct] = useState(null);
  const [discountedPrice, setDiscountedPrice] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const productRes = await axios.get(`http://localhost:8000/products/${product.id}`);
        const formattedImages = productRes.data.images.map(
          (img) => `http://localhost:8000/static/product_images/${img.image_url}`
        );
        const productWithImages = {
          ...productRes.data,
          images: formattedImages,
        };
        setFullProduct(productWithImages);

        const res = await axios.get(`http://localhost:8000/products/${product.id}/discounted-price`);
        const price = parseFloat(res.data.discounted_price);
        if (!isNaN(price)) setDiscountedPrice(price);
      } catch (err) {
        console.error("Failed to fetch product data or discounted price", err);
      }
    };

    if (product?.id) {
      fetchData();
    }
  }, [product?.id]);

  if (!fullProduct) return null;

  const imageUrl = fullProduct.images?.[0]
    ? fullProduct.images[0]
    : "https://via.placeholder.com/300?text=No+Image";

  const price = Number(fullProduct.price) || 0;

  return (
    <div className="pm-overlay" onClick={onClose}>
      <div className="pm-modal" onClick={(e) => e.stopPropagation()} role="dialog">
        <button className="pm-close" onClick={onClose}>&times;</button>

        <img
          src={imageUrl}
          alt={fullProduct.name}
          className="pm-image"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = "https://via.placeholder.com/300?text=No+Image";
          }}
        />

        <div className="pm-content">
          <h2 className="pm-title">{fullProduct.name}</h2>
          <p className="pm-description">{fullProduct.description}</p>

          <div className="pm-price-block">
            {discountedPrice !== null && discountedPrice < price ? (
              <>
                <p className="pm-price-original">
                  Original: {price.toFixed(2)} KM
                </p>
                <p className="pm-price-discounted">
                  Discounted: {discountedPrice.toFixed(2)} KM
                </p>
              </>
            ) : (
              <p className="pm-price">Price: {price.toFixed(2)} KM</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
