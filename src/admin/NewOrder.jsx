import React, { useState } from "react";
import "../css/NewOrder.css";

const products = [
  {
    id: "P001",
    name: "ชุดไทยจักรพรรดิ",
    price: 4500,
    stock: 5,
    image:
      "https://i.pinimg.com/1200x/b7/6c/1b/b76c1b9fbab0528a0993c8c1e04910b7.jpg",
  },
  {
    id: "P002",
    name: "ชุดไทยบรมพิมาน",
    price: 5200,
    stock: 3,
    image:
      "https://i.pinimg.com/736x/ad/1a/32/ad1a32e535731d7a55d1c30ace6460b4.jpg",
  },
  {
    id: "P003",
    name: "ชุดไทยอมรินทร์",
    price: 4800,
    stock: 4,
    image:
      "https://i.pinimg.com/1200x/f1/e9/6d/f1e96db21aa7fe21a6674eb3c86c06fa.jpg",
  },
  {
    id: "P004",
    name: "ผ้าซิ่นมัดหมี่",
    price: 3500,
    stock: 8,
    image:
      "https://i.pinimg.com/736x/f5/a0/a6/f5a0a6c40303547575ce07fe9b67145e.jpg",
  },
];

export default function NewOrder() {
  const [step, setStep] = useState(1);
  const [cart, setCart] = useState([]);
  const [showReceipt, setShowReceipt] = useState(false);

  const [customer, setCustomer] = useState({
    name: "",
    phone: "",
    taxId: "",
    company: "",
    payment: "เงินสด",
  });

  // 💸 เงินสดที่รับมา
  const [cashReceived, setCashReceived] = useState("");

  // ---------------- AUTO FORMAT PHONE ----------------
  const handlePhone = (e) => {
    let input = e.target.value.replace(/\D/g, "").slice(0, 10);

    if (input.length > 6)
      input = `${input.slice(0, 3)}-${input.slice(3, 6)}-${input.slice(6)}`;
    else if (input.length > 3)
      input = `${input.slice(0, 3)}-${input.slice(3)}`;

    setCustomer({ ...customer, phone: input });
  };

  // ---------------- AUTO FORMAT TAX ID ----------------
  const handleTaxId = (e) => {
    let v = e.target.value.replace(/\D/g, "").slice(0, 13);

    if (v.length > 11)
      v = `${v[0]}-${v.slice(1, 5)}-${v.slice(5, 10)}-${v.slice(
        10,
        12
      )}-${v.slice(12)}`;
    else if (v.length > 10)
      v = `${v[0]}-${v.slice(1, 5)}-${v.slice(5, 10)}-${v.slice(10)}`;
    else if (v.length > 5)
      v = `${v[0]}-${v.slice(1, 5)}-${v.slice(5)}`;
    else if (v.length > 1) v = `${v[0]}-${v.slice(1)}`;

    setCustomer({ ...customer, taxId: v });
  };

  // ---------------- CART FUNCTIONS ----------------
  const addProduct = (p) => {
    const exist = cart.find((i) => i.id === p.id);
    if (exist) {
      setCart(
        cart.map((i) =>
          i.id === p.id ? { ...i, qty: i.qty + 1 } : i
        )
      );
    } else {
      setCart([...cart, { ...p, qty: 1 }]);
    }
  };

  const increaseQty = (id) => {
    setCart(
      cart.map((i) =>
        i.id === id ? { ...i, qty: i.qty + 1 } : i
      )
    );
  };

  const decreaseQty = (id) => {
    setCart(
      cart
        .map((i) =>
          i.id === id ? { ...i, qty: Math.max(0, i.qty - 1) } : i
        )
        .filter((i) => i.qty > 0)
    );
  };

  // ---------------- TOTALS ----------------
  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const vat = subtotal * 0.07;
  const total = subtotal + vat;

  const cashReceivedNum = Number(cashReceived) || 0;
  const change = cashReceivedNum - total;
  const isCash = customer.payment === "เงินสด";

  const printReceipt = () => window.print();

  return (
    <div className="order-container">
      <h2 className="order-title">สั่งซื้อสินค้า</h2>

      {/* ---------------- STEP BAR ---------------- */}
      <div className="step-wrapper">
        <div className="step-item">
          <div className={`step-circle ${step === 1 ? "active" : ""}`}>
            <img src="/pics/cart2.png" className="step-icon-img" />
          </div>
          <p className={`step-text ${step === 1 ? "active" : ""}`}>
            เลือกสินค้า
          </p>
        </div>

        <div className={`step-line ${step >= 2 ? "active" : ""}`}></div>

        <div className="step-item">
          <div className={`step-circle ${step === 2 ? "active" : ""}`}>
            <img src="/pics/user2.png" className="step-icon-img" />
          </div>
          <p className={`step-text ${step === 2 ? "active" : ""}`}>
            ข้อมูลลูกค้า
          </p>
        </div>

        <div className={`step-line ${step === 3 ? "active" : ""}`}></div>

        <div className="step-item">
          <div className={`step-circle ${step === 3 ? "active" : ""}`}>
            <img src="/pics/confirmation.png" className="step-icon-img" />
          </div>
          <p className={`step-text ${step === 3 ? "active" : ""}`}>
            ยืนยันและชำระเงิน
          </p>
        </div>
      </div>

      {/* ---------------- STEP 1 ---------------- */}
      {step === 1 && (
        <div className="layout">
          <div className="box-left">
            <h3 className="section-title">เลือกสินค้า</h3>

            <div className="product-grid">
              {products.map((p) => (
                <div className="product-card" key={p.id}>
                  <img src={p.image} className="product-img" />

                  <span className="tag-id">{p.id}</span>
                  <span className="tag-stock">คงเหลือ {p.stock}</span>

                  <p className="p-name">{p.name}</p>
                  <p className="p-price">
                    ฿{p.price.toLocaleString()}
                  </p>

                  <button
                    className="btn-add"
                    onClick={() => addProduct(p)}
                  >
                    + เพิ่ม
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="box-right">
            <Summary
              cart={cart}
              subtotal={subtotal}
              vat={vat}
              total={total}
              increaseQty={increaseQty}
              decreaseQty={decreaseQty}
              nextDisabled={cart.length === 0}
              onNext={() => setStep(2)}
            />
          </div>
        </div>
      )}

      {/* ---------------- STEP 2 ---------------- */}
      {step === 2 && (
        <div className="layout">
          <div className="box-left">
            <h3 className="section-title">ข้อมูลลูกค้า</h3>

            <label>ชื่อ - นามสกุล</label>
            <input
              className="input"
              placeholder="ไม่บังคับ"
              value={customer.name}
              onChange={(e) =>
                setCustomer({ ...customer, name: e.target.value })
              }
            />

            <label>เบอร์โทรศัพท์</label>
            <input
              className="input"
              placeholder="000-000-0000"
              value={customer.phone}
              onChange={handlePhone}
            />

            <label>เลขประจำตัวผู้เสียภาษี</label>
            <input
              className="input"
              placeholder="0-0000-00000-00-0"
              value={customer.taxId}
              onChange={handleTaxId}
            />

            <label>ชื่อบริษัท</label>
            <input
              className="input"
              placeholder="ไม่บังคับ"
              value={customer.company}
              onChange={(e) =>
                setCustomer({ ...customer, company: e.target.value })
              }
            />
          </div>

          <div className="box-right">
            <Summary
              cart={cart}
              subtotal={subtotal}
              vat={vat}
              total={total}
              increaseQty={increaseQty}
              decreaseQty={decreaseQty}
              showBack
              onBack={() => setStep(1)}
              onNext={() => setStep(3)}
            />
          </div>
        </div>
      )}

      {/* ---------------- STEP 3 ---------------- */}
      {step === 3 && (
        <div className="layout">
          <div className="box-left">
            <h3 className="section-title">ข้อมูลลูกค้า</h3>

            <div className="customer-summary">
              <p>ชื่อ: {customer.name || "-"}</p>
              <p>โทร: {customer.phone || "-"}</p>
              <p>เลขประจำตัวผู้เสียภาษี: {customer.taxId || "-"}</p>
              <p>บริษัท: {customer.company || "-"}</p>
            </div>

            <label>วิธีชำระเงิน</label>
            <select
              className="input"
              value={customer.payment}
              onChange={(e) => {
                setCustomer({
                  ...customer,
                  payment: e.target.value,
                });
                if (e.target.value !== "เงินสด") {
                  setCashReceived("");
                }
              }}
            >
              <option>เงินสด</option>
              <option>โอนผ่านธนาคาร</option>
            </select>

            {/* ถ้าเป็นเงินสด ให้กรอกรับเงิน/แสดงเงินทอน */}
            {isCash && (
              <>
                <label style={{ marginTop: "12px" }}>
                  รับเงินมา (บาท)
                </label>
                <input
                  className="input"
                  type="number"
                  min="0"
                  value={cashReceived}
                  onChange={(e) => setCashReceived(e.target.value)}
                  placeholder="เช่น 6000"
                />

                <p
                  style={{
                    marginTop: "8px",
                    fontSize: "14px",
                  }}
                >
                  ยอดสุทธิที่ต้องชำระ:{" "}
                  <strong>
                    ฿{total.toLocaleString()}
                  </strong>
                </p>

                <p
                  style={{
                    fontSize: "14px",
                    color:
                      cashReceived && change >= 0
                        ? "#16a34a"
                        : "#dc2626",
                  }}
                >
                  {cashReceived
                    ? change >= 0
                      ? `เงินทอน: ฿${change.toLocaleString()}`
                      : `เงินยังไม่พอ ขาดอีก ฿${Math.abs(
                          change
                        ).toLocaleString()}`
                    : "กรอกจำนวนเงินที่ลูกค้าชำระ เพื่อให้ระบบคำนวณเงินทอน"}
                </p>
              </>
            )}
          </div>

          <div className="box-right">
            <div className="summary-card">
              <h3 className="section-title">รายการสินค้า</h3>

              {cart.map((item) => (
  <div className="sum-item" key={item.id}>
    {/* ใช้คลาสเดียวกับฝั่งสรุปตะกร้า */}
    <img src={item.image} className="s-img" />
    <div className="sum-info">
      <p>{item.name}</p>
      <span>{item.qty} × ฿{item.price.toLocaleString()}</span>
    </div>
    <p className="sum-price">
      ฿{(item.qty * item.price).toLocaleString()}
    </p>
  </div>
))}

              <hr />

              <p className="sum-line">
                <span>ยอดรวม</span>
                <span>฿{subtotal.toLocaleString()}</span>
              </p>

              <p className="sum-line">
                <span>VAT 7%</span>
                <span>฿{vat.toLocaleString()}</span>
              </p>

              <p className="sum-line total">
                <span>ยอดสุทธิ</span>
                <span>฿{total.toLocaleString()}</span>
              </p>

              <div className="btn-row">
                <button
                  className="btn-ghost"
                  onClick={() => setStep(2)}
                >
                  ‹ ก่อนหน้า
                </button>

                <button
                  className="btn-primary"
                  onClick={() => setShowReceipt(true)}
                  disabled={isCash && change < 0}
                >
                  ชำระเงินและพิมพ์ใบเสร็จ
                </button>
              </div>

              {isCash && change < 0 && (
                <p
                  style={{
                    marginTop: "6px",
                    fontSize: "13px",
                    color: "#dc2626",
                    textAlign: "right",
                  }}
                >
                  ยอดเงินสดยังไม่พอ กรุณาใส่จำนวนเงินให้มากกว่ายอดสุทธิ
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ---------------- RECEIPT POPUP ---------------- */}
      {showReceipt && (
        <div className="receipt-overlay">
          <div className="receipt-box" id="print-area">
            <h3 className="r-title">ใบเสร็จรับเงิน</h3>
            <p>ร้านผ้าทอพื้นเมือง</p>
            <p>วันที่: {new Date().toLocaleString()}</p>
            <p>วิธีชำระเงิน: {customer.payment}</p>

            <hr />

            {cart.map((item) => (
              <div className="r-row" key={item.id}>
                <span>
                  {item.name} ({item.qty} × ฿
                  {item.price.toLocaleString()})
                </span>
                <span>
                  ฿{(item.qty * item.price).toLocaleString()}
                </span>
              </div>
            ))}

            <hr />

            <div className="r-row">
              <span>รวม</span>
              <span>฿{subtotal.toLocaleString()}</span>
            </div>

            <div className="r-row">
              <span>VAT 7%</span>
              <span>฿{vat.toLocaleString()}</span>
            </div>

            <div className="r-row total">
              <span>ยอดสุทธิ</span>
              <span>฿{total.toLocaleString()}</span>
            </div>

            {isCash && (
              <>
                <hr />
                <div className="r-row">
                  <span>รับเงินมา</span>
                  <span>
                    ฿{cashReceivedNum.toLocaleString()}
                  </span>
                </div>
                <div className="r-row">
                  <span>เงินทอน</span>
                  <span>
                    ฿{Math.max(change, 0).toLocaleString()}
                  </span>
                </div>
              </>
            )}

            <div className="r-btn-row">
              <button
                className="btn-print"
                onClick={printReceipt}
              >
                พิมพ์ใบเสร็จ
              </button>
              <button
                className="btn-close"
                onClick={() => setShowReceipt(false)}
              >
                ปิด
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------- SUMMARY COMPONENT ----------------
function Summary({
  cart,
  subtotal,
  vat,
  total,
  increaseQty,
  decreaseQty,
  nextDisabled,
  onNext,
  onBack,
  showBack,
}) {
  return (
    <div className="summary-card">
      <h3 className="section-title">สรุปรายการ</h3>

      {cart.length === 0 && (
        <p className="summary-empty">ไม่มีสินค้าในตะกร้า</p>
      )}

      {cart.map((item) => (
        <div className="s-item" key={item.id}>
          <img src={item.image} className="s-img" />
          <div className="s-info">
            <p>{item.name}</p>

            <div className="qty-box">
              <button onClick={() => decreaseQty(item.id)}>
                -
              </button>
              <span>{item.qty}</span>
              <button onClick={() => increaseQty(item.id)}>
                +
              </button>
            </div>
          </div>

          <p className="s-price">
            ฿{(item.qty * item.price).toLocaleString()}
          </p>
        </div>
      ))}

      {cart.length > 0 && (
        <>
          <hr />
          <p className="sum-line">
            <span>ยอดรวม</span>
            <span>฿{subtotal.toLocaleString()}</span>
          </p>
          <p className="sum-line">
            <span>VAT 7%</span>
            <span>฿{vat.toLocaleString()}</span>
          </p>
          <p className="sum-line total">
            <span>ยอดสุทธิ</span>
            <span>฿{total.toLocaleString()}</span>
          </p>
        </>
      )}

      <div className="btn-row">
        {showBack && (
          <button className="btn-ghost" onClick={onBack}>
            ‹ ก่อนหน้า
          </button>
        )}

        <button
          className={`btn-primary ${
            nextDisabled ? "disabled" : ""
          }`}
          disabled={nextDisabled}
          onClick={onNext}
        >
          ถัดไป
        </button>
      </div>
    </div>
  );
}