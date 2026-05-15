import { useEffect, useRef, useMemo } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import { CompactRecord } from '../types';
import { getGradeColor } from '../utils/gradeUtils';
import { DEFAULT_CENTER, DEFAULT_ZOOM, OPENFREEMAP_TILE, OPENFREEMAP_ATTR } from '../constants';
import BuildingPopup from './BuildingPopup';

// Fix default marker icon path issue
delete (L.Icon.Default.prototype as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

interface MapViewProps {
  buildings: CompactRecord[];
  onBuildingSelect?: (b: CompactRecord) => void;
}

/** Renders markers and heatmap inside the map */
function MapContent({ buildings }: { buildings: CompactRecord[] }) {
  const map = useMap();
  const markersRef = useRef<L.LayerGroup | null>(null);
  const heatRef = useRef<L.LayerGroup | null>(null);
  const clusterGroupRef = useRef<L.MarkerClusterGroup | null>(null);

  const markers = useMemo(() => {
    return buildings.map((b) => ({
      pos: [b[2], b[3]] as [number, number],
      grade: b[8],
      data: b,
      count: b[9],
    }));
  }, [buildings]);

  useEffect(() => {
    // Clean up previous layers
    if (clusterGroupRef.current) map.removeLayer(clusterGroupRef.current);
    if (heatRef.current) map.removeLayer(heatRef.current);

    // Create marker cluster group
    const clusterGroup = L.markerClusterGroup({
      chunkedLoading: true,
      maxClusterRadius: 50,
      spiderfyOnMaxZoom: true,
      showCoverageOnHover: false,
      zoomToBoundsOnClick: true,
      iconCreateFunction: (cluster) => {
        const count = cluster.getChildCount();
        // Determine cluster color based on highest grade in cluster
        let worstGrade = 'E';
        cluster.getAllChildMarkers().forEach((m) => {
          const g = (m as any).__grade;
          if (!g) return;
          const gradeOrder: Record<string, number> = { A: 0, B: 1, C: 2, D: 3, E: 4 };
          if ((gradeOrder[g] ?? 99) < (gradeOrder[worstGrade] ?? 99)) {
            worstGrade = g;
          }
        });
        const color = getGradeColor(worstGrade);
        return L.divIcon({
          html: `<div style="
            background:${color}; color:white; border-radius:50%;
            width:${count > 100 ? 50 : count > 50 ? 44 : 38}px;
            height:${count > 100 ? 50 : count > 50 ? 44 : 38}px;
            display:flex; align-items:center; justify-content:center;
            font-size:${count > 100 ? 13 : count > 50 ? 12 : 11}px; font-weight:bold;
            border:3px solid rgba(255,255,255,0.8); box-shadow:0 2px 4px rgba(0,0,0,0.3);
          ">${count}</div>`,
          className: '',
          iconSize: L.point(50, 50),
          iconAnchor: [25, 25],
        });
      },
    });

    // Individual markers using CircleMarker for performance
    const markers: L.CircleMarker[] = buildings.map((b, idx) => {
      const color = getGradeColor(b[8]);
      const radius = b[9] >= 3 ? 8 : b[9] >= 2 ? 7 : 6;
      const marker = L.circleMarker([b[2], b[3]], {
        radius,
        fillColor: color,
        color: '#ffffff',
        weight: 1.5,
        opacity: 0.9,
        fillOpacity: 0.8,
      });

      // Store grade for clustering
      (marker as any).__grade = b[8];

      // Build popup content inline (ReactDOM would be too heavy for 100K+ markers)
      const popupContent = buildPopupContent(b);
      marker.bindPopup(popupContent, { maxWidth: 350, className: '' });

      return marker;
    });

    // Add all markers to cluster group
    clusterGroup.addLayers(markers);

    // Add cluster group to map
    map.addLayer(clusterGroup);
    clusterGroupRef.current = clusterGroup;

    // Heatmap layer (for 15+ year buildings only if any)
    const heatData: [number, number, number][] = [];
    for (const b of buildings) {
      if (['A', 'B', 'C'].includes(b[8])) {
        heatData.push([b[2], b[3], 0.3]);
      }
    }
    if (heatData.length > 0) {
      try {
        const heat = (L as any).heatLayer(heatData, {
          radius: 25,
          blur: 15,
          maxZoom: 10,
          max: 1.0,
          gradient: { 0.4: '#f97316', 0.6: '#ef4444', 0.8: '#dc2626' },
        });
        map.addLayer(heat);
        heatRef.current = heat;
      } catch (e) {
        // heatmap layer not available - skip
      }
    }

    // Fit bounds to show all markers
    if (buildings.length > 0 && buildings.length < 100000) {
      const bounds = L.latLngBounds(buildings.map((b) => [b[2], b[3]] as [number, number]));
      map.fitBounds(bounds, { padding: [30, 30], maxZoom: 12 });
    }

    return () => {
      if (clusterGroupRef.current) map.removeLayer(clusterGroupRef.current);
      if (heatRef.current) map.removeLayer(heatRef.current);
    };
  }, [buildings, map]);

  return null;
}

function buildPopupContent(b: CompactRecord): string {
  const [name, addr, lat, lng, type, date, mfr, maint, grade, count, region, bUse, elevators] = b;

  let html = `<div>
    <div class="building-name">${escapeHtml(name)}</div>
    <table class="popup-table">
      <tr><th>주소</th><td>${escapeHtml(addr)}</td></tr>
      <tr><th>용도</th><td>${escapeHtml(bUse)}</td></tr>
      <tr><th>승강기</th><td>${count}대</td></tr>
      <tr><th>설치일</th><td>${escapeHtml(date)}</td></tr>
      <tr><th>등급</th><td><span class="grade-badge" style="background:${gradeColor(grade)};color:white;padding:1px 6px;border-radius:3px;font-size:11px;font-weight:bold">${grade}</span></td></tr>
      <tr><th>제조</th><td>${escapeHtml(mfr)}</td></tr>
      <tr><th>관리</th><td>${escapeHtml(maint)}</td></tr>
    </table>`;

  if (elevators.length > 0) {
    html += `<div style="margin-top:8px"><div style="font-size:11px;font-weight:600;color:#6b7280;margin-bottom:4px">전체 승강기 (${elevators.length}대)</div>`;
    const show = elevators.slice(0, 10);
    for (const e of show) {
      html += `<div style="padding:4px 0;border-top:1px solid #e5e7eb;font-size:11px">
        <div style="display:flex;justify-content:space-between"><span>${escapeHtml(e[0])}</span><span style="color:#9ca3af">${escapeHtml(e[1])}</span></div>
        <div style="color:#9ca3af">${escapeHtml(e[2])}</div>
      </div>`;
    }
    if (elevators.length > 10) {
      html += `<div style="font-size:10px;color:#9ca3af;margin-top:4px">외 ${elevators.length - 10}대</div>`;
    }
    html += '</div>';
  }

  html += '</div>';
  return html;
}

function escapeHtml(str: string): string {
  return str.replace(/[&<>"]/g, (m) => {
    switch (m) { case '&': return '&amp;'; case '<': return '&lt;'; case '>': return '&gt;'; case '"': return '&quot;'; default: return m; }
  });
}

function gradeColor(g: string): string {
  const colors: Record<string, string> = { A: '#EF4444', B: '#F97316', C: '#EAB308', D: '#22C55E', E: '#9CA3AF' };
  return colors[g] ?? '#9CA3AF';
}

export default function MapView({ buildings }: MapViewProps) {
  if (buildings.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50 text-gray-400">
        표시할 데이터가 없습니다. 필터를 조정해보세요.
      </div>
    );
  }

  return (
    <div className="flex-1 relative">
      <MapContainer
        center={DEFAULT_CENTER}
        zoom={DEFAULT_ZOOM}
        minZoom={6}
        maxZoom={18}
        className="absolute inset-0"
        zoomControl={true}
      >
        <TileLayer url={OPENFREEMAP_TILE} attribution={OPENFREEMAP_ATTR} />
        <MapContent buildings={buildings} />
      </MapContainer>
    </div>
  );
}
