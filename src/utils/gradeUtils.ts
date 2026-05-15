export function calcGrade(installDate: string): string {
  if (!installDate) return 'E';
  const year = parseInt(installDate.substring(0, 4));
  if (isNaN(year)) return 'E';
  const age = 2026 - year;
  if (age >= 25) return 'A';
  if (age >= 20) return 'B';
  if (age >= 15) return 'C';
  if (age >= 10) return 'D';
  return 'E';
}

const GRADE_ORDER: Record<string, number> = { A: 0, B: 1, C: 2, D: 3, E: 4 };

export function compareGrade(a: string, b: string): number {
  return (GRADE_ORDER[a] ?? 99) - (GRADE_ORDER[b] ?? 99);
}

export function getGradeColor(grade: string): string {
  const colors: Record<string, string> = {
    A: '#EF4444',
    B: '#F97316',
    C: '#EAB308',
    D: '#22C55E',
    E: '#9CA3AF',
  };
  return colors[grade] ?? '#9CA3AF';
}

export function getGradeLabel(grade: string): string {
  const labels: Record<string, string> = {
    A: '25년 이상 (긴급 교체)',
    B: '20~24년 (교체 권고)',
    C: '15~19년 (교체 검토)',
    D: '10~14년 (양호)',
    E: '10년 미만 (신규)',
  };
  return labels[grade] ?? '';
}
