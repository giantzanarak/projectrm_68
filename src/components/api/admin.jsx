let api = "http://127.0.0.1:3010"

import axios from "axios"


export async function GetProducts() {
  // console.log(id_strategic.data)
  try {
    const response = await axios.get(
      `${api}/products`,
    //   { email, password },
      {
        headers: {
          "Content-Type": `application/json`, // ส่ง Token ผ่าน Header
        },
      }
    );

    // const json = await response.json();
    console.log("data : ", response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching user data:", error);
    // Swal.fire("Error", "ไม่สามารถดึงข้อมูลได้", "error");
    const message =
      error.response?.data?.message || "เกิดข้อผิดพลาดขณะส่งข้อมูล";

    throw message; // ส่ง Error ออกไปให้จัดการในที่เรียกใช้
  }
}

export async function GetProduct(id) {
  try {
    const response = await axios.get(`${api}/products/${id}`, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    console.log("Product data:", response.data);  // ตรวจสอบข้อมูลที่ได้รับจาก API
    return response.data;
  } catch (error) {
    console.error("Error fetching user data:", error);
    const message = error.response?.data?.message || "เกิดข้อผิดพลาดขณะส่งข้อมูล";
    throw message;
  }
}

export async function GetStocks() {
  try {
    const response = await axios.get(`${api}/Stock`, {
      headers: { 
        "Content-Type": "application/json" },
    });
    
    console.log("All Stock Data:", response.data); // ตรวจสอบข้อมูลที่ได้จาก phpMyAdmin
    return response.data;
  } catch (error) {
    console.error("Error fetching user data:", error);
    const message = error.response?.data?.message || "ดึงข้อมูลสต็อกล้มเหลว";
    throw message;
  }
}
export async function GetStock(id) {
  // console.log(id_strategic.data)
  try {
    const response = await axios.get(
      `${api}/stock/${id}`,
    //   { email, password },
    
      {
        headers: {
          "Content-Type": `application/json`, // ส่ง Token ผ่าน Header
        },
      }
    );

    // const json = await response.json();
    console.log("data : ", response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching user data:", error);
    // Swal.fire("Error", "ไม่สามารถดึงข้อมูลได้", "error");
    const message =
      error.response?.data?.message || "เกิดข้อผิดพลาดขณะส่งข้อมูล";

    throw message; // ส่ง Error ออกไปให้จัดการในที่เรียกใช้
  }
}



 