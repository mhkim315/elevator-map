import { CompactRecord } from '../types';

interface BuildingPopupProps {
  building: CompactRecord;
}

export default function BuildingPopup({ building }: BuildingPopupProps) {
  const [name, addr, lat, lng, type, date, mfr, maint, grade, count, region, bUse, elevators] = building;

  return (
    <div>
      <div className="building-name">{name}</div>
      <table className="popup-table">
        <tbody>
          <tr><th>주소</th><td>{addr}</td></tr>
          <tr><th>건물용도</th><td>{bUse}</td></tr>
          <tr><th>승강기 대수</th><td>{count}대</td></tr>
          <tr><th>최고령 설치일</th><td>{date}</td></tr>
          <tr><th>노후도 등급</th><td>
            <span className={`inline-block px-1.5 py-0.5 rounded text-xs font-bold text-white`}
              style={{ backgroundColor: gradeColor(grade) }}>
              {grade}
            </span>
          </td></tr>
          <tr><th>제조업체</th><td>{mfr}</td></tr>
          <tr><th>유지관리</th><td>{maint}</td></tr>
        </tbody>
      </table>

      {elevators.length > 0 && (
        <div className="mt-2">
          <div className="text-xs font-medium text-gray-500 mb-1">
            전체 승강기 목록 ({elevators.length}대)
          </div>
          {elevators.slice(0, 10).map((elev, i) => (
            <div key={i} className="elevator-list-item">
              <div className="flex justify-between">
                <span className="font-medium">{elev[0]}</span>
                <span className="text-gray-400">{elev[1]}</span>
              </div>
              <div className="text-gray-500">{elev[2]}</div>
            </div>
          ))}
          {elevators.length > 10 && (
            <div className="text-xs text-gray-400 mt-1">
              외 {elevators.length - 10}대
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function gradeColor(g: string): string {
  const colors: Record<string, string> = {
    A: '#EF4444', B: '#F97316', C: '#EAB308', D: '#22C55E', E: '#9CA3AF',
  };
  return colors[g] ?? '#9CA3AF';
}
