import { GRADE_COLORS, GRADE_LABELS } from './types';

export { GRADE_COLORS, GRADE_LABELS };

export const DEFAULT_CENTER: [number, number] = [36.5, 127.8];
export const DEFAULT_ZOOM = 7;
export const MIN_ZOOM = 6;
export const MAX_ZOOM = 18;

export const TILE_URL = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
export const TILE_ATTR = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

export const ALL_GRADES = ['A', 'B', 'C', 'D', 'E'] as const;
export const DEFAULT_GRADES = ['A', 'B', 'C'];

export const BUILDING_COLORS: Record<string, string> = {
  A: '#EF4444',
  B: '#F97316',
  C: '#EAB308',
  D: '#22C55E',
  E: '#9CA3AF',
};

export const AGE_LABELS: Record<string, string> = {
  A: '25년+',
  B: '20~24년',
  C: '15~19년',
  D: '10~14년',
  E: '10년 미만',
};
