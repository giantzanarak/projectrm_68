import { API_BASE } from "./http";
const api = API_BASE;

import axios from "axios";

export async function getColors() {
  const response = await axios.get(`${api}/color`);     
  return response.data;
}

export async function addColor(data) {
  const response = await axios.post(`${api}/color`, data, {
    headers: { "Content-Type": "application/json" },
  });
  return response.data;
}

export async function getFabricTypes() {
  const response = await axios.get(`${api}/fabrictypes`); 
  return response.data;
}

export async function addFabricType(data) {
  const isFormData = data instanceof FormData;
  const response = await axios.post(`${api}/fabrictypes`, data, {
    headers: { "Content-Type": isFormData ? "multipart/form-data" : "application/json" },
  });
  return response.data;
}

export async function editFabricType(type_id, data) {
  const isFormData = data instanceof FormData;
  const response = await axios.put(`${api}/fabrictypes/${type_id}`, data, {
    headers: { "Content-Type": isFormData ? "multipart/form-data" : "application/json" },
  });
  return response.data;
}

export const getCategories = async () => {
  const res = await axios.get(`${api}/category`);         
  return res.data;
};

export const addCategory = async (data) => {
  const res = await axios.post(`${api}/category`, data, {
    headers: { "Content-Type": "application/json" },
  });
  return res.data;
};

export async function getStorageLocations() {
  const response = await axios.get(`${api}/storage-locations`);
  return response.data;
}

export async function getFabricRolls() {
  try {
    const response = await axios.get(`${api}/fabricrolls`);
    
    console.log("fabric rolls with joined data:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching fabric rolls:", error);
    throw error;
  }
}

export async function getFabricRoll(roll_id) {
  try {
    const response = await axios.get(`${api}/fabricrolls/${roll_id}`);
    console.log("fabric roll detail:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching fabric roll:", error);
    throw error;
  }
}

