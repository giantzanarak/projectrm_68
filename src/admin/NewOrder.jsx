import React, { useState, useEffect } from "react";
import "../css/NewOrder.css";

const baseUrl = "http://localhost:3010";

export default function NewOrder() {
  const [step, setStep] = useState(1);
  const [cart, setCart] = useState([]);
  const [customer, setCustomer] = useState({ name: '', phone: '', taxId: '', company: '', payment: 'เงินสด' });
  const [dbProducts, setDbProducts] = useState([]);
  const fetchProducts = async () => {
    try {
      const response = await fetch(`${baseUrl}/products`);
      const data = await response.json();

      console.log("Data from DB:", data);

      const formattedData = data.map(p => {
        let finalImageUrl = "/pics/box2.png";

        if (p.image) {
          const imagePath = p.image.startsWith('/') ? p.image : `/static/images/${p.image}`;
          finalImageUrl = `${baseUrl}${imagePath}`; 
        }


        return {
          id: p.idProducts, 
          name: p.name,
          price: p.price,
          stock: p.stock_amount, 
          image: finalImageUrl,
          details: `${p.category_name || ''} ${p.type_name || ''}`
        };
      });

      setDbProducts(formattedData);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };


  useEffect(() => {
    fetchProducts(); 
    const pendingItem = localStorage.getItem("pendingItem");
    if (pendingItem) {
      try {
        const item = JSON.parse(pendingItem);
        setCart((prevCart) => {
          const exist = prevCart.find((i) => i.id === item.id);
          if (exist) {
            return prevCart.map((i) => i.id === item.id ? { ...i, qty: i.qty + item.qty } : i);
          }
          return [...prevCart, item];
        });
        localStorage.removeItem("pendingItem");
      } catch (e) { console.error(e); }
    }
  }, []);

  const [showReceipt, setShowReceipt] = useState(false);
  const [cashReceived, setCashReceived] = useState("");
  useEffect(() => {
    const pendingItem = localStorage.getItem("pendingItem");
    if (pendingItem) {
      try {
        const item = JSON.parse(pendingItem);
        setCart((prevCart) => {
          const exist = prevCart.find((i) => i.id === item.id);

          if (exist) {
            return prevCart.map((i) =>
              i.id === item.id ? { ...i, qty: i.qty + item.qty } : i
            );
          }
          return [...prevCart, item];
        });
        localStorage.removeItem("pendingItem");

      } catch (error) {
        console.error("Error parsing pending item:", error);
      }
    }
  }, []);

  const addToCart = (p) => {
    const exist = cart.find((i) => i.id === p.id);
    if (exist) {
      setCart(cart.map((i) => (i.id === p.id ? { ...i, qty: i.qty + 1 } : i)));
    } else {
      setCart([...cart, { ...p, qty: 1 }]);
    }
  };

  const updateQty = (id, delta) => {
    setCart(cart.map((i) => (i.id === id ? { ...i, qty: Math.max(1, i.qty + delta) } : i)));
  };

  const removeItem = (id) => setCart(cart.filter((i) => i.id !== id));

  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const vat = subtotal * 0.07;
  const total = subtotal + vat;

  const change = cashReceived ? Number(cashReceived) - total : 0;

  return (
    <div className="order-container">
      <div className="main-layout">

        
        <div className="left-panel">
          <header className="cart-header">
            <h1 className="title-large">
              {step === 1 ? "ตะกร้าของคุณ " : step === 2 ? "ข้อมูลลูกค้า " : "ชำระเงิน "}
              <span className="count-badge">({cart.length} รายการ)</span>
            </h1>

            <div className="step-bar-compact">
              <div className={`step-node ${step >= 1 ? "active" : ""}`}><div className="node-dot">1</div><span>เลือกสินค้า</span></div>
              <div className={`node-connector ${step >= 2 ? "active" : ""}`}></div>
              <div className={`step-node ${step >= 2 ? "active" : ""}`}><div className="node-dot">2</div><span>ข้อมูลลูกค้า</span></div>
              <div className={`node-connector ${step >= 3 ? "active" : ""}`}></div>
              <div className={`step-node ${step >= 3 ? "active" : ""}`}><div className="node-dot">3</div><span>ชำระเงิน</span></div>
            </div>
          </header>

          {step === 1 && (
            <>
              <section className="cart-items-section">
                {cart.length === 0 ? (
                  <p className="empty-msg">ตะกร้าว่างเปล่า เลือกสินค้าจากรายการด้านล่าง</p>
                ) : (
                  cart.map((item) => (
                    <div className="item-row" key={item.id}>
                      <img src={item.image} alt={item.name} className="item-thumb" />
                      <div className="item-info-main">
                        <div className="item-top"><h3>{item.name}</h3><p className="price-bold">฿{item.price.toLocaleString()}</p></div>
                        <p className="item-desc">{item.details}</p>
                        <div className="item-actions">
                          <div className="qty-picker">
                            <button onClick={() => updateQty(item.id, -1)}>−</button>
                            <span>{item.qty}</span>
                            <button onClick={() => updateQty(item.id, 1)}>+</button>
                          </div>
                          <button className="del-btn" onClick={() => removeItem(item.id)}>ลบทิ้ง</button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </section>
              <section className="more-products-grid">
                <h2 className="section-title">เลือกสินค้าเพิ่ม</h2>
                <div className="picker-grid">
                  {dbProducts.map(p => (
                    <div className="mini-card" key={p.id} onClick={() => addToCart(p)}>
                      <img
                        src={p.image}
                        alt={p.name}
                        // ✅ ถ้าโหลดรูปจาก URL ปกติไม่ได้ ให้เปลี่ยนไปใช้รูปสำรองในเครื่องทันที
                        onError={(e) => { e.target.src = "/pics/box2.png"; }}
                      />
                      <div className="mini-card-body">
                        <p>{p.name}</p>
                        <strong>฿{p.price.toLocaleString()}</strong>
                        <div style={{ fontSize: '11px', color: 'gray' }}>คงเหลือ: {p.stock}</div>
                      </div>
                      <div className="add-overlay">+ เพิ่ม</div>
                    </div>
                  ))}
                </div>
              </section>
            </>
          )}

          {step === 2 && (
            <div className="customer-form-card">
              <h3 className="section-subtitle">รายละเอียดสำหรับออกใบเสร็จ</h3>
              <div className="form-grid">
                <div className="input-group"><label>ชื่อ - นามสกุล</label><input className="custom-input" value={customer.name} onChange={(e) => setCustomer({ ...customer, name: e.target.value })} placeholder="ไม่บังคับ" /></div>
                <div className="input-group"><label>เบอร์โทรศัพท์</label><input className="custom-input" value={customer.phone} onChange={(e) => setCustomer({ ...customer, phone: e.target.value })} placeholder="000-000-0000" /></div>
                <div className="input-group full-width"><label>เลขประจำตัวผู้เสียภาษี</label><input className="custom-input" value={customer.taxId} onChange={(e) => setCustomer({ ...customer, taxId: e.target.value })} placeholder="0-0000-00000-00-0" /></div>
                <div className="input-group full-width"><label>ชื่อบริษัท</label><input className="custom-input" value={customer.company} onChange={(e) => setCustomer({ ...customer, company: e.target.value })} placeholder="ไม่บังคับ" /></div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="payment-step-content">
              <div className="customer-form-card" style={{ marginBottom: '24px' }}>
                <h3 className="section-subtitle">ข้อมูลการออกใบเสร็จ</h3>
                <div className="customer-info-display">
                  <div className="info-item"><span>ชื่อลูกค้า:</span> <strong>{customer.name || "ทั่วไป"}</strong></div>
                  <div className="info-item"><span>เบอร์โทรศัพท์:</span> <strong>{customer.phone || "-"}</strong></div>
                  <div className="info-item"><span>เลขประจำตัวผู้เสียภาษี:</span> <strong>{customer.taxId || "-"}</strong></div>
                </div>
              </div>

              <div className="customer-form-card">
                <h3 className="section-subtitle">เลือกวิธีชำระเงิน</h3>
                <div className="payment-selector-grid">
                  <button className={`pay-option ${customer.payment === 'เงินสด' ? 'active' : ''}`} onClick={() => setCustomer({ ...customer, payment: 'เงินสด' })}><span className="icon">💵</span> เงินสด</button>
                  <button className={`pay-option ${customer.payment === 'โอนผ่านธนาคาร' ? 'active' : ''}`} onClick={() => setCustomer({ ...customer, payment: 'โอนผ่านธนาคาร' })}><span className="icon">📱</span> โอนผ่านธนาคาร/QR</button>
                </div>

                {customer.payment === 'เงินสด' && (
                  <div className="cash-input-section">
                    <label>รับเงินมา (บาท)</label>
                    <input className="custom-input cash-large" type="number" value={cashReceived} onChange={(e) => setCashReceived(e.target.value)} placeholder="0.00" />
                    {cashReceived && (
                      <div className={`change-display ${change >= 0 ? 'success' : 'danger'}`}>
                        {change >= 0 ? <><span>เงินทอน:</span> <strong>฿{change.toLocaleString()}</strong></> : <><span>ยอดเงินยังขาด:</span> <strong>฿{Math.abs(change).toLocaleString()}</strong></>}
                      </div>
                    )}
                  </div>
                )}

                {customer.payment === 'โอนผ่านธนาคาร' && (
                  <div className="qr-section">
                    <p>สแกน QR Code เพื่อชำระเงิน</p>
                    <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=PROMPTPAY" alt="QR" className="qr-image" />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* --- ฝั่งขวา --- */}
        <aside className="right-panel">
          <div className="summary-card">
            <h2 className="summary-head">สรุปคำสั่งซื้อ</h2>
            <div className="summary-line"><span>{cart.length} รายการ</span><span>฿{subtotal.toLocaleString()}</span></div>
            <div className="divider-dashed"></div>
            <div className="summary-line total-bold"><span>ยอดสุทธิ (รวม VAT 7%)</span><span>฿{total.toLocaleString()}</span></div>
            <p className="vat-sub"> (รวมภาษีมูลค่าเพิ่ม ฿{vat.toLocaleString()}) </p>

            <button className="btn-checkout-primary" disabled={cart.length === 0} onClick={() => {
              if (step === 1) setStep(2);
              else if (step === 2) setStep(3);
              else if (step === 3) setShowReceipt(true);
              else if (showReceipt) window.print();
            }}>
              {showReceipt ? "พิมพ์ใบเสร็จอีกครั้ง" : step === 3 ? "ยืนยันการชำระเงิน" : "ถัดไป"} <span className="arrow">→</span>
            </button>

            {step > 1 && !showReceipt && <button className="btn-back-text" onClick={() => setStep(step - 1)}>← ย้อนกลับ</button>}
          </div>
        </aside>

        {/* --- MODAL ใบเสร็จ --- */}
        {showReceipt && (
          <div className="receipt-modal-overlay left">
            <div className="receipt-modal-content slide-in-left">
              <button className="modal-close-x no-print" onClick={() => setShowReceipt(false)}>×</button>
              <div className="receipt-paper">
                <div className="receipt-header">
                  <h2 className="shop-name-receipt">ร้านผ้าพื้นเมือง</h2>
                  <p className="shop-address">123 ถ.มิตรภาพ ต.ในเมือง อ.เมือง จ.ขอนแก่น</p>
                  <div className="divider-star">********************************</div>
                  <h3 className="receipt-title">ใบเสร็จรับเงิน</h3>
                </div>
                <div className="receipt-info-details">
                  <p><span>เลขที่:</span> RE-{new Date().getTime().toString().slice(-6)}</p>
                  <p><span>วันที่:</span> {new Date().toLocaleDateString('th-TH')}</p>
                  <p><span>ลูกค้า:</span> {customer.name || "ทั่วไป"}</p>
                </div>
                <div className="divider-dash">--------------------------------</div>
                <div className="receipt-item-list">
                  {cart.map((item, index) => (
                    <div key={index} className="receipt-item-row">
                      <span className="item-name-qty">{item.name} x{item.qty}</span>
                      <span className="item-price">฿{item.price.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
                <div className="divider-dash">--------------------------------</div>
                <div className="receipt-total-section">
                  <div className="receipt-row-summary"><span>ยอดรวม:</span><span>฿{subtotal.toLocaleString()}</span></div>
                  <div className="receipt-row-summary total-bold"><span>รวมทั้งสิ้น (VAT 7%):</span><span>฿{total.toLocaleString()}</span></div>
                </div>
                <div className="divider-dash">--------------------------------</div>
                <div className="payment-method-info">
                  <p><span>ชำระด้วย:</span> {customer.payment}</p>
                  {customer.payment === 'เงินสด' && <div className="receipt-row-summary"><span>เงินทอน:</span><span className="change-text-receipt">฿{change.toLocaleString()}</span></div>}
                </div>
                <div className="receipt-footer-text"><p>ขอบคุณที่อุดหนุน</p></div>
                <div className="modal-actions-inside no-print">
                  <button className="btn-modal-new-start" onClick={() => { setShowReceipt(false); setStep(1); setCart([]); setCashReceived(""); }}>เริ่มการขายใหม่</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}