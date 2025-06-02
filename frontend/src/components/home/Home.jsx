import React from "react";
import { Link } from "react-router-dom";
import "./Home.css";
import FeaturesSection from "./FeaturesSection";

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
    name: "Drawer Dresser Cabinet",
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
            <p>
              Discover stylish, high-quality furniture tailored for comfort and
              elegance.
            </p>
            <Link to="./products" className="btn-primary">
              Shop Now
            </Link>
          </div>
          <div className="honeycomb-wrapper">
            <div className="honeycomb border-layer">
              <div className="column offset">
                <div className="hex"></div>
                <div className="hex"></div>
              </div>

              <div className="column">
                <div className="hex"></div>
                <div className="hex"></div>
                <div className="hex"></div>
              </div>

              <div className="column offset">
                <div className="hex"></div>
                <div className="hex"></div>
              </div>

              <div className="column">
                <div className="hex"></div>
                <div className="hex"></div>
                <div className="hex"></div>
              </div>
            </div>
            <div className="honeycomb content-layer">
              <div className="column offset">
                <div className="hex">
                  <img
                    src="https://hative.com/wp-content/uploads/2013/05/white-compact-bathroom-layout-2567.jpg"
                    alt="Bathroom Interior"
                    loading="lazy"
                  />
                </div>
                <div className="hex">
                  <img
                    src="https://th.bing.com/th/id/R.d821e003396d01c34437aba796942fea?rik=HCrdPfJXn40Zhw&pid=ImgRaw&r=0"
                    alt="Kids Room"
                    loading="lazy"
                  />
                </div>
              </div>

              <div className="column">
                <div className="hex">
                  <img
                    src="https://www.thespruce.com/thmb/q0WFSRB2P_Xu_VN22mGNJTQ8cFg=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/ScreenShot2021-09-01at1.03.00PM-9e1ddb24f72a4e1f9efa34d3ddfee90c.png"
                    alt="Kitchen Interior"
                    loading="lazy"
                  />
                </div>
                <div className="hex">
                  <img
                    src="https://www.furniturechoice.co.uk/p/l/FS10001313/FS10001313.jpg"
                    alt="Living Room Interior"
                    loading="lazy"
                  />
                </div>
                <div className="hex">
                  <img
                    src="https://hips.hearstapps.com/hmg-prod/images/furniture-2021q1-patio-naturalist-v1a-0638-edit-copy-1651162124.jpg?resize=980:*"
                    alt="Outdoor Furniture"
                    loading="lazy"
                  />
                </div>
              </div>

              <div className="column offset">
                <div className="hex">
                  <img
                    src="https://st.hzcdn.com/simgs/cc611e970fc93dd9_9-6890/home-design.jpg"
                    alt="Dining Room Interior"
                    loading="lazy"
                  />
                </div>
                <div className="hex">
                  <img
                    src="https://microless.com/cdn/products/cc681613506e08b81ff9a51f0c799a66-hi.jpg"
                    alt="Office Interior"
                    loading="lazy"
                  />
                </div>
              </div>

              <div className="column">
                <div className="hex">
                  <img
                    src="https://img.freepik.com/premium-photo/bedroom-with-bed-window-with-plant-corner_1007014-5138.jpg"
                    alt="Bedroom Interior"
                    loading="lazy"
                  />
                </div>
                <div className="hex">
                  <img
                    src="https://www.innovative-designs.co.uk/wp-content/uploads/2023/11/ID-Hallway-Sept-5-Large.webp"
                    alt="Hallway"
                    loading="lazy"
                  />
                </div>
                <div className="hex">
                  <img
                    src="https://i.pinimg.com/736x/ad/3c/d7/ad3cd781a745d801acbdb6c668daf3d6.jpg"
                    alt="Other Interior"
                    loading="lazy"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <div className="content-container">
        <section className="categories-section">
          <h2>Shop by Category</h2>
          <div className="categories-grid">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                to={`/customer/products?category=${encodeURIComponent(cat.name)}`}
                className="category-card"
              >
                <img src={cat.image} alt={cat.name} loading="lazy" />
                <div className="category-name">{cat.name}</div>
              </Link>
            ))}
          </div>
        </section>

        <section className="featured-products-section">
          <h2>Featured Products</h2>
          <div className="featured-products-grid">
            {featuredProducts.map((prod) => (
              <Link
                to={`/products/${prod.id}`}
                key={prod.id}
                className="product-card-home"
              >
                <img src={prod.image} alt={prod.name} loading="lazy" />
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
            At Furniture Store, we combine elegant design with lasting quality.
            Explore our carefully curated collections and let us help you create your
            dream home.
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
