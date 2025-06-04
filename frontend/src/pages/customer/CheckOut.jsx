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

  useEffect(() => {
    async function fetchCallingCodes() {
      try {
        const res = await fetch("http://localhost:8000/shipping/calling-codes/");
        if (!res.ok) throw new Error("Failed to fetch calling codes");
        const data = await res.json();
        setCallingCodes(data);
      } catch (err) {
        console.error(err);
      }
    }
    fetchCallingCodes();
  }, []);

  useEffect(() => {
    async function fetchDiscounts() {
      try {
        const res = await fetch("http://localhost:8000/discounts/");
        if (!res.ok) throw new Error("Failed to fetch discounts");
        const data = await res.json();
        const map = {};
        data.forEach(discount => {
          map[discount.product_id] = discount;
        });
        setDiscountsMap(map);
      } catch (err) {
        console.error(err);
      }
    }
    if (cartItems.length > 0) fetchDiscounts();
  }, [cartItems]);

  

  useEffect(() => {
  async function fetchTaxByCallingCode() {
    if (!orderData.calling_code) {
      setTaxRate(0); // Default tax rate if no calling code is selected
      return;
    }

    try {
      // Find the country code corresponding to the calling code
      const selectedCountry = callingCodes.find(
        (code) => code.calling_code === orderData.calling_code
      );

      if (selectedCountry) {
        // Fetch the tax rates from the backend
        const res = await fetch(`http://localhost:8000/shipping/tax-rates/`);

        if (!res.ok) throw new Error("Failed to fetch tax rates");

        const data = await res.json(); // Get all tax rates

        // Find the tax rate based on the selected country's country_code
        const countryTaxRate = data.find(
          (rate) => rate.country_code === selectedCountry.country_code
        );

        if (countryTaxRate) {
  // Convert VAT percentage (e.g. 20) to decimal (0.20)
  setTaxRate(parseFloat(countryTaxRate.vat_rate) / 100);
} else {
  setTaxRate(0);
}

      }
    } catch (err) {
      console.error(err);
      setTaxRate(0); // Default to 0 in case of error
    }
  }

  fetchTaxByCallingCode();
}, [orderData.calling_code, callingCodes]);


  const calculateTotals = () => {
  let subtotal = 0;
  let discountTotal = 0;

  cartItems.forEach(item => {
    const product = productsMap[item.product_id];
    if (!product) return;

    const productPriceTotal = product.price * item.quantity;
    subtotal += productPriceTotal;

    // Discount amount is percentage, e.g. 15 means 15%
    const discountPercentRaw = discountsMap[item.product_id]?.amount ?? 0;
    const discountPercent = parseFloat(discountPercentRaw);

    // Calculate discount amount by applying percentage on product price total
    const totalDiscountForItem = (discountPercent / 100) * productPriceTotal;

    discountTotal += totalDiscountForItem;
  });

  const afterDiscount = subtotal - discountTotal;

  // Tax is calculated by multiplying after discount total by the tax rate
  const tax = afterDiscount * (taxRate*100);  // taxRate is already in percentage (e.g., 0.25 for 25%)

  const total = afterDiscount + tax;

  return { subtotal, discountTotal, tax, total };
};

  const { subtotal, discountTotal, tax, total } = calculateTotals();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setOrderData(prev => ({ ...prev, [name]: value }));
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
                {/* <div>Shipping: + ${shipping.toFixed(2)}</div> */}
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
              <div className="phone-input-group">
                <select
                  name="calling_code"
                  value={orderData.calling_code}
                  onChange={(e) => {
                    const selected = callingCodes.find(
                      (c) => c.calling_code === e.target.value
                    );
                    setOrderData((prev) => ({
                      ...prev,
                      calling_code: e.target.value,
                      country_code: selected?.country_code || "",
                    }));
                  }}
                  required
                  className="calling-code-select"
                >
                  <option value="">Calling Code</option>
                  {callingCodes.map((code) => (
                    <option key={code.id} value={code.calling_code}>
                      {code.calling_code} ({code.country_code})
                    </option>
                  ))}
                </select>

                <input
                  name="phone"
                  type="tel"
                  value={orderData.phone}
                  onChange={handleInputChange}
                  required
                  className="phone-input"
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
              >
                <option value="credit_card">Credit Card</option>
                <option value="paypal">PayPal</option>
                <option value="cash_on_delivery">Cash on Delivery</option>
              </select>
            </label>

            <button type="submit" disabled={formSubmitting}>
              {formSubmitting ? "Submitting..." : "Place Order"}
            </button>

            {formSuccess && <p className="form-success">{formSuccess}</p>}
            {formError && <p className="form-error">{formError}</p>}
          </form>
        </div>
      </div>
    </div>
  );
}