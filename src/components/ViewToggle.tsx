import { ViewMode } from '../types';

interface ViewToggleProps {
  mode: ViewMode;
  onChange: (mode: ViewMode) => void;
}

export default function ViewToggle({ mode, onChange }: ViewToggleProps) {
  return (
    <div className="flex border border-gray-300 rounded overflow-hidden bg-white text-sm">
      <button
        className={`px-3 py-1 ${mode === 'map' ? 'bg-blue-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
        onClick={() => onChange('map')}
      >
        지도
      </button>
      <button
        className={`px-3 py-1 ${mode === 'table' ? 'bg-blue-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
        onClick={() => onChange('table')}
      >
        테이블
      </button>
    </div>
  );
}
