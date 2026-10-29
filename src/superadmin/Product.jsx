import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_BASE, IMAGE_BASE } from "../api/http";
import Swal from "sweetalert2";
import {
  FiSearch, FiEye, FiEdit2, FiTrash2, FiPackage, FiCheckCircle, FiScissors, FiDollarSign,
} from "react-icons/fi";
import { saleStatusOf, SALE_STATUSES, SOURCE_LABELS, STATUS_CUTTING } from "../utils/productStatus";
import { rangeText } from "../utils/productSizes";
import SizeRangeModal from "../components/SizeRangeModal";
import "../styles/fabric.css";
import "../styles/logs.css";
import "../styles/listPage.css";
import "../styles/product.css";

export default function ProductPage() {
  const API = `${API_BASE}/api/products`;
  const IMAGE_URL = IMAGE_BASE;
  const navigate = useNavigate();

  const [categoryOptions, setCategoryOptions] = useState([
    "ชุดผ้าไหม", "ชุดไทยประยุกต์", "ผ้าฝ้าย", "ผ้าพันคอ",
  ]);

  const statusOptions = ["พร้อมขาย", "ไม่พร้อมขาย"];

  const saleStatus = (p) => saleStatusOf(p.status, p.stock_qty);
  const isMade = (p) => p?.source === "made";

  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ทั้งหมด");
  const [statusFilter, setStatusFilter] = useState("ทั้งหมด");
  const [sourceFilter, setSourceFilter] = useState("ทั้งหมด");

  const [showModal, setShowModal] = useState(false);
  const [viewModal, setViewModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [selected, setSelected] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const initialForm = {
    name: "",
    pattern: "",
    size: "",
    price: "",
    cost: "",
    category: "",
    status: "พร้อมขาย",
    stock_qty: "1",
    supplier_name: "",
    description: "",
    image: null,
  };

  const [form, setForm] = useState(initialForm);

  const editingProduct = editId ? products.find((p) => p.id === editId) : null;
  const editingMade = isMade(editingProduct);
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    fetchProducts();
    axios.get(`${API_BASE}/product-categories`)
      .then((r) => {
        const names = (r.data || []).filter((c) => !c.deleted_at).map((c) => c.category_name);
        if (names.length) setCategoryOptions(names);
      })
      .catch(() => {});
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await axios.get(API);
      setProducts(res.data || []);
    } catch {
      Swal.fire({
        icon: "error",
        title: "โหลดข้อมูลไม่สำเร็จ",
        text: "ไม่สามารถดึงข้อมูลสินค้าได้",
        confirmButtonText: "ตกลง",
      });
    }
  };

  const totalValue = useMemo(() => {
    return products.reduce((sum, p) => sum + Number(p.price || 0) * (Number(p.stock_qty) || 0), 0);
  }, [products]);

  const totalReady = useMemo(() => {
    return products.filter((p) => saleStatus(p) === "พร้อมขาย").length;
  }, [products]);

  const totalCutting = useMemo(() => {
    return products.filter((p) => p.status === STATUS_CUTTING).length;
  }, [products]);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const term = search.trim().toLowerCase();
      const matchSearch = !term ||
        p.name?.toLowerCase().includes(term) ||
        p.pattern?.toLowerCase().includes(term) ||
        p.category?.toLowerCase().includes(term) ||
        p.lot_code?.toLowerCase().includes(term);
      const matchCategory =
        categoryFilter === "ทั้งหมด" || p.category === categoryFilter;
      const matchStatus =
        statusFilter === "ทั้งหมด" || saleStatus(p) === statusFilter;
      const matchSource =
        sourceFilter === "ทั้งหมด" || p.source === sourceFilter;
      return matchSearch && matchCategory && matchStatus && matchSource;
    });
  }, [products, search, categoryFilter, statusFilter, sourceFilter]);

  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentItems = filtered.slice(indexOfFirst, indexOfLast);

  const resetForm = () => {
    setForm(initialForm);
    setEditId(null);
    setImagePreview(null);
  };

  const openAdd = () => {
    resetForm();
    setShowModal(true);
  };

  const openEdit = (p) => {
    setEditId(p.id);
    setForm({
      name: p.name || "",
      pattern: p.pattern || "",
      size: p.size || "",
      price: p.price || "",
      cost: p.cost || "",
      category: p.category || "",
      status: p.status || "พร้อมขาย",
      stock_qty: String(Number(p.stock_qty) || 0),
      supplier_name: p.supplier_name || "",
      description: p.description || "",
      image: null,
    });
    setImagePreview(p.image ? IMAGE_URL + p.image : null);
    setShowModal(true);
  };

  const openView = (p) => {
    setSelected(p);
    setViewModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    resetForm();
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0] || null;
    setForm({ ...form, image: file });
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    const missing = !form.name || !form.price || !form.category
      || (!editingMade && (form.stock_qty === "" || !form.supplier_name.trim()));
    if (missing) {
      Swal.fire({
        icon: "warning",
        title: "กรอกข้อมูลไม่ครบ",
        text: editingMade
          ? "กรุณากรอกชื่อสินค้า ราคาขาย และประเภท"
          : "กรุณากรอกชื่อสินค้า ราคาขาย ประเภท จำนวนที่รับเข้า และรับมาจากที่ไหน",
        confirmButtonText: "ตกลง",
      });
      return;
    }

    const skip = editingMade ? ["cost", "stock_qty", "supplier_name"] : [];
    const data = new FormData();
    Object.keys(form).forEach((key) => {
      if (form[key] !== null && form[key] !== undefined && !skip.includes(key)) {
        data.append(key, form[key]);
      }
    });

    try {
      if (editId) {
        const result = await Swal.fire({
          icon: "question",
          title: "ยืนยันการแก้ไข?",
          text: "คุณต้องการบันทึกการเปลี่ยนแปลงสินค้านี้ใช่หรือไม่",
          showCancelButton: true,
          confirmButtonText: "บันทึกเลย",
          cancelButtonText: "ยกเลิก",
          reverseButtons: true,
        });
        if (!result.isConfirmed) return;

        await axios.put(`${API}/${editId}`, data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        await Swal.fire({
          icon: "success",
          title: "แก้ไขสำเร็จ",
          text: "อัปเดตข้อมูลสินค้าเรียบร้อยแล้ว",
          confirmButtonText: "ตกลง",
        });
      } else {
        await axios.post(API, data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        await Swal.fire({
          icon: "success",
          title: "บันทึกสำเร็จ",
          text: "เพิ่มสินค้ารับมาขายเรียบร้อยแล้ว",
          confirmButtonText: "ตกลง",
        });
      }

      setShowModal(false);
      setCurrentPage(1);
      fetchProducts();
      resetForm();
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "บันทึกไม่สำเร็จ",
        text: error?.response?.data?.message || "เกิดข้อผิดพลาดในการบันทึกข้อมูล",
        confirmButtonText: "ตกลง",
      });
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "ยืนยันการลบสินค้า?",
      text: "เมื่อลบแล้วจะไม่สามารถกู้คืนได้",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "ลบสินค้า",
      cancelButtonText: "ยกเลิก",
      reverseButtons: true,
    });
    if (!result.isConfirmed) return;

    try {
      await axios.delete(`${API}/${id}`);
      Swal.fire({
        icon: "success",
        title: "ลบสำเร็จ",
        text: "ลบข้อมูลสินค้าเรียบร้อยแล้ว",
        confirmButtonText: "ตกลง",
      });
      fetchProducts();
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "ลบไม่สำเร็จ",
        text: error.response?.data?.message || "ไม่สามารถลบข้อมูลสินค้าได้",
        confirmButtonText: "ตกลง",
      });
    }
  };

  const [sizeEdit, setSizeEdit] = useState(null);

  const profit = Number(form.price || 0) - Number(form.cost || 0);

  const STATUS_BADGE = {
    "พร้อมขาย": "log-badge-success",
    [STATUS_CUTTING]: "log-badge-warning",
    "ขายหมด": "log-badge-warning",
    "ไม่พร้อมขาย": "log-badge-error",
  };

  return (
    <div className="fabric-container pp-root">

      <div className="fabric-header">
        <div className="header-left">
          <h2 className="fabric-title">จัดการสินค้า</h2>
          
        </div>
        <div className="pp-header-actions">
          <button className="pp-btn-outline" onClick={() => navigate("/fabriccalc")}>
            <FiScissors size={15} /> ตัดชุดใหม่
          </button>
          <button className="add-roll-btn page-add-btn" onClick={openAdd}>
            <span className="plus-icon">+</span> เพิ่มสินค้ารับมาขาย
          </button>
        </div>
      </div>

      <div className="summary-container-logs">
        <div className="summary-card">
          <div className="card-content">
            <span className="card-label">สินค้าทั้งหมด</span>
            <h2 className="card-value">{products.length.toLocaleString()}</h2>
          </div>
          <div className="card-icon-box bg-gray-light"><FiPackage size={24} /></div>
        </div>

        <div className="summary-card">
          <div className="card-content">
            <span className="card-label">พร้อมขาย</span>
            <h2 className="card-value">{totalReady}</h2>
          </div>
          <div className="card-icon-box bg-gray-light"><FiCheckCircle size={24} /></div>
        </div>

        <div className="summary-card">
          <div className="card-content">
            <span className="card-label">กำลังตัด (ยังขายไม่ได้)</span>
            <h2 className="card-value">{totalCutting}</h2>
          </div>
          <div className="card-icon-box bg-gray-light"><FiScissors size={24} /></div>
        </div>

        <div className="summary-card">
          <div className="card-content">
            <span className="card-label">มูลค่าสินค้าในคลัง</span>
            <h2 className="card-value">฿{totalValue.toLocaleString()}</h2>
          </div>
          <div className="card-icon-box bg-gray-light"><FiDollarSign size={24} /></div>
        </div>
      </div>

      <div className="fabric-filter-section">
        <div className="search-wrapper">
          <FiSearch className="search-icon" />
          <input
            type="text"
            placeholder="ค้นหาชื่อสินค้า / ลาย / ประเภท / เลขล็อต..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
          />
        </div>

        <select
          className="filter-select"
          value={categoryFilter}
          onChange={(e) => { setCategoryFilter(e.target.value); setCurrentPage(1); }}
        >
          <option value="ทั้งหมด">ทุกประเภท</option>
          {categoryOptions.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>

        <select
          className="filter-select"
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
        >
          <option value="ทั้งหมด">ทุกสถานะ</option>
          {SALE_STATUSES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>

        <select
          className="filter-select"
          value={sourceFilter}
          onChange={(e) => { setSourceFilter(e.target.value); setCurrentPage(1); }}
        >
          <option value="ทั้งหมด">ทุกแหล่งที่มา</option>
          {Object.entries(SOURCE_LABELS).map(([k, label]) => (
            <option key={k} value={k}>{label}</option>
          ))}
        </select>

        {(search || categoryFilter !== "ทั้งหมด" || statusFilter !== "ทั้งหมด" || sourceFilter !== "ทั้งหมด") && (
          <button className="filter-clear-btn" onClick={() => { setSearch(""); setCategoryFilter("ทั้งหมด"); setStatusFilter("ทั้งหมด"); setSourceFilter("ทั้งหมด"); setCurrentPage(1); }}>
            ล้างตัวกรอง ✕
          </button>
        )}

        <span className="log-result-count">พบ {filtered.length} รายการ</span>
      </div>

      <div className="fabric-table-container">
        <table className="fabric-main-table products-table">
          <thead>
            <tr>
              <th>รูปภาพ</th>
              <th>สินค้า</th>
              <th>ประเภท</th>
              <th className="r">ราคาขาย</th>
              <th className="r">ต้นทุน</th>
              <th className="r">กำไร</th>
              <th>สถานะ</th>
              <th className="c">จัดการ</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.length === 0 ? (
              <tr><td colSpan={8} className="fabric-empty-row">ไม่มีสินค้าที่ตรงกับเงื่อนไข</td></tr>
            ) : (
              currentItems.map((p) => {
                const price = Number(p.price || 0);
                const cost = Number(p.cost || 0);
                const profitVal = price - cost;
                const profitPct = cost > 0 ? Math.round((profitVal / cost) * 100) : 0;
                const status = saleStatus(p);
                const subText = p.lot_code ? `ล็อต ${p.lot_code}` : "";

                return (
                  <tr key={p.id} className={status === "พร้อมขาย" ? "" : "is-off"}>
                    <td>
                      <button className="pp-thumb-btn" onClick={() => openView(p)} title="ดูรายละเอียด">
                        {p.image ? (
                          <img src={IMAGE_URL + p.image} alt={p.name} className="fabric-thumb" />
                        ) : (
                          <div className="fabric-thumb fabric-thumb-empty"><FiPackage size={16} /></div>
                        )}
                      </button>
                    </td>
                    <td>
                      <button className="table-link" onClick={() => openView(p)}>{p.name}</button>
                      {subText && <small className="cell-sub">{subText}</small>}
                    </td>
                    <td>
                      {p.category
                        ? <span className="log-module-badge">{p.category}</span>
                        : <span className="text-muted">—</span>}
                    </td>
                    <td className="r font-bold">฿{price.toLocaleString()}</td>
                    <td className="r">{cost > 0 ? `฿${cost.toLocaleString()}` : <span className="text-muted">—</span>}</td>
                    <td className={`r pp-row-profit ${profitVal >= 0 ? "pos" : "neg"}`}>
                      {profitVal >= 0 ? "+" : ""}฿{profitVal.toLocaleString()}
                      {cost > 0 && <small> ({profitPct}%)</small>}
                    </td>
                    <td>
                      <span className={`log-status-badge ${STATUS_BADGE[status]}`}>{status}</span>
                    </td>
                    <td className="action-cell">
                      <div className="fabric-action-group">
                        <button className="view-btn" title="ดูรายละเอียด" onClick={() => openView(p)}>
                          <FiEye size={16} />
                        </button>
                        <button className="edit-btn" title="แก้ไข" onClick={() => openEdit(p)}>
                          <FiEdit2 size={16} />
                        </button>
                        <button className="delete-btn" title="ลบสินค้า" onClick={() => handleDelete(p.id)}>
                          <FiTrash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        {totalPages > 1 && (
          <div className="table-pagination">
            <span>หน้า {currentPage} / {totalPages}</span>
            <div className="pagination-btns">
              <button className="page-nav" disabled={currentPage === 1} onClick={() => setCurrentPage((p) => p - 1)}>‹</button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                <button key={n} className={`page-num ${n === currentPage ? "active" : ""}`} onClick={() => setCurrentPage(n)}>{n}</button>
              ))}
              <button className="page-nav" disabled={currentPage === totalPages} onClick={() => setCurrentPage((p) => p + 1)}>›</button>
            </div>
          </div>
        )}
      </div>

      {showModal && (
        <div className="pp-backdrop" onClick={closeModal}>
          <div className="pp-modal" onClick={(e) => e.stopPropagation()}>
            <div className="pp-modal-header">
              <div>
                <p className="pp-modal-eyebrow">
                  {editId ? `แก้ไขข้อมูลสินค้า · ${editingMade ? "ร้านตัดเอง" : "รับมาขาย"}` : "เพิ่มสินค้า"}
                </p>
                <h3 className="pp-modal-title">{editId ? "อัปเดตสินค้า" : "สินค้าที่รับมาจากที่อื่น"}</h3>
              </div>
              <button className="pp-modal-close" onClick={closeModal}>✕</button>
            </div>

            <div className="pp-modal-body">
              <p className="pp-source-note">
                {editingMade
                  ? "ชุดนี้ร้านตัดเอง — ต้นทุนและจำนวนมาจากการตัดผ้า แก้จากหน้านี้ไม่ได้"
                  : editId
                    ? "สินค้ารับมาขาย — ปรับจำนวนคงเหลือได้เมื่อรับของเข้าเพิ่ม"
                    : "เพิ่มได้เฉพาะสินค้าที่รับมาขายจากที่อื่น"}
              </p>

              <div className="pp-upload-zone" onClick={() => document.getElementById("pp-file-input").click()}>
                {imagePreview ? (
                  <img src={imagePreview} alt="preview" className="pp-upload-preview" />
                ) : (
                  <div className="pp-upload-placeholder">
                    <svg viewBox="0 0 24 24" width="30" height="30" fill="none">
                      <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.6" />
                      <circle cx="9" cy="10" r="2" stroke="currentColor" strokeWidth="1.6" />
                      <path d="M3 17l5-4 4 3 4-4 5 5" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
                    </svg>
                    <p>คลิกเพื่ออัปโหลดรูปสินค้า</p>
                    <small>PNG, JPG ขนาดไม่เกิน 5MB</small>
                  </div>
                )}
                <input
                  id="pp-file-input"
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={handleImageChange}
                />
              </div>

              <div className="pp-form-grid">
                <div className="pp-field pp-span-2">
                  <label>ชื่อสินค้า <span className="pp-required">*</span></label>
                  <input type="text" placeholder="กรอกชื่อสินค้า" value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })} />
                </div>

                <div className="pp-field">
                  <label>ลาย</label>
                  <input type="text" placeholder="ชื่อลาย" value={form.pattern}
                    onChange={(e) => setForm({ ...form, pattern: e.target.value })} />
                </div>

                <div className="pp-field">
                  <label>ไซส์</label>
                  {editingMade ? (
                    <>
                      <input type="text" value={form.size || "ยังไม่ได้กรอกขนาด"} disabled />
                      
                    </>
                  ) : (
                    <input type="text" placeholder="S / M / L / XL" value={form.size}
                      onChange={(e) => setForm({ ...form, size: e.target.value })} />
                  )}
                </div>

                <div className="pp-field">
                  <label>ราคาขาย (฿) <span className="pp-required">*</span></label>
                  <input type="number" placeholder="0" value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })} />
                </div>

                <div className="pp-field">
                  <label>{editingMade ? "ต้นทุน (฿) จากการตัด" : "ราคาทุนที่รับมา (฿)"}</label>
                  <input type="number" placeholder="0" value={form.cost} disabled={editingMade}
                    onChange={(e) => setForm({ ...form, cost: e.target.value })} />
                </div>

                {!editingMade && (
                  <div className="pp-field pp-span-2">
                    <label>รับมาจาก <span className="pp-required">*</span></label>
                    <input type="text" placeholder="ชื่อร้าน / ผู้ผลิต / แหล่งที่รับมา" value={form.supplier_name}
                      onChange={(e) => setForm({ ...form, supplier_name: e.target.value })} />
                  </div>
                )}

                {form.price && form.cost && (
                  <div className="pp-field pp-span-2">
                    <div className={`pp-profit-preview ${profit >= 0 ? "pos" : "neg"}`}>
                      <span>กำไรโดยประมาณ</span>
                      <strong>฿{profit.toLocaleString()} {form.cost > 0 ? `(${Math.round((profit / Number(form.cost)) * 100)}%)` : ""}</strong>
                    </div>
                  </div>
                )}

                <div className="pp-field">
                  <label>ประเภท <span className="pp-required">*</span></label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                  >
                    <option value="">เลือกประเภท</option>
                    {categoryOptions.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                {editId && <div className="pp-field">
                  <label>สถานะ</label>
                  {form.status === STATUS_CUTTING ? (
                    <>
                      <select value={STATUS_CUTTING} disabled>
                        <option>{STATUS_CUTTING}</option>
                      </select>
                      <small className="pp-field-hint">กด "ตัดเสร็จ" ที่หน้าตั้งราคาขายเมื่อตัดเสร็จแล้ว</small>
                    </>
                  ) : (
                    <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                      {statusOptions.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  )}
                </div>}

                <div className="pp-field">
                  <label>
                    {editingMade ? "คงเหลือ (ชิ้น)" : editId ? "คงเหลือ (ชิ้น)" : "จำนวนที่รับเข้า (ชิ้น)"}
                    {!editingMade && <span className="pp-required"> *</span>}
                  </label>
                  <input type="number" min="0" step="1" value={form.stock_qty} disabled={editingMade}
                    onChange={(e) => setForm({ ...form, stock_qty: e.target.value })} />
                  {editingMade ? (
                    <small className="pp-field-hint">
                      ตัดไว้ {editingProduct.made_qty} ชิ้น · ขายแล้ว {editingProduct.sold_qty || 0} ชิ้น
                    </small>
                  ) : Number(form.stock_qty) <= 0 && form.stock_qty !== "" ? (
                    <small className="pp-field-warn">
                      จำนวน 0 = ขายหมด เปิดบิลขายไม่ได้จนกว่าจะเพิ่มจำนวน
                    </small>
                  ) : editingProduct && Number(editingProduct.sold_qty) > 0 ? (
                    <small className="pp-field-hint">
                      ขายไปแล้ว {editingProduct.sold_qty} ชิ้น 
                    </small>
                  ) : null}
                </div>

                <div className="pp-field pp-span-2">
                  <label>รายละเอียด</label>
                  <textarea placeholder="รายละเอียดสินค้าเพิ่มเติม" value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} />
                </div>
              </div>
            </div>

            <div className="pp-modal-footer">
              <button className="pp-btn-cancel" onClick={closeModal}>ยกเลิก</button>
              <button className="pp-btn-save" onClick={handleSave}>
                {editId ? "บันทึกการแก้ไข" : "บันทึกสินค้ารับมาขาย"}
              </button>
            </div>
          </div>
        </div>
      )}

      {viewModal && selected && (
        <div className="pp-backdrop" onClick={() => setViewModal(false)}>
          <div className="pp-modal pp-view-modal" onClick={(e) => e.stopPropagation()}>
            <button className="pp-modal-close pp-view-close" onClick={() => setViewModal(false)}>✕</button>

            <div className="pp-view-image-wrap">
              {selected.image ? (
                <img src={IMAGE_URL + selected.image} alt={selected.name} className="pp-view-image" />
              ) : (
                <div className="pp-view-no-image">
                  <svg viewBox="0 0 48 48" width="64" height="64" fill="none">
                    <path d="M8 16l16-8 16 8v16l-16 8-16-8V16z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
                    <path d="M8 16l16 8 16-8M24 24v16" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
                  </svg>
                </div>
              )}
              <div className="pp-view-image-overlay">
                <span className={`pp-badge ${saleStatus(selected) === "พร้อมขาย" ? "pp-badge-ready" : "pp-badge-not"}`}>
                  <i className={`pp-dot ${saleStatus(selected) === "พร้อมขาย" ? "dot-green" : "dot-red"}`} />
                  {saleStatus(selected)}
                </span>
              </div>
            </div>

            <div className="pp-view-body">
              <div className="pp-view-top">
                <div>
                  {selected.category && <p className="pp-view-cat">{selected.category}</p>}
                  <h2 className="pp-view-name">{selected.name}</h2>
                  {selected.pattern && <p className="pp-view-pattern">ลาย {selected.pattern}</p>}
                </div>
                <div className="pp-view-price-block">
                  <span className="pp-view-price">฿{Number(selected.price || 0).toLocaleString()}</span>
                  <span className={`pp-row-profit ${(Number(selected.price || 0) - Number(selected.cost || 0)) >= 0 ? "pos" : "neg"}`}>
                    กำไร ฿{(Number(selected.price || 0) - Number(selected.cost || 0)).toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="pp-view-table">
                <div className="pp-view-row">
                  <span>แหล่งที่มา</span>
                  <span>
                    {SOURCE_LABELS[selected.source] || "—"}
                    {!isMade(selected) && selected.supplier_name ? ` · ${selected.supplier_name}` : ""}
                  </span>
                </div>
                <div className="pp-view-row">
                  <span>ขนาดชุด</span>
                  <span>
                    {selected.size_ranges?.length ? (
                      <span className="pp-size-list">
                        {selected.size_ranges.map((r, i) => (
                          <span key={i}><b>{rangeText(r)}</b></span>
                        ))}
                      </span>
                    ) : (selected.size || "—")}
                  </span>
                </div>
                <div className="pp-view-row">
                  <span>ต้นทุน</span><span>฿{Number(selected.cost || 0).toLocaleString()}</span>
                </div>
                <div className="pp-view-row">
                  <span>คงเหลือในคลัง</span>
                  <span>
                    {Number(selected.stock_qty) > 0 ? `${selected.stock_qty} ชิ้น` : "ขายหมดแล้ว"}
                    {Number(selected.sold_qty) > 0 ? ` · ขายแล้ว ${selected.sold_qty} ชิ้น` : ""}
                  </span>
                </div>
                {selected.description && (
                  <div className="pp-view-row pp-view-desc">
                    <span>รายละเอียด</span>
                    <span>{selected.description}</span>
                  </div>
                )}
              </div>

              <div className="pp-view-actions">
                {isMade(selected) && selected.status !== STATUS_CUTTING && (
                  <button className="pp-btn-cancel" onClick={() => { setViewModal(false); setSizeEdit(selected); }}>
                    แก้ขนาดชุด
                  </button>
                )}
                <button className="pp-btn-edit pp-view-edit" onClick={() => { setViewModal(false); openEdit(selected); }}>
                  <svg viewBox="0 0 20 20" width="14" height="14" fill="none"><path d="M13 4l3 3-9 9H4v-3l9-9z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" /></svg>
                  แก้ไขสินค้า
                </button>
                <button className="pp-btn-cancel" onClick={() => setViewModal(false)}>ปิด</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {sizeEdit && (
        <SizeRangeModal product={sizeEdit} mode="edit"
          onClose={() => setSizeEdit(null)} onSaved={fetchProducts} />
      )}
    </div>
  );
}
