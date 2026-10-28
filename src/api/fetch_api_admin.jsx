import { API_BASE } from "./http";
const api = API_BASE;

import axios from "axios";

export async function getTailoringOrders() {
  const response = await axios.get(`${api}/tailoringorders`);
  return response.data;
}

export async function getTailoringOrderByCode(orderCode) {
  const response = await axios.get(`${api}/tailoringorders/code/${encodeURIComponent(orderCode)}`);
  return response.data;
}

export async function getTailoringOrdersByBill(billId) {
  const response = await axios.get(`${api}/tailoringorders`, { params: { bill_id: billId } });
  return response.data;
}

export async function createTailoringOrder(formData) {
  const response = await axios.post(`${api}/tailoringorders`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
}

export async function linkTailoringOrderToBill(orderId, billId) {
  const response = await axios.put(`${api}/tailoringorders/${orderId}/link-bill`, { bill_id: billId });
  return response.data;
}

export async function updateTailoringOrder(orderId, payload) {
  const response = await axios.put(`${api}/tailoringorders/${orderId}`, payload);
  return response.data;
}

export async function settleTailoringOrder(orderId, { amount, paymentMethod, slipFile }) {
  const formData = new FormData();
  formData.append("amount", amount);
  formData.append("payment_method", paymentMethod || "");
  if (slipFile) formData.append("slip", slipFile);

  const response = await axios.put(`${api}/tailoringorders/${orderId}/settle`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
}

export async function deleteTailoringOrder(orderId) {
  const response = await axios.delete(`${api}/tailoringorders/${orderId}`);
  return response.data;
}

export async function addTailoringPhotos(orderId, itemId, files, photoType = "design") {
  const formData = new FormData();
  formData.append("photo_type", photoType);
  Array.from(files).forEach((file) => formData.append("photos", file));

  const response = await axios.post(
    `${api}/tailoringorders/${orderId}/items/${itemId}/photos`,
    formData,
    { headers: { "Content-Type": "multipart/form-data" } }
  );
  return response.data;
}

export async function replaceTailoringPhoto(orderId, photoId, file) {
  const formData = new FormData();
  formData.append("photo", file);

  const response = await axios.put(
    `${api}/tailoringorders/${orderId}/photos/${photoId}`,
    formData,
    { headers: { "Content-Type": "multipart/form-data" } }
  );
  return response.data;
}

export async function deleteTailoringPhoto(orderId, photoId) {
  const response = await axios.delete(`${api}/tailoringorders/${orderId}/photos/${photoId}`);
  return response.data;
}
