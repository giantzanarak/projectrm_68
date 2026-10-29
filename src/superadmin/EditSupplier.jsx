import { useState, useEffect, useRef } from 'react';
import { onlyDigits, isValidPhone, PHONE_HINT } from "../utils/phone";
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import { FiSave, FiPhone, FiUser, FiCamera, FiTrash2, FiCheckCircle } from "react-icons/fi";
import '../styles/EditSupplier.css';
import { getSupplier, editSupplier } from "../api/fetch_api_superadmin";
import { geocodeAddress } from "../utils/geocode";
import AddressMapPicker from "../components/AddressMapPicker";

import { IMAGE_BASE as IMAGE_URL } from "../api/http";

const EditSupplier = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const fileInputRef = useRef(null);

    const [formData, setFormData] = useState({
        name: '',
        contactName: '',
        phone: '',
        email: '',
        address: '',
        note: '',
        status: 'active'
    });

    const [imageFile, setImageFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [removeImage, setRemoveImage] = useState(false);

    const [coords, setCoords] = useState(null);

    useEffect(() => {
    const fetchData = async () => {
        try {
            const data = await getSupplier(id);

            setFormData({
                name: data.supplier_name || '',
                contactName: data.contact_name || '',
                phone: data.phone || '',
                email: data.email || '',
                address: data.address || '',
                note: data.note || '',
                status: data.status || 'active'
            });

            setPreviewUrl(data.image ? `${IMAGE_URL}${data.image}` : null);

            if (data.lat != null && data.lng != null) {
                setCoords({ lat: Number(data.lat), lng: Number(data.lng) });
            }

            } catch (err) {
                console.error(err);
            }
        };

        fetchData();
    }, [id]);

    const blobUrlRef = useRef(null);
    const setBlobPreview = (url) => {
        if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current);
        blobUrlRef.current = url;
        setPreviewUrl(url);
    };
    useEffect(() => () => {
        if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current);
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: name === "phone" ? onlyDigits(value) : value }));
    };

    const handleAddressBlur = async () => {
        if (coords) return;
        const address = formData.address.trim();
        if (!address) return;

        try {
            const resolved = await geocodeAddress(address);
            setCoords(resolved);
        } catch {
        }
    };

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
        if (!isValidPhone(formData.phone)) {
            await Swal.fire({ icon: "warning", title: "เบอร์โทรไม่ถูกต้อง", text: PHONE_HINT });
            return;
        }
        try {

        const payload = new FormData();
        payload.append("name", formData.name);
        payload.append("contact_name", formData.contactName);
        payload.append("phone", formData.phone);
        payload.append("email", formData.email);
        payload.append("address", formData.address);
        payload.append("note", formData.note);
        payload.append("status", formData.status);
        if (coords) {
            payload.append("lat", coords.lat);
            payload.append("lng", coords.lng);
        }
        if (imageFile) payload.append("image", imageFile);
        if (removeImage) payload.append("removeImage", "true");

        await editSupplier(id, payload);

        await Swal.fire({
            position: "center",
            icon: "success",
            title: "บันทึกข้อมูลสำเร็จ",
            text: `อัปเดตข้อมูลผู้จัดจำหน่าย ${formData.name} เรียบร้อยแล้ว`,
            showConfirmButton: false,
            timer: 1500
        });

        navigate("/Supplier");

        } catch (err) {
        console.error(err);
        await Swal.fire({
            icon: "error",
            title: "อัปเดตไม่สำเร็จ",
            text: "ไม่สามารถบันทึกข้อมูลผู้จัดจำหน่ายได้",
            confirmButtonText: "ปิด"
        });
        }
    };

    return (
        <div className="edit-supplier-container">
            <div className="edit-supplier-header">
                <div className="header-text">
                    <h2 className="editsupplier-title">แก้ไขข้อมูลผู้จัดจำหน่าย</h2>
                    <p className="editsupplier-subtitle">ตรวจสอบและปรับปรุงข้อมูลของผู้จัดจำหน่ายให้เป็นปัจจุบัน</p>
                </div>
            </div>

            <div className="form-card">
                
                <div className="form-section-header">
                    <h3>ข้อมูลหลัก</h3>
                </div>

                <div className="supplier-avatar-upload">
                    <div className="supplier-avatar-preview">
                        {previewUrl ? (
                            <img src={previewUrl} alt="รูปผู้ติดต่อ" />
                        ) : (
                            <FiUser size={32} />
                        )}
                    </div>
                    <div className="supplier-avatar-actions">
                        <button
                            type="button"
                            className="supplier-avatar-btn"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <FiCamera size={14} /> {previewUrl ? "เปลี่ยนรูป" : "เพิ่มรูปผู้ติดต่อ"}
                        </button>
                        {previewUrl && (
                            <button
                                type="button"
                                className="supplier-avatar-btn supplier-avatar-btn--danger"
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

                <div className="form-grid">
                    <div className="input-group full-width">
                        <label>ชื่อร้าน/บริษัท <span className="required">*</span></label>
                        <input name="name" type="text" value={formData.name} onChange={handleChange} placeholder="ระบุชื่อร้านค้าหรือบริษัท" />
                    </div>

                    <div className="input-group">
                        <label>ผู้ติดต่อ <span className="required">*</span></label>
                        <div className="input-with-icon">
                            <FiUser className="inner-icon" />
                            <input name="contactName" type="text" value={formData.contactName} onChange={handleChange} placeholder="ชื่อ-นามสกุล ผู้ประสานงาน" />
                        </div>
                    </div>

                    <div className="input-group">
                        <label>เบอร์โทรศัพท์ <span className="required">*</span></label>
                        <div className="input-with-icon">
                            <FiPhone className="inner-icon" />
                            <input name="phone" type="tel" inputMode="numeric" maxLength={10} value={formData.phone} onChange={handleChange} placeholder="0812345678" />
                        </div>
                    </div>
                </div>

                <div className="section-divider"></div>

                <div className="form-section-header">
                    <h3>ข้อมูลที่อยู่</h3>
                </div>

                <div className="form-grid">
                    <div className="input-group full-width">
                        <label>ที่อยู่/บ้านเลขที่</label>
                        <textarea
                            name="address"
                            type="text"
                            value={formData.address}
                            onChange={handleChange}
                            onBlur={handleAddressBlur}
                            placeholder="เลขที่บ้าน, อาคาร, ซอย, ถนน"
                        />
                    </div>

                    <div className="input-group full-width">
                        <label>พิกัดร้าน</label>
                        {coords && (
                            <p className="map-link-status map-link-status--ok">
                                <FiCheckCircle /> พบพิกัด: {coords.lat.toFixed(6)}, {coords.lng.toFixed(6)}
                            </p>
                        )}
                        <AddressMapPicker coords={coords} onCoordsChange={setCoords} />
                    </div>
                </div>

                <div className="section-divider"></div>

                <div className="input-group full-width">
                    <label>หมายเหตุ</label>
                    <textarea 
                        name="note"
                        value={formData.note}
                        onChange={handleChange}
                        placeholder="ระบุหมายเหตุเพิ่มเติม (ถ้ามี)"
                    ></textarea>
                </div>

                <div className="status-container">
                    <label className="section-label">สถานะการใช้งาน</label>
                    <div className="radio-group">
                        <label className="radio-item">
                            <input type="radio" name="status" value="active" checked={formData.status === 'active'} onChange={handleChange} />
                            <span className="radio-dot-custom active"></span> ใช้งาน
                        </label>
                        <label className="radio-item">
                            <input type="radio" name="status" value="inactive" checked={formData.status === 'inactive'} onChange={handleChange} />
                            <span className="radio-dot-custom inactive"></span> ปิดใช้งาน
                        </label>
                    </div>
                </div>

                <div className="form-footer-action">
                    <button className="btn-cancel-flat" onClick={() => navigate(-1)}>ยกเลิกการแก้ไข</button>
                    <button className="btn-submit-primary" onClick={handleSubmit}>
                        <FiSave /> อัปเดตข้อมูลผู้จัดจำหน่าย
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EditSupplier;
