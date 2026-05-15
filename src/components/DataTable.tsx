import { useState, useMemo } from 'react';
import { CompactRecord } from '../types';
import { getGradeColor } from '../utils/gradeUtils';

interface DataTableProps {
  buildings: CompactRecord[];
}

type SortKey = 'name' | 'address' | 'grade' | 'date' | 'count' | 'region' | 'buildingType';

export default function DataTable({ buildings }: DataTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>('grade');
  const [sortAsc, setSortAsc] = useState(true);
  const [page, setPage] = useState(0);
  const rowsPerPage = 50;
  const totalPages = Math.ceil(buildings.length / rowsPerPage);

  const sorted = useMemo(() => {
    const arr = [...buildings];
    arr.sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case 'name': cmp = a[0].localeCompare(b[0], 'ko'); break;
        case 'address': cmp = a[1].localeCompare(b[1], 'ko'); break;
        case 'grade': cmp = (a[8] || 'E').localeCompare(b[8] || 'E'); break;
        case 'date': cmp = (a[5] || '').localeCompare(b[5] || ''); break;
        case 'count': cmp = a[9] - b[9]; break;
        case 'region': cmp = (a[10] || '').localeCompare(b[10] || '', 'ko'); break;
        case 'buildingType': cmp = (a[11] || '').localeCompare(b[11] || '', 'ko'); break;
      }
      return sortAsc ? cmp : -cmp;
    });
    return arr;
  }, [buildings, sortKey, sortAsc]);

  const pageData = sorted.slice(page * rowsPerPage, (page + 1) * rowsPerPage);

  // Reset page when filtered data changes
  if (page >= totalPages && totalPages > 0) setPage(0);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else { setSortKey(key); setSortAsc(true); }
  };

  const SortHeader = ({ column, children }: { column: SortKey; children: React.ReactNode }) => (
    <th
      className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700 whitespace-nowrap"
      onClick={() => handleSort(column)}
    >
      {children}
      {sortKey === column && (
        <span className="ml-1">{sortAsc ? '▲' : '▼'}</span>
      )}
    </th>
  );

  return (
    <div className="flex-1 overflow-auto bg-white">
      <div className="overflow-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50 sticky top-0">
            <tr>
              <SortHeader column="grade">등급</SortHeader>
              <SortHeader column="name">건물명</SortHeader>
              <SortHeader column="address">주소</SortHeader>
              <SortHeader column="buildingType">용도</SortHeader>
              <SortHeader column="date">최고령 설치일</SortHeader>
              <SortHeader column="count">대수</SortHeader>
              <SortHeader column="region">지역</SortHeader>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 text-sm">
            {pageData.map((b, idx) => (
              <tr key={idx} className="hover:bg-gray-50">
                <td className="px-3 py-2 whitespace-nowrap">
                  <span
                    className="inline-block w-6 text-center text-xs font-bold text-white rounded"
                    style={{ backgroundColor: getGradeColor(b[8]) }}
                  >
                    {b[8]}
                  </span>
                </td>
                <td className="px-3 py-2 font-medium text-gray-900 max-w-[200px] truncate" title={b[0]}>
                  {b[0]}
                </td>
                <td className="px-3 py-2 text-gray-500 max-w-[300px] truncate" title={b[1]}>
                  {b[1]}
                </td>
                <td className="px-3 py-2 text-gray-500">{b[11]}</td>
                <td className="px-3 py-2 text-gray-500 whitespace-nowrap">{b[5]}</td>
                <td className="px-3 py-2 text-gray-500 text-center">{b[9]}</td>
                <td className="px-3 py-2 text-gray-500">{b[10]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-t">
          <span className="text-sm text-gray-500">
            총 {buildings.length.toLocaleString()}건 중 {(page * rowsPerPage) + 1}-
            {Math.min((page + 1) * rowsPerPage, buildings.length)}건
          </span>
          <div className="flex gap-1">
            <button
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
              className="px-3 py-1 text-sm border rounded disabled:opacity-30 hover:bg-gray-100"
            >
              이전
            </button>
            <span className="px-3 py-1 text-sm text-gray-500">
              {page + 1}/{totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="px-3 py-1 text-sm border rounded disabled:opacity-30 hover:bg-gray-100"
            >
              다음
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
