import { CompactRecord, FilterState } from '../types';

export function applyFilters(
  buildings: CompactRecord[],
  filters: FilterState
): CompactRecord[] {
  return buildings.filter((b) => {
    // 등급 필터
    if (filters.grades.length > 0 && !filters.grades.includes(b[8])) return false;

    // 지역 필터
    if (filters.regions.length > 0 && !filters.regions.includes(b[10])) return false;

    // 건물용도 필터
    if (filters.buildingTypes.length > 0 && !filters.buildingTypes.includes(b[11])) return false;

    // 설치연도 범위
    const date = b[5];
    if (date) {
      const year = parseInt(date.substring(0, 4));
      if (!isNaN(year)) {
        if (year < filters.yearsRange[0] || year > filters.yearsRange[1]) return false;
      }
    }

    // 검색어
    if (filters.searchQuery) {
      const q = filters.searchQuery.toLowerCase();
      if (!b[0].toLowerCase().includes(q) && !b[1].toLowerCase().includes(q)) return false;
    }

    return true;
  });
}

export function extractAvailableYears(buildings: CompactRecord[]): [number, number] {
  let minYear = 2026;
  let maxYear = 1980;
  for (const b of buildings) {
    const date = b[5];
    if (date) {
      const year = parseInt(date.substring(0, 4));
      if (!isNaN(year)) {
        if (year < minYear) minYear = year;
        if (year > maxYear) maxYear = year;
      }
    }
  }
  return [minYear, maxYear];
}
