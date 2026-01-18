import React, { useState, useEffect } from "react";
import "../../styles/modal.css";
import { GetProduct } from "../api/admin";

export default function ProductDetailModal({ product, onClose }) {
  // 1. สร้าง State เพื่อเก็บข้อมูลสินค้าล่าสุด (เริ่มต้นให้ใช้ค่าจาก props ไปก่อน)
  const [productDetail, setProductDetail] = useState(product);

  useEffect(() => {
    // อัปเดต State เมื่อ props product เปลี่ยน (กันไว้กรณีเปิด modal ใหม่)
    setProductDetail(product);
  }, [product]);

  useEffect(() => {
    const fetchProduct = async () => {
      // ✅ ถูก: ต้องใช้ idProducts ตามฐานข้อมูล
      const productId = product.idProducts || product.id;

      console.log("Product ID to fetch:", productId);

      if (!productId) {
        console.error("Product ID is missing");
        return;
      }

      try {
        const res = await GetProduct(productId);
        console.log("Product data:", res);

        // ********** จุดที่แก้ไข **********
        // เอา res (ข้อมูลใหม่ที่มี category_name) ไปใส่ใน State
        if (res) {
          setProductDetail(res);
        }
        // ******************************

      } catch (error) {
        console.error("Error fetching product:", error);
      }
    };
    fetchProduct();
  }, [product]);

  // ใช้ข้อมูลจาก productDetail แทน product เฉยๆ ในส่วนที่จะแสดงผล
  const displayData = productDetail || product;

  // ฟังก์ชันช่วยจัดรูปแบบตัวเลขให้สวยงาม
  const formatCurrency = (amount) => {
    return Number(amount || 0).toLocaleString('th-TH', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });
  };

  return (
    <div className="modal-bg" onClick={onClose}>
      <div
        className="modal-box detail-modal"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ปุ่มปิด Modal มุมขวาบน */}
        <button className="modal-close" onClick={onClose}>
          ×
        </button>

        <div className="detail-layout">
          {/* === ฝั่งซ้าย: รูปภาพสินค้า === */}
          <div className="detail-image-wrap">
            {displayData.image ? (
              <img
                src={`http://127.0.0.1:3010/static/images/${displayData.image}`}
                alt={displayData.name}
                className="detail-image"
              />
            ) : (
              // กรณีไม่มีรูป แสดง Placeholder สวยๆ
              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f3f4f6', color: '#9ca3af', flexDirection: 'column', gap: '8px' }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>
                <span style={{ fontSize: '13px' }}>ไม่มีรูปภาพ</span>
              </div>
            )}

            {/* Chip ID แบบลอยบนมุมรูป */}
            <span className="detail-chip-id">
              #{displayData.idProducts || displayData.id}
            </span>
          </div>

          {/* === ฝั่งขวา: ข้อมูลรายละเอียด === */}
          <div className="detail-info">
            {/* ส่วนหัว: ชื่อสินค้า */}
            <div style={{ marginBottom: '24px' }}>
              <h2 className="detail-title" style={{ fontSize: '24px', lineHeight: '1.3' }}>
                {displayData.name}
              </h2>
              <p className="detail-sub" style={{ marginTop: '8px' }}>
                ดูรายละเอียดสินค้า สต็อก และราคาทุนเพื่อประกอบการตัดสินใจ
              </p>
            </div>

            {/* ตารางข้อมูล (Grid 2 คอลัมน์) */}
            <div className="detail-grid">

              {/* กลุ่ม: ประเภทและลักษณะ */}
              <div className="detail-field">
                <span className="detail-label">ประเภทผ้า</span>
                <span className="detail-value">{displayData.type_name || '-'}</span>
              </div>

              <div className="detail-field">
                <span className="detail-label">ลวดลาย</span>
                <span className="detail-value">{displayData.category_name || '-'}</span>
              </div>

              {/* กลุ่ม: สต็อกและราคา (ไฮไลท์) */}
              <div className="detail-field">
                <span className="detail-label">สต็อกคงเหลือ</span>
                <span className="detail-value" style={{ color: displayData.stock < 10 ? '#ef4444' : '#1f2937' }}>
                  {formatCurrency(displayData.stock)} ชิ้น
                </span>
              </div>

              <div className="detail-field">
                <span className="detail-label">ราคาต่อชิ้น</span>
                <span className="detail-value price" style={{ fontSize: '20px' }}>
                  ฿{formatCurrency(displayData.price)}
                </span>
              </div>
            </div>

            {/* ส่วนสรุปมูลค่า (Card แยกออกมาให้เด่น) */}
            <div style={{
              background: '#f0f9ff',
              border: '1px solid #bae6fd',
              borderRadius: '12px',
              padding: '16px',
              marginTop: '12px',
              marginBottom: '20px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span style={{ fontSize: '13px', color: '#0369a1', fontWeight: '600' }}>
                มูลค่าสต็อกรวมโดยประมาณ
              </span>
              <span style={{ fontSize: '18px', color: '#0284c7', fontWeight: '700' }}>
                ฿{formatCurrency((Number(displayData.price || 0) * Number(displayData.stock || 0)))}
              </span>
            </div>

            {/* Note ด้านล่าง */}
            <p className="detail-note" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" /></svg>
              <span>
                หากต้องการแก้ไขข้อมูล กรุณาปิดหน้านี้และกดปุ่ม <strong>"แก้ไข"</strong> ที่หน้ารายการสินค้า
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}