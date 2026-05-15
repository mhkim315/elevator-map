import { useMemo, useState } from 'react';

interface CheckboxFilterProps {
  label: string;
  options: string[];
  selected: string[];
  onToggle: (value: string) => void;
  max?: number;
}

export default function CheckboxFilter({
  label,
  options,
  selected,
  onToggle,
  max = 10,
}: CheckboxFilterProps) {
  const [showAll, setShowAll] = useState(false);
  const sorted = useMemo(
    () => [...options].sort((a, b) => a.localeCompare(b, 'ko')),
    [options]
  );
  const visible = showAll ? sorted : sorted.slice(0, max);

  if (options.length === 0) return null;

  return (
    <div>
      <label className="block text-xs font-medium text-gray-500 mb-1.5">{label}</label>
      <div className="space-y-1 max-h-52 overflow-y-auto">
        {visible.map((opt) => (
          <label key={opt} className="flex items-center gap-2 cursor-pointer text-sm">
            <input
              type="checkbox"
              checked={selected.includes(opt)}
              onChange={() => onToggle(opt)}
              className="rounded border-gray-300"
            />
            <span className="text-gray-700 truncate">{opt}</span>
          </label>
        ))}
      </div>
      {sorted.length > max && (
        <button
          className="text-xs text-blue-600 hover:text-blue-800 mt-1"
          onClick={() => setShowAll(!showAll)}
        >
          {showAll ? '접기' : `${sorted.length - max}개 더보기`}
        </button>
      )}
    </div>
  );
}
