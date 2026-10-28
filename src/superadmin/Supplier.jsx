import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import {
  FiEye,
  FiEdit2,
  FiPlus,
  FiSearch,
  FiRefreshCw,
  FiTrash2,
  FiUser,
  FiMapPin,
} from "react-icons/fi";
import "../styles/Supplier.css";

import {
  deleteSupplier,
  getSuppliers,
  getShopSettings,
  updateShopSettings,
  resolveMapLink,
} from "../api/fetch_api_superadmin";
import { parseGoogleMapsLink, googleMapsUrl } from "../utils/geo";
import Select from "../components/Select";

import { IMAGE_BASE as IMAGE_URL } from "../api/http";

const Supplier = () => {
  const navigate = useNavigate();

  const [suppliers, setSuppliers] = useState([]);
  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] = useState("all");

  const fetchData = async () => {
    try {
      const data = await getSuppliers();
      setSuppliers(data);
    } catch (error) {
      console.error("โหลด supplier ไม่สำเร็จ:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (supplierId, supplierName) => {
    const result = await Swal.fire({
      title: "ยืนยันการลบ",
      text: `ต้องการลบ Supplier "${supplierName}" ใช่หรือไม่?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "ตกลง",
      cancelButtonText: "ยกเลิก",
      reverseButtons: true,
    });
    const confirmed = result.isConfirmed;
    if (!confirmed) return;

    try {
      await deleteSupplier(supplierId);
      setSuppliers((prev) => prev.filter((item) => item.supplier_id !== supplierId));
      await Swal.fire({
        position: "center",
        icon: "success",
        title: "ลบข้อมูลสำเร็จ",
        text: `ลบ Supplier "${supplierName}" เรียบร้อยแล้ว`,
        showConfirmButton: false,
        timer: 1500,
      });
    } catch (error) {
      console.error("ลบ supplier ไม่สำเร็จ:", error);
      await Swal.fire({
        icon: "error",
        title: "ลบ Supplier ไม่สำเร็จ",
        text: "ไม่สามารถลบข้อมูลผู้จัดจำหน่ายได้",
        confirmButtonText: "ปิด",
      });
    }
  };

  const handleOpenShopSettings = async () => {
    let current = null;
    try {
      current = await getShopSettings();
    } catch (error) {
      console.error("โหลดพิกัดร้านเราไม่สำเร็จ:", error);
    }

    const currentLink =
      current?.lat != null && current?.lng != null
        ? googleMapsUrl(current.lat, current.lng)
        : "";

    const escapedName = (current?.shop_name || "").replace(/"/g, "&quot;");

    const { value: formValues } = await Swal.fire({
      title: "ตั้งค่าพิกัดร้านเรา",
      html:
        `<input id="swal-shop-name" class="swal2-input" placeholder="ชื่อร้าน (ถ้ามี)" value="${escapedName}">` +
        `<input id="swal-shop-maplink" class="swal2-input" placeholder="วางลิงก์ Google Maps ของร้านเรา" value="${currentLink}">` +
        `<p style="font-size:12px;color:#94a3b8;margin-top:8px;">ใช้พิกัดนี้เพื่อคำนวณระยะทางจากร้านเราไปยังผู้จำหน่ายแต่ละราย</p>`,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: "บันทึก",
      cancelButtonText: "ยกเลิก",
      reverseButtons: true,
      showLoaderOnConfirm: true,
      preConfirm: async () => {
        const shopName = document.getElementById("swal-shop-name").value.trim();
        const mapLink = document.getElementById("swal-shop-maplink").value.trim();

        if (!mapLink) {
          return { shopName, coords: null };
        }

        let coords = parseGoogleMapsLink(mapLink);

        if (!coords) {
          if (!/^https?:\/\//i.test(mapLink)) {
            Swal.showValidationMessage(
              "ไม่พบพิกัดจากลิงก์นี้ กรุณาวางลิงก์ Google Maps"
            );
            return false;
          }

          try {
            coords = await resolveMapLink(mapLink);
          } catch {
            Swal.showValidationMessage(
              "ไม่พบพิกัดจากลิงก์นี้ กรุณาตรวจสอบลิงก์อีกครั้ง"
            );
            return false;
          }
        }

        return { shopName, coords };
      },
    });

    if (!formValues) return;

    try {
      await updateShopSettings({
        shop_name: formValues.shopName || null,
        lat: formValues.coords?.lat ?? null,
        lng: formValues.coords?.lng ?? null,
      });

      await Swal.fire({
        position: "center",
        icon: "success",
        title: "บันทึกพิกัดร้านเราสำเร็จ",
        showConfirmButton: false,
        timer: 1500,
      });
    } catch (error) {
      console.error("บันทึกพิกัดร้านเราไม่สำเร็จ:", error);
      await Swal.fire({
        icon: "error",
        title: "บันทึกไม่สำเร็จ",
        text: "ไม่สามารถบันทึกพิกัดร้านเราได้",
        confirmButtonText: "ปิด",
      });
    }
  };

  const filteredSuppliers = suppliers.filter((item) => {
  const matchSearch =
    item.supplier_name?.toLowerCase().includes(search.toLowerCase()) ||
    item.phone?.includes(search);

  const matchStatus =
    statusFilter === "all" || item.status === statusFilter;

  return matchSearch && matchStatus;
});

  return (
    <div className="supplier-container">

      <div className="supplier-header">
        <div>
          <h1 className="supplier-title">ผู้จำหน่ายผ้า</h1>
          <p className="supplier-subtitle">
            จัดการร้านค้าผู้จำหน่ายผ้า
          </p>
        </div>

        <div className="supplier-header-actions">
          <button
            className="btn-supplier-shop-location"
            onClick={handleOpenShopSettings}
          >
            <FiMapPin />
            ตั้งค่าพิกัดร้านเรา
          </button>

          <button
            className="btn-supplier-add"
            onClick={() => navigate("/Supplier/add")}
          >
            <FiPlus />
            เพิ่ม Supplier
          </button>
        </div>
      </div>

      <div className="filter-bar">
        <div className="search-supplier-box">
          <FiSearch className="search-icon" />
          <input
            type="text"
            placeholder="ค้นหาชื่อร้าน / เบอร์"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <Select 
          className="filter-select"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">สถานะทั้งหมด</option>
          <option value="active">ใช้งาน</option>
          <option value="inactive">ปิดใช้งาน</option>
        </Select>

       <button
          className="btn-refresh"
          onClick={() => {
            setSearch("");
            setStatusFilter("all");
            fetchData();
          }}
        >
          <FiRefreshCw />
        </button>
      </div>

      <div className="table-card">
        <table className="supplier-table">
          <thead>
            <tr>
              <th>ชื่อร้าน</th>
              <th>ผู้ติดต่อ</th>
              <th>เบอร์</th>
              <th>สถานะ</th>
              <th className="text-center">จัดการ</th>
            </tr>
          </thead>

          <tbody>
            {filteredSuppliers.length > 0 ? (
              filteredSuppliers.map((item) => (
                <tr key={item.supplier_id}>
                  <td className="font-bold">{item.supplier_name}</td>
                  <td>
                    <div className="supplier-contact-cell">
                      <div className="supplier-contact-avatar">
                        {item.image ? (
                          <img src={`${IMAGE_URL}${item.image}`} alt={item.contact_name || "ผู้ติดต่อ"} />
                        ) : (
                          <FiUser size={14} />
                        )}
                      </div>
                      <span>{item.contact_name}</span>
                    </div>
                  </td>
                  <td>{item.phone}</td>
                  <td>
                    <span
                      className={
                        item.status === "active"
                          ? "badge status-active"
                          : "badge status-inactive"
                      }
                    >
                      {item.status === "active" ? "ใช้งาน" : "ปิดใช้งาน"}
                    </span>
                  </td>
                  <td className="action-cell">
                    <div className="action-group">
                      <button
                        className="btn-action view"
                        onClick={() =>
                          navigate(`/Supplier/detail/${item.supplier_id}`)
                        }
                      >
                        <FiEye />
                      </button>

                      <button
                        className="btn-action edit"
                        onClick={() =>
                          navigate(`/Supplier/edit/${item.supplier_id}`)
                        }
                      >
                        <FiEdit2 size={15} />
                      </button>

                      <button
                        className="btn-action delete"
                        onClick={() =>
                          handleDelete(item.supplier_id, item.supplier_name)
                        }
                      >
                        <FiTrash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" style={{ textAlign: "center" }}>
                  ไม่มีข้อมูล
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Supplier;
