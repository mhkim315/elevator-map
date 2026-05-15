import { ElevatorMeta } from '../types';

interface HeaderProps {
  meta?: ElevatorMeta;
  region?: string;
  onBack?: () => void;
}

export default function Header({ meta, region, onBack }: HeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between shrink-0">
      <div className="flex items-center gap-3">
        {region && onBack && (
          <button
            onClick={onBack}
            className="text-sm text-blue-600 hover:text-blue-800 mr-1 whitespace-nowrap"
          >
            ← 지역 선택
          </button>
        )}
        <h1 className="text-lg font-bold text-gray-800 whitespace-nowrap">
          {region ? `${region} 노후 승강기` : '노후 승강기 영업 지도'}
        </h1>
        {meta && (
          <span className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded">
            v{meta.updated}
          </span>
        )}
      </div>
      {meta && (
        <div className="flex items-center gap-4 text-xs text-gray-500">
          <span>건물 {meta.totalBuildings.toLocaleString()}곳</span>
          <span className="hidden sm:inline">승강기 {meta.totalElevators.toLocaleString()}대</span>
          <span className="hidden md:inline">지역 {meta.regions.length}개</span>
        </div>
      )}
    </header>
  );
}
