import { useParams } from "react-router-dom";
import ProductGridPage from "./ProductGridPage";

export default function ProductList() {
  const { categoryName } = useParams();

  return (
    <ProductGridPage
      title="Our Products"
      fetchUrl="http://localhost:8000/products/"
      selectedCategoryName={categoryName} 
    />
  );
}

