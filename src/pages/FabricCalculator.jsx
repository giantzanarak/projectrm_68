// src/pages/FabricCalculator.jsx
import { useState, useEffect } from "react";

/* API ดึงข้อมูลผ้าจาก backend */
import { fetchFabrics } from "../api/fabricApi";

/* ขนาดไซส์ ใช้จากไฟล์ JS ไปก่อน */
import sizes from "../data/sizes";

/* STYLES */
import "../styles/fabricCalc.css";

export default function FabricCalculator() {
  const [tab, setTab] = useState("calc");

  // ข้อมูลผ้าจากฐานข้อมูล
  const [fabrics, setFabrics] = useState([]);
  const [loading, setLoading] = useState(true);

  // เลือกประเภทผ้า + ผ้าผืน
  const [selectedType, setSelectedType] = useState("");
  const [selectedFabricId, setSelectedFabricId] = useState("");

  // เลือกไซส์ + จำนวน
  const [selectedSize, setSelectedSize] = useState("");
  const [qty, setQty] = useState("");

  // ผลลัพธ์การคำนวณ
  const [result, setResult] = useState(null);

  // โหลดผ้าจาก backend ตอนเปิดหน้า
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await fetchFabrics();
        setFabrics(data);
      } catch (err) {
        console.error(err);
        alert("โหลดข้อมูลผ้าไม่สำเร็จ");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  // ดึงรายการประเภทผ้า (type) จากข้อมูลที่โหลดมา
  const fabricTypes = Array.from(new Set(fabrics.map((f) => f.type)));

  // filter ผ้าตามประเภทที่เลือก
  const filteredFabrics = fabrics.filter((f) =>
    selectedType ? f.type === selectedType : true
  );

  /* -----------------------------
          FUNCTION คำนวณ
  ------------------------------ */
  const handleCalculate = () => {
    if (!selectedFabricId || !selectedSize || !qty) {
      alert("กรุณาเลือกประเภทผ้า / ผ้าผืน / ไซส์ และจำนวนให้ครบ");
      return;
    }

    const fabric = fabrics.find(
      (f) => String(f.id) === String(selectedFabricId)
    );
    const size = sizes.find((s) => s.size === selectedSize);

    if (!fabric || !size) {
      alert("ข้อมูลผ้าหรือไซส์ไม่ถูกต้อง");
      return;
    }

    const qtyNum = Number(qty);
    if (qtyNum <= 0) {
      alert("จำนวนผลิตต้องมากกว่า 0");
      return;
    }

    const totalUse = size.use * qtyNum; // ผ้าที่ต้องใช้ทั้งหมด (เมตร)
    const totalCost = totalUse * fabric.price_per_m; // ต้นทุนรวม
    const remain = fabric.stock_m - totalUse; // ผ้าคงเหลือหลังผลิต

    setResult({
      totalUse,
      totalCost,
      remain,
      status: remain >= 0 ? "เพียงพอ" : "ไม่เพียงพอ",
      usePerPiece: size.use,
      qty: qtyNum,

      fabricId: fabric.id,
      fabricCode: fabric.code,
      fabricName: fabric.name,
      fabricType: fabric.type,
      fabricPrice: fabric.price_per_m,
      fabricStock: fabric.stock_m,
    });
  };

  // ใช้หา stock สูงสุดไว้ทำ progress bar ในแท็บ "สรุปคงเหลือ"
  const maxStock =
    fabrics.length > 0
      ? Math.max(...fabrics.map((f) => Number(f.stock_m || 0)))
      : 0;

  return (
    <div className="fabric-page">
      {/* ---------------- HEADER ---------------- */}
      <div className="fabric-header">
        <h2 className="fabric-title">คำนวณผ้า</h2>
        <p className="fabric-sub">
          เลือกประเภทผ้า เลือกผ้าผืนจากคลัง แล้วให้ระบบคำนวณการใช้งานและคงเหลือให้โดยอิงจากฐานข้อมูลจริง
        </p>
      </div>

      {/* ---------------- TABS ---------------- */}
      <div className="fabric-tabs">
        <button
          className={tab === "calc" ? "active" : ""}
          onClick={() => setTab("calc")}
        >
          คำนวณผ้า
        </button>

        <button
          className={tab === "stock" ? "active" : ""}
          onClick={() => setTab("stock")}
        >
          สรุปคงเหลือ
        </button>

        <button
          className={tab === "cost" ? "active" : ""}
          onClick={() => setTab("cost")}
        >
          ต้นทุนตามไซส์
        </button>
      </div>

      {/* =============================================================
                         TAB 1 : คำนวณผ้า
      ============================================================= */}
      {tab === "calc" && (
  <div className="fabric-section">
    <div className="icon-box-premium large">📏</div>

    <h3 className="section-title">คำนวณปริมาณผ้าที่ต้องใช้จากผ้า</h3>
    <div className="section-divider" />

    {loading && (
      <div style={{ marginBottom: 12, fontSize: 13, color: "#6b7280" }}>
        กำลังโหลดข้อมูลผ้าจากฐานข้อมูล...
      </div>
    )}

    <div className="calc-grid">
      {/* เลือกประเภทผ้า */}
      <div>
        <label>ประเภทผ้า</label>
        <select
          value={selectedType}
          onChange={(e) => {
            setSelectedType(e.target.value);
            setSelectedFabricId("");
          }}
        >
          <option value="">ทุกประเภท</option>
          {fabricTypes.map((t) => (
            <option key={t.id} value={t.id}>
              {t.type_name || t.name}
            </option>
          ))}
        </select>
      </div>

      {/* เลือกผ้าผืน */}
      <div>
        <label>เลือกผ้าผืนที่ต้องการคำนวณ</label>
        <select
          value={selectedFabricId}
          onChange={(e) => setSelectedFabricId(e.target.value)}
        >
          <option value="">
            {filteredFabrics.length === 0
              ? "ไม่มีผ้าในประเภทนี้"
              : "เลือกผ้าผืน"}
          </option>
          {filteredFabrics.map((f) => (
            <option key={f.id} value={f.id}>
              ผืน {f.code || f.id} — {f.name_f || f.name} (คงเหลือ{" "}
              {f.stock_m ?? f.stock ?? 0} เมตร)
            </option>
          ))}
        </select>
      </div>

      {/* เลือกไซส์ */}
      <div>
        <label>ไซส์สินค้า</label>
        <select
          value={selectedSize}
          onChange={(e) => setSelectedSize(e.target.value)}
        >
          <option value="">เลือกไซส์</option>
          {sizes.map((s) => (
            <option key={s.size} value={s.size}>
              {s.size} (ใช้ {s.use} เมตรต่อชิ้น)
            </option>
          ))}
        </select>
      </div>

      {/* จำนวนผลิต */}
      <div>
        <label>จำนวนที่ต้องการผลิต</label>
        <input
          type="number"
          placeholder="กรอกจำนวน"
          value={qty}
          onChange={(e) => setQty(e.target.value)}
        />
      </div>
    </div>

    <button className="calc-btn" onClick={handleCalculate}>
      📐 คำนวณ
    </button>

    {/* ผลลัพธ์ */}
    {result && (
      <>
        <div className="section-divider" />

        {/* แสดงว่ากำลังคำนวณจากผ้าผืนไหน */}
        <div
          style={{
            fontSize: 13,
            marginBottom: 12,
            color: "#4b5563",
          }}
        >
          คำนวณจากผ้าผืนที่เลือก:{" "}
          <strong>
            ผืน {result.fabricCode} — {result.fabricName} ({result.fabricType})
          </strong>{" "}
          | ผ้าในคลังผืนนี้: {result.fabricStock} เมตร
        </div>

        <div className="result-grid">
          {/* TOTAL USE */}
          <div className="result-box blue">
            <div className="icon-box-premium small">📏</div>
            <h4>ผ้าที่ต้องใช้ทั้งหมด</h4>
            <p className="big-number">
              {result.totalUse.toFixed(2)} เมตร
            </p>
            <small>
              ({result.usePerPiece} เมตร × {result.qty} ชิ้น)
            </small>
          </div>

          {/* TOTAL COST */}
          <div className="result-box green">
            <div className="icon-box-premium small icon-green">💰</div>
            <h4>ต้นทุนรวม</h4>
            <p className="big-number">
              ฿{result.totalCost.toLocaleString()}
            </p>
            <small>({result.fabricPrice} บาท/เมตร)</small>
          </div>

          {/* CURRENT STOCK */}
          <div className="result-box gray">
            <div className="icon-box-premium small icon-yellow">📦</div>
            <h4>ผ้าในคลังผืนนี้ (ก่อนผลิต)</h4>
            <p className="big-number">
              {result.fabricStock.toFixed(2)} เมตร
            </p>
          </div>

          {/* REMAIN */}
          <div
            className={`result-box ${
              result.status === "เพียงพอ" ? "green-light" : "red-light"
            }`}
          >
            <div className="icon-box-premium small icon-red">⚠️</div>
            <h4>ผ้าคงเหลือหลังผลิตจากผืนนี้</h4>
            <p className="big-number">
              {result.remain.toFixed(2)} เมตร
            </p>
            <small>{result.status}</small>
          </div>
        </div>

        {/* ข้อความแนะนำ */}
        <div
          style={{
            marginTop: 12,
            fontSize: 13,
            color: "#374151",
            background: "#f9fafb",
            padding: "10px 12px",
            borderRadius: 12,
          }}
        >
          {result.remain >= 0 ? (
            <>
              ผ้าผืน <strong>{result.fabricCode}</strong> สามารถผลิตได้{" "}
              {result.qty} ชิ้น และยังเหลือผ้าอีก{" "}
              {result.remain.toFixed(2)} เมตร สามารถเก็บไว้ผลิตไซส์อื่น
              หรือใช้ทำสินค้าเสริมได้
            </>
          ) : (
            <>
              ผ้าผืน <strong>{result.fabricCode}</strong> มีไม่พอสำหรับผลิต{" "}
              {result.qty} ชิ้น ขาดอีก{" "}
              {Math.abs(result.remain).toFixed(2)} เมตร แนะนำให้
              <strong> ลดจำนวนผลิต หรือเลือกผ้าผืนอื่น</strong>{" "}
              ที่มีสต็อกมากกว่า
            </>
          )}
        </div>
      </>
    )}
  </div>
)}

      {/* =============================================================
                      TAB 2 : สรุปคงเหลือในคลัง
      ============================================================= */}
      {tab === "stock" && (
        <div className="fabric-section">
          <div className="icon-box-premium large">📦</div>

          <h3 className="section-title">สรุปผ้าคงเหลือในคลัง (ตามผ้าผืน)</h3>
          <div className="section-divider" />

          {loading && (
            <div style={{ fontSize: 13, color: "#6b7280" }}>
              กำลังโหลดข้อมูลผ้าจากฐานข้อมูล...
            </div>
          )}

          {!loading &&
            fabrics.map((f) => {
              const percent = maxStock
                ? (Number(f.stock_m || 0) / maxStock) * 100
                : 0;

              return (
                <div key={f.id} className="summary-box">
                  <div className="summary-header">
                    <h4>
                      ผืน {f.code} — {f.name} ({f.type})
                    </h4>
                    <span className="price-tag">
                      ฿{Number(f.price_per_m).toLocaleString()}/เมตร
                    </span>
                  </div>

                  <div className="summary-value-row">
                    <span>คงเหลือ</span>
                    <span className="green-text">
                      {Number(f.stock_m || 0)} เมตร
                    </span>
                  </div>

                  <div className="summary-value-row">
                    <span>มูลค่าคงเหลือโดยประมาณ</span>
                    <span className="blue-text">
                      ฿
                      {(
                        Number(f.stock_m || 0) * Number(f.price_per_m || 0)
                      ).toLocaleString()}
                    </span>
                  </div>

                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{ width: percent + "%" }}
                    ></div>
                  </div>
                </div>
              );
            })}
        </div>
      )}

      {/* =============================================================
                    TAB 3 : ต้นทุนตามไซส์
      ============================================================= */}
      {tab === "cost" && (
        <div className="fabric-section">
          <div className="icon-box-premium">💵</div>
          <h3 className="section-title">ตารางต้นทุนต่อชิ้น แยกตามไซส์และผ้าผืน</h3>

          <div className="section-divider"></div>

          {fabrics.map((f) => (
            <div key={f.id} className="cost-table-block">
              {/* หัวข้อผ้า */}
              <div className="cost-table-header">
                <h4>
                  ผืน {f.code} — {f.name} ({f.type})
                </h4>
                <span className="price-tag">
                  ฿{Number(f.price_per_m).toLocaleString()}/เมตร
                </span>
              </div>

              <table className="cost-table">
                <thead>
                  <tr>
                    <th>ไซส์</th>
                    <th>ปริมาณผ้าต่อชิ้น</th>
                    <th>ราคาต่อเมตร</th>
                    <th>ต้นทุนต่อชิ้น</th>
                  </tr>
                </thead>

                <tbody>
                  {sizes.map((s) => (
                    <tr key={s.size}>
                      <td>{s.size}</td>
                      <td>{s.use} เมตร</td>
                      <td>
                        ฿{Number(f.price_per_m || 0).toLocaleString()}
                      </td>
                      <td className="highlight">
                        ฿
                        {(
                          Number(s.use || 0) * Number(f.price_per_m || 0)
                        ).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="section-divider"></div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}