export async function getFabricUsageByRoll(roll_id) {
  try {
    const response = await axios.get(`${api}/fabricusage/roll/${roll_id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching usage by roll:", error);
    throw error;
  }
}

export async function getFabricUsageHistory(roll_id) {
  const response = await axios.get(`${api}/fabricusage/roll/${roll_id}/history`);
  return response.data;
}

export async function addFabricRoll(data) {
  try {
    const response = await axios.post(
      `${api}/fabricrolls`,
      data,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    console.log("add fabric roll success:", response.data);
    return response.data;
  } catch (error) {
    console.error("Add fabric roll error:", error);
    throw error;
  }
}

export async function getSupplierFabrics(supplier_id) {
  const response = await axios.get(`${api}/fabricrolls/supplier-fabrics/${supplier_id}`);
  return response.data;
}

export async function getNextRollCode({ supplier_id, type_id, category_id, color_id }) {
  const response = await axios.get(`${api}/fabricrolls/next-code`, {
    params: { supplier_id, type_id, category_id, color_id },
  });
  return response.data;
}

export async function receiveFabricRoll(formData) {
  const response = await axios.post(`${api}/fabricrolls/receive`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
}

export async function editFabricRoll(roll_id, data) {
  console.log("EDIT DATA:", data);
  try {
    const isFormData = data instanceof FormData;
    const response = await axios.put(
      `${api}/fabricrolls/${roll_id}`,
      data,
      {
        headers: {
          "Content-Type": isFormData ? "multipart/form-data" : "application/json",
        },
      }
    );
    console.log("edit fabric roll success:", response.data);

    return response.data;
  } catch (error) {
    console.error("Edit fabric roll error:", error);
    throw error;
  }
}

export async function deleteFabricRoll(roll_id) {
  try {
    const res = await axios.delete(`${api}/fabricrolls/${roll_id}`);
    console.log("delete fabric roll:", res.data);
    return res.data;
  } catch (err) {
    console.error("Delete fabric roll error:", err);
    throw err;
  }
}

export async function getFabricUsage() {

  try {

    const response = await axios.get(
      `${api}/fabricusage`,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    console.log("fabric usage logs:", response.data);

    return response.data;

  } catch (error) {

    console.error("Error fetching usage logs:", error);
    throw error;

  }

}

export async function getFabricUsageById(id) {

  try {

    const response = await axios.get(
      `${api}/fabricusage/${id}`,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    console.log("fabric usage detail:", response.data);

    return response.data;

  } catch (error) {

    console.error("Error fetching usage detail:", error);
    throw error;

  }

}

export async function addFabricUsage(data) {
  try {
    const response = await axios.post(
      `${api}/fabricusage`,
      data,
      { headers: { "Content-Type": "application/json" } }
    );
    console.log("add usage success:", response.data);
    return response.data;
  } catch (error) {
    console.error("Add usage error:", error);
    throw error;
  }
}

export async function deleteFabricUsage(id) {

  try {

    const response = await axios.delete(
      `${api}/fabricusage/${id}`,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    console.log("delete usage success:", response.data);

    return response.data;

  } catch (error) {

    console.error("Delete usage error:", error);
    throw error;

  }

}

export async function getSuppliers() {

  try {

    const response = await axios.get(
      `${api}/suppliers`,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    console.log("suppliers:", response.data);

    return response.data;

  } catch (error) {

    console.error("Error fetching suppliers:", error);
    throw error;

  }

}

export async function getSupplier(id) {

  try {

    const response = await axios.get(
      `${api}/suppliers/${id}`,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    console.log("supplier:", response.data);

    return response.data;

  } catch (error) {

    console.error("Error fetching supplier:", error);
    throw error;

  }

}

export async function addSupplier(data) {

  try {

    const isFormData = data instanceof FormData;

    const response = await axios.post(
      `${api}/suppliers`,
      data,
      {
        headers: {
          "Content-Type": isFormData ? "multipart/form-data" : "application/json",
        },
      }
    );

    console.log("add supplier success:", response.data);

    return response.data;

  } catch (error) {

    console.error("Add supplier error:", error);
    throw error;

  }

}

export async function editSupplier(id, data) {

  try {

    const isFormData = data instanceof FormData;

    const response = await axios.put(
      `${api}/suppliers/${id}`,
      data,
      {
        headers: {
          "Content-Type": isFormData ? "multipart/form-data" : "application/json",
        },
      }
    );

    console.log("edit supplier success:", response.data);

    return response.data;

  } catch (error) {

    console.error("Edit supplier error:", error);
    throw error;

  }

}

export async function getShopSettings() {

  try {

    const response = await axios.get(`${api}/shop_settings`, {
      headers: { "Content-Type": "application/json" },
    });

    return response.data;

  } catch (error) {

    console.error("Error fetching shop settings:", error);
    throw error;

  }

}

export async function updateShopSettings(data) {

  try {

    const response = await axios.put(`${api}/shop_settings`, data, {
      headers: { "Content-Type": "application/json" },
    });

    return response.data;

  } catch (error) {

    console.error("Update shop settings error:", error);
    throw error;

  }

}

export async function resolveMapLink(url) {

  try {

    const response = await axios.post(
      `${api}/geo/resolve-map-link`,
      { url },
      { headers: { "Content-Type": "application/json" } }
    );

    return response.data;

  } catch (error) {

    console.error("Resolve map link error:", error);
    throw error;

  }

}

export async function deleteSupplier(id) {

  try {

    const response = await axios.delete(
      `${api}/suppliers/${id}`,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    console.log("delete supplier success:", response.data);

    return response.data;

  } catch (error) {

    console.error("Delete supplier error:", error);
    throw error;

  }

}

export async function getUsers() {
  try {
    const response = await axios.get(`${api}/users`);
    return response.data;
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
}

export async function addUser(data) {
  try {
    const response = await axios.post(`${api}/users`, data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  } catch (error) {
    console.error("Add user error:", error);
    throw error;
  }
}

export async function editUser(id, data) {
  try {
    const response = await axios.put(`${api}/users/${id}`, data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  } catch (error) {
    console.error("Edit user error:", error);
    throw error;
  }
}

export async function deleteUser(id) {
  try {
    const response = await axios.delete(`${api}/users/${id}`);
    return response.data;
  } catch (error) {
    console.error("Delete user error:", error);
    throw error;
  }
}

export async function getFabrics() {
  try {
    const response = await axios.get(`${api}/fabric`, {
      headers: { "Content-Type": "application/json" },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching fabrics:", error);
    throw error;
  }
}

export function getFabricImageUrl(imagePath) {
  if (!imagePath) return "";
  if (/^https?:\/\//i.test(imagePath)) return imagePath;
  return imagePath.startsWith("/") ? `${api}${imagePath}` : `${api}/uploads/${imagePath}`;
}

const PURCHASE_ORDER_STATUS_LABELS = {
  pending: "รอสินค้า",
  partial: "รับบางส่วน",
  completed: "รับครบแล้ว",
};

function toUiPurchaseOrderStatus(status) {
  const normalized = String(status || "").trim().toLowerCase();
  return PURCHASE_ORDER_STATUS_LABELS[normalized] || "รอสินค้า";
}

export function toApiPurchaseOrderStatus(status) {
  const normalized = String(status || "").trim().toLowerCase();

  if (["pending", "partial", "completed"].includes(normalized)) {
    return normalized;
  }

  if (normalized === "รับบางส่วน") return "partial";
  if (normalized === "รับครบแล้ว") return "completed";
  return "pending";
}

function mapPurchaseOrderDetail(order, items = []) {
  return {
    po_id: order.po_id,
    id: order.po_code,
    date: order.order_date ? String(order.order_date).slice(0, 10) : "",
    supplierId: order.supplier_id ? String(order.supplier_id) : "",
    supplier: order.supplier_name || "-",
    price: Number(order.total_amount || 0),
    receiveStatus: toUiPurchaseOrderStatus(order.status),
    items: items.map((item) => ({
      item_id: item.item_id,
      fabricId: item.fabric_id ? String(item.fabric_id) : "",
      fabricCode: item.fabric_code || "",
      spec: !item.fabric_id && item.type_id
        ? {
            type_id: item.type_id,
            category_id: item.category_id,
            color_id: item.color_id,
            name: item.fabric_name || "",
            width_cm: item.width_cm ?? null,
          }
        : null,
      name: item.fabric_name || "-",
      unit: "ม้วน",
      ordered: Number(item.roll_qty || 0),
      unitPrice: Number(item.price_per_roll || 0),
      received: Number(item.received_roll_qty || 0),
      rollLength: Number(item.roll_length || 0),
      totalPrice: Number(item.total_price || 0),
    })),
  };
}

export async function getPurchaseOrders() {
  try {
    const response = await axios.get(`${api}/purchase_orders`, {
      headers: { "Content-Type": "application/json" },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching purchase orders:", error);
    throw error;
  }
}

export async function getPurchaseOrderById(id) {
  try {
    const response = await axios.get(`${api}/purchase_orders/${id}`, {
      headers: { "Content-Type": "application/json" },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching purchase order:", error);
    throw error;
  }
}

export async function addPurchaseOrder(data) {
  try {
    const response = await axios.post(`${api}/purchase_orders`, data, {
      headers: { "Content-Type": "application/json" },
    });
    return response.data;
  } catch (error) {
    console.error("Add purchase order error:", error);
    throw error;
  }
}

export async function editPurchaseOrder(id, data) {
  try {
    const response = await axios.put(`${api}/purchase_orders/${id}`, data, {
      headers: { "Content-Type": "application/json" },
    });
    return response.data;
  } catch (error) {
    console.error("Edit purchase order error:", error);
    throw error;
  }
}

export async function deletePurchaseOrder(id) {
  try {
    const response = await axios.delete(`${api}/purchase_orders/${id}`, {
      headers: { "Content-Type": "application/json" },
    });
    return response.data;
  } catch (error) {
    console.error("Delete purchase order error:", error);
    throw error;
  }
}

export async function getPurchaseOrderItems() {
  try {
    const response = await axios.get(`${api}/purchase_order_items`, {
      headers: { "Content-Type": "application/json" },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching purchase order items:", error);
    throw error;
  }
}

export async function getPurchaseOrderItemsByPo(poId) {
  try {
    const response = await axios.get(`${api}/purchase_order_items/po/${poId}`, {
      headers: { "Content-Type": "application/json" },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching purchase order items by po:", error);
    throw error;
  }
}

export async function addPurchaseOrderItem(data) {
  try {
    const response = await axios.post(`${api}/purchase_order_items`, data, {
      headers: { "Content-Type": "application/json" },
    });
    return response.data;
  } catch (error) {
    console.error("Add purchase order item error:", error);
    throw error;
  }
}

export async function editPurchaseOrderItem(id, data) {
  try {
    const response = await axios.put(`${api}/purchase_order_items/${id}`, data, {
      headers: { "Content-Type": "application/json" },
    });
    return response.data;
  } catch (error) {
    console.error("Edit purchase order item error:", error);
    throw error;
  }
}

export async function deletePurchaseOrderItem(id) {
  try {
    const response = await axios.delete(`${api}/purchase_order_items/${id}`, {
      headers: { "Content-Type": "application/json" },
    });
    return response.data;
  } catch (error) {
    console.error("Delete purchase order item error:", error);
    throw error;
  }
}

export async function receivePurchaseOrder(poId, data) {
  const response = await axios.post(`${api}/purchase_orders/${poId}/receive`, data, {
    headers: { "Content-Type": "application/json" },
  });
  return response.data;
}

export async function getPurchaseOrdersDetailed() {
  const [orders, items] = await Promise.all([
    getPurchaseOrders(),
    getPurchaseOrderItems(),
  ]);

  const itemsByPoId = items.reduce((acc, item) => {
    const key = Number(item.po_id);
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});

  return orders.map((order) =>
    mapPurchaseOrderDetail(order, itemsByPoId[Number(order.po_id)] || [])
  );
}

export async function getPurchaseOrderDetailedByCode(code) {
  const orders = await getPurchaseOrdersDetailed();
  return (
    orders.find(
      (order) =>
        String(order.id || "").trim() === String(code || "").trim() ||
        String(order.po_id || "") === String(code || "")
    ) || null
  );
}
