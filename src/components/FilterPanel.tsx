import GradeFilter from './filters/GradeFilter';
import CheckboxFilter from './filters/CheckboxFilter';
import SearchInput from './filters/SearchInput';
import { ElevatorMeta } from '../types';

interface FilterPanelProps {
  meta: ElevatorMeta;
  grades: string[];
  onToggleGrade: (g: string) => void;
  regions: string[];
  onToggleRegion: (r: string) => void;
  buildingTypes: string[];
  onToggleBuildingType: (t: string) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  open: boolean;
}

export default function FilterPanel({
  meta,
  grades,
  onToggleGrade,
  regions,
  onToggleRegion,
  buildingTypes,
  onToggleBuildingType,
  searchQuery,
  onSearchChange,
  open,
}: FilterPanelProps) {
  if (!open) return null;

  return (
    <aside className="w-64 bg-white border-r border-gray-200 overflow-y-auto shrink-0 hidden md:block">
      <div className="p-3 space-y-4">
        <SearchInput value={searchQuery} onChange={onSearchChange} />

        <GradeFilter grades={grades} onToggle={onToggleGrade} />

        <CheckboxFilter
          label="지역 (시도)"
          options={meta.regions}
          selected={regions}
          onToggle={onToggleRegion}
        />

        <CheckboxFilter
          label="건물 용도"
          options={meta.buildingTypes}
          selected={buildingTypes}
          onToggle={onToggleBuildingType}
          max={15}
        />
      </div>
    </aside>
  );
}
