import React from "react";
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useCart } from "../../contexts/CartContext";
import { FaShoppingCart, FaPaperPlane } from "react-icons/fa";
import ProductDetail from "../../components/product/ProductDetail"
import "./ProductDetails.css";

// StarRating class component
class StarRating extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hover: 0 };
  }

  getClassName(star) {
    const { rating, editable } = this.props;
    const { hover } = this.state;

    if (editable) {
      if (hover >= star) return "pd-star filled editable";
      if (!hover && rating >= star) return "pd-star filled editable";
      return "pd-star editable";
    }
    return rating >= star ? "pd-star filled" : "pd-star";
  }

  render() {
    const { editable, onChange } = this.props;
    const stars = [1, 2, 3, 4, 5];

    return (
      <div className="pd-star-rating">
        {stars.map((star) => (
          <span
            key={star}
            className={this.getClassName(star)}
            onMouseEnter={() => editable && this.setState({ hover: star })}
            onMouseLeave={() => editable && this.setState({ hover: 0 })}
            onClick={() => editable && onChange(star)}
            role={editable ? "button" : undefined}
            aria-label={editable ? `Set rating to ${star}` : undefined}
            style={{ cursor: editable ? "pointer" : "default" }}
          >
            ★
          </span>
        ))}
      </div>
    );
  }
}

class ProductDetails extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      product: null,
      loading: true,
      error: null,
      reviewRating: 0,
      reviewComment: "",
      submitError: null,
      submitSuccess: false,
    };
  }

  componentDidMount() {
    this.fetchProduct();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.match.params.id !== this.props.match.params.id) {
      this.fetchProduct();
    }
  }

  fetchProduct() {
    const productId = parseInt(this.props.match.params.id, 10);

    this.setState({ loading: true, error: null, product: null });

    fetch(`http://localhost:8000/products/${productId}`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        this.setState({ product: data, loading: false });
      })
      .catch((err) => {
        this.setState({ error: err.message, loading: false });
      });
  }

  handleSubmitReview = (e) => {
    e.preventDefault();

    const { reviewRating, reviewComment } = this.state;
    const productId = parseInt(this.props.match.params.id, 10);

    this.setState({ submitError: null, submitSuccess: false });

    if (reviewRating === 0) {
      this.setState({ submitError: "Please select a rating." });
      return;
    }

    fetch(`http://localhost:8000/products/${productId}/reviews`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rating: reviewRating, comment: reviewComment }),
    })
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to submit review: ${res.statusText}`);
        return res.json();
      })
      .then((updatedProduct) => {
        this.setState({
          reviewRating: 0,
          reviewComment: "",
          submitSuccess: true,
          product: updatedProduct,
        });
      })
      .catch((err) => this.setState({ submitError: err.message }));
  };

  render() {
    const {
      product, loading, error, reviewRating, reviewComment,
      submitError, submitSuccess,
    } = this.state;
    const { cart } = this.props;

    if (loading) return <p>Loading product...</p>;
    if (error) return <p>Error loading product: {error}</p>;
    if (!product) return <p>Product not found.</p>;

    return (
      <div className="pd-container">
       {/* <div className="pd-info-wrapper">
            <div className="pd-image"> */}
            <ProductDetail/>
           {/* <img
              src={
                product.image?.startsWith("http")
                  ? product.image
                  : product.image?.startsWith("/static")
                  ? `http://localhost:8000${product.image}`
                  : `http://localhost:8000/static/product_images/${product.image}`
              }
              alt={product.name}
              onError={(e) => {
                e.target.src = "/fallback-image.png";
              }}
            />
          </div>

          <div className="pd-summary">
            <h1>{product.name}</h1>
            <p className="pd-description">Category: {product.category?.name || "No category"}</p>
            <p className="pd-price">${product.price}</p>

            <StarRating rating={product.rating} />

            <button
              onClick={() => cart.addToCart(product)}
              className="pd-add-to-cart"
            >
              <FaShoppingCart /> Add to Cart
            </button> */}
          {/* </div> 
        </div>*/}

        <div className="pd-add-review">
          <h2>Submit a Review</h2>
          {submitError && <p style={{ color: "red" }}>{submitError}</p>}
          {submitSuccess && <p style={{ color: "green" }}>Review submitted successfully!</p>}

          <form onSubmit={this.handleSubmitReview}>
            <label>Rating:</label>
            <StarRating
              rating={reviewRating}
              editable={true}
              onChange={(rating) => this.setState({ reviewRating: rating })}
            />

            <label htmlFor="comment">Comment:</label>
            <textarea
              id="comment"
              value={reviewComment}
              onChange={(e) => this.setState({ reviewComment: e.target.value })}
              rows={4}
              placeholder="Write your review here..."
            />

            <button type="submit" className="pd-submit-review pd-add-to-cart">
              <FaPaperPlane /> Submit Review
            </button>
          </form>
        </div>
      </div>
    );
  }
}

// Wrapper for hooks
function ProductDetailsWrapper(props) {
  const params = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const cart = useCart();

  return (
    <ProductDetails
      {...props}
      match={{ params }}
      navigate={navigate}
      location={location}
      cart={cart}
    />
  );
}

export default ProductDetailsWrapper;
