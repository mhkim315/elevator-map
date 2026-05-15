import { getGradeColor, getGradeLabel } from '../utils/gradeUtils';
import { CompactRecord } from '../types';

interface StatsBarProps {
  filtered: CompactRecord[];
  total: number;
}

export default function StatsBar({ filtered, total }: StatsBarProps) {
  const gradeCounts: Record<string, number> = { A: 0, B: 0, C: 0, D: 0, E: 0 };
  for (const b of filtered) {
    gradeCounts[b[8]] = (gradeCounts[b[8]] || 0) + 1;
  }

  return (
    <div className="bg-white border-b border-gray-200 px-4 py-2 text-xs text-gray-600">
      <div className="flex items-center justify-between flex-wrap gap-1">
        <span>
          검색 결과: <strong className="text-gray-800">{filtered.toLocaleString()}</strong> /
          전체 {total.toLocaleString()} 건물
        </span>
        <div className="flex items-center gap-3">
          {(['A', 'B', 'C', 'D', 'E'] as const).map((g) => (
            <span key={g} className="flex items-center gap-1">
              <span
                className="inline-block w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: getGradeColor(g) }}
              />
              <span title={getGradeLabel(g)}>
                {g}: {gradeCounts[g] || 0}
              </span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
