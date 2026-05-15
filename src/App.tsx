import { useState } from 'react';
import { useElevatorData } from './hooks/useElevatorData';
import { useFilters } from './hooks/useFilters';
import { ViewMode } from './types';
import Header from './components/Header';
import StatsBar from './components/StatsBar';
import FilterPanel from './components/FilterPanel';
import MapView from './components/MapView';
import DataTable from './components/DataTable';
import ViewToggle from './components/ViewToggle';

export default function App() {
  const { data, loading, error, progress } = useElevatorData();
  const [viewMode, setViewMode] = useState<ViewMode>('map');
  const [filterOpen, setFilterOpen] = useState(true);

  const buildings = data?.buildings ?? [];

  const {
    filtered,
    grades,
    toggleGrade,
    regions,
    buildingTypes,
    setRegions,
    setBuildingTypes,
    searchQuery,
    setSearchQuery,
  } = useFilters(buildings);

  // Loading state
  if (loading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="text-lg font-semibold text-gray-700 mb-2">데이터 로딩 중...</div>
        <div className="w-64 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="text-sm text-gray-400 mt-2">{progress}%</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-lg font-semibold text-red-600 mb-2">데이터 로드 오류</div>
          <div className="text-sm text-gray-500">{error}</div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-lg font-semibold text-gray-600 mb-2">데이터가 없습니다</div>
          <div className="text-sm text-gray-400">데이터 파이프라인을 먼저 실행해주세요.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden">
      <Header meta={data.meta} />

      <StatsBar filtered={filtered} total={buildings.length} />

      <div className="flex flex-1 overflow-hidden">
        <FilterPanel
          meta={data.meta}
          grades={grades}
          onToggleGrade={toggleGrade}
          regions={regions}
          onToggleRegion={(r) => setRegions(prev =>
            prev.includes(r) ? prev.filter(x => x !== r) : [...prev, r]
          )}
          buildingTypes={buildingTypes}
          onToggleBuildingType={(t) => setBuildingTypes(prev =>
            prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]
          )}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          open={filterOpen}
        />

        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top bar with view toggle and mobile filter toggle */}
          <div className="flex items-center justify-between px-3 py-1.5 bg-gray-50 border-b md:hidden">
            <ViewToggle mode={viewMode} onChange={setViewMode} />
            <button
              className="text-sm text-blue-600"
              onClick={() => setFilterOpen(!filterOpen)}
            >
              {filterOpen ? '필터 닫기' : '필터 열기'}
            </button>
          </div>

          <div className="flex items-center justify-end px-3 py-1 bg-gray-50 border-b gap-2 hidden md:flex">
            <ViewToggle mode={viewMode} onChange={setViewMode} />
            <button
              className="text-xs text-gray-500 hover:text-gray-700"
              onClick={() => setFilterOpen(!filterOpen)}
            >
              {filterOpen ? '필터 숨기기' : '필터 보기'}
            </button>
          </div>

          {viewMode === 'map' ? (
            <MapView buildings={filtered} />
          ) : (
            <DataTable buildings={filtered} />
          )}
        </div>
      </div>
    </div>
  );
}
