// src/pages/customer/NewArrivals.jsx
import ProductGridPage from "./ProductGridPage";

export default function NewArrivals() {
  return (
    <ProductGridPage
      title="New Arrivals"
      description="Discover new products added within the last 30 days"
      fetchUrl="http://localhost:8000/products/recent"
    />
  );
}
