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