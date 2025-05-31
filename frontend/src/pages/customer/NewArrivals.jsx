import React, { useEffect, useState } from "react";
import axios from "axios";
import FeatureCard from "../../components/home/FeatureCard";

const NewArrivals = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    axios
      .get("http://localhost:8000/products/new-arrivals", { params: { limit: 10 } })
      .then((res) => {
        console.log("New arrivals data:", res.data);
        setProducts(res.data);
      })
      .catch((err) => {
        console.error("Error fetching new arrivals:", err);
      });
  }, []);

  return (
    <div className="new-arrivals-section">
      <h2>New Arrivals</h2>
      <div className="feature-card-container">
        {products.length === 0 ? (
          <p>No new products found.</p>
        ) : (
          products.map((product) => (
            <FeatureCard
              key={product.id}
              feature={{
                imgSrc: `http://localhost:8000/${product.images?.[0]?.image_url || "placeholder.jpg"}`, // OVDE koristimo image_url
                imgAlt: product.name,
                h1: product.name,
                h2: `${product.price} KM`,
              }}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default NewArrivals;
