/**
 * 데이터 파이프라인 스크립트
 *
 * 한국승강기안전공단 CSV + 좌표 CSV → 필터링 → 좌표 매칭 → 건물 그룹핑 → Compact JSON
 *
 * 사용: node scripts/build-data.mjs
 *
 * 입력 파일 (환경변수로 경로 지정 가능):
 *   - PRE_CSV: 2015년 이전 CSV
 *   - POST_CSV: 2016년 이후 CSV
 *   - COORD_CSV: 좌표 CSV
 *   - OUTPUT: 출력 JSON 경로
 */

import { createRequire } from 'module';
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { dirname, resolve } from 'path';

const require = createRequire(import.meta.url);
const { parse } = require('csv-parse/sync');

// === 설정 ===
const PRE_CSV = process.env.PRE_CSV || 'C:/Users/user/Downloads/한국승강기안전공단_승강기 설치 현황_20251231/한국승강기안전공단_승강기 설치 현황_2015년 이전.csv';
const POST_CSV = process.env.POST_CSV || 'C:/Users/user/Downloads/한국승강기안전공단_승강기 설치 현황_20251231/한국승강기안전공단_승강기 설치 현황_2016년 이후.csv';
const COORD_CSV = process.env.COORD_CSV || 'C:/Users/user/Downloads/한국승강기안전공단_승강기 설치 건물 좌표 목록_20251212.csv';
const OUTPUT = process.env.OUTPUT || resolve(import.meta.dirname, '../public/data/elevators.json');

// 필터링 조건
const ELEVATOR_CLASSIFICATIONS = ['엘리베이터'];
const ELEVATOR_TYPES = new Set([
  '승객용', '장애인용', '병원용', '화물용',
  '소방구조/장애인용', '소방구조/장애/승객화물', '장애/승객화물용', '소방구조용'
]);
const ACTIVE_STATUS = '운행중';

// 15년 이상 (A/B/C 등급)만 출력하여 파일 크기 최적화
const MIN_GRADE_INDEX = 2; // 0=A, 1=B, 2=C - C 이상만 포함

// === 1. CSV 읽기 ===
function stripBOM(text) {
  // UTF-8 BOM (0xFEFF) 제거
  if (text.charCodeAt(0) === 0xFEFF) return text.substring(1);
  return text;
}

function loadCSV(filePath) {
  console.log(`  읽는 중: ${filePath}`);
  let content = readFileSync(filePath, 'utf-8');
  content = stripBOM(content);
  // Windows CRLF -> LF
  content = content.replace(/\r\n/g, '\n').replace(/\r/g, '');
  const records = parse(content, {
    columns: true,
    skip_empty_lines: true,
    relax_column_count: true,
    bom: false,  // 이미 수동 처리
  });
  console.log(`  → ${records.length.toLocaleString()} 레코드`);
  return records;
}

// === 2. 좌표 맵 구축 ===
function buildCoordMap(records) {
  const map = new Map();
  let matched = 0;
  for (const r of records) {
    const name = (r.건물명 || '').trim();
    const addr = (r.건물주소 || '').trim();
    if (!name || !addr) continue;
    const key = `${name}|${addr}`;
    const lat = parseFloat(r.위도);
    const lng = parseFloat(r.경도);
    if (!isNaN(lat) && !isNaN(lng)) {
      map.set(key, { lat, lng });
      matched++;
    }
  }
  console.log(`  → ${matched.toLocaleString()} 건물 좌표 로드 (${map.size.toLocaleString()} 고유)`);
  return map;
}

// === 3. 승강기 필터링 및 좌표 매칭 ===
function processElevators(records, coordMap) {
  console.log(`  필터링 중...`);

  const buildingMap = new Map(); // key: "name|addr" -> building group

  let total = 0;
  let filtered = 0;
  let coordMatched = 0;

  for (const r of records) {
    total++;
    const classification = (r.승강기구분 || '').trim();
    const type = (r.승강기종류 || '').trim();
    const status = (r.승강기상태 || '').trim();
    const name = (r.건물명 || '').trim();
    const addr = (r.건물주소 || '').trim();
    const installDate = (r.설치일자 || '').trim();

    // 필터링
    if (!ELEVATOR_CLASSIFICATIONS.includes(classification)) continue;
    if (!ELEVATOR_TYPES.has(type)) continue;
    if (status !== ACTIVE_STATUS) continue;
    if (!name || !addr) continue;

    filtered++;

    // 좌표 매칭
    const coordKey = `${name}|${addr}`;
    const coord = coordMap.get(coordKey);
    if (coord) coordMatched++;

    // 건물 그룹핑
    const existing = buildingMap.get(coordKey);
    if (existing) {
      existing.elevators.push([type, installDate, (r.제조업체 || '').trim()]);
      // 최고령 설치일자 업데이트
      if (installDate && installDate < existing.oldestDate) {
        existing.oldestDate = installDate;
        existing.oldestType = type;
        existing.oldestManufacturer = (r.제조업체 || '').trim();
        existing.maintenanceCompany = (r.유지관리업체 || '').trim();
      }
      // 제조업체 집계
      const mfr = (r.제조업체 || '').trim();
      if (mfr && !existing.manufacturers.has(mfr)) {
        existing.manufacturers.add(mfr);
        existing.manufacturerList.push(mfr);
      }
    } else {
      const mfr = (r.제조업체 || '').trim();
      buildingMap.set(coordKey, {
        name,
        address: addr,
        coord,
        oldestDate: installDate,
        oldestType: type,
        oldestManufacturer: mfr,
        maintenanceCompany: (r.유지관리업체 || '').trim(),
        region: (r.시도 || '').trim(),
        buildingUse: (r['건물용도(대)'] || '').trim(),
        manufacturers: new Set(mfr ? [mfr] : []),
        manufacturerList: mfr ? [mfr] : [],
        elevators: [[type, installDate, mfr]],
      });
    }
  }

  console.log(`  총 ${total.toLocaleString()} → 필터 후 ${filtered.toLocaleString()} → 좌표매칭 ${coordMatched.toLocaleString()} → 건물 ${buildingMap.size.toLocaleString()}곳`);
  return { buildingMap, coordMatched };
}

