import React from "react";

export default function Settings(){
  return (
    <div>
      <h2>ตั้งค่าระบบ</h2>
      <div className="card" style={{ marginTop:12 }}>
        <div style={{ marginBottom:12 }}>ตั้งค่าทั่วไปของระบบ</div>
        <div style={{ display:"grid", gap:12, gridTemplateColumns:"1fr 1fr" }}>
          <input className="input" placeholder="ชื่อร้าน" />
          <input className="input" placeholder="เลขที่ผู้ประกอบการ" />
          <button className="btn primary">บันทึกการตั้งค่า</button>
        </div>
      </div>
    </div>
  );
}