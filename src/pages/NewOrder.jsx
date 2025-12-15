// src/pages/NewOrder.jsx
import React, { useState } from "react";
import "../styles/NewOrder.css";

const products = [
  {
    id: "P001",
    name: "ชุดไทยจักรพรรดิ สีชมพู",
    price: 4500,
    stock: 5,
    image:
      "https://images.unsplash.com/photo-1552641156-93c6b53f9e7b?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "P002",
    name: "ชุดไทยบรมพิมาน สีฟ้า",
    price: 5200,
    stock: 3,
    image:
      "https://images.unsplash.com/photo-1552641972-3b62a0ba96b6?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "P003",
    name: "ชุดไทยอมรินทร์ สีเขียว",
    price: 4800,
    stock: 4,
    image:
      "https://images.unsplash.com/photo-1524678714210-9917a6c619c4?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "P004",
    name: "ผ้ายันต์พิมพ์ดี ลายเรขาคณิต",
    price: 3500,
    stock: 8,
    image:
      "https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&w=900&q=80",
  },
];

function formatTHB(value) {
  return `฿${value.toLocaleString("th-TH")}`;
}

export default function NewOrder() {
  const [cart, setCart] = useState([]);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("เงินสด");
  const [showReceipt, setShowReceipt] = useState(false);

  // เพิ่มสินค้าเข้าตะกร้า
  const handleAddToCart = (product) => {
    setCart((prev) => {
      const exist = prev.find((item) => item.id === product.id);
      if (exist) {
        if (exist.qty >= product.stock) return prev;
        return prev.map((item) =>
          item.id === product.id ? { ...item, qty: item.qty + 1 } : item
        );
      }
      return [
        ...prev,
        { id: product.id, name: product.name, price: product.price, qty: 1 },
      ];
    });
  };

  // ลบทั้งรายการออกจากตะกร้า
  const handleRemoveFromCart = (productId) => {
    setCart((prev) => prev.filter((item) => item.id !== productId));
  };

  // รวมยอด
  const subTotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const vat = Math.round(subTotal * 0.07);
  const grandTotal = subTotal + vat;

  const handlePay = () => {
    if (cart.length === 0) return;
    setShowReceipt(true);
  };

  const closeReceipt = () => setShowReceipt(false);

  return (
    <>
      <div className="new-order-page">
        {/* ซ้าย: การ์ดสินค้า */}
        <div className="new-order-main">
          <div className="product-grid">
            {products.map((p) => (
              <div className="product-card" key={p.id}>
                <div className="product-image-wrapper">
                  <img src={p.image} alt={p.name} className="product-image" />
                  {/* ซ่อนป้ายรหัส (ไม่แสดงแล้ว) */}
                  {/* <span className="product-code">{p.id}</span> */}
                  <span className="product-stock">คงเหลือ {p.stock}</span>
                </div>

                <div className="product-body">
                  <div className="product-name">{p.name}</div>

                  <div className="product-footer">
                    <div className="product-price-block">
                      <span className="price-label">ราคา</span>
                      <span className="product-price">
                        <span className="price-symbol">฿</span>
                        {p.price.toLocaleString("th-TH")}
                      </span>
                    </div>

                    <button
                      className="add-btn"
                      type="button"
                      onClick={() => handleAddToCart(p)}
                    >
                      <span className="add-btn-icon">+</span>
                      เพิ่ม
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ขวา: ข้อมูลลูกค้า + สรุปยอดชำระ */}
        <div className="new-order-right">
          {/* ข้อมูลลูกค้า */}
          <div className="card">
            <div className="card-header">
              <div className="card-header-left">
                <div className="card-icon">👤</div>
                <div className="card-title">ข้อมูลลูกค้า</div>
              </div>
            </div>

            <div className="form-group">
              <label>ชื่อลูกค้า</label>
              <input
                className="text-input"
                placeholder="ระบุชื่อลูกค้า (ไม่บังคับ)"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>เบอร์โทรศัพท์</label>
              <input
                className="text-input"
                placeholder="เบอร์โทรศัพท์ (ไม่บังคับ)"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>วิธีชำระเงิน</label>
              <div className="select-wrapper">
                <select
                  className="text-input select-input"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                >
                  <option value="เงินสด">เงินสด</option>
                  <option value="บัตรเครดิต">บัตรเครดิต</option>
                  <option value="โอนเงิน">โอนเงิน</option>
                </select>
              </div>
            </div>
          </div>

          {/* สรุปยอดชำระ */}
          <div className="card">
            <div className="card-header">
              <div className="card-header-left">
                <div className="card-icon">🧾</div>
                <div className="card-title">สรุปยอดชำระ</div>
              </div>
            </div>

            {/* รายการสินค้าในตะกร้า */}
            <div className="summary-items">
              {cart.length === 0 ? (
                <div className="summary-empty">ยังไม่มีสินค้าในตะกร้า</div>
              ) : (
                cart.map((item) => (
                  <div className="summary-item" key={item.id}>
                    <div className="summary-item-left">
                      <div className="summary-item-name">{item.name}</div>
                      <div className="summary-item-meta">x {item.qty}</div>
                    </div>
                    <div className="summary-item-right">
                      <div className="summary-item-price">
                        {formatTHB(item.price * item.qty)}
                      </div>
                      <button
                        type="button"
                        className="summary-remove-btn"
                        onClick={() => handleRemoveFromCart(item.id)}
                      >
                        ลบ
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* ยอดรวม */}
            <div className="summary-row summary-row-tight">
              <span>ยอดรวมสินค้า</span>
              <span>{formatTHB(subTotal)}</span>
            </div>
            <div className="summary-row summary-row-tight">
              <span>ภาษี (7%)</span>
              <span>{formatTHB(vat)}</span>
            </div>

            <div className="summary-total-label">ยอดชำระทั้งหมด</div>
            <div className="summary-total-amount">
              {formatTHB(grandTotal)}
            </div>

            <button
              className="new-order-pay-button"
              type="button"
              onClick={handlePay}
              disabled={cart.length === 0}
            >
              ชำระเงินและพิมพ์ใบเสร็จ
            </button>
          </div>
        </div>
      </div>

      {/* MODAL ใบเสร็จ (เหมือนเดิม) */}
      {showReceipt && (
        <div className="receipt-modal-overlay">
          <div className="receipt-modal">
            <div className="receipt-header">
              <h2>ใบเสร็จรับเงิน</h2>
              <button
                type="button"
                className="receipt-close"
                onClick={closeReceipt}
              >
                ×
              </button>
            </div>

            <div className="receipt-body">
              <h3 className="receipt-shop-name">ร้านผ้าทอพื้นเมือง</h3>
              <div className="receipt-subtitle">ใบเสร็จรับเงิน</div>

              <div className="receipt-info-grid">
                <div>
                  <div className="receipt-label">ลูกค้า</div>
                  <div className="receipt-text">
                    {customerName || "ลูกค้าทั่วไป"}
                  </div>
                </div>
                <div>
                  <div className="receipt-label">เบอร์โทรศัพท์</div>
                  <div className="receipt-text">
                    {customerPhone || "-"}
                  </div>
                </div>
                <div>
                  <div className="receipt-label">วิธีชำระเงิน</div>
                  <div className="receipt-text">{paymentMethod}</div>
                </div>
              </div>

              <div className="receipt-items">
                {cart.map((item) => (
                  <div className="receipt-item-row" key={item.id}>
                    <div>
                      <div className="receipt-item-name">{item.name}</div>
                      <div className="receipt-item-qty">
                        {item.qty} x {formatTHB(item.price)}
                      </div>
                    </div>
                    <div className="receipt-item-amount">
                      {formatTHB(item.price * item.qty)}
                    </div>
                  </div>
                ))}
              </div>

              <div className="receipt-summary">
                <div className="receipt-summary-row">
                  <span>รวม:</span>
                  <span>{formatTHB(subTotal)}</span>
                </div>
                <div className="receipt-summary-row">
                  <span>ภาษี 7%:</span>
                  <span>{formatTHB(vat)}</span>
                </div>
                <div className="receipt-summary-row total">
                  <span>ยอดชำระ:</span>
                  <span>{formatTHB(grandTotal)}</span>
                </div>
              </div>

              <div className="receipt-footer-text">ขอบคุณที่ใช้บริการ</div>

              <div className="receipt-buttons">
                <button
                  type="button"
                  className="receipt-print-btn"
                  onClick={() => window.print()}
                >
                  พิมพ์ใบเสร็จ
                </button>
                <button
                  type="button"
                  className="receipt-close-btn"
                  onClick={closeReceipt}
                >
                  ปิด
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}