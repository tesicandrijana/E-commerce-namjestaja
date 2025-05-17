import React from "react";
import { Link } from "react-router-dom";
import "./Home.css";
import FeaturesSection from "../../components/home/FeaturesSection";

const featuredProducts = [
  {
    id: 1,
    name: "Modern Sofa",
    price: "$1200",
    image:
      "https://i5.walmartimages.com/asr/823f1e50-b827-4cfd-9f30-3897cb5fcfad.bf223222239f8933b96feb796a5013e6.jpeg",
  },
  {
    id: 53,
    name: "Wooden Dining Table",
    price: "$480",
    image:
      "https://ak1.ostkcdn.com/images/products/is/images/direct/630b272777237219a041e7896e61c2dcbcb0cdb6/47-Inch-Round-Dining-Table-for-4%2CKitchen-Farmhouse-Dinner-Table%2CWood-Dinning-Table-for-Kitchen-Dining-Living-Room.jpg",
  },
  {
    id: 54,
    name: "Cozy Armchair",
    price: "$300",
    image:
      "https://thearchitecturedesigns.com/wp-content/uploads/2023/03/Upholstery-History-2-1024x1024.jpeg",
  },
  {
    id: 55,
    name: "Drawer Dresser cabinet",
    price: "$599",
    image:
      "https://furnicut.com/public/uploads/all/XVtJZt9VafsUV3nEQU3mT613WXgAM9hZ87jRDm3K.jpg",
  },
];

const categories = [
  {
    id: 1,
    name: "Living Room",
    image:
      "https://mir-s3-cdn-cf.behance.net/project_modules/max_3840/dc9c36198076673.663b3e8715d15.jpg",
  },
  {
    id: 2,
    name: "Bedroom",
    image:
      "https://i5.walmartimages.com/seo/Amolife-Queen-Size-Fabric-Upholstered-Platform-Bed-Frame-with-Headboard-Navy-Blue_b6ea4927-ac46-4859-9f54-3f2292d3db2a.a1e617c4a02b42597036d9c6c1ff12ee.jpeg",
  },
  {
    id: 3,
    name: "Office",
    image: "https://m.media-amazon.com/images/I/71k6ifp-15L._AC_SL1500_.jpg",
  },
];

const Home = () => {
  return (
    <main>
      <div className="home-container">
        <section className="hero-section">
        <div className="hero-text">
          <h1>Elevate Your Space with Our Premium Furniture</h1>
          <p>Discover stylish, high-quality furniture tailored for comfort and elegance.</p>
          <Link to="./products" className="btn-primary">
            Shop Now
          </Link>
        </div>
      </section>
      </div>

      <div className="content-container">
        <section className="categories-section">
          <h2>Shop by Category</h2>
          <div className="categories-grid">
            {categories.map(cat => (
              <Link
                key={cat.id}
                to={`/customer/products?category=${encodeURIComponent(cat.name)}`}
                className="category-card"
              >
                <img src={cat.image} alt={cat.name} />
                <div className="category-name">{cat.name}</div>
              </Link>
            ))}
          </div>
        </section>

        <section className="featured-products-section">
          <h2>Featured Products</h2>
          <div className="featured-products-grid">
            {featuredProducts.map(prod => (
              <Link
                to={`/products/${prod.id}`}
                key={prod.id}
                className="product-card-home"
              >
                <img src={prod.image} alt={prod.name} />
                <div className="product-info">
                  <h3>{prod.name}</h3>
                  <p className="price">{prod.price}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="about-snippet-section">
          <h2>Why Choose Us?</h2>
          <p>
            At Furniture Store, we combine elegant design with lasting quality. Explore
            our carefully curated collections and let us help you create your dream home.
          </p>
          <Link to="/about" className="btn-secondary">
            Learn More
          </Link>
        </section>
      </div>
      <FeaturesSection />
    </main>
  );
};

export default Home;