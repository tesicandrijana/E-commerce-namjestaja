import React, { useEffect, useState } from "react"; 
import { useCart } from "../../contexts/CartContext";
import { useAuth } from "../../components/auth/AuthProvider";
import jsPDF from "jspdf";
import "./CheckOut.css";

export default function Checkout() {
  const { cartItems, clearCart } = useCart();
  const { currentUser } = useAuth();

  const [callingCodes, setCallingCodes] = useState([]);
  const [taxRate, setTaxRate] = useState(0);
  const [shippingCost, setShippingCost] = useState(0);
  const [discountedPrices, setDiscountedPrices] = useState({});
  const [productNames, setProductNames] = useState({});
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
    async function loadCodes() {
      try {
        const res = await fetch("http://localhost:8000/taxes-shipping/calling-codes/");
        if (!res.ok) throw new Error("Failed to load calling codes");
        setCallingCodes(await res.json());
      } catch (e) {
        console.error(e);
      }
    }
    loadCodes();
  }, []);

  useEffect(() => {
    async function fetchData() {
      const prices = {};
      const names = {};

      await Promise.all(
        cartItems.map(async (item) => {
          try {
            const priceRes = await fetch(`http://localhost:8000/products/${item.product_id}/discounted-price`);
            if (!priceRes.ok) throw new Error("Bad response for price");
            const { discounted_price } = await priceRes.json();
            prices[item.product_id] = Number(discounted_price) || 0;

            const nameRes = await fetch(`http://localhost:8000/products/${item.product_id}`);
            if (!nameRes.ok) throw new Error("Bad response for product info");
            const product = await nameRes.json();
            names[item.product_id] = product.name || `Product #${item.product_id}`;
          } catch (e) {
            console.error(e);
            prices[item.product_id] = 0;
            names[item.product_id] = `Product #${item.product_id}`;
          }
        })
      );

      setDiscountedPrices(prices);
      setProductNames(names);
    }

    if (cartItems.length > 0) fetchData();
  }, [cartItems]);

  useEffect(() => {
    async function loadRates() {
      if (!orderData.calling_code) {
        setTaxRate(0);
        setShippingCost(0);
        return;
      }

      try {
        const codeInfo = callingCodes.find(c => c.calling_code === orderData.calling_code);
        if (!codeInfo) return;

        const [taxRes, shipRes] = await Promise.all([
          fetch("http://localhost:8000/taxes-shipping/taxes"),
          fetch("http://localhost:8000/taxes-shipping/shipping")
        ]);

        if (!taxRes.ok || !shipRes.ok) throw new Error("Failed to load tax/shipping data");

        const taxArr = await taxRes.json();
        const shipArr = await shipRes.json();

        const countryTax = taxArr.find(r => r.country_code === codeInfo.country_code);
        const countryShip = shipArr.find(r => r.country_code === codeInfo.country_code);

        setTaxRate(countryTax ? parseFloat(countryTax.vat_rate) : 0);
        setShippingCost(countryShip ? parseFloat(countryShip.shipping_rate) : 0);
      } catch (e) {
        console.error(e);
        setTaxRate(0);
        setShippingCost(0);
      }
    }

    loadRates();
  }, [orderData.calling_code, callingCodes]);

  const calculateTotals = () => {
    let subtotal = 0;
    cartItems.forEach(item => {
      const unit = discountedPrices[item.product_id] || 0;
      subtotal += unit * item.quantity;
    });
    const tax = subtotal * taxRate;
    const total = subtotal + tax + shippingCost;
    return { subtotal, tax, shipping: shippingCost, total };
  };

  const { subtotal, tax, shipping, total } = calculateTotals();

  const handleChange = e => {
    const { name, value } = e.target;
    setOrderData(prev => ({
      ...prev,
      [name]: value,
      ...(name === "calling_code" && {
        country_code: (callingCodes.find(c => c.calling_code === value)?.country_code) || ""
      })
    }));
  };

  const generateReceipt = () => {
  const doc = new jsPDF();

  doc.setFontSize(16);
  doc.text("Order Receipt", 20, 20);

  doc.setFontSize(12);
  doc.text(`Name: ${orderData.name}`, 20, 30);
  doc.text(`Email: ${orderData.email}`, 20, 38);
  doc.text(`Phone: ${orderData.calling_code}${orderData.phone}`, 20, 46);
  doc.text(`Address: ${orderData.address}, ${orderData.city}, ${orderData.postal_code}`, 20, 54);
  doc.text(`Payment Method: ${orderData.paymentMethod}`, 20, 62);

  doc.text("Items:", 20, 74);
  let y = 82;

  cartItems.forEach((item) => {
    const name = productNames[item.product_id] || `Product #${item.product_id}`;
    const price = discountedPrices[item.product_id]?.toFixed(2) || "0.00";
    doc.text(`${name}: ${item.quantity} × $${price}`, 20, y);
    y += 8;
  });

  y += 4;
  doc.text(`Subtotal: $${subtotal.toFixed(2)}`, 20, y); y += 8;
  doc.text(`Tax: $${tax.toFixed(2)}`, 20, y); y += 8;
  doc.text(`Shipping: $${shipping.toFixed(2)}`, 20, y); y += 8;
  doc.text(`Total: $${total.toFixed(2)}`, 20, y);

  doc.save("order_receipt.pdf");
};


  const handleSubmit = async e => {
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
      const orderItems = cartItems.map(item => ({
        product_id: item.product_id,
        quantity: item.quantity,
        price_per_unit: Number(discountedPrices[item.product_id] || 0),
      }));

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
        discount: 0,
        tax,
        shipping_cost: shipping,
        total_price: total
      };

      const res = await fetch("http://localhost:8000/orders/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Failed to place order");
      }

      setFormSuccess("Order placed successfully!");
      generateReceipt();
      clearCart();
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
    } catch (e) {
      console.error(e);
      setFormError("Failed to place order. Please try again.");
    } finally {
      setFormSubmitting(false);
    }
  };

  if (cartItems.length === 0) {
    return <p className="empty-cart-msg">Your cart is empty.</p>;
  }

  return (
    <div className="checkout-overlay">
      <div className="checkout-wrapper">
        <h2 className="checkout-title">Finalize your order</h2>
        <div className="checkout-grid">
          <div className="checkout-summary">
            <h3>Cart Summary</h3>
            <div className="checkout-summary-scrollable">
              {cartItems.map(item => (
                <div key={item.id} className="checkout-summary-item">
                  <span>{productNames[item.product_id] || `Product #${item.product_id}`}</span>
                  <span>{`${item.quantity} × ${(discountedPrices[item.product_id] || 0).toFixed(2)} KM`}</span>
                </div>
              ))}
              <div className="checkout-summary-totals">
                <div><span>Subtotal:</span> <span>{subtotal.toFixed(2)} KM</span></div>
                <div><span>Tax:</span> <span>+ {tax.toFixed(2)} KM</span></div>
                <div><span>Shipping:</span> <span>+ {shipping.toFixed(2)} KM</span></div>
              </div>
            </div>
            <div className="checkout-summary-total">
              <strong>Total: {total.toFixed(2)} KM</strong>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="checkout-form">
            <label>Name<input name="name" value={orderData.name} onChange={handleChange} required /></label>
            <label>Email<input name="email" type="email" value={orderData.email} onChange={handleChange} required /></label>
            <label>Phone
              <div className="phone-input-group">
                <select
                  name="calling_code"
                  value={orderData.calling_code}
                  onChange={handleChange}
                  required
                  className="calling-code-select"
                >
                  <option value="">Calling Code</option>
                  {callingCodes.map(c => (
                    <option key={c.id} value={c.calling_code}>
                      {`${c.calling_code} (${c.country_code})`}
                    </option>
                  ))}
                </select>
                <input
                  name="phone"
                  type="tel"
                  value={orderData.phone}
                  onChange={handleChange}
                  required
                  className="phone-input"
                  placeholder="Phone number"
                />
              </div>
            </label>
            <label>Address<input name="address" value={orderData.address} onChange={handleChange} required /></label>
            <label>City<input name="city" value={orderData.city} onChange={handleChange} required /></label>
            <label>Postal Code<input name="postal_code" value={orderData.postal_code} onChange={handleChange} required /></label>
            <label>Payment Method
              <select name="paymentMethod" value={orderData.paymentMethod} onChange={handleChange} required>
                <option value="credit_card">Credit Card</option>
                <option value="paypal">PayPal</option>
                <option value="cash_on_delivery">Cash on Delivery</option>
              </select>
            </label>
            <button className="checkout-btn" type="submit" disabled={formSubmitting}>
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





