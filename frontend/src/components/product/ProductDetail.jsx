import React, { useEffect, useState } from "react";
import axios from "axios";
import "./ProductDetail.css";
import ProductActions from "./ProductActions";
import ImageCarousel from "./ImageCarousel";
import StarRatingOverall from "../modals/StarRatingOverall";
import AddToCartButton from "../modals/AddToCartButton";
import { useAuth } from "../../components/auth/AuthProvider";

function ProductDetail({ id }) {
  const [product, setProduct] = useState(null);
  const [material, setMaterial] = useState("");
  const [discountedPrice, setDiscountedPrice] = useState(null);
  const { currentUser } = useAuth();

  const fetchProductAndDiscount = async () => {
    try {
      // Fetch product details
      const productRes = await axios.get(`http://localhost:8000/products/${id}`);
      const formattedImages = productRes.data.images.map(
        (img) => `http://localhost:8000/static/product_images/${img.image_url}`
      );
      const productData = {
        ...productRes.data,
        images: formattedImages,
      };
      setProduct(productData);

      // Fetch material if available
      if (productRes.data.material_id) {
        const materialRes = await axios.get(
          `http://localhost:8000/materials/${productRes.data.material_id}`
        );
        setMaterial(materialRes.data.name);
      }

      // Fetch discounted price per product
      const discountRes = await axios.get(
        `http://localhost:8000/products/${id}/discounted-price`
      );
      const discounted = parseFloat(discountRes.data.discounted_price);

      // If discounted price is less than original price, store it; else, null
      if (!isNaN(discounted) && discounted < productRes.data.price) {
        setDiscountedPrice(discounted);
      } else {
        setDiscountedPrice(null);
      }
    } catch (e) {
      console.error("Error fetching data:", e);
    }
  };

  useEffect(() => {


    fetchProductAndDiscount();
  }, [id]);

  if (!product) return <div className="loader">Loading...</div>;

  const originalPrice = parseFloat(product.price);
  const userRole = currentUser?.role;

  return (
    <div className="p-product-wrapper">
      <div className="product-detail-card">
        <div className="product-detail-image">
          <ImageCarousel steps={product.images} />
          <StarRatingOverall productId={product.id} />
        </div>

        <div className="p-product-details">
          <h2>{product.name}</h2>
          <p className="description">{product.description}</p>

          <div className="dimensions">
            <span>Dimensions:</span> {product.length}cm × {product.width}cm × {product.height}cm{" "}
            <small>(W × D × H)</small>
          </div>

          <div className="meta">

            <span>Material: {material || "N/A"}</span>
          </div>

          <div className="price">
            {discountedPrice !== null ? (
              <>
                <span
                  style={{
                    textDecoration: "line-through",
                    color: "gray",
                    marginRight: "15px",
                  }}
                >
                  {originalPrice.toFixed(2)} KM
                </span>
                <span style={{ color: "#d32f2f", fontWeight: "bold" }}>
                  {discountedPrice.toFixed(2)} KM
                </span>
              </>
            ) : (
              <span>{originalPrice.toFixed(2)} KM</span>
            )}
          </div>


          <div className="action-buttons">{userRole && userRole !== "customer" && (
            <ProductActions id={id} stock={product.quantity} fetchProduct={fetchProductAndDiscount} />
          )}

            <p>
              {(!userRole || userRole === "customer") && (
                <AddToCartButton productId={id} stock={product.quantity} />
              )}
            </p></div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetail;
