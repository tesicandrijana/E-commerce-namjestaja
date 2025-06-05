import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './ProductDetail.css';
import ProductActions from './ProductActions';
import ImageCarousel from './ImageCarousel';
import { Drawer } from '@mui/material';
import StarRatingOverall from '../modals/StarRatingOverall';
import AddToCartButton from "../modals/AddToCartButton";
import { useAuth } from "../../components/auth/AuthProvider";

function ProductDetail({ id }) {
  const [product, setProduct] = useState(null);
  const [material, setMaterial] = useState('');
  const [discount, setDiscount] = useState(null);
  const { currentUser } = useAuth();
  

  useEffect(() => {
    const fetchProductAndDiscount = async () => {
      try {
        
        const productRes = await axios.get(`http://localhost:8000/products/${id}`);
        const formattedImages = productRes.data.images.map(
          (img) => `http://localhost:8000/static/product_images/${img.image_url}`
        );
        const productData = {
          ...productRes.data,
          images: formattedImages,
        };
        setProduct(productData);

        if (productRes.data.material_id) {
          const materialRes = await axios.get(`http://localhost:8000/materials/${productRes.data.material_id}`);
          setMaterial(materialRes.data.name);
        }

        const discountRes = await axios.get('http://localhost:8000/discounts/all');
        const allDiscounts = discountRes.data;

        const now = new Date();
        const activeDiscount = allDiscounts.find((d) =>
          d.product_id === productRes.data.id &&
          new Date(d.start_date) <= now &&
          new Date(d.end_date) >= now
        );

        if (activeDiscount) {
          setDiscount(activeDiscount);
        }

      } catch (e) {
        console.error('Error fetching data:', e);
      }
    };

    fetchProductAndDiscount();
  }, [id]);

  if (!product) return <div className="loader">Loading...</div>;

  // Calculate discounted price if discount exists
  const originalPrice = parseFloat(product.price);
  const discountPercentage = discount?.amount || 0;
  const discountedPrice = (originalPrice * (1 - discountPercentage / 100)).toFixed(2);
  const userRole = currentUser?.role;
  return (
    <div className="p-product-wrapper">
      <div className="product-detail-card">
        <div className="product-detail-image">
          <ImageCarousel steps={product.images} />
          <StarRatingOverall productId={product.id} />
        </div>

        <div className="p-product-details">
          <h1>{product.name}</h1>
          <p className="description">{product.description}</p>

          <div className="dimensions">
            <span>Dimensions:</span> {product.length}cm × {product.width}cm × {product.height}cm <small>(W × D × H)</small>
          </div>

          <div className="meta">
            <span>Material: {material || 'N/A'}</span>
          </div>

          <div className="price">
            {discount && discount.amount > 0 ? (
               <>
            <span style={{ textDecoration: 'line-through', color: 'gray', marginRight: '15px' }}>
                {originalPrice.toFixed(2)} KM
             </span>
            <span style={{ color: '#d32f2f', fontWeight: 'bold' }}>
              {discountedPrice} KM
            </span>
              </>
             ) : (
              <span>{originalPrice.toFixed(2)} KM</span>
)}

          </div>

{userRole && userRole !== 'customer' && (
  <ProductActions id={id} stock={product.quantity} />
)}

<p>
  {(!userRole || userRole === 'customer') && (
    <AddToCartButton productId={id} stock={product.quantity} />
  )}
</p>

</div>

      </div>
    </div>
  );
}

export default ProductDetail;

