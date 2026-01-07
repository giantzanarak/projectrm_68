// src/superadmin/FabricCalculator.jsx
import { useState } from "react";
import "../styles/fabricCalc.css";

export default function FabricCalculator() {
  const [activeTab, setActiveTab] = useState("calc");

  const productTypes = [
    "ทุกประเภท",
    "ชุดไทยผู้หญิง",
    "ชุดไทยผู้ชาย",
    "ผ้าซิ่น / ผ้าถุง",
    "เสื้อ",
    "กางเกง",
    "ผ้าพันคอ",
    "ผ้าคลุมไหล่",
  ];

  // เพิ่ม pricePerMeter = ราคาผ้าต่อเมตร
  const fabricOptions = [
    {
      id: "F01",
      name: "ผ้าไหมมัดหมี่ หน้ากว้าง 1.20 ม.",
      width: 1.2,
      pricePerMeter: 650,
    },
    {
      id: "F02",
      name: "ผ้าไหมพื้น หน้ากว้าง 1.50 ม.",
      width: 1.5,
      pricePerMeter: 580,
    },
    {
      id: "F03",
      name: "ผ้าฝ้ายทอมือ หน้ากว้าง 1.10 ม.",
      width: 1.1,
      pricePerMeter: 250,
    },
    {
      id: "F04",
      name: "ผ้าฝ้ายลายดอก หน้ากว้าง 1.50 ม.",
      width: 1.5,
      pricePerMeter: 280,
    },
  ];

  const sizeOptions = ["Free size", "XS", "S", "M", "L", "XL"];

  const [productType, setProductType] = useState("ทุกประเภท");
  const [fabricId, setFabricId] = useState("");
  const [size, setSize] = useState("Free size");
  const [quantity, setQuantity] = useState(1);

  const [fabricSource, setFabricSource] = useState("store"); // store | customer
  const [customerWidth, setCustomerWidth] = useState("");
  const [customerLength, setCustomerLength] = useState("");

  // ช่องใหม่สำหรับคิดเงินลูกค้า
  const [laborCost, setLaborCost] = useState(200);     // ค่าแรงตัดเย็บต่อชิ้น
  const [profitPercent, setProfitPercent] = useState(30); // กำไรที่ต้องการ (%)

  const [result, setResult] = useState(null);

  const usageTable = {
    "ชุดไทยผู้หญิง": { XS: 2.2, S: 2.3, M: 2.4, L: 2.6, XL: 2.8, "Free size": 2.5 },
    "ชุดไทยผู้ชาย": { XS: 2.0, S: 2.1, M: 2.2, L: 2.3, XL: 2.4, "Free size": 2.2 },
    "ผ้าซิ่น / ผ้าถุง": { XS: 1.8, S: 1.9, M: 2.0, L: 2.1, XL: 2.2, "Free size": 2.0 },
    เสื้อ: { XS: 1.2, S: 1.3, M: 1.4, L: 1.5, XL: 1.6, "Free size": 1.4 },
    กางเกง: { XS: 1.3, S: 1.4, M: 1.5, L: 1.6, XL: 1.7, "Free size": 1.5 },
    ผ้าพันคอ: { "Free size": 0.8 },
    ผ้าคลุมไหล่: { "Free size": 1.2 },
  };

  const getUsagePerPiece = () => {
    const table = usageTable[productType];
    if (!table) return 2;
    return table[size] ?? table["Free size"] ?? 2;
  };

  const handleCalculate = () => {
    const qty = Number(quantity) || 0;
    if (qty <= 0) {
      alert("กรุณากรอกจำนวนที่ต้องการผลิตให้ถูกต้อง");
      return;
    }

    const perPiece = getUsagePerPiece();
    const wastePercent = 10;
    const baseNeed = perPiece * qty;
    const totalNeed = baseNeed * (1 + wastePercent / 100);

    const selectedFabric =
      fabricOptions.find((f) => f.id === fabricId) || null;

    // ---------- ต้นทุนผ้า ----------
    let pricePerMeter = 0;
    let totalFabricCost = 0;
    let fabricCostPerPiece = 0;

    if (fabricSource === "store" && selectedFabric) {
      pricePerMeter = Number(selectedFabric.pricePerMeter || 0);
      totalFabricCost = totalNeed * pricePerMeter;
      fabricCostPerPiece = qty > 0 ? totalFabricCost / qty : 0;
    }

    // ---------- ลูกค้านำผ้ามาเอง: เช็คว่าพอไหม ----------
    let customerTotal = null;
    let enough = null;
    let remain = null;

    if (fabricSource === "customer") {
      const w = Number(customerWidth) || 0;
      const l = Number(customerLength) || 0;

      if (w > 0 && l > 0) {
        customerTotal = l;
        enough = customerTotal >= totalNeed;
        remain = customerTotal - totalNeed;
      }
    }

    // ---------- คำนวณเงินที่ลูกค้าต้องจ่าย ----------
    const laborCostNum = Number(laborCost) || 0;
    const profitPct = Number(profitPercent) || 0;

    const totalLaborCost = laborCostNum * qty;

    // ต้นทุนต่อชิ้น = ผ้าต่อชิ้น + ค่าแรง (ผ้าต่อชิ้นอาจเป็น 0 ถ้าลูกค้านำผ้ามาเอง)
    const costPerPiece = fabricCostPerPiece + laborCostNum;

    const sellingPricePerPiece = costPerPiece * (1 + profitPct / 100);
    const totalCustomerPay = sellingPricePerPiece * qty;

    const totalCostForShop = totalFabricCost + totalLaborCost;
    const totalProfit = totalCustomerPay - totalCostForShop;

    setResult({
      qty,
      perPiece,
      wastePercent,
      baseNeed,
      totalNeed,
      fabricSource,
      selectedFabric,
      customerTotal,
      enough,
      remain,
      pricePerMeter,
      totalFabricCost,
      fabricCostPerPiece,
      laborCost: laborCostNum,
      profitPercent: profitPct,
      totalLaborCost,
      sellingPricePerPiece,
      totalCustomerPay,
      totalProfit,
    });
  };

  return (
    <div className="fabric-page">
      <div className="fabric-header">
        <h1 className="page-title">คำนวนผ้า</h1>
        <p className="page-subtitle">
          เลือกประเภทสินค้า เลือกผ้าจากคลัง หรือผ้าที่ลูกค้านำมาเอง
          แล้วให้ระบบคำนวณปริมาณผ้าที่ต้องใช้ ผ้าที่เหลือ และราคาที่ลูกค้าต้องจ่าย
        </p>
      </div>

      {/* TABS */}
      <div className="fabric-tabs">
        <button
          className={activeTab === "calc" ? "tab active" : "tab"}
          onClick={() => setActiveTab("calc")}
        >
          คำนวณผ้า
        </button>
        <button
          className={activeTab === "summary" ? "tab active" : "tab"}
          onClick={() => setActiveTab("summary")}
        >
          สรุปผลเหลือ
        </button>
        <button
          className={activeTab === "cost" ? "tab active" : "tab"}
          onClick={() => setActiveTab("cost")}
        >
          ต้นทุนผ้า / ไซส์
        </button>
      </div>

      {/* ================= TAB: คำนวณผ้า ================= */}
      {activeTab === "calc" && (
        <div className="fabric-card">
          <div className="fabric-card-header">
            <div>
              <h2 className="fabric-card-title">
                คำนวณปริมาณผ้าที่ต้องใช้จากผ้า
              </h2>
              <p className="fabric-card-sub">
                เลือกประเภทสินค้า ไซส์ จำนวน แหล่งที่มาของผ้า
                และตั้งค่าแรงตัดเย็บ/กำไร เพื่อให้ระบบคิดราคาที่ลูกค้าต้องจ่ายให้เลย
              </p>
            </div>
          </div>

          {/* แถวบน: ประเภท / ผ้า / ไซส์ */}
          <div className="fabric-row">
            <div className="fabric-field">
              <label>ประเภทสินค้า</label>
              <select
                value={productType}
                onChange={(e) => setProductType(e.target.value)}
              >
                {productTypes.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
              <p className="field-hint">
                
              </p>
            </div>

            <div className="fabric-field">
              <label>เลือกผ้าที่ต้องการคำนวณ (จากคลัง)</label>
              <select
                value={fabricId}
                disabled={fabricSource === "customer"}
                onChange={(e) => setFabricId(e.target.value)}
              >
                <option value="">เลือกผ้า</option>
                {fabricOptions.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name} – ฿{f.pricePerMeter.toLocaleString()} / เมตร
                  </option>
                ))}
              </select>
              <p className="field-hint">
                
              </p>
            </div>

            <div className="fabric-field">
              <label>ไซส์สินค้า</label>
              <select value={size} onChange={(e) => setSize(e.target.value)}>
                {sizeOptions.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <p className="field-hint">
                
              </p>
            </div>
          </div>

          {/* แถวกลาง: จำนวน / แหล่งผ้า */}
          <div className="fabric-row">
            <div className="fabric-field">
              <label>จำนวนที่ต้องการผลิต (ชิ้น)</label>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
              />
            </div>

            <div className="fabric-field">
              <label>แหล่งที่มาของผ้า</label>
              <div className="fabric-source-row">
                <label className="radio-pill">
                  <input
                    type="radio"
                    value="store"
                    checked={fabricSource === "store"}
                    onChange={(e) => setFabricSource(e.target.value)}
                  />
                  <span>ใช้ผ้าจากหน้าร้าน / คลังผ้า</span>
                </label>
                <label className="radio-pill">
                  <input
                    type="radio"
                    value="customer"
                    checked={fabricSource === "customer"}
                    onChange={(e) => setFabricSource(e.target.value)}
                  />
                  <span>ลูกค้านำผ้ามาเอง</span>
                </label>
              </div>
              <p className="field-hint">
                
              </p>
            </div>
          </div>

          {/* แถวใหม่: ค่าแรง + กำไร */}
          <div className="fabric-row">
            <div className="fabric-field">
              <label>ค่าแรงตัดเย็บต่อชิ้น (บาท)</label>
              <input
                type="number"
                min="0"
                value={laborCost}
                onChange={(e) => setLaborCost(e.target.value)}
              />
              <p className="field-hint">
                
              </p>
            </div>
            <div className="fabric-field">
              <label>กำไรที่ต้องการ (%)</label>
              <input
                type="number"
                min="0"
                value={profitPercent}
                onChange={(e) => setProfitPercent(e.target.value)}
              />
              <p className="field-hint">
                
              </p>
            </div>
          </div>

          {/* ลูกค้านำผ้ามาเอง: กว้าง/ยาว */}
          {fabricSource === "customer" && (
            <div className="fabric-row">
              <div className="fabric-field">
                <label>ความกว้างผ้าที่ลูกค้านำมา (เมตร)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={customerWidth}
                  onChange={(e) => setCustomerWidth(e.target.value)}
                  placeholder="เช่น 1.20"
                />
              </div>
              <div className="fabric-field">
                <label>ความยาวผ้าที่ลูกค้านำมา (เมตรรวม)</label>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={customerLength}
                  onChange={(e) => setCustomerLength(e.target.value)}
                  placeholder="เช่น 8"
                />
                <p className="field-hint">
                  ถ้าเป็นม้วน ให้คำนวณความยาวคร่าว ๆ แล้วกรอก (เช่น 1 ม้วน ~ 8 เมตร)
                </p>
              </div>
            </div>
          )}

          <div className="fabric-footer">
            <button className="btn-primary" onClick={handleCalculate}>
              ▶ คำนวณ
            </button>
          </div>

          {/* =============== RESULT =============== */}
          {result && (
            <div className="fabric-result-card">
              <h3>สรุปผลการคำนวณ</h3>

              <div className="result-grid">
                <div>
                  <p className="result-label">ประเภทสินค้า</p>
                  <p className="result-value">{productType}</p>
                </div>
                <div>
                  <p className="result-label">ไซส์</p>
                  <p className="result-value">{size}</p>
                </div>
                <div>
                  <p className="result-label">จำนวนที่ต้องการผลิต</p>
                  <p className="result-value">{result.qty} ชิ้น</p>
                </div>
                <div>
                  <p className="result-label">ผ้าที่ใช้ต่อ 1 ชิ้น (ประมาณ)</p>
                  <p className="result-value">
                    {result.perPiece.toFixed(2)} เมตร
                  </p>
                </div>
              </div>

              <hr className="result-divider" />

              <p className="result-formula-title">รายละเอียดการคำนวณผ้า</p>
              <ul className="result-formula-list">
                <li>
                  ขั้นที่ 1:{" "}
                  <strong>ผ้าต่อชิ้น × จำนวนชิ้น</strong> =
                  <strong>
                    {" "}
                    {result.perPiece.toFixed(2)} × {result.qty}
                  </strong>{" "}
                  ={" "}
                  <strong>{result.baseNeed.toFixed(2)} เมตร</strong>
                </li>
                <li>
                  ขั้นที่ 2: เผื่อเศษผ้าและการวางผ้า {result.wastePercent}% →{" "}
                  <strong>
                    {result.baseNeed.toFixed(2)} × (1 + {result.wastePercent}
                    /100)
                  </strong>{" "}
                  ={" "}
                  <strong>{result.totalNeed.toFixed(2)} เมตร</strong>
                </li>
                {result.fabricSource === "store" && result.selectedFabric && (
                  <li>
                    ผ้าที่เลือกใช้:{" "}
                    <strong>{result.selectedFabric.name}</strong> (ใช้จากคลัง)
                  </li>
                )}
              </ul>

              {/* ----- ต้นทุนผ้า (กรณีใช้ผ้าร้าน) ----- */}
              {result.fabricSource === "store" &&
                result.selectedFabric &&
                result.pricePerMeter > 0 && (
                  <>
                    <hr className="result-divider" />
                    <p className="result-formula-title">
                      ประมาณต้นทุนค่าวัสดุ (ผ้า)
                    </p>
                    <div className="result-price-rows">
                      <div className="summary-value-row">
                        <span>ราคาผ้าต่อเมตร</span>
                        <span>
                          ฿{result.pricePerMeter.toLocaleString()} / เมตร
                        </span>
                      </div>
                      <div className="summary-value-row">
                        <span>ผ้าที่ใช้ทั้งหมด</span>
                        <span>{result.totalNeed.toFixed(2)} เมตร</span>
                      </div>
                      <div className="summary-value-row">
                        <span>ต้นทุนผ้ารวมโดยประมาณ</span>
                        <span className="blue-text">
                          ฿
                          {result.totalFabricCost.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </span>
                      </div>
                      <div className="summary-value-row">
                        <span>ต้นทุนผ้าต่อชิ้น (เฉลี่ย)</span>
                        <span>
                          ฿{result.fabricCostPerPiece.toFixed(2)} / ชิ้น
                        </span>
                      </div>
                    </div>
                  </>
                )}

              {/* ----- ราคาให้ลูกค้าจ่าย (ทุกกรณี) ----- */}
              <hr className="result-divider" />
              <p className="result-formula-title">ราคาที่แนะนำสำหรับลูกค้า</p>
              <div className="result-price-rows">
                <div className="summary-value-row">
                  <span>ค่าแรงตัดเย็บต่อชิ้น</span>
                  <span>฿{result.laborCost.toLocaleString()} / ชิ้น</span>
                </div>
                <div className="summary-value-row">
                  <span>กำไรที่ต้องการ</span>
                  <span>{result.profitPercent}%</span>
                </div>
                <div className="summary-value-row">
                  <span>ราคาขายต่อชิ้น (แนะนำ)</span>
                  <span className="green-text">
                    ฿{result.sellingPricePerPiece.toFixed(2)}
                  </span>
                </div>
                <div className="summary-value-row">
                  <span>ยอดรวมที่ลูกค้าต้องจ่าย ({result.qty} ชิ้น)</span>
                  <span className="blue-text">
                    ฿
                    {result.totalCustomerPay.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>
                <div className="summary-value-row">
                  <span>กำไรโดยประมาณจากออเดอร์นี้</span>
                  <span className="green-text">
                    ฿{result.totalProfit.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* ลูกค้านำผ้ามาเอง: แจ้งเตือนเรื่องผ้าพอ/ไม่พอ */}
              {result.fabricSource === "customer" && (
                <>
                  <hr className="result-divider" />
                  <p className="result-formula-title">
                    ตรวจสอบผ้าที่ลูกค้านำมา
                  </p>
                  {result.customerTotal != null ? (
                    <>
                      <p className="result-text">
                        ลูกค้ามีผ้าทั้งหมดประมาณ{" "}
                        <strong>
                          {result.customerTotal.toFixed(2)} เมตร
                        </strong>{" "}
                        ระบบประเมินว่าต้องใช้{" "}
                        <strong>
                          {result.totalNeed.toFixed(2)} เมตร
                        </strong>
                      </p>
                      <p
                        className={
                          result.enough ? "result-ok" : "result-warning"
                        }
                      >
                        {result.enough
                          ? `✅ ผ้าของลูกค้าเพียงพอ เหลือประมาณ ${Math.abs(
                              result.remain
                            ).toFixed(2)} เมตร`
                          : `⚠️ ผ้าของลูกค้ายังไม่พอ ขาดประมาณ ${Math.abs(
                              result.remain
                            ).toFixed(2)} เมตร ควรแนะนำให้เตรียมผ้าเพิ่ม`}
                      </p>
                      <p className="result-note">
                        *กรณีลูกค้านำผ้ามาเอง ราคาที่คำนวณด้านบนจะคิดเฉพาะค่าแรง +
                        กำไรของร้าน (ไม่มีต้นทุนผ้า)
                      </p>
                    </>
                  ) : (
                    <p className="result-text">
                      กรุณากรอกความกว้างและความยาวผ้าที่ลูกค้านำมา
                      เพื่อให้ระบบช่วยตรวจสอบให้ว่าเพียงพอหรือไม่
                    </p>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB อื่น ๆ */}
      {activeTab === "summary" && (
        <div className="fabric-placeholder-card">
          <p>
            หน้าสรุปผลเหลือ สามารถใช้แสดงรายการผ้าที่เหลือจากการคำนวณในอนาคต
          </p>
        </div>
      )}

      {activeTab === "cost" && (
        <div className="fabric-placeholder-card">
          <p>
            หน้าต้นทุนผ้า / ไซส์ ใช้คำนวณต้นทุนต่อชุด / ต่อเมตร
            สามารถต่อยอดมาเชื่อมกับ “รายงานยอดขาย” ได้
          </p>
        </div>
      )}
    </div>
  );
}