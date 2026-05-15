export function formatDate(dateStr: string): string {
  if (!dateStr) return '-';
  return dateStr;
}

export function formatYearRange(min: number, max: number): string {
  return `${min}년 ~ ${max}년`;
}

export function formatBuildingCount(n: number): string {
  return n.toLocaleString();
}

export function extractRegion(addr: string): string {
  // 주소에서 '서울', '경기' 등 첫 번째 부분 추출
  const parts = addr.split(' ');
  return parts.length > 1 ? parts[0] : addr;
}
