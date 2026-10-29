import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FiEdit2 } from "react-icons/fi";
import { getFabricRoll, getFabricUsageHistory, getFabricImageUrl } from "../api/fetch_api_superadmin";
import ImageLightbox from "../components/ImageLightbox";
import { UnitToggle } from "../components/MeasureUnit";
import { FABRIC_UNITS, cmToUnit, formatLength, metersToCm, unitLabelOf, useFabricUnit } from "../utils/measureUnit";
import "../styles/fabricdetail.css";

const USAGE_SOURCE_LABEL = {
  manual: "บันทึกการใช้",
  calc: "คำนวณต้นทุนชุด",
  tailoring: "ใบสั่งตัด",
};

const FabricDetail = () => {

  const navigate = useNavigate();
  const { id } = useParams();

  const [roll, setRoll]           = useState(null);
  const [usageLogs, setUsageLogs] = useState([]);
  const [zoomOpen, setZoomOpen]   = useState(false);
  const [unit, setUnit]           = useFabricUnit();
  const len = (m) => formatLength(metersToCm(m), unit);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [rollData, usageData] = await Promise.all([
          getFabricRoll(id),
          getFabricUsageHistory(id),
        ]);
        setRoll(rollData);
        setUsageLogs(usageData);
      } catch (err) {
        console.error("Error loading data:", err);
      }
    };
    loadData();
  }, [id]);

  if (!roll) return <div>Loading...</div>;

  const usedLength = Number(roll.initial_length) - Number(roll.remaining_length);
  const deductedTotal = usageLogs
    .filter((log) => log.deducted)
    .reduce((sum, log) => sum + (Number(log.used_length) || 0), 0);

  const remainPercent = Number(roll.initial_length) > 0
    ? Math.round((Number(roll.remaining_length) / Number(roll.initial_length)) * 100)
    : 0;

  const totalValue = Number(roll.purchase_total_price);

  const remainValue = Number(roll.initial_length) > 0
    ? (Number(roll.remaining_length) / Number(roll.initial_length)) * Number(roll.purchase_total_price)
    : 0;

  return (
    <div className="fabric-detail-container">

      <div className="detail-header">
        <div>
          <h2>
            ม้วนผ้า :
            <span className="highlight-id"> {roll.roll_code}</span>
          </h2>

          {Number(roll.remaining_length) === 0 ? (
            <span className="badge danger">หมด</span>
          ) : Number(roll.remaining_length) < 10 ? (
            <span className="badge warning">
              ใกล้หมด ({len(roll.remaining_length)})
            </span>
          ) : (
            <span className="badge success">พร้อมใช้งาน</span>
          )}
        </div>

        <div className="header-actions">
          <button
            className="btn-edit-fabric"
            onClick={() => navigate(`/Fabric/edit/${roll.roll_id}`)}
          >
            <FiEdit2 size={16} /> แก้ไขข้อมูล
          </button>
          <button
            className="btn-add-fabric"
            onClick={() => navigate(`/Fabric/usage-record/${roll.roll_id}`)}
          >
            + บันทึกการใช้
          </button>
        </div>
      </div>

      <div className="fabric-unit-bar">
        <span>หน่วยความยาว</span>
        <UnitToggle unit={unit} onChange={setUnit} units={FABRIC_UNITS} />
      </div>

      <div className="kpi-grid">
        <div className="kpi-card">
          <span>ความยาวเริ่มต้น</span>
          <h3>{len(roll.initial_length)}</h3>
        </div>
        <div className="kpi-card">
          <span>ใช้ไปแล้ว</span>
          <h3>{len(usedLength)}</h3>
        </div>
        <div className="kpi-card warning">
          <span>คงเหลือ</span>
          <h3>{len(roll.remaining_length)}</h3>
        </div>
        <div className="kpi-card">
          <span>ต้นทุนต่อเมตร</span>
          <h3>{Number(roll.cost_per_meter).toFixed(2)} บาท</h3>
        </div>
      </div>

      <div className="content-grid">

        <div className="info-fabric-card">
          <h4>ข้อมูลม้วนผ้า</h4>

          {roll.image_path && (
            <div className="fabric-detail-image">
              <button type="button" className="zoomable-img" title="คลิกเพื่อดูรูปขยาย" onClick={() => setZoomOpen(true)}>
                <img src={getFabricImageUrl(roll.image_path)} alt={roll.fabric_name || "ผ้า"} />
              </button>
            </div>
          )}

          <div className="info-row">
            <span>รหัสม้วน</span>
            <strong>{roll.roll_code}</strong>
          </div>
          <div className="info-row">
            <span>ชื่อผ้า</span>
            <strong>{roll.fabric_name || "-"}</strong>
          </div>
          <div className="info-row">
            <span>ประเภท</span>
            <strong>{roll.type_name || "-"}</strong>
          </div>
          <div className="info-row">
            <span>หน้ากว้าง</span>
            <strong>{formatLength(roll.width_cm, unit)}</strong>
          </div>
          <div className="info-row">
            <span>สี</span>
            <strong>{roll.color_name || "-"}</strong>
          </div>
          <div className="info-row">
            <span>ลวดลาย</span>
            <strong>{roll.category_name || "-"}</strong>
          </div>
          <div className="info-row">
            <span>Lot</span>
            <strong>{roll.lot_number || "-"}</strong>
          </div>
          <div className="info-row">
            <span>คลังที่จัดเก็บ</span>
            <strong>{roll.storage_location || "-"}</strong>
          </div>
          <div className="info-row">
            <span>ผู้จัดจำหน่าย</span>
            <strong className="link">{roll.supplier_name || "-"}</strong>
          </div>
          <div className="info-row">
            <span>วันที่จัดซื้อ</span>
            <strong>
              {roll.purchase_date
                ? new Date(roll.purchase_date).toLocaleDateString("th-TH", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })
                : "-"}
            </strong>
          </div>
        </div>

        <div className="stock-card">
          <div className="stock-header">
            <h4>สถานะสต็อก</h4>
            {Number(roll.remaining_length) === 0 ? (
              <span className="stock-badge danger">หมด</span>
            ) : Number(roll.remaining_length) < 10 ? (
              <span className="stock-badge low">ใกล้หมด</span>
            ) : (
              <span className="stock-badge normal">พร้อมใช้งาน</span>
            )}
          </div>

          <div className="stock-main">
            <div className="stock-number">
              {cmToUnit(metersToCm(roll.remaining_length), unit)}
              <span>{unitLabelOf(unit)}</span>
            </div>
            <div className="stock-sub">
              คงเหลือ {remainPercent}% จากทั้งหมด
            </div>
          </div>

          <div className="progress-wrapper">
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${remainPercent}%` }}
              />
            </div>
          </div>

          <div className="value-cards-modern">
            <div className="value-card">
              <div className="value-label">มูลค่าเริ่มต้นทั้งหมด</div>
              <div className="value-amount">
                {totalValue.toLocaleString("th-TH", { minimumFractionDigits: 2 })}
                <span> บาท</span>
              </div>
            </div>
            <div className="value-card highlight">
              <div className="value-label">มูลค่าคงเหลือ</div>
              <div className="value-amount">
                {remainValue.toLocaleString("th-TH", { minimumFractionDigits: 2 })}
                <span> บาท</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      <div className="usage-table-card">
        <h4>ประวัติการใช้ผ้า</h4>
        <p className="usage-sub">
          รวมทุกแหล่ง — บันทึกการใช้ผ้า และคำนวณต้นทุนชุด จะตัดผ้าออกจากสต็อก
          ส่วนใบสั่งตัดแสดงเพื่อให้รู้ว่าม้วนนี้ถูกเลือกไปใช้ที่ไหน (ไม่ตัดสต็อก)
        </p>
        <table>
          <thead>
            <tr>
              <th>วันที่</th>
              <th>ที่มา</th>
              <th>รายการ</th>
              <th className="num">ใช้ไป ({unitLabelOf(unit)})</th>
            </tr>
          </thead>
          <tbody>
            {usageLogs.length === 0 ? (
              <tr>
                <td colSpan="4" style={{ textAlign: "center", color: "#94a3b8" }}>
                  ยังไม่มีบันทึกการใช้งาน
                </td>
              </tr>
            ) : (
              usageLogs.map((log) => (
                <tr key={log.key} className={log.deducted ? "" : "usage-row-muted"}>
                  <td className="nowrap">
                    {new Date(log.created_at).toLocaleDateString("th-TH", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                  <td>
                    <span className={`usage-source usage-source-${log.source}`}>
                      {USAGE_SOURCE_LABEL[log.source]}
                    </span>
                  </td>
                  <td>
                    {log.source === "tailoring" ? (
                      <button
                        type="button"
                        className="usage-link"
                        onClick={() => navigate(`/Order/detail/${log.order_code}`)}
                      >
                        {log.title}
                      </button>
                    ) : (
                      <div className="usage-title">{log.title}</div>
                    )}
                    {log.detail && <div className="usage-detail">{log.detail}</div>}
                    {log.product_lot && (
                      <div className="usage-detail">
                        สินค้า {log.product_lot} {log.product_name}
                        {log.product_deleted && <span className="usage-deleted"> (ลบแล้ว)</span>}
                      </div>
                    )}
                  </td>
                  <td className="num">
                    {log.used_length == null ? (
                      <span className="usage-detail">ยังไม่ระบุ</span>
                    ) : (
                      <>
                        {cmToUnit(metersToCm(log.used_length), unit)}
                        {!log.deducted && <div className="usage-detail">ไม่ตัดสต็อก</div>}
                      </>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
          {usageLogs.length > 0 && (
            <tfoot>
              <tr>
                <td colSpan="3">รวมที่ตัดสต็อกตามประวัติ</td>
                <td className="num">{cmToUnit(metersToCm(deductedTotal), unit)}</td>
              </tr>
              <tr>
                <td colSpan="3">ใช้ไปตามสต็อกจริง (เริ่มต้น − คงเหลือ)</td>
                <td className="num">{cmToUnit(metersToCm(usedLength), unit)}</td>
              </tr>
            </tfoot>
          )}
        </table>
        {usageLogs.length > 0 && Math.abs(deductedTotal - usedLength) >= 0.01 && (
          <p className="usage-mismatch">
            ⚠️ ประวัติกับสต็อกจริงไม่ตรงกัน ต่างกัน {formatLength(metersToCm(Math.abs(deductedTotal - usedLength)), unit)} —
            อาจมีการแก้ความยาวคงเหลือโดยตรง หรือลบประวัติการคำนวณไปแล้ว (การลบไม่คืนผ้าเข้าคลัง)
          </p>
        )}
      </div>

      <ImageLightbox
        src={zoomOpen && roll.image_path ? getFabricImageUrl(roll.image_path) : null}
        alt={roll.fabric_name || "ผ้า"}
        caption={[roll.roll_code, roll.fabric_name].filter(Boolean).join(" · ")}
        onClose={() => setZoomOpen(false)}
      />
    </div>
  );
};

export default FabricDetail;
