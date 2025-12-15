import React from "react";

export default function Employees(){
  const staff = [
    { name:"สมชาย", role:"ผู้ดูแลระบบ" },
    { name:"สมหญิง", role:"พนักงานขาย" }
  ];

  return (
    <div>
      <h2>พนักงาน</h2>
      <div className="card" style={{ marginTop:12 }}>
        {staff.map((s,i)=>(
          <div key={i} style={{ padding:10, borderBottom: "1px solid #f2f5f9" }}>
            <div style={{ fontWeight:700 }}>{s.name}</div>
            <div style={{ color:"#6b7280" }}>{s.role}</div>
          </div>
        ))}
      </div>
    </div>
  );
}