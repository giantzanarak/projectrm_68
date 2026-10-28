import { useEffect, useMemo, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { FiSearch, FiAlertCircle } from 'react-icons/fi';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import { geocodeAddress } from '../utils/geocode';
import '../styles/AddressMapPicker.css';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const THAILAND_CENTER = { lat: 13.7563, lng: 100.5018 };

function ClickToPlace({ onCoordsChange }) {
  useMapEvents({
    click(e) {
      onCoordsChange({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
}

function Recenter({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center.lat, center.lng]);
  return null;
}

const AddressMapPicker = ({ coords, onCoordsChange, height = 280 }) => {
  const [query, setQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState(false);

  const center = coords || THAILAND_CENTER;
  const zoom = coords ? 16 : 6;
  const style = useMemo(() => ({ width: '100%', height: `${height}px` }), [height]);

  const handleDragEnd = (e) => {
    const { lat, lng } = e.target.getLatLng();
    onCoordsChange({ lat, lng });
  };

  const handleSearch = async () => {
    const value = query.trim();
    if (!value) return;

    setSearching(true);
    setSearchError(false);
    try {
      const resolved = await geocodeAddress(value);
      onCoordsChange(resolved);
    } catch {
      setSearchError(true);
    } finally {
      setSearching(false);
    }
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch();
    }
  };

  return (
    <div className="map-picker-wrap">
      <div className="map-picker-search">
        <input
          type="text"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setSearchError(false); }}
          onKeyDown={handleSearchKeyDown}
          placeholder="ค้นหาสถานที่บนแผนที่ เช่น ถนน ตำบล"
        />
        <button
          type="button"
          onClick={handleSearch}
          disabled={searching || !query.trim()}
        >
          <FiSearch size={14} /> {searching ? 'กำลังค้นหา' : 'ค้นหา'}
        </button>
      </div>
      {searchError && (
        <p className="map-picker-error">
          <FiAlertCircle /> ไม่พบสถานที่นี้ ลองค้นหาคำอื่น หรือคลิก/ลากหมุดบนแผนที่เพื่อปักเอง
        </p>
      )}
      <MapContainer center={center} zoom={zoom} style={style} scrollWheelZoom={false}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={center} draggable eventHandlers={{ dragend: handleDragEnd }} />
        <ClickToPlace onCoordsChange={onCoordsChange} />
        <Recenter center={center} zoom={zoom} />
      </MapContainer>
      <p className="map-picker-hint">
        {coords
          ? 'ลากหมุดเพื่อปรับตำแหน่งให้แม่นยำ หรือคลิกบนแผนที่เพื่อย้ายหมุด'
          : 'ค้นหาสถานที่ด้านบน หรือคลิกบนแผนที่เพื่อปักหมุด'}
      </p>
    </div>
  );
};

export default AddressMapPicker;
