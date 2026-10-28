import { useEffect, useState } from 'react';
import { useNavigate, useParams } from "react-router-dom";
import {
  FiEdit3, FiUser, FiPhone, FiMapPin,
  FiFileText, FiEye, FiChevronLeft, FiChevronRight, FiMail,
  FiNavigation, FiExternalLink
} from 'react-icons/fi';
import '../styles/SupplierDetail.css';

import { getPurchaseOrdersDetailed, getSupplier, getShopSettings } from "../api/fetch_api_superadmin";
import { haversineDistanceKm, googleMapsUrl } from "../utils/geo";

const PAGE_SIZE = 5;
import { IMAGE_BASE as IMAGE_URL } from "../api/http";

const statusToClassName = (status) => {
  if (status === "รับครบแล้ว") return "received";
  if (status === "รับบางส่วน") return "partial";
  if (status === "รอสินค้า") return "ordered";
  return "draft";
};

const SupplierDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [supplier, setSupplier] = useState(null);
  const [poHistory, setPoHistory] = useState([]);
  const [page, setPage] = useState(1);
  const [shopSettings, setShopSettings] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [supplierData, orders, shopData] = await Promise.all([
          getSupplier(id),
          getPurchaseOrdersDetailed(),
          getShopSettings().catch(() => null),
        ]);

        setSupplier(supplierData);
        setShopSettings(shopData);
        setPoHistory(
          (orders || [])
            .filter((order) => String(order.supplierId || "") === String(id))
            .map((order) => ({
              po_id: order.po_id,
              id: order.id,
              date: order.date
                ? new Date(order.date).toLocaleDateString("th-TH", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })
                : "-",
              items: order.items?.length || 0,
              status: order.receiveStatus || "รอสินค้า",
            }))
        );
      } catch (err) {
        console.error("โหลด supplier ไม่สำเร็จ", err);
      }
    };

    fetchData();
  }, [id]);

  if (!supplier) {
    return <div className="sd-page-container">กำลังโหลด...</div>;
  }

  const totalPages = Math.max(1, Math.ceil(poHistory.length / PAGE_SIZE));
  const pagedHistory = poHistory.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const hasSupplierLocation = supplier.lat != null && supplier.lng != null;
  const hasShopLocation = shopSettings?.lat != null && shopSettings?.lng != null;
  const distanceKm =
    hasSupplierLocation && hasShopLocation
      ? haversineDistanceKm(
          Number(shopSettings.lat),
          Number(shopSettings.lng),
          Number(supplier.lat),
          Number(supplier.lng)
        )
      : null;

  return (
    <div className="sd-page-container">

      <div className="sd-info-card">
        <div className="sd-card-header">
          <div className="sd-supplier-title-group">
            <h2 className="sd-supplier-name">
              {supplier.supplier_name}
            </h2>
          </div>

          <button
            className="sd-btn-edit"
            onClick={() => navigate(`/Supplier/edit/${supplier.supplier_id}`)}
          >
            <FiEdit3 /> แก้ไขข้อมูล
          </button>
        </div>

        <div className="sd-info-grid">

          <div className="sd-info-item">
            <div className="sd-avatar">
              {supplier.image ? (
                <img src={`${IMAGE_URL}${supplier.image}`} alt={supplier.contact_name || 'ผู้ติดต่อ'} />
              ) : (
                <FiUser />
              )}
            </div>
            <div className="sd-info-text">
              <label>ผู้ติดต่อ</label>
              <p>{supplier.contact_name || '-'}</p>
            </div>
          </div>

          <div className="sd-info-item">
            <div className="sd-icon-circle"><FiPhone /></div>
            <div className="sd-info-text">
              <label>เบอร์โทรศัพท์</label>
              <p>{supplier.phone || '-'}</p>
            </div>
          </div>

          <div className="sd-info-item">
            <div className="sd-icon-circle"><FiMapPin /></div>
            <div className="sd-info-text">
              <label>ที่อยู่</label>
              <p>{supplier.address || '-'}</p>
            </div>
          </div>

          <div className="sd-info-item">
            <div className="sd-icon-circle"><FiMail /></div>
            <div className="sd-info-text">
              <label>อีเมล</label>
              <p>{supplier.email || '-'}</p>
            </div>
          </div>

          <div className="sd-info-item sd-note-full-width">
            <div className="sd-icon-circle"><FiNavigation /></div>
            <div className="sd-info-text">
              <label>พิกัดร้าน</label>
              {hasSupplierLocation ? (
                <div className="sd-location-content">
                  <p>{Number(supplier.lat).toFixed(6)}, {Number(supplier.lng).toFixed(6)}</p>
                  {distanceKm != null ? (
                    <span className="sd-distance-badge">
                      ห่างจากร้านเราประมาณ {distanceKm.toFixed(1)} กม.
                    </span>
                  ) : (
                    <span className="sd-distance-badge sd-distance-badge--muted">
                      ยังไม่ได้ตั้งค่าพิกัดร้านเรา จึงคำนวณระยะทางไม่ได้
                    </span>
                  )}
                  <a
                    className="sd-btn-view-map"
                    href={googleMapsUrl(supplier.lat, supplier.lng)}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <FiExternalLink /> ดูใน Google Maps
                  </a>
                </div>
              ) : (
                <p>ยังไม่ได้ระบุพิกัด</p>
              )}
            </div>
          </div>

          <div className="sd-info-item sd-note-full-width">
            <div className="sd-icon-circle"><FiFileText /></div>
            <div className="sd-info-text">
              <label>หมายเหตุ</label>
              <p className="sd-note-content">
                {supplier.note || '-'}
              </p>
            </div>
          </div>

        </div>
      </div>

      <div className="sd-history-card">
        <div className="sd-history-header">
          <div className="sd-history-title">
            <FiFileText className="sd-title-icon" />
            <h3>ประวัติการสั่งซื้อ</h3>
          </div>
        </div>

        <div className="sd-table-responsive">
          <table className="sd-po-table">
            <thead>
              <tr>
                <th>เลขที่ PO</th>
                <th>วันที่สั่ง</th>
                <th>จำนวนรายการ</th>
                <th>สถานะ</th>
                <th>จัดการ</th>
              </tr>
            </thead>

            <tbody>
              {pagedHistory.length > 0 ? (
                pagedHistory.map((po) => (
                  <tr key={po.po_id}>
                    <td className="sd-po-id">{po.id}</td>
                    <td>{po.date}</td>
                    <td>{po.items} รายการ</td>
                    <td>
                      <span className={`sd-status-badge sd-status-${statusToClassName(po.status)}`}>
                        {po.status}
                      </span>
                    </td>
                    <td>
                      <button
                        className="sd-btn-view-table"
                        onClick={() => navigate(`/orders/detail/${encodeURIComponent(po.id)}`)}
                      >
                        <FiEye /> ดูรายละเอียด
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="sd-empty-history">ยังไม่มีประวัติการสั่งซื้อ</td>
                </tr>
              )}
            </tbody>

          </table>
        </div>

        <div className="sd-pagination">
          <span>หน้า {page} / {totalPages}</span>
          <div className="sd-pagination-controls">
            <button
              className="sd-btn-page"
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              disabled={page === 1}
            >
              <FiChevronLeft />
            </button>
            <button
              className="sd-btn-page"
              onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
              disabled={page === totalPages}
            >
              <FiChevronRight />
            </button>
          </div>
        </div>
      </div>

    </div>
  );
};

export default SupplierDetail;
