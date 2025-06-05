import React, { useEffect, useState } from "react";
import { useCart } from "../../contexts/CartContext";
import { useAuth } from "../../components/auth/AuthProvider";
import "./CheckOut.css";

export default function Checkout() {
  const { cartItems, clearCart } = useCart();
  const { currentUser } = useAuth();

  const [productsMap, setProductsMap] = useState({});
  const [callingCodes, setCallingCodes] = useState([]);
  const [discountsMap, setDiscountsMap] = useState({});
  const [taxRate, setTaxRate] = useState(0);
  const [shippingCost, setShippingRate] = useState(0); // Shipping cost state
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formSuccess, setFormSuccess] = useState(null);
  const [formError, setFormError] = useState(null);

  const [orderData, setOrderData] = useState({
    name: currentUser?.name || "",
    email: currentUser?.email || "",
    calling_code: "",
    country_code: "",
    phone: "",
    address: "",
    city: "",
    postal_code: "",
    paymentMethod: "credit_card",
  });

  // Fetch all products and create a map for quick lookup
  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await fetch("http://localhost:8000/products/");
        if (!res.ok) throw new Error("Failed to fetch products");
        const products = await res.json();
        const map = {};
        products.forEach((p) => (map[p.id] = p));
        setProductsMap(map);
      } catch (err) {
        console.error(err);
      }
    }
    fetchProducts();
  }, []);

  // Fetch calling codes for phone input
  useEffect(() => {
    async function fetchCallingCodes() {
      try {
        const res = await fetch(
          "http://localhost:8000/taxes-shipping/calling-codes/"
        );
        if (!res.ok) throw new Error("Failed to fetch calling codes");
        const data = await res.json();
        setCallingCodes(data);
      } catch (err) {
        console.error(err);
      }
    }
    fetchCallingCodes();
  }, []);

  // Fetch discounts if cart has items
  useEffect(() => {
    async function fetchDiscounts() {
      try {
        const res = await fetch("http://localhost:8000/discounts/");
        if (!res.ok) throw new Error("Failed to fetch discounts");
        const data = await res.json();
        const map = {};
        data.forEach((discount) => {
          map[discount.product_id] = discount;
        });
        setDiscountsMap(map);
      } catch (err) {
        console.error(err);
      }
    }
    if (cartItems.length > 0) fetchDiscounts();
  }, [cartItems]);

  // Fetch tax and shipping rates based on selected calling code
  useEffect(() => {
    async function fetchTaxAndShippingByCallingCode() {
      if (!orderData.calling_code) {
        setTaxRate(0);
        setShippingRate(0);
        return;
      }

      try {
        const selectedCountry = callingCodes.find(
          (code) => code.calling_code === orderData.calling_code
        );

        if (!selectedCountry) {
          setTaxRate(0);
          setShippingRate(0);
          return;
        }

        // Fetch tax rates
        const taxRes = await fetch(`http://localhost:8000/taxes-shipping/taxes`);
        if (!taxRes.ok) throw new Error("Failed to fetch tax rates");
        const taxData = await taxRes.json();

        const countryTaxRate = taxData.find(
          (rate) => rate.country_code === selectedCountry.country_code
        );
        setTaxRate(
          countryTaxRate ? parseFloat(countryTaxRate.vat_rate) : 0
        ); // Convert percentage to decimal

        // Fetch shipping rates
        const shippingRes = await fetch(
          `http://localhost:8000/taxes-shipping/shipping`
        );
        if (!shippingRes.ok) throw new Error("Failed to fetch shipping rates");
        const shippingData = await shippingRes.json();

        const countryShipping = shippingData.find(
          (rate) => rate.country_code === selectedCountry.country_code
        );
        setShippingRate(
          countryShipping ? parseFloat(countryShipping.shipping_rate) : 0
        ); // Convert percentage to decimal
      } catch (error) {
        console.error("Error fetching tax or shipping rates:", error);
        setTaxRate(0);
        setShippingRate(0);
      }
    }

    fetchTaxAndShippingByCallingCode();
  }, [orderData.calling_code, callingCodes]);

  // Calculate totals with discounts, tax, and shipping
  const calculateTotals = () => {
    let subtotal = 0;
    let discountTotal = 0;

    cartItems.forEach((item) => {
      const product = productsMap[item.product_id];
      if (!product) return;

      const productPriceTotal = product.price * item.quantity;
      subtotal += productPriceTotal;

      const discountPercentRaw = discountsMap[item.product_id]?.amount ?? 0;
      const discountPercent = parseFloat(discountPercentRaw);

      const totalDiscountForItem = (discountPercent / 100) * productPriceTotal;
      discountTotal += totalDiscountForItem;
    });

    const afterDiscount = subtotal - discountTotal;
    const tax = afterDiscount * taxRate;
    const total = afterDiscount + tax + shippingCost;

    return {
      subtotal,
      discountTotal,
      tax,
      shipping: shippingCost,
      total,
    };
  };

  const { subtotal, discountTotal, tax, shipping, total } = calculateTotals();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setOrderData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormSubmitting(true);
    setFormError(null);
    setFormSuccess(null);

    if (cartItems.length === 0) {
      setFormError("Your cart is empty.");
      setFormSubmitting(false);
      return;
    }

    if (!orderData.calling_code) {
      setFormError("Please select your country calling code.");
      setFormSubmitting(false);
      return;
    }

    try {
      const orderItems = cartItems.map((item) => {
        const product = productsMap[item.product_id];
        return {
          product_id: item.product_id,
          quantity: item.quantity,
          price_per_unit: Number(product?.price || 0),
        };
      });

      const payload = {
        customer_id: currentUser?.id || 1,
        address: orderData.address,
        city: orderData.city,
        postal_code: orderData.postal_code,
        country_code: orderData.country_code,
        phone: `${orderData.calling_code}${orderData.phone}`,
        payment_method: orderData.paymentMethod,
        status: "pending",
        payment_status: "pending",
        items: orderItems,
        transaction_id: null,
        subtotal,
        discount: discountTotal,
        tax,
        shipping_cost: shipping, // Include shipping cost in order payload
        total_price: total,
      };

      const res = await fetch("http://localhost:8000/orders/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || "Failed to place order");
      }

      setFormSuccess("Order placed successfully!");
      setOrderData({
        name: currentUser?.name || "",
        email: currentUser?.email || "",
        calling_code: "",
        country_code: "",
        phone: "",
        address: "",
        city: "",
        postal_code: "",
        paymentMethod: "credit_card",
      });
      clearCart();
    } catch (error) {
      console.error(error);
      setFormError("Failed to place order. Please try again.");
    } finally {
      setFormSubmitting(false);
    }
  };

  if (cartItems.length === 0)
    return <p className="empty-cart-msg">Your cart is empty.</p>;

  return (
    <div className="checkout-overlay">
      <div className="checkout-wrapper">
        <h2 className="checkout-title">Finalize your order</h2>
        <div className="checkout-grid">
          {/* Summary */}
          <div className="checkout-summary">
            <h3>Cart Summary</h3>

            {/* Scrollable container: items + subtotal, discount, tax */}
            <div className="checkout-summary-scrollable">
              {cartItems.map((item) => {
                const product = productsMap[item.product_id];
                return (
                  <div key={item.id} className="checkout-summary-item">
                    <span>{product?.name || `Product #${item.product_id}`}</span>
                    <span>
                      {item.quantity} × ${Number(product?.price || 0).toFixed(2)}
                    </span>
                  </div>
                );
              })}

              <div className="checkout-summary-totals">
                <div>
                  <span>Subtotal:</span> <span>${subtotal.toFixed(2)}</span>
                </div>
                <div>
                  <span>Discount:</span> <span>- ${discountTotal.toFixed(2)}</span>
                </div>
                <div>
                  <span>Tax:</span> <span>+ ${tax.toFixed(2)}</span>
                </div>
                <div>
                  <span>Shipping:</span> <span>+ ${shipping.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Total outside scroll container */}
            <div className="checkout-summary-total">
              <strong>Total: ${total.toFixed(2)}</strong>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="checkout-form">
            <label>
              Name
              <input
                name="name"
                value={orderData.name}
                onChange={handleInputChange}
                required
              />
            </label>

            <label>
              Email
              <input
                name="email"
                type="email"
                value={orderData.email}
                onChange={handleInputChange}
                required
              />
            </label>

            <label>
              Phone
              <div className="phone-input-wrapper">
                <select
                  name="calling_code"
                  value={orderData.calling_code}
                  onChange={(e) => {
                    handleInputChange(e);
                    const country = callingCodes.find(
                      (c) => c.calling_code === e.target.value
                    );
                    setOrderData((prev) => ({
                      ...prev,
                      country_code: country ? country.country_code : "",
                    }));
                  }}
                  required
                >
                  <option value="">Select</option>
                  {callingCodes.map((code) => (
                    <option key={code.calling_code} value={code.calling_code}>
                      {code.country_name} ({code.calling_code})
                    </option>
                  ))}
                </select>
                <input
                  name="phone"
                  type="tel"
                  value={orderData.phone}
                  onChange={handleInputChange}
                  required
                  placeholder="Phone number"
                />
              </div>
            </label>

            <label>
              Address
              <input
                name="address"
                value={orderData.address}
                onChange={handleInputChange}
                required
              />
            </label>

            <label>
              City
              <input
                name="city"
                value={orderData.city}
                onChange={handleInputChange}
                required
              />
            </label>

            <label>
              Postal Code
              <input
                name="postal_code"
                value={orderData.postal_code}
                onChange={handleInputChange}
                required
              />
            </label>

            <label>
              Payment Method
              <select
                name="paymentMethod"
                value={orderData.paymentMethod}
                onChange={handleInputChange}
                required
              >
                <option value="credit_card">Credit Card</option>
                <option value="paypal">PayPal</option>
                <option value="cash_on_delivery">Cash on Delivery</option>
              </select>
            </label>

            <button
              className="checkout-btn"
              type="submit"
              disabled={formSubmitting}
            >
              {formSubmitting ? "Placing Order..." : "Place Order"}
            </button>

            {formError && <p className="form-error">{formError}</p>}
            {formSuccess && <p className="form-success">{formSuccess}</p>}
          </form>
        </div>
      </div>
    </div>
  );
}
