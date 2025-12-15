import React from "react";

export default function Table({ columns = [], data = [] }) {
  return (
    <div className="card">
      <table className="table">
        <thead>
          <tr>
            {columns.map((c, i) => <th key={i}>{c}</th>)}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr><td colSpan={columns.length} style={{padding:20, color:'#666'}}>ไม่มีข้อมูล</td></tr>
          ) : data.map((row, r) => (
            <tr key={r}>
              {columns.map((c, i) => <td key={i}>{row[c] ?? row[i] ?? ""}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}