import ProductGridPage from "./ProductGridPage";

export default function ProductList() {
  return (
    <ProductGridPage
      title="Our Products"
     /*description="Browse by category or search for anything"*/
      fetchUrl="http://localhost:8000/products/"
    />
  );
}