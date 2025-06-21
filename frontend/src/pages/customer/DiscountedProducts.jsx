
import ProductGridPage from "./ProductGridPage";

export default function DiscountedProducts() {
  return (
    <ProductGridPage
      title="Discounted Products"
      description="Save big with our currently discounted items"
      fetchUrl="http://localhost:8000/discounts/discounted"
    />
  );
}
