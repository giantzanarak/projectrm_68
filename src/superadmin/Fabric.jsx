import { useMemo, useRef, useState, useEffect } from "react";
import {
  getFabricRolls,
  getColors,
  getFabricTypes,
  deleteFabricRoll,
  getFabricImageUrl,
  editFabricType,
} from "../api/fetch_api_superadmin";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import ImageLightbox from "../components/ImageLightbox";
import "../styles/fabric.css";
import "../styles/dropdown.css";

import {
  FiBox,
  FiAlertTriangle,
  FiShoppingCart,
  FiSearch,
  FiEye,
  FiEdit2,
  FiTrash2,
  FiChevronDown,
  FiCamera,
} from "react-icons/fi";

function FilterDropdown({ triggerContent, children }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <div className="filter-dropdown" ref={ref}>
      <button
        type="button"
        className={`filter-select filter-dropdown-trigger ${open ? "open" : ""}`}
        onClick={() => setOpen((o) => !o)}
      >
        <span className="filter-dropdown-trigger-content">{triggerContent}</span>
        <FiChevronDown size={16} className="filter-dropdown-arrow" />
      </button>

      {open && (
        <div className="filter-dropdown-menu" onClick={() => setOpen(false)}>
          {children}
        </div>
      )}
    </div>
  );
}

