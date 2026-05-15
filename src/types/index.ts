/** Compact building-level elevator record (JSON 배열 기반) */
export type CompactRecord = [
  string,    // [0] 건물명
  string,    // [1] 건물주소
  number,    // [2] 위도
  number,    // [3] 경도
  string,    // [4] 대표 승강기종류
  string,    // [5] 최고령 설치일자 (YYYY-MM-DD)
  string,    // [6] 제조업체
  string,    // [7] 유지관리업체
  string,    // [8] 노후도 등급 (A/B/C/D/E)
  number,    // [9] 현장 승강기 총 대수
  string,    // [10] 시도
  string,    // [11] 건물용도(대)
  string[][], // [12] 건물 내 모든 승강기: [종류, 설치일자, 제조업체, 승강기상태][]
];

export interface ElevatorMeta {
  updated: string;
  totalBuildings: number;
  totalElevators: number;
  regions: string[];
  manufacturers: string[];
  buildingTypes: string[];
}

export interface ElevatorDataset {
  meta: ElevatorMeta;
  buildings: CompactRecord[];
}

export interface FilterState {
  grades: string[];
  regions: string[];
  buildingTypes: string[];
  yearsRange: [number, number];
  searchQuery: string;
}

export const GRADE_COLORS: Record<string, string> = {
  A: '#EF4444', // 25년 이상
  B: '#F97316', // 20~24년
  C: '#EAB308', // 15~19년
  D: '#22C55E', // 10~14년
  E: '#9CA3AF', // 10년 미만
};

export const GRADE_LABELS: Record<string, string> = {
  A: '25년 이상 (긴급 교체)',
  B: '20~24년 (교체 권고)',
  C: '15~19년 (교체 검토)',
  D: '10~14년 (양호)',
  E: '10년 미만 (신규)',
};

export type ViewMode = 'map' | 'table';
