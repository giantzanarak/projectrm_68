export async function geocodeAddress(address) {
  const params = new URLSearchParams({
    format: "json",
    q: address,
    limit: "1",
    countrycodes: "th",
  });

  const response = await fetch(`https://nominatim.openstreetmap.org/search?${params}`);
  if (!response.ok) throw new Error("geocode request failed");

  const results = await response.json();
  if (!results.length) throw new Error("address not found");

  return { lat: parseFloat(results[0].lat), lng: parseFloat(results[0].lon) };
}
