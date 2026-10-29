import { useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";
import OutfitEditor from "../components/OutfitEditor";
import {
  getOutfits, createOutfit, updateOutfit, deleteOutfit, partNamesOf,
} from "../api/outfitApi";
import { FiSearch, FiEdit2, FiTrash2 } from "react-icons/fi";
import "../styles/fabric.css";
import "../styles/logs.css";
import "../styles/listPage.css";
import "../styles/outfit.css";

const swalTheme = {
  popup: "of-swal-popup",
  confirmButton: "of-swal-confirm",
  cancelButton: "of-swal-cancel",
};
const swalDanger = { ...swalTheme, confirmButton: "of-swal-danger" };

export default function OutfitFormulas() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [editing, setEditing] = useState(null);
  const [draft, setDraft] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      setLoading(true);
      setList(await getOutfits());
    } catch {
      Swal.fire({
        icon: "error", title: "โหลดข้อมูลไม่สำเร็จ",
        text: "เชื่อมต่อระบบไม่ได้ ตรวจสอบว่าเซิร์ฟเวอร์เปิดอยู่",
        confirmButtonText: "ตกลง", buttonsStyling: false, customClass: swalTheme,
      });
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    const t = search.trim().toLowerCase();
    if (!t) return list;
    return list.filter((f) =>
      f.outfit_name.toLowerCase().includes(t)
      || partNamesOf(f).some((n) => n.toLowerCase().includes(t))
    );
  }, [list, search]);

  const openAdd = () => {
    setEditing({});
    setDraft({ outfitName: "", parts: ["เสื้อ"] });
  };

  const openEdit = (f) => {
    setEditing(f);
    setDraft({
      outfitName: f.outfit_name,
      parts: partNamesOf(f),
    });
  };

  const close = () => { setEditing(null); setDraft(null); };

  const problem = !draft
    ? "ยังไม่มีข้อมูล"
    : !String(draft.outfitName || "").trim()
      ? "กรอกชื่อแบบชุด"
      : !(draft.parts || []).some((x) => String(x).trim()) ? "เพิ่มชิ้นส่วนชุดอย่างน้อย 1 ชิ้น" : null;

  const handleSave = async () => {
    if (problem) return;
    try {
      setSaving(true);
      if (editing?.formula_id) await updateOutfit(editing.formula_id, draft);
      else await createOutfit({ ...draft, sortOrder: list.length + 1 });

      await Swal.fire({
        icon: "success",
        title: editing?.formula_id ? "แก้ไขสำเร็จ" : "เพิ่มแบบชุดสำเร็จ",
        text: "หน้าคำนวณราคาชุดใช้แบบชุดนี้ได้ทันที",
        confirmButtonText: "ตกลง", buttonsStyling: false, customClass: swalTheme,
      });
      close();
      load();
    } catch (err) {
      Swal.fire({
        icon: "error", title: "บันทึกไม่สำเร็จ",
        text: err?.response?.data?.message || "เกิดข้อผิดพลาด",
        confirmButtonText: "ตกลง", buttonsStyling: false, customClass: swalTheme,
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (f) => {
    const ok = await Swal.fire({
      icon: "warning",
      title: "ลบแบบชุดนี้?",
      html: `<b>${f.outfit_name}</b><br/>จะไม่แสดงในหน้าคำนวณราคาชุดอีก (ข้อมูลเดิมยังเก็บไว้)`,
      showCancelButton: true, confirmButtonText: "ลบ", cancelButtonText: "ยกเลิก",
      reverseButtons: true, buttonsStyling: false, customClass: swalDanger,
    });
    if (!ok.isConfirmed) return;
    try {
      await deleteOutfit(f.formula_id);
      setList((prev) => prev.filter((x) => x.formula_id !== f.formula_id));
    } catch (err) {
      Swal.fire({
        icon: "error", title: "ลบไม่สำเร็จ",
        text: err?.response?.data?.message || "เกิดข้อผิดพลาด",
        confirmButtonText: "ตกลง", buttonsStyling: false, customClass: swalTheme,
      });
      load();
    }
  };

  return (
    <div className="fabric-container of-root">

      <div className="fabric-header">
        <div className="header-left">
          <h2 className="fabric-title">แบบชุด</h2>
          <p className="fabric-subtitle">แบบชุดที่ร้านรับตัด และชิ้นส่วนของแต่ละชุด — ใช้ขึ้นแถวผ้าในหน้าคำนวณราคาชุด</p>
        </div>
        <button className="add-roll-btn page-add-btn" onClick={openAdd}>
          <span className="plus-icon">+</span> เพิ่มแบบชุด
        </button>
      </div>

      <div className="fabric-filter-section">
        <div className="search-wrapper">
          <FiSearch className="search-icon" />
          <input
            type="text"
            placeholder="ค้นหาแบบชุด หรือชิ้นส่วน"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <span className="log-result-count">พบ {filtered.length} แบบ</span>
      </div>

      <div className="fabric-table-container">
        <table className="fabric-main-table outfit-table">
          <thead>
            <tr>
              <th>แบบชุด</th>
              <th>ชิ้นส่วนชุด</th>
              <th className="c">จัดการ</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={3} className="fabric-empty-row">กำลังโหลด...</td></tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={3} className="fabric-empty-row">
                  {search ? "ไม่พบแบบชุดที่ค้นหา" : "ยังไม่มีแบบชุด กด \"เพิ่มแบบชุด\" เพื่อเริ่ม"}
                </td>
              </tr>
            ) : (
              filtered.map((f) => {
                const parts = partNamesOf(f);
                return (
                  <tr key={f.formula_id}>
                    <td>
                      <button className="table-link" onClick={() => openEdit(f)}>{f.outfit_name}</button>
                      <small className="cell-sub">{parts.length} ชิ้นส่วน</small>
                    </td>
                    <td>
                      {parts.length ? (
                        <div className="outfit-chips">
                          {parts.map((n, i) => <span key={i} className="log-module-badge">{n}</span>)}
                        </div>
                      ) : <span className="text-muted">—</span>}
                    </td>
                    <td className="action-cell">
                      <div className="fabric-action-group">
                        <button className="edit-btn" title="แก้ไข" onClick={() => openEdit(f)}>
                          <FiEdit2 size={16} />
                        </button>
                        <button className="delete-btn" title="ลบ" onClick={() => handleDelete(f)}>
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
      </div>

      {editing && (
        <div className="of-backdrop" onClick={close}>
          <div className="of-modal" onClick={(e) => e.stopPropagation()}>
            <div className="of-modal-head">
              <h2>{editing.formula_id ? "แก้ไขแบบชุด" : "เพิ่มแบบชุดใหม่"}</h2>
              <button className="of-close" onClick={close} aria-label="ปิด">✕</button>
            </div>

            <div className="of-modal-body">
              <OutfitEditor value={draft} onChange={setDraft} />
            </div>

            <div className="of-modal-foot">
              {problem && <span className="of-problem">{problem}</span>}
              <button className="of-btn-ghost" onClick={close}>ยกเลิก</button>
              <button className="of-btn-primary" onClick={handleSave} disabled={saving || !!problem}>
                {saving ? "กำลังบันทึก..." : "บันทึก"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
