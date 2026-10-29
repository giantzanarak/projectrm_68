import { useRef, useState, useEffect } from "react";
import { onlyDigits, isValidPhone, PHONE_HINT } from "../utils/phone";
import Swal from "sweetalert2";
import { useDialog } from "../context/DialogContext";
import { getUsers, addUser, editUser, deleteUser } from "../api/fetch_api_superadmin";
import "../styles/manageusers.css";
import {
  FiPlus,
  FiSearch,
  FiEdit2,
  FiTrash2,
  FiX,
  FiSave,
  FiEye,
  FiEyeOff,
  FiCamera,
  FiUser,
} from "react-icons/fi";
import Select from "../components/Select";

import { IMAGE_BASE as IMAGE_URL } from "../api/http";

const ROLE_LABEL = {
  admin: "เจ้าของร้าน",
  staff: "พนักงาน",
};

const ROLE_CLASS = {
  admin: "role-admin",
  staff: "role-staff",
};

const getUserId = (user) =>
  user?.id ??
  user?.user_id ??
  user?.userId ??
  user?.staff_id ??
  user?.admin_id ??
  null;

const getAvatarSrc = (user) =>
  user?.image ? `${IMAGE_URL}${user.image}` : null;

const UserModal = ({ user, onClose, onSaved }) => {
  const { showAlert } = useDialog();
  const userId = getUserId(user);
  const isEdit = !!userId;
  const fileInputRef = useRef(null);

  const [name, setName]         = useState(user?.name     || "");
  const [nickname, setNickname] = useState(user?.nickname || "");
  const [username, setUsername] = useState(user?.username || "");
  const [email, setEmail]       = useState(user?.email    || "");
  const [phone, setPhone]       = useState(user?.phone    || "");
  const [address, setAddress]   = useState(user?.address  || "");
  const [role, setRole]         = useState(user?.role     || "staff");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw]     = useState(false);
  const [loading, setLoading]   = useState(false);

  const [imageFile, setImageFile]     = useState(null);
  const [previewUrl, setPreviewUrl]   = useState(getAvatarSrc(user));
  const [removeImage, setRemoveImage] = useState(false);

  const blobUrlRef = useRef(null);
  const setBlobPreview = (url) => {
    if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current);
    blobUrlRef.current = url;
    setPreviewUrl(url);
  };
  useEffect(() => () => {
    if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current);
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setBlobPreview(URL.createObjectURL(file));
    setRemoveImage(false);
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setBlobPreview(null);
    setRemoveImage(true);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async () => {
    if (!name || !username || !email) {
      await showAlert("กรุณากรอกชื่อ-นามสกุล username และอีเมล");
      return;
    }
    if (!isEdit && !password) {
      await showAlert("กรุณากรอกรหัสผ่าน");
      return;
    }
    if (!isValidPhone(phone)) {
      await showAlert(PHONE_HINT);
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("nickname", nickname);
      formData.append("username", username);
      formData.append("email", email);
      formData.append("phone", phone);
      formData.append("address", address);
      formData.append("role", role);
      if (password) formData.append("password", password);
      if (imageFile) formData.append("image", imageFile);
      if (removeImage) formData.append("removeImage", "true");

      if (isEdit) {
        await editUser(userId, formData);
      } else {
        await addUser(formData);
      }
      await Swal.fire({
        position: "center",
        icon: "success",
        title: "บันทึกข้อมูลสำเร็จ",
        text: isEdit ? `อัปเดตบัญชี ${name} เรียบร้อยแล้ว` : `เพิ่มบัญชี ${name} เรียบร้อยแล้ว`,
        showConfirmButton: false,
        timer: 1500,
      });
      onSaved();
      onClose();
    } catch (err) {
      console.error(err);
      await showAlert(err.response?.data?.message || "เกิดข้อผิดพลาด", {
        title: "บันทึกข้อมูลไม่สำเร็จ",
        icon: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mu-modal-overlay" onClick={onClose}>
      <div className="mu-modal" onClick={(e) => e.stopPropagation()}>

        <div className="mu-modal-header">
          <h3>{isEdit ? "แก้ไขบัญชีผู้ใช้" : "เพิ่มผู้ใช้ใหม่"}</h3>
          <button className="mu-modal-close" onClick={onClose}>
            <FiX size={18} />
          </button>
        </div>

        <div className="mu-modal-body">

          <div className="mu-avatar-upload">
            <div className="mu-avatar-preview">
              {previewUrl ? (
                <img src={previewUrl} alt="avatar preview" />
              ) : (
                <FiUser size={32} />
              )}
            </div>
            <div className="mu-avatar-actions">
              <button
                type="button"
                className="mu-avatar-btn"
                onClick={() => fileInputRef.current?.click()}
              >
                <FiCamera size={14} /> {previewUrl ? "เปลี่ยนรูป" : "เพิ่มรูป"}
              </button>
              {previewUrl && (
                <button
                  type="button"
                  className="mu-avatar-btn mu-avatar-btn--danger"
                  onClick={handleRemoveImage}
                >
                  <FiTrash2 size={14} /> ลบรูป
                </button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                hidden
                onChange={handleImageChange}
              />
            </div>
          </div>

          <div className="mu-form-grid">

            <div className="mu-input-group full-width">
              <label>ชื่อ-นามสกุล <span className="text-red">*</span></label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="ระบุชื่อ-นามสกุล"
              />
            </div>

            <div className="mu-input-group">
              <label>ชื่อเล่น</label>
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="ระบุชื่อเล่น"
              />
            </div>

            <div className="mu-input-group">
              <label>Username <span className="text-red">*</span></label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="ระบุ username"
              />
            </div>

            <div className="mu-input-group">
              <label>อีเมล <span className="text-red">*</span></label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@email.com"
              />
            </div>

            <div className="mu-input-group">
              <label>เบอร์โทร</label>
              <input
                type="tel"
                inputMode="numeric"
                maxLength={10}
                value={phone}
                onChange={(e) => setPhone(onlyDigits(e.target.value))}
                placeholder="0812345678"
              />
            </div>

            <div className="mu-input-group full-width">
              <label>ที่อยู่</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="ระบุที่อยู่"
              />
            </div>

            <div className="mu-input-group">
              <label>บทบาท</label>
              <Select value={role} onChange={(e) => setRole(e.target.value)}>
                <option value="staff">พนักงาน (Staff)</option>
                <option value="admin">เจ้าของร้าน (Admin)</option>
              </Select>
            </div>

            <div className="mu-input-group">
              <label>
                {isEdit ? "รหัสผ่านใหม่ (เว้นว่างถ้าไม่เปลี่ยน)" : "รหัสผ่าน *"}
              </label>
              <div className="mu-pw-wrapper">
                <input
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  className="mu-pw-toggle"
                  onClick={() => setShowPw(!showPw)}
                >
                  {showPw ? <FiEyeOff size={15} /> : <FiEye size={15} />}
                </button>
              </div>
            </div>

          </div>
        </div>

        <div className="mu-modal-footer">
          <button className="mu-btn-cancel" onClick={onClose}>ยกเลิก</button>
          <button className="mu-btn-save" onClick={handleSubmit} disabled={loading}>
            <FiSave size={14} />
            {loading ? "กำลังบันทึก..." : "บันทึก"}
          </button>
        </div>

      </div>
    </div>
  );
};

const ManageUsers = () => {

  const { showConfirm, showAlert } = useDialog();

  const [users, setUsers]         = useState([]);
  const [search, setSearch]       = useState("");
  const [roleFilter, setRoleFilter] = useState("ทั้งหมด");
  const [modalUser, setModalUser] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const data = await getUsers();
      setUsers(
        (Array.isArray(data) ? data : []).map((user) => ({
          ...user,
          id: getUserId(user),
        }))
      );
    } catch (err) {
      console.error("โหลด users ไม่สำเร็จ:", err);
    }
  };

  const handleDelete = async (user) => {
    const userId = getUserId(user);
    if (!userId) {
      await showAlert("ไม่พบรหัสผู้ใช้ที่ต้องการลบ", {
        title: "เกิดข้อผิดพลาด",
        icon: "error",
      });
      return;
    }

    const confirmed = await showConfirm(`ต้องการลบบัญชี "${user.name}" ใช่หรือไม่?`, {
      title: "ยืนยันการลบ",
      confirmText: "ตกลง",
      cancelText: "ยกเลิก",
    });
    if (!confirmed) {
      await Swal.fire({
        icon: "error",
        title: "ยกเลิกการทำรายการ",
        text: "ข้อมูลผู้ใช้ยังคงอยู่",
        confirmButtonText: "ตกลง",
      });
      return;
    }
    try {
      await deleteUser(userId);
      loadUsers();
      await Swal.fire({
        position: "center",
        icon: "success",
        title: "ลบข้อมูลสำเร็จ",
        text: `ลบบัญชี ${user.name} เรียบร้อยแล้ว`,
        showConfirmButton: false,
        timer: 1500,
      });
    } catch (err) {
      console.error(err);
      await showAlert("ลบไม่สำเร็จ", {
        title: "เกิดข้อผิดพลาด",
        icon: "error",
      });
    }
  };

  const filtered = users.filter((u) => {
    const matchSearch =
      !search ||
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      (u.username || "").toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === "ทั้งหมด" || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  return (
    <div className="mu-container">

      <div className="mu-header">
        <div className="mu-header-info">
          <h1>จัดการพนักงาน</h1>
          <p>เพิ่ม แก้ไข และกำหนดสิทธิ์บัญชีผู้ใช้ในระบบ</p>
        </div>
        <button
          className="mu-btn-add"
          onClick={() => { setModalUser(null); setShowModal(true); }}
        >
          <FiPlus size={15} /> เพิ่มพนักงาน
        </button>
      </div>

      <div className="mu-filter-bar">
        <div className="mu-search-wrapper">
          <FiSearch className="mu-search-icon" />
          <input
            type="text"
            placeholder="ค้นหาชื่อ / username / อีเมล"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select
          className="mu-select"
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
        >
          <option value="ทั้งหมด">ทั้งหมด</option>
          <option value="admin">เจ้าของร้าน</option>
          <option value="staff">พนักงาน</option>
        </Select>
      </div>

      <div className="mu-table-card">
        <table className="mu-table">
          <thead>
            <tr>
              <th>#</th>
              <th></th>
              <th>ชื่อ-นามสกุล</th>
              <th>Username</th>
              <th>อีเมล</th>
              <th>เบอร์โทร</th>
              <th>บทบาท</th>
              <th>เพิ่มเมื่อ</th>
              <th>จัดการ</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={9} className="mu-empty">ไม่พบข้อมูล</td>
              </tr>
            ) : (
              filtered.map((user, i) => (
                <tr key={user.id || user.email || i}>
                  <td className="mu-index">{i + 1}</td>
                  <td>
                    <div className="mu-avatar-cell">
                      {getAvatarSrc(user) ? (
                        <img src={getAvatarSrc(user)} alt={user.name} />
                      ) : (
                        <FiUser size={16} />
                      )}
                    </div>
                  </td>
                  <td className="mu-name">
                    {user.name}
                    {user.nickname && (
                      <span className="mu-nickname"> ({user.nickname})</span>
                    )}
                  </td>
                  <td>{user.username || "-"}</td>
                  <td className="mu-email">{user.email}</td>
                  <td>{user.phone || "-"}</td>
                  <td>
                    <span className={`mu-role-badge ${ROLE_CLASS[user.role] || ""}`}>
                      {ROLE_LABEL[user.role] || user.role}
                    </span>
                  </td>
                  <td className="mu-date">
                    {new Date(user.created_at).toLocaleDateString("th-TH", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                  <td>
                    <div className="mu-actions">
                      <button
                        className="mu-icon-btn"
                        title="แก้ไข"
                        onClick={() => { setModalUser(user); setShowModal(true); }}
                      >
                        <FiEdit2 size={15} />
                      </button>
                      <button
                        className="mu-icon-btn mu-icon-btn--danger"
                        title="ลบ"
                        onClick={() => handleDelete(user)}
                      >
                        <FiTrash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <UserModal
          user={modalUser}
          onClose={() => setShowModal(false)}
          onSaved={loadUsers}
        />
      )}

    </div>
  );
};

export default ManageUsers;
