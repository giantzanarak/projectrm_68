import { ORDER_STATUSES, formatDateInput } from "../admin/AddTailoringOrders";
import { API_BASE } from "../api/http";

export const photoUrl = (filePath) => (filePath ? `${API_BASE}${filePath}` : "");

export function transformDbOrder(o) {
  const header = {
    orderCode: o.order_code,
    orderDate: o.order_date || "",
    deadline: o.deadline || "",
    customerName: o.customer_name || "",
    customerPhone: o.customer_phone || "",
    orderNumber: o.order_number || "",
    fittingDate: o.fitting_date || "",
    deposit: o.deposit != null ? String(o.deposit) : "",
    depositPaymentMethod: o.deposit_payment_method || "",
    finalPaymentMethod: o.final_payment_method || "",
  };

  const items = (o.items || []).map((it) => {
    const measurements = {};
    const extraMeasurements = [];
    (it.measurements || []).forEach((m) => {
      const entry = { current: m.current_cm ?? "", min: m.min_cm ?? "", max: m.max_cm ?? "" };
      if (m.is_custom || !m.field_key) {
        extraMeasurements.push({ id: `m-${m.measurement_id}`, label: m.field_label, ...entry });
      } else {
        measurements[m.field_key] = entry;
      }
    });

    const seamAllowance = {};
    (it.seam_allowance || []).forEach((s) => {
      seamAllowance[s.seam_key] = s.allowance_cm ?? "";
    });

    const photosOf = (type) =>
      (it.photos || [])
        .filter((p) => p.photo_type === type)
        .map((p) => ({ id: `p-${p.photo_id}`, preview: photoUrl(p.file_path) }));

    return {
      id: `item-${it.item_id}`,
      garmentType: it.garment_type || "",
      subtype: it.subtype || "",
      suitMode: it.suit_mode || "ชุดเดียว",
      suitBottom: it.suit_bottom || "กางเกง",
      measurements,
      extraMeasurements,
      status: it.status || ORDER_STATUSES[0],
      fabricSource: it.fabric_source || "shop",
      fabric: {
        fabricName: it.fabric_name || "",
        fabricType: it.fabric_type || "",
        colorName: it.fabric_color || "",
        patternName: it.fabric_pattern || "",
        prewashed: it.fabric_prewashed || "",
      },
      customerFabric: {
        receivedDate: it.customer_fabric?.received_date || "",
        rollCount: it.customer_fabric?.roll_count ?? "",
        measuredLength: it.customer_fabric?.measured_length ?? "",
        measuredWidth: it.customer_fabric?.measured_width ?? "",
        condition: it.customer_fabric?.condition_note || "",
        washed: it.customer_fabric?.washed || "ไม่ทราบ",
        acknowledged: !!it.customer_fabric?.acknowledged,
        enough: it.customer_fabric?.enough || "พอ",
        adjustmentNote: it.customer_fabric?.adjustment_note || "",
        returnScraps: it.customer_fabric?.return_scraps || "คืนลูกค้า",
      },
      customerFabricPhotos: photosOf("customer_fabric"),
      shopFabric: {
        rollId: it.shop_fabric?.roll_id ?? "",
        rollCode: it.shop_fabric?.roll_code || "",
        pricePerMeter: it.shop_fabric?.price_per_meter ?? "",
        metersIssued: it.shop_fabric?.meters_issued ?? "",
      },
      designImages: photosOf("design"),
      seamAllowance,
      allowancePlan: {
        type: it.allowance_type || "ปกติ",
        specialNote: it.allowance_special_note || "",
        cannotAllow: !!it.allowance_cannot_allow,
        cannotAllowNote: it.allowance_cannot_allow_note || "",
      },
      price: it.price != null ? String(it.price) : "",
      postCut: {
        fabricIssuedMeters: it.fabric_issued_meters != null ? String(it.fabric_issued_meters) : "",
        fabricUsedMeters: it.fabric_used_meters != null ? String(it.fabric_used_meters) : "",
      },
      alterationRows: (it.alterations || []).map((a) => ({
        id: `alt-${a.alteration_id}`,
        date: a.alteration_date || "",
        point: a.point || "",
        adjustCm: a.adjust_cm || "",
        remainingAllowance: a.remaining_allowance || "",
        feeAmount: a.fee_amount != null ? String(a.fee_amount) : "",
      })),
    };
  });

  return {
    order_id: o.order_code,
    db_order_id: o.order_id,
    bill_id: o.bill_id ?? null,
    source: "db",
    detail: { header, items },
  };
}

export const daysFromToday = (dateStr) => {
  if (!dateStr) return null;
  const today = new Date(formatDateInput());
  const target = new Date(dateStr);
  return Math.round((target - today) / (1000 * 60 * 60 * 24));
};

export const dueLabel = (dateStr) => {
  const diff = daysFromToday(dateStr);
  if (diff === null) return { text: "ยังไม่กำหนด", tone: "muted" };
  if (diff === 0) return { text: "วันนี้", tone: "today" };
  if (diff > 0) return { text: `อีก ${diff} วัน`, tone: diff <= 3 ? "soon" : "normal" };
  return { text: `เลยกำหนดมาแล้ว ${Math.abs(diff)} วัน`, tone: "overdue" };
};

export const formatDateTH = (dateStr) => {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString("th-TH", { day: "2-digit", month: "short", year: "numeric" });
};

export function tailoringTotals(detail) {
  const items = detail?.items || [];
  const piecesTotal = items.reduce((s, it) => s + (Number(it.price) || 0), 0);
  const alterationsTotal = items.reduce(
    (s, it) => s + (it.alterationRows || []).reduce((a, r) => a + (Number(r.feeAmount) || 0), 0),
    0
  );
  const deposit = Number(detail?.header?.deposit) || 0;
  return {
    piecesTotal,
    alterationsTotal,
    deposit,
    remaining: piecesTotal + alterationsTotal - deposit,
  };
}