export default function Fabric() {

  const navigate = useNavigate();

  const [rolls, setRolls] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [colors, setColors] = useState([]);
  const [fabricTypes, setFabricTypes] = useState([]);
  const [selectedType, setSelectedType] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [uploadingTypeId, setUploadingTypeId] = useState(null);
  const [zoomImage, setZoomImage] = useState(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [resRolls, resColors, resFabricTypes] = await Promise.all([
          getFabricRolls(),
          getColors(),
          getFabricTypes(),
        ]);

        setRolls(resRolls);
        setColors(resColors);
        setFabricTypes(resFabricTypes);
      } catch (err) {
        console.error("Error loading fabric data:", err);
      }
    }

    loadData();
  }, []);

  const getRollStatus = (roll) => {
    const remaining = Number(roll.remaining_length || 0);

    if (remaining === 0) return "หมด";
    if (remaining < 10) return "ใกล้หมด";
    return "พร้อมใช้งาน";
  };

  const filteredRolls = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();

    return rolls.filter((roll) => {
      const rollStatus = getRollStatus(roll);
      const rollCode = `fr-${String(roll.roll_id).padStart(3, "0")}`;
      const purchaseDate = roll.purchase_date ? String(roll.purchase_date).slice(0, 10) : "";

      const matchesSearch =
        !keyword ||
        [
          roll.fabric_name,
          roll.lot_number,
          roll.type_name,
          roll.color_name,
          rollCode,
          roll.roll_code,
          roll.supplier_name,
        ]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(keyword));

      const matchesType = !selectedType || String(roll.type_id) === selectedType;
      const matchesColor = !selectedColor || String(roll.color_id) === selectedColor;
      const matchesStatus = !selectedStatus || rollStatus === selectedStatus;
      const matchesDate = !selectedDate || purchaseDate === selectedDate;

      return (
        matchesSearch &&
        matchesType &&
        matchesColor &&
        matchesStatus &&
        matchesDate
      );
    });
  }, [rolls, searchTerm, selectedType, selectedColor, selectedStatus, selectedDate]);

  const selectedTypeInfo = fabricTypes.find(
    (type) => String(type.type_id) === selectedType
  );

  const totalOrders = rolls.length;
  const pendingOrders = rolls.filter(
    (r) => Number(r.remaining_length) > 0 && Number(r.remaining_length) < 10
  ).length;
  const outOfStock = rolls.filter(
    (r) => Number(r.remaining_length) === 0
  ).length;

  const handleTypeImageUpload = async (type, file) => {
    if (!file) return;

    setUploadingTypeId(type.type_id);
    try {
      const formData = new FormData();
      formData.append("image", file);

      await editFabricType(type.type_id, formData);
      const refreshed = await getFabricTypes();
      setFabricTypes(refreshed);
    } catch (error) {
      console.error("อัปโหลดรูปประเภทผ้าไม่สำเร็จ:", error);
      await Swal.fire({
        icon: "error",
        title: "อัปโหลดรูปไม่สำเร็จ",
        text:
          error?.response?.data?.message ||
          "ไม่สามารถอัปโหลดรูปประเภทผ้าได้",
        confirmButtonText: "ปิด",
      });
    } finally {
      setUploadingTypeId(null);
    }
  };

  const handleDelete = async (roll) => {
    // ม้วนสุดท้ายของผ้าแบบนี้ → ผ้าจะถูกซ่อนจากตัวเลือกด้วย (ซื้อสเปกเดิมอีกครั้ง ระบบเอากลับมาเอง)
    const isLastRoll = !rolls.some(
      (item) => item.fabric_id === roll.fabric_id && item.roll_id !== roll.roll_id
    );
    const confirmed = await Swal.fire({
      icon: "warning",
      title: "ยืนยันการลบ",
      text:
        `ต้องการลบม้วนผ้า ${roll.roll_code || `FR-${String(roll.roll_id).padStart(3, "0")}`} ใช่หรือไม่?` +
        (isLastRoll
          ? ` (ม้วนนี้เป็นม้วนสุดท้ายของ "${roll.fabric_name}" ผ้านี้จะถูกซ่อนจากตัวเลือกด้วย)`
          : ""),
      showCancelButton: true,
      confirmButtonText: "ลบ",
      cancelButtonText: "ยกเลิก",
      confirmButtonColor: "#dc2626",
    });

    if (!confirmed.isConfirmed) return;

    try {
      await deleteFabricRoll(roll.roll_id);
      setRolls((prev) => prev.filter((item) => item.roll_id !== roll.roll_id));

      await Swal.fire({
        icon: "success",
        title: "ลบข้อมูลสำเร็จ",
        text: `ลบม้วนผ้า ${roll.roll_code || `FR-${String(roll.roll_id).padStart(3, "0")}`} เรียบร้อยแล้ว`,
        confirmButtonText: "ปิด",
      });
    } catch (error) {
      console.error("ลบม้วนผ้าไม่สำเร็จ:", error);
      await Swal.fire({
        icon: "error",
        title: "ลบข้อมูลไม่สำเร็จ",
        text:
          error?.response?.data?.message ||
          "ไม่สามารถลบข้อมูลม้วนผ้าได้",
        confirmButtonText: "ปิด",
      });
    }
  };

  return (
    <div className="fabric-container">

      <div className="fabric-header">

        <div className="header-left">
          <h2 className="fabric-title">ม้วนผ้า</h2>
          <p className="fabric-subtitle">
            จัดการสต็อกผ้าแบบม้วนและติดตามปริมาณคงเหลือในคลังสินค้า
          </p>
        </div>

        <button className="add-roll-btn" onClick={() => navigate("/Fabric/add")}>
          <span className="plus-icon">+</span> เพิ่มม้วนผ้า
        </button>

      </div>

      <div className="summary-container">
        <div className="summary-card">
          <div className="card-content">
            <span className="card-label">ม้วนทั้งหมด</span>
            <h2 className="card-value">{totalOrders.toLocaleString()}</h2>
          </div>
          <div className="card-icon-box bg-gray-light">
            <FiBox size={24} />
          </div>
        </div>

        <div className="summary-card">
          <div className="card-content">
            <span className="card-label">ผ้าใกล้หมด</span>
            <h2 className="card-value">{pendingOrders}</h2>
          </div>
          <div className="card-icon-box bg-gray-light">
            <FiAlertTriangle size={24} />
          </div>
        </div>

        <div className="summary-card">
          <div className="card-content">
            <span className="card-label">ผ้าหมดแล้ว</span>
            <h2 className="card-value">{outOfStock}</h2>
          </div>
          <div className="card-icon-box bg-gray-light">
            <FiShoppingCart size={24} />
          </div>
        </div>
      </div>

      <div className="fabric-filter-section">

        <div className="search-wrapper">
          <FiSearch className="search-icon" />
          <input
            type="text"
            placeholder="ค้นหา ชื่อผ้า / รหัสม้วน / Lot..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <FilterDropdown
          triggerContent={
            selectedTypeInfo ? (
              <>
                {selectedTypeInfo.image_path ? (
                  <img
                    src={getFabricImageUrl(selectedTypeInfo.image_path)}
                    alt={selectedTypeInfo.type_name}
                    className="type-dropdown-thumb"
                  />
                ) : (
                  <div className="type-dropdown-thumb type-dropdown-thumb-empty">
                    <FiBox size={12} />
                  </div>
                )}
                <span>{selectedTypeInfo.type_name}</span>
              </>
            ) : (
              "ประเภท: ทั้งหมด"
            )
          }
        >
          <div
            className={`filter-dropdown-item ${!selectedType ? "active" : ""}`}
            onClick={() => setSelectedType("")}
          >
            <div className="type-dropdown-thumb type-dropdown-thumb-empty">
              <FiBox size={12} />
            </div>
            <span>ทั้งหมด</span>
          </div>

          {fabricTypes.map((type) => (
            <div
              key={type.type_id}
              className={`filter-dropdown-item ${
                selectedType === String(type.type_id) ? "active" : ""
              }`}
              onClick={() => setSelectedType(String(type.type_id))}
            >
              {type.image_path ? (
                <img
                  src={getFabricImageUrl(type.image_path)}
                  alt={type.type_name}
                  className="type-dropdown-thumb"
                />
              ) : (
                <div className="type-dropdown-thumb type-dropdown-thumb-empty">
                  <FiBox size={12} />
                </div>
              )}
              <span className="filter-dropdown-name">{type.type_name}</span>

              <label
                className="type-dropdown-upload"
                title={type.image_path ? "แก้ไขรูป" : "เพิ่มรูป"}
                onClick={(e) => e.stopPropagation()}
              >
                <FiCamera size={13} />
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  disabled={uploadingTypeId === type.type_id}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    handleTypeImageUpload(type, file);
                    e.target.value = "";
                  }}
                />
              </label>
            </div>
          ))}
        </FilterDropdown>

        <FilterDropdown
          triggerContent={
            selectedColor
              ? colors.find((c) => String(c.color_id) === selectedColor)?.color_name
              : "สี: ทั้งหมด"
          }
        >
          <div
            className={`filter-dropdown-item ${!selectedColor ? "active" : ""}`}
            onClick={() => setSelectedColor("")}
          >
            <span className="filter-dropdown-name">ทั้งหมด</span>
          </div>
          {colors.map((color) => (
            <div
              key={color.color_id}
              className={`filter-dropdown-item ${
                selectedColor === String(color.color_id) ? "active" : ""
              }`}
              onClick={() => setSelectedColor(String(color.color_id))}
            >
              <span className="filter-dropdown-name">{color.color_name}</span>
            </div>
          ))}
        </FilterDropdown>

        <FilterDropdown triggerContent={selectedStatus || "สถานะ: ทั้งหมด"}>
          {["", "พร้อมใช้งาน", "ใกล้หมด", "หมด"].map((status) => (
            <div
              key={status || "all"}
              className={`filter-dropdown-item ${selectedStatus === status ? "active" : ""}`}
              onClick={() => setSelectedStatus(status)}
            >
              <span className="filter-dropdown-name">{status || "ทั้งหมด"}</span>
            </div>
          ))}
        </FilterDropdown>

        <div className="date-wrapper">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </div>

      </div>

      <div className="fabric-table-container">
        <table className="fabric-main-table">
          <thead>
            <tr>
              <th>รูปภาพ</th>
              <th>รหัสม้วน</th>
              <th>Lot</th>
              <th>ชื่อผ้า</th>
              <th>ประเภท</th>
              <th>สี</th>
              <th>ซื้อเมื่อ</th>
              <th>ความยาว/คงเหลือ</th>
              <th>สถานะ</th>
              <th>จัดการ</th>
            </tr>
          </thead>
          <tbody>
          {filteredRolls.map((roll) => (
            <tr key={roll.roll_id}>
              <td>
                {roll.image_path ? (
                  <button
                    type="button"
                    className="fabric-thumb-btn"
                    title="คลิกเพื่อดูรูปขยาย"
                    onClick={() =>
                      setZoomImage({
                        src: getFabricImageUrl(roll.image_path),
                        alt: roll.fabric_name || "ผ้า",
                        caption: [roll.roll_code, roll.fabric_name].filter(Boolean).join(" · "),
                      })
                    }
                  >
                    <img
                      src={getFabricImageUrl(roll.image_path)}
                      alt={roll.fabric_name || "ผ้า"}
                      className="fabric-thumb"
                    />
                  </button>
                ) : (
                  <div className="fabric-thumb fabric-thumb-empty">
                    <FiBox size={16} />
                  </div>
                )}
              </td>
              <td className="font-bold">{roll.roll_code || `FR-${String(roll.roll_id).padStart(3, "0")}`}</td>
              <td>{roll.lot_number}</td>
              <td>{roll.fabric_name}</td>
              <td className="text-muted">{roll.type_name}</td>
              <td>{roll.color_name || 'ไม่ระบุ'}</td>
              <td>{new Date(roll.purchase_date).toLocaleDateString("th-TH",{
                    day:"2-digit",
                    month:"short",
                    year:"numeric"
                  })}</td>
              <td>{roll.initial_length} / {roll.remaining_length} ม.</td>
              <td>
               {getRollStatus(roll) === "หมด" ? (
                <span className="status-badge warning">หมด</span>
              ) : getRollStatus(roll) === "ใกล้หมด" ? (
                <span className="status-badge warning">ใกล้หมด</span>
              ) : (
                <span className="status-badge ready">พร้อมใช้งาน</span>
              )}
              </td>
              <td className="action-cell">
                <div className="fabric-action-group">
                  <button
                    className="view-btn"
                    onClick={() =>
                     navigate(`/Fabric/detail/${roll.roll_id}`)
                    }
                  >
                    <FiEye size={16} />
                  </button>
                  <button
                    className="edit-btn"
                    onClick={() =>
                      navigate(`/Fabric/edit/${roll.roll_id}`)
                    }
                  >
                    <FiEdit2 size={16} />
                  </button>
                  <button
                    className="delete-btn"
                    onClick={() => handleDelete(roll)}
                    title="ลบ"
                  >
                    <FiTrash2 size={16} />
                  </button>
                </div>
              </td>
            </tr>
            ))}
            {filteredRolls.length === 0 && (
              <tr>
                <td colSpan={10} className="fabric-empty-row">
                  ไม่พบข้อมูลผ้าที่ตรงกับเงื่อนไขค้นหา
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <ImageLightbox
        src={zoomImage?.src}
        alt={zoomImage?.alt}
        caption={zoomImage?.caption}
        onClose={() => setZoomImage(null)}
      />
    </div>
  );
}
