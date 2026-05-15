import { useState, useMemo } from 'react';
import { CompactRecord, FilterState } from '../types';
import { applyFilters, extractAvailableYears } from '../utils/filterUtils';
import { DEFAULT_GRADES } from '../constants';

export function useFilters(buildings: CompactRecord[]) {
  const [grades, setGrades] = useState<string[]>([...DEFAULT_GRADES]);
  const [regions, setRegions] = useState<string[]>([]);
  const [buildingTypes, setBuildingTypes] = useState<string[]>([]);
  const [yearsRange, setYearsRange] = useState<[number, number]>(() => extractAvailableYears(buildings));
  const [searchQuery, setSearchQuery] = useState('');

  const filters: FilterState = useMemo(() => ({
    grades,
    regions,
    buildingTypes,
    yearsRange,
    searchQuery,
  }), [grades, regions, buildingTypes, yearsRange, searchQuery]);

  const filtered = useMemo(
    () => (buildings.length > 0 ? applyFilters(buildings, filters) : []),
    [buildings, filters]
  );

  const availableYears = useMemo(() => extractAvailableYears(buildings), [buildings]);

  const gradeCounts = useMemo(() => {
    const counts: Record<string, number> = { A: 0, B: 0, C: 0, D: 0, E: 0 };
    for (const b of buildings) {
      counts[b[8]] = (counts[b[8]] || 0) + 1;
    }
    return counts;
  }, [buildings]);

  const toggleGrade = (g: string) => {
    setGrades((prev) =>
      prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g]
    );
  };

  const toggleFilterArray = (
    setter: React.Dispatch<React.SetStateAction<string[]>>,
    value: string
  ) => {
    setter((prev) =>
      prev.includes(value) ? prev.filter((x) => x !== value) : [...prev, value]
    );
  };

  return {
    filters,
    filtered,
    gradeCounts,
    availableYears,
    grades,
    setGrades,
    toggleGrade,
    regions,
    setRegions,
    buildingTypes,
    setBuildingTypes,
    yearsRange,
    setYearsRange,
    searchQuery,
    setSearchQuery,
    toggleFilterArray,
  };
}
