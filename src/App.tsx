import { useState } from 'react';
import { useRegionsList, useRegionData } from './hooks/useElevatorData';
import { useFilters } from './hooks/useFilters';
import { ViewMode } from './types';
import Header from './components/Header';
import StatsBar from './components/StatsBar';
import FilterPanel from './components/FilterPanel';
import MapView from './components/MapView';
import DataTable from './components/DataTable';
import ViewToggle from './components/ViewToggle';
import RegionSelect from './components/RegionSelect';

export default function App() {
  const { regions: regionsData, loading: regionsLoading, error: regionsError } = useRegionsList();
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('map');
  const [filterOpen, setFilterOpen] = useState(true);

  // 지역 선택 시에만 데이터 로드
  const { data: regionData, loading: dataLoading, error: dataError } = useRegionData(selectedRegion);

  const buildings = regionData?.buildings ?? [];
  const { filtered, grades, toggleGrade, buildingTypes, setBuildingTypes, searchQuery, setSearchQuery } =
    useFilters(buildings);

  // regions.json 로딩 중
  if (regionsLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-gray-50">
        <div className="text-lg font-semibold text-gray-700">지역 정보 로딩 중...</div>
      </div>
    );
  }

  // regions.json 오류
  if (regionsError) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-lg font-semibold text-red-600 mb-2">데이터 로드 오류</div>
          <div className="text-sm text-gray-500">{regionsError}</div>
        </div>
      </div>
    );
  }

  // 지역 선택 화면
  if (!selectedRegion) {
    return (
      <div className="h-screen w-screen flex flex-col overflow-hidden">
        <Header />
        {regionsData && (
          <RegionSelect
            regions={regionsData.regions}
            totalBuildings={regionsData.totalBuildings}
            totalElevators={regionsData.totalElevators}
            onSelect={setSelectedRegion}
          />
        )}
      </div>
    );
  }

  // 지역 데이터 로딩 중
  if (dataLoading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="text-lg font-semibold text-gray-700 mb-2">{selectedRegion} 데이터 로딩 중...</div>
        <div className="w-64 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div className="h-full bg-blue-500 rounded-full animate-pulse" style={{ width: '60%' }} />
        </div>
        <button
          className="mt-6 text-sm text-gray-400 underline"
          onClick={() => setSelectedRegion(null)}
        >
          취소
        </button>
      </div>
    );
  }

  // 지역 데이터 오류
  if (dataError) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-lg font-semibold text-red-600 mb-2">데이터 로드 오류</div>
          <div className="text-sm text-gray-500 mb-4">{dataError}</div>
          <button
            className="text-sm text-blue-600 underline"
            onClick={() => setSelectedRegion(null)}
          >
            지역 선택으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  // 지도/테이블 화면
  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden">
      <Header
        meta={regionData?.meta}
        region={selectedRegion}
        onBack={() => setSelectedRegion(null)}
      />

      <StatsBar filtered={filtered} total={buildings.length} />

      <div className="flex flex-1 overflow-hidden">
        <FilterPanel
          meta={regionData!.meta}
          grades={grades}
          onToggleGrade={toggleGrade}
          buildingTypes={buildingTypes}
          onToggleBuildingType={(t) => setBuildingTypes(prev =>
            prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]
          )}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          open={filterOpen}
        />

        <div className="flex-1 flex flex-col overflow-hidden">
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
