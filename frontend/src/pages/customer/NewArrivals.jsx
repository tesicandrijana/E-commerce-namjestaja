import React, { useEffect, useState } from "react";
import axios from "axios";
import FeatureCard from "../../components/home/FeatureCard";

const NewArrivalsByCategory = () => {
  const [categories, setCategories] = useState([]);
  const [arrivalsByCategory, setArrivalsByCategory] = useState({});

  useEffect(() => {
    // Prvo dohvati sve kategorije
    axios.get("http://localhost:8000/categories")
      .then(res => {
        setCategories(res.data);

        // Za svaku kategoriju dohvati nove proizvode (limit npr. 5)
        res.data.forEach(category => {
          axios.get("http://localhost:8000/product/new-arrivals", {
            params: { category_id: category.id, limit: 5 }
          })
          .then(productRes => {
            // Formatiraj slike u puni URL
            const formattedProducts = productRes.data.map(product => ({
              ...product,
              images: product.images.map(
                img => `http://localhost:8000/static/product_images/${img.image_url}`
              )
            }));

            setArrivalsByCategory(prev => ({
              ...prev,
              [category.name]: formattedProducts
            }));
          })
          .catch(err => console.error(`Greška kod dohvata proizvoda za kategoriju ${category.name}:`, err));
        });
      })
      .catch(err => console.error("Greška kod dohvata kategorija:", err));
  }, []);

  return (
    <div>
      {categories.map(category => (
        <div key={category.id}>
          <h2>{category.name}</h2>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            {(arrivalsByCategory[category.name] || []).length === 0 ? (
              <p>Nema novopristiglih proizvoda u kategoriji.</p>
            ) : (
              arrivalsByCategory[category.name].map(product => (
                <FeatureCard
                  key={product.id}
                  feature={{
                    imgSrc: product.images?.[0] || "http://localhost:8000/static/product_images/placeholder.jpg",
                    imgAlt: product.name,
                    h1: product.name,
                    h2: `${product.price} KM`,
                  }}
                />
              ))
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default NewArrivalsByCategory;
