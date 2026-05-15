/**
 * 기존 elevators.json을 지역별로 분할하는 스크립트
 */
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';

const DATA_DIR = resolve(import.meta.dirname, '../public/data');
const INPUT = `${DATA_DIR}/elevators.json`;

console.log('=== elevators.json 지역별 분할 ===\n');

const raw = readFileSync(INPUT, 'utf-8');
console.log(`  읽음: ${(Buffer.byteLength(raw, 'utf-8') / 1024 / 1024).toFixed(1)}MB`);

const dataset = JSON.parse(raw);
const buildings = dataset.buildings;
const meta = dataset.meta;

console.log(`  건물: ${buildings.length.toLocaleString()}`);

// 지역별 분할
const byRegion = {};
for (const b of buildings) {
  const region = b[10] || '기타';
  if (!byRegion[region]) byRegion[region] = [];
  byRegion[region].push(b);
}

const regionMeta = [];

for (const [region, regionBuildings] of Object.entries(byRegion)) {
  const regionData = { meta: { ...meta, region, regionBuildings: regionBuildings.length }, buildings: regionBuildings };
  const filename = `${region}.json`;
  const json = JSON.stringify(regionData);
  writeFileSync(`${DATA_DIR}/${filename}`, json, 'utf-8');
  const size = Buffer.byteLength(json, 'utf-8');
  regionMeta.push({ name: region, count: regionBuildings.length, file: filename, size });
  console.log(`  [${region}] ${regionBuildings.length.toLocaleString()}건 → ${(size/1024/1024).toFixed(1)}MB`);
}

// regions.json
const regionsInfo = {
  updated: meta.updated,
  totalBuildings: meta.totalBuildings,
  totalElevators: meta.totalElevators,
  regions: regionMeta.sort((a, b) => b.count - a.count),
  manufacturers: meta.manufacturers,
  buildingTypes: meta.buildingTypes,
};
writeFileSync(`${DATA_DIR}/regions.json`, JSON.stringify(regionsInfo), 'utf-8');

console.log(`\n=== 완료 ===`);
console.log(`  regions.json 생성 (${regionMeta.length}개 지역)`);