// === 4. 등급 계산 ===
function calcGrade(installDate) {
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

// === 5. Compact JSON 생성 ===
function buildCompactJSON(buildingMap) {
  const buildings = [];
  const regionsSet = new Set();
  const manufacturersSet = new Set();
  const buildingTypesSet = new Set();
  let totalElevators = 0;

  for (const [key, b] of buildingMap) {
    // 좌표가 없는 건물은 건너뛰기 (지도 표시 불가)
    if (!b.coord) continue;

    const grade = calcGrade(b.oldestDate);

    // MIN_GRADE_INDEX 이상 등급만 포함 (0=A, 1=B, 2=C)
    const gradeOrder = { A: 0, B: 1, C: 2, D: 3, E: 4 };
    if ((gradeOrder[grade] ?? 99) > MIN_GRADE_INDEX) continue;

    const record = [
      b.name,
      b.address,
      b.coord.lat,
      b.coord.lng,
      b.oldestType,
      b.oldestDate || '',
      b.oldestManufacturer || b.manufacturerList[0] || '',
      b.maintenanceCompany || '',
      grade,
      b.elevators.length,
      b.region || '',
      b.buildingUse || '',
      b.elevators.map(e => [String(e[0]||''), String(e[1]||''), String(e[2]||'')]),
    ];

    buildings.push(record);
    totalElevators += b.elevators.length;

    if (b.region) regionsSet.add(b.region);
    for (const m of b.manufacturerList) {
      if (m) manufacturersSet.add(m);
    }
    if (b.buildingUse) buildingTypesSet.add(b.buildingUse);
  }

  // 정렬: 등급 높은 순 (A → E)
  const gradeOrder = { A: 0, B: 1, C: 2, D: 3, E: 4 };
  buildings.sort((a, b) => {
    const gDiff = (gradeOrder[a[8]] ?? 99) - (gradeOrder[b[8]] ?? 99);
    if (gDiff !== 0) return gDiff;
    // 동일 등급은 대수 내림차순
    return b[9] - a[9];
  });

  const dataset = {
    meta: {
      updated: new Date().toISOString().split('T')[0],
      totalBuildings: buildings.length,
      totalElevators,
      regions: [...regionsSet].sort(),
      manufacturers: [...manufacturersSet].sort(),
      buildingTypes: [...buildingTypesSet].sort(),
    },
    buildings,
  };

  return dataset;
}

// === 6. 메인 ===
function main() {
  console.log('=== 노후 승강기 영업 지도 데이터 파이프라인 ===\n');

  // 좌표 CSV 로드
  console.log('[1/4] 좌표 데이터 로드...');
  const coordRecords = loadCSV(COORD_CSV);
  const coordMap = buildCoordMap(coordRecords);

  // 승강기 CSV 로드 및 처리
  console.log('\n[2/4] 2015년 이전 승강기 데이터 처리...');
  const preRecords = loadCSV(PRE_CSV);
  const result1 = processElevators(preRecords, coordMap);

  console.log('\n[3/4] 2016년 이후 승강기 데이터 처리...');
  const postRecords = loadCSV(POST_CSV);
  const result2 = processElevators(postRecords, coordMap);

  // 건물 맵 병합
  console.log('\n[4/4] 건물 데이터 병합 및 JSON 출력...');
  const mergedMap = new Map([...result1.buildingMap, ...result2.buildingMap]);
  console.log(`  병합 후 건물 수: ${mergedMap.size.toLocaleString()}`);

  const dataset = buildCompactJSON(mergedMap);

  // 출력
  const json = JSON.stringify(dataset);
  mkdirSync(dirname(OUTPUT), { recursive: true });
  writeFileSync(OUTPUT, json, 'utf-8');

  const bytes = Buffer.byteLength(json, 'utf-8');
  console.log(`\n=== 완료 ===`);
  console.log(`  건물 수: ${dataset.meta.totalBuildings.toLocaleString()}`);
  console.log(`  승강기 수: ${dataset.meta.totalElevators.toLocaleString()}`);
  console.log(`  JSON 크기: ${(bytes / 1024 / 1024).toFixed(1)}MB`);
  console.log(`  지역(시도): ${dataset.meta.regions.length}개`);
  console.log(`  제조업체: ${dataset.meta.manufacturers.length}개`);
  console.log(`  건물용도: ${dataset.meta.buildingTypes.length}개`);
  console.log(`  출력: ${OUTPUT}`);
}

main();
