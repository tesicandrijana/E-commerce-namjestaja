// src/pages/customer/BestSellers.jsx
import ProductGridPage from "./ProductGridPage";

export default function BestSellers() {
  return (
    <ProductGridPage
      title="Best Sellers"
      description="Our most popular products based on customer orders"
      fetchUrl="http://localhost:8000/products/best-sellers"
    />
  );
}
