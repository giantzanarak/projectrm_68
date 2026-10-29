import { useState, useEffect, useRef } from 'react';
import { onlyDigits, isValidPhone, PHONE_HINT } from "../utils/phone";
import { useLocation, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { FiSave, FiPhone, FiMail, FiUser, FiCamera, FiTrash2, FiCheckCircle } from "react-icons/fi";
import '../styles/AddSupplier.css';
import { addSupplier } from "../api/fetch_api_superadmin";
import { geocodeAddress } from "../utils/geocode";
import AddressMapPicker from "../components/AddressMapPicker";

const AddSupplier = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const fileInputRef = useRef(null);

    const returnTo = location.state?.returnTo;
    const returnState = location.state?.returnState || {};
    const goBack = (newSupplierId) => {
        if (!returnTo) return navigate(newSupplierId ? "/Supplier" : -1);
        navigate(returnTo, {
            replace: true,
            state: newSupplierId ? { ...returnState, newSupplierId } : returnState,
        });
    };

    const [formData, setFormData] = useState({
        supplier_name: '',
        contact_name: '',
        phone: '',
        email: '',
        address: '',
        note: '',
        status: 'active'
    });

    const [coords, setCoords] = useState(null);

    const [imageFile, setImageFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);

    useEffect(() => {
        return () => {
            if (previewUrl) URL.revokeObjectURL(previewUrl);
        };
    }, [previewUrl]);

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
        setPreviewUrl(URL.createObjectURL(file));
    };

    const handleRemoveImage = () => {
        setImageFile(null);
        setPreviewUrl(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleSubmit = async () => {
        if (!isValidPhone(formData.phone)) {
            await Swal.fire({ icon: "warning", title: "เบอร์โทรไม่ถูกต้อง", text: PHONE_HINT });
            return;
        }
        try {

            const payload = new FormData();
            Object.entries(formData).forEach(([key, value]) => payload.append(key, value));
            if (coords) {
                payload.append("lat", coords.lat);
                payload.append("lng", coords.lng);
            }
            if (imageFile) payload.append("image", imageFile);

            const created = await addSupplier(payload);

            await Swal.fire({
                position: "center",
                icon: "success",
                title: "บันทึกข้อมูลสำเร็จ",
                text: `เพิ่มผู้จัดจำหน่าย ${formData.supplier_name} เรียบร้อยแล้ว`,
                showConfirmButton: false,
                timer: 1500
            });
            goBack(created?.supplier_id);

        } catch (err) {
            console.error(err);
            await Swal.fire({
                icon: "error",
                title: "เพิ่มไม่สำเร็จ",
                text: "ไม่สามารถเพิ่มข้อมูลผู้จัดจำหน่ายได้",
                confirmButtonText: "ปิด"
            });
        }
    };

    return (
        <div className="add-supplier-container">
            <div className="add-supplier-header">
                <h2 className="addsupplier-title">เพิ่มผู้จัดจำหน่าย</h2>
                <p className="addsupplier-subtitle">กรุณากรอกข้อมูลผู้จัดจำหน่ายให้ครบถ้วนเพื่อความถูกต้องของระบบสต็อกสินค้า</p>
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
                        <input
                          type="text"
                          name="supplier_name"
                          value={formData.supplier_name}
                          onChange={handleChange}
                          placeholder="กรุณากรอกชื่อร้านหรือบริษัท"
                        />
                    </div>

                    <div className="input-group">
                        <label>ผู้ติดต่อ <span className="required">*</span></label>
                        <div className="input-with-icon">
                            <FiUser className="inner-icon" />
                            <input
                                type="text"
                                name="contact_name"
                                value={formData.contact_name}
                                onChange={handleChange}
                                placeholder="ชื่อ-นามสกุล ผู้ประสานงาน"
                            />
                        </div>
                    </div>

                    <div className="input-group">
                        <label>เบอร์โทรศัพท์ <span className="required">*</span></label>
                        <div className="input-with-icon">
                            <FiPhone className="inner-icon" />
                            <input 
                                type="tel" 
                                inputMode="numeric"
                                maxLength={10}
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                placeholder="0812345678" 
                            />
                        </div>
                    </div>

                    <div className="input-group full-width">
                        <label>อีเมล</label>
                        <div className="input-with-icon">
                            <FiMail className="inner-icon" />
                            <input 
                                type="email" 
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="example@email.com" 
                            />
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
                            rows="13"
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                            onBlur={handleAddressBlur}
                            placeholder="เลขที่อาคาร, ถนน, ซอย..."
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

                <div className="form-section-header">
                    <h3>ข้อมูลเพิ่มเติมและสถานะ</h3>
                </div>

                <div className="input-group full-width">
                    <label>หมายเหตุ</label>
                    <textarea 
                        rows="13"
                        name="note"
                        value={formData.note}
                        onChange={handleChange}
                        placeholder="รายละเอียดเพิ่มเติมเกี่ยวกับผู้จัดจำหน่ายรายนี้..."
                    />
                </div>

                <div className="status-container">
                    <label className="section-label">สถานะการใช้งาน</label>
                    <div className="radio-group">
                        <label className="radio-item">
                            <input 
                              type="radio" 
                              name="status" 
                              value="active"
                              checked={formData.status === 'active'}
                              onChange={handleChange}
                            />
                            <span className="radio-dot-custom active"></span> ใช้งาน
                        </label>
                        <label className="radio-item">
                            <input 
                              type="radio" 
                              name="status" 
                              value="inactive"
                              checked={formData.status === 'inactive'}
                              onChange={handleChange}
                            />
                            <span className="radio-dot-custom inactive"></span> ปิดใช้งาน
                        </label>
                    </div>
                </div>

                <div className="form-footer-action">
                    <button className="btn-cancel-flat" onClick={() => goBack()}>ยกเลิก</button>
                    <button className="btn-submit-primary" onClick={handleSubmit}>
                        <FiSave /> บันทึกข้อมูล
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AddSupplier;
