import { RegionInfo } from '../types';

interface RegionSelectProps {
  regions: RegionInfo[];
  totalBuildings: number;
  totalElevators: number;
  onSelect: (region: string) => void;
}

const regionColors: Record<string, string> = {
  서울: '#d32f2f', 부산: '#e91e63', 대구: '#9c27b0', 인천: '#673ab7',
  광주: '#3f51b5', 대전: '#2196f3', 울산: '#0097a7', 세종: '#00897b',
  경기: '#4caf50', 경남: '#689f38', 경북: '#7cb342', 전남: '#c0ca33',
  전북: '#fdd835', 충남: '#ffb300', 충북: '#fb8c00', 강원: '#795548',
  제주: '#607d8b',
};

export default function RegionSelect({ regions, totalBuildings, totalElevators, onSelect }: RegionSelectProps) {
  return (
    <div className="flex-1 flex items-center justify-center bg-gray-50 p-8 overflow-auto">
      <div className="w-full max-w-3xl">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">노후 승강기 교체 영업 지도</h2>
          <p className="text-sm text-gray-500">
            전국 {totalBuildings.toLocaleString()}개 건물 · {totalElevators.toLocaleString()}대 승강기 (15년 이상)
          </p>
          <p className="text-xs text-gray-400 mt-1">분석할 광역시/도를 선택하세요</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {regions.map((r) => (
            <button
              key={r.name}
              onClick={() => onSelect(r.name)}
              className="relative flex flex-col items-center justify-center p-5 rounded-xl border-2 border-transparent hover:border-blue-400 bg-white shadow-sm hover:shadow-md transition-all cursor-pointer"
              style={{ borderTopColor: regionColors[r.name] || '#9e9e9e', borderTopWidth: 3 }}
            >
              <span className="text-lg font-bold text-gray-800">{r.name}</span>
              <span className="text-xs text-gray-400 mt-1">{r.count.toLocaleString()}개 건물</span>
              <span className="text-xs text-gray-300 mt-0.5">{(r.size / 1024 / 1024).toFixed(1)}MB</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
