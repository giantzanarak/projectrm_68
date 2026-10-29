import axios from "axios";
import { API_BASE } from "./http";

const API = `${API_BASE}/api/outfit-formulas`;

export async function getOutfits() {
  const res = await axios.get(API);
  return res.data || [];
}

export async function createOutfit(draft) {
  const res = await axios.post(API, toPayload(draft));
  return res.data;
}

export async function updateOutfit(formulaId, draft) {
  const res = await axios.put(`${API}/${formulaId}`, toPayload(draft));
  return res.data;
}

export async function deleteOutfit(formulaId) {
  const res = await axios.delete(`${API}/${formulaId}`);
  return res.data;
}

export const partNamesOf = (f) => (f.parts || []).map((p) => p.part_name).filter(Boolean);

function toPayload(draft) {
  return {
    outfitName: draft.outfitName,
    parts: (draft.parts || [])
      .map((name) => String(name || "").trim())
      .filter(Boolean)
      .map((name) => ({ name })),
    sortOrder: draft.sortOrder,
  };
}

export function toOutfitMap(list) {
  const map = {};
  (list || []).forEach((f) => {
    map[f.outfit_name] = {
      parts: partNamesOf(f),
    };
  });
  return map;
}
