import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import axios from 'axios'
import './ProductDetail.css'
import ProductActions from './ProductActions'
import ImageCarousel from './ImageCarousel'

function ProductDetail() {
  const [product, setProduct] = useState()
  const [material, setMaterial] = useState()
  const { id } = useParams()

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/products/${id}`);
        const formattedImages = response.data.images.map(img =>
          `http://localhost:8000/${img.image_url}`
        );

        setProduct({
          ...response.data,
          images: formattedImages
        });

        if (response.data.material_id) {
          const materialRes = await axios.get(`http://localhost:8000/materials/${response.data.material_id}`);
          setMaterial(materialRes.data.name);
        }
      } catch (e) {
        console.error("Error fetching product:", e);
      }
    }

    fetchProduct();
  }, [id]);

  if (!product) return <div className="loader">Loading...</div>;

  return (
    <div className="product-wrapper">
      <div className="product-detail-card">
        <div className="product-detail-image">
          <ImageCarousel steps={product.images} />
        </div>
        <div className="product-details">
          <h1>{product.name}</h1>

          <p className="description">{product.description}</p>
          <div className="dimensions">
            <span>Dimensions:</span> {product.length}cm × {product.width}cm × {product.height}cm
          </div>
          <div className="meta">
            <span>Material: {material}</span>
          </div>
          <div className="price">{product.price} KM</div>
          <ProductActions id={id} stock={product.quantity}/>
        </div>
      </div>
    </div>
  )
}

export default ProductDetail
