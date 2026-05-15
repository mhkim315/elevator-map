import { getGradeColor } from '../../utils/gradeUtils';
import { AGE_LABELS } from '../../constants';

interface GradeFilterProps {
  grades: string[];
  onToggle: (grade: string) => void;
}

export default function GradeFilter({ grades, onToggle }: GradeFilterProps) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-500 mb-1.5">노후도 등급</label>
      <div className="space-y-1.5">
        {(['A', 'B', 'C', 'D', 'E'] as const).map((g) => (
          <label key={g} className="flex items-center gap-2 cursor-pointer text-sm">
            <input
              type="checkbox"
              checked={grades.includes(g)}
              onChange={() => onToggle(g)}
              className="rounded border-gray-300"
            />
            <span
              className="inline-block w-3 h-3 rounded-full shrink-0"
              style={{ backgroundColor: getGradeColor(g) }}
            />
            <span className="text-gray-700">
              {g} - {AGE_LABELS[g]}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}
