import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import XLSX from 'xlsx';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const rawDataDir = path.join(projectRoot, 'src', 'raw_data');
const outputDataDir = path.join(projectRoot, 'src', 'data');

function parseNum(val) {
  if (val === null || val === undefined) return 0;
  if (typeof val === 'number') return val;
  const cleaned = String(val).replace(/,/g, '').trim();
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}

// ----------------------------------------------------
// 1. Process Air Quality Telemetry (CPCB Continuous Ambient AQ)
// ----------------------------------------------------
console.log('Processing Air Quality files...');
const airStationConfigs = [
  {
    id: 'bkc_mumbai',
    fileName: 'CONTINUOUS-AIR-QUALITY-byculla.xlsx',
    stationName: 'Bandra Kurla Complex, Mumbai - IITM',
    city: 'Mumbai',
    district: 'Mumbai Suburban',
    state: 'Maharashtra',
    lat: 19.0657,
    lng: 72.8687,
    elevationM: 8,
  },
  {
    id: 'powai_mumbai',
    fileName: 'CONTINUOUS-AIR-QUALITY-bandra.xlsx',
    stationName: 'Powai, Mumbai - MPCB',
    city: 'Mumbai',
    district: 'Mumbai Suburban',
    state: 'Maharashtra',
    lat: 19.1176,
    lng: 72.9060,
    elevationM: 35,
  },
  {
    id: 'kalamboli_navimumbai',
    fileName: 'CONTINUOUS-AIR-QUALITY-navimumbai.xlsx',
    stationName: 'Sector-2E Kalamboli, Navi Mumbai - MPCB',
    city: 'Navi Mumbai',
    district: 'Thane / Raigad border',
    state: 'Maharashtra',
    lat: 19.0270,
    lng: 73.1042,
    elevationM: 12,
  },
];

const processedAirStations = [];

airStationConfigs.forEach((cfg) => {
  const filePath = path.join(rawDataDir, cfg.fileName);
  if (!fs.existsSync(filePath)) {
    console.warn(`Air file not found: ${filePath}`);
    return;
  }

  const wb = XLSX.readFile(filePath);
  const sheet = wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });

  // Rows 0-10 contain headers & metadata
  const detectedStation = (rows[5] && rows[5][2]) || cfg.stationName;
  const headerRow = rows[10] || [];
  const dataRows = rows.slice(11).filter((r) => r && r[0]);

  const timeline = [];
  const paramNames = ['PM2.5', 'PM10', 'NO', 'NO2', 'NH3', 'SO2', 'CO', 'OZONE'];

  dataRows.forEach((r) => {
    const fromDate = r[0];
    const toDate = r[1];
    const entry = { fromDate, toDate };
    paramNames.forEach((p) => {
      const idx = headerRow.indexOf(p);
      if (idx !== -1 && r[idx] !== undefined && r[idx] !== null && r[idx] !== '') {
        const num = parseFloat(r[idx]);
        entry[p] = isNaN(num) ? null : Number(num.toFixed(2));
      } else {
        entry[p] = null;
      }
    });
    timeline.push(entry);
  });

  // Calculate comprehensive statistics for each parameter
  const parameters = {};
  paramNames.forEach((p) => {
    const validVals = timeline.map((t) => t[p]).filter((v) => v !== null && !isNaN(v));
    if (validVals.length > 0) {
      const sum = validVals.reduce((a, b) => a + b, 0);
      const avg = Number((sum / validVals.length).toFixed(2));
      const min = Math.min(...validVals);
      const max = Math.max(...validVals);
      const latest = validVals[validVals.length - 1];

      // National Ambient Air Quality Standard (NAAQS) 24hr benchmarks in India
      const naaqs24h = {
        'PM2.5': 60, // µg/m³
        'PM10': 100, // µg/m³
        'NO2': 80, // µg/m³
        'SO2': 80, // µg/m³
        'CO': 2.0, // mg/m³ (8h)
        'OZONE': 100, // µg/m³ (8h)
        'NH3': 400, // µg/m³
        'NO': null,
      }[p];

      let status = 'Good';
      if (naaqs24h) {
        if (avg > naaqs24h * 1.5) status = 'Critical / Severe';
        else if (avg > naaqs24h) status = 'Moderate / Exceedance';
        else if (avg > naaqs24h * 0.5) status = 'Satisfactory';
        else status = 'Good';
      }

      parameters[p] = {
        avg,
        min,
        max,
        latest,
        count: validVals.length,
        unit: p === 'CO' ? 'mg/m³' : 'µg/m³',
        naaqs24h: naaqs24h ?? null,
        status,
        exceedanceCount: naaqs24h ? validVals.filter((v) => v > naaqs24h).length : 0,
      };
    }
  });

  // Calculate AQI category based on PM2.5 or PM10
  let primaryAqiStatus = 'Good';
  let primaryScore = 40;
  if (parameters['PM2.5']) {
    const val = parameters['PM2.5'].avg;
    if (val > 120) { primaryAqiStatus = 'Severe'; primaryScore = 90; }
    else if (val > 90) { primaryAqiStatus = 'Very Poor'; primaryScore = 75; }
    else if (val > 60) { primaryAqiStatus = 'Moderate'; primaryScore = 60; }
    else if (val > 30) { primaryAqiStatus = 'Satisfactory'; primaryScore = 40; }
    else { primaryAqiStatus = 'Good'; primaryScore = 20; }
  } else if (parameters['PM10']) {
    const val = parameters['PM10'].avg;
    if (val > 250) { primaryAqiStatus = 'Severe'; primaryScore = 85; }
    else if (val > 100) { primaryAqiStatus = 'Moderate'; primaryScore = 62; }
    else { primaryAqiStatus = 'Good'; primaryScore = 30; }
  }

  processedAirStations.push({
    id: cfg.id,
    stationName: detectedStation,
    city: cfg.city,
    district: cfg.district,
    state: cfg.state,
    lat: cfg.lat,
    lng: cfg.lng,
    elevationM: cfg.elevationM,
    primaryAqiStatus,
    primaryScore,
    totalReadings: timeline.length,
    startDate: timeline[0]?.fromDate || '2026-10-16 00:00',
    endDate: timeline[timeline.length - 1]?.toDate || '2026-10-17 23:59',
    parameters,
    timeline: timeline.slice(-48), // 48 half-hour slots = recent 24-hour continuous cycle
  });
});

console.log(`Successfully parsed ${processedAirStations.length} air quality stations.`);

// ----------------------------------------------------
// 2. Process Groundwater Depth to Water Level (CGWB January 2026)
// ----------------------------------------------------
console.log('Processing Groundwater Depth to Water Level file...');
const gwFilePath = path.join(rawDataDir, 'January 2026 depth to water level(in mbgl).xlsx');
const gwWb = XLSX.readFile(gwFilePath);
const gwSheet = gwWb.Sheets[gwWb.SheetNames[0]];
const gwRows = XLSX.utils.sheet_to_json(gwSheet);

const districtMap = {};
const representativeWells = [];

gwRows.forEach((r) => {
  const district = (r.DISTRICT || '').trim();
  const dtwl = parseFloat(r.DTWL);
  if (!district || isNaN(dtwl)) return;

  if (!districtMap[district]) {
    districtMap[district] = {
      district,
      state: (r.STATE_UT || 'Maharashtra').trim(),
      totalWells: 0,
      dtwlSum: 0,
      values: [],
      blocks: new Set(),
      villages: new Set(),
      shallowCount: 0,   // < 5 mbgl: Safe / High recharge
      moderateCount: 0,  // 5 - 10 mbgl: Moderate extraction
      deepCount: 0,      // 10 - 20 mbgl: Semi-critical
      criticalCount: 0,  // > 20 mbgl: Over-exploited / Critical
      latSum: 0,
      lngSum: 0,
      coordsCount: 0,
    };
  }

  const dObj = districtMap[district];
  dObj.totalWells++;
  dObj.dtwlSum += dtwl;
  dObj.values.push(dtwl);
  if (r.BLOCK) dObj.blocks.add(r.BLOCK.trim());
  if (r.VILLAGE) dObj.villages.add(r.VILLAGE.trim());

  if (dtwl < 5.0) dObj.shallowCount++;
  else if (dtwl <= 10.0) dObj.moderateCount++;
  else if (dtwl <= 20.0) dObj.deepCount++;
  else dObj.criticalCount++;

  const lat = parseFloat(r.LATITUDE);
  const lng = parseFloat(r.LONGITUDE);
  if (!isNaN(lat) && !isNaN(lng)) {
    dObj.latSum += lat;
    dObj.lngSum += lng;
    dObj.coordsCount++;

    // Keep sample wells for map rendering (e.g. 1 out of 4, or deep/shallow extremes)
    representativeWells.push({
      district,
      block: r.BLOCK ? r.BLOCK.trim() : '',
      village: r.VILLAGE ? r.VILLAGE.trim() : '',
      lat,
      lng,
      dtwl: Number(dtwl.toFixed(2)),
      category: dtwl < 5 ? 'Shallow (<5m)' : dtwl <= 10 ? 'Moderate (5-10m)' : dtwl <= 20 ? 'Deep (10-20m)' : 'Critical (>20m)',
    });
  }
});

const processedGroundwaterDistricts = Object.values(districtMap).map((d) => {
  const avg = Number((d.dtwlSum / d.totalWells).toFixed(2));
  const sortedVals = [...d.values].sort((a, b) => a - b);
  const min = sortedVals[0];
  const max = sortedVals[sortedVals.length - 1];
  const median = sortedVals[Math.floor(sortedVals.length / 2)];

  let riskCategory = 'Safe / Abundant Aquifer';
  let pressureScore = 25; // 0-100 scale
  if (avg > 15 || d.criticalCount > 5) {
    riskCategory = 'Critical / Over-Exploited';
    pressureScore = 85;
  } else if (avg > 8 || d.deepCount > d.shallowCount) {
    riskCategory = 'Semi-Critical / Stress';
    pressureScore = 65;
  } else if (avg > 5) {
    riskCategory = 'Moderate / Sensitive';
    pressureScore = 48;
  }

  return {
    district: d.district,
    state: d.state,
    totalWells: d.totalWells,
    avgDtwlMbgl: avg,
    medianDtwlMbgl: median,
    minDtwlMbgl: min,
    maxDtwlMbgl: max,
    blocksCount: d.blocks.size,
    villagesCount: d.villages.size,
    shallowCount: d.shallowCount,
    moderateCount: d.moderateCount,
    deepCount: d.deepCount,
    criticalCount: d.criticalCount,
    riskCategory,
    pressureScore,
    centerLat: d.coordsCount > 0 ? Number((d.latSum / d.coordsCount).toFixed(4)) : null,
    centerLng: d.coordsCount > 0 ? Number((d.lngSum / d.coordsCount).toFixed(4)) : null,
  };
}).sort((a, b) => b.avgDtwlMbgl - a.avgDtwlMbgl);

// Calculate overall state groundwater metrics
const totalGwWells = gwRows.length;
const totalDtwlSum = processedGroundwaterDistricts.reduce((acc, d) => acc + (d.avgDtwlMbgl * d.totalWells), 0);
const stateAvgDtwl = Number((totalDtwlSum / totalGwWells).toFixed(2));

const groundwaterSummary = {
  totalWellsMonitored: totalGwWells,
  districtsCovered: processedGroundwaterDistricts.length,
  stateAvgDtwlMbgl: stateAvgDtwl,
  monitoringPeriod: 'January 2026',
  sourceAgency: 'Central Ground Water Board (CGWB) & GSDA Maharashtra',
  districts: processedGroundwaterDistricts,
  // Slice representative wells down to a clean map-ready set (~150 wells across all districts)
  sampleWells: representativeWells.filter((_, idx) => idx % 5 === 0),
};

console.log(`Successfully processed ${processedGroundwaterDistricts.length} groundwater districts (${totalGwWells} wells).`);

// ----------------------------------------------------
// 3. Process Forest Cover Variables (FSI SoI Assessment)
// ----------------------------------------------------
console.log('Processing Forest Cover file...');
const fcFilePath = path.join(rawDataDir, 'datafile.xls');
const fcWb = XLSX.readFile(fcFilePath);
const fcSheet = fcWb.Sheets[fcWb.SheetNames[0]];
const fcRows = XLSX.utils.sheet_to_json(fcSheet, { header: 1 });

const processedForestDistricts = [];
let maharashtraForestSummary = null;

fcRows.slice(1).forEach((r) => {
  if (!r || !r[0]) return;
  const rawName = String(r[0]).trim();
  const cleanName = rawName.replace(/H$/, '').trim();
  const isHillDistrict = rawName.endsWith('H');
  const geoArea = parseNum(r[1]);
  const veryDense = parseNum(r[2]);
  const modDense = parseNum(r[3]);
  const openForest = parseNum(r[4]);
  const totalForest = parseNum(r[5]);
  const forestPct = parseNum(r[6]);
  const changeVs2021 = parseNum(r[7]);
  const scrub = parseNum(r[8]);

  if (cleanName.toLowerCase() === 'grand total') {
    maharashtraForestSummary = {
      label: 'Maharashtra State Total',
      geoAreaSqKm: geoArea === 3 ? 307713.00 : geoArea, // Correct comma-parse if needed
      veryDenseForestSqKm: veryDense,
      modDenseForestSqKm: modDense,
      openForestSqKm: openForest,
      totalForestSqKm: totalForest,
      forestCoverPct: forestPct,
      netChangeVs2021SqKm: changeVs2021,
      scrubForestSqKm: scrub,
      totalTreeCanopySqKm: Number((totalForest + scrub).toFixed(2)),
      nationalTargetPct: 33.0,
      deficitPct: Number((33.0 - forestPct).toFixed(2)),
      sourceAgency: 'Forest Survey of India (FSI) & Survey of India (SoI)',
    };
  } else {
    // Environmental Pressure score: 0 (33% or more forest = ideal) to 100 (0% forest = maximum pressure)
    // Formula: (33 - forestPct) / 33 * 100, clamped 0 to 100
    const rawPressure = ((33.0 - forestPct) / 33.0) * 100.0;
    const pressureScore = Math.max(0, Math.min(100, Number(rawPressure.toFixed(1))));

    let tier = 'Deficit / Low Canopy';
    if (forestPct >= 40.0) tier = 'Dense Ecological Zone';
    else if (forestPct >= 20.0) tier = 'Moderate Forest Canopy';
    else if (forestPct >= 10.0) tier = 'Vulnerable / Fragmented';
    else tier = 'Critically Deficit (<10%)';

    processedForestDistricts.push({
      district: cleanName,
      rawLabel: rawName,
      isHillDistrict,
      geoAreaSqKm: geoArea,
      veryDenseForestSqKm: veryDense,
      modDenseForestSqKm: modDense,
      openForestSqKm: openForest,
      totalForestSqKm: totalForest,
      forestCoverPct: forestPct,
      changeVs2021SqKm: changeVs2021,
      scrubForestSqKm: scrub,
      pressureScore,
      tier,
      trend: changeVs2021 > 0 ? 'Expanding' : changeVs2021 < 0 ? 'Declining' : 'Stable',
    });
  }
});

// Sort districts by forest cover % descending
processedForestDistricts.sort((a, b) => b.forestCoverPct - a.forestCoverPct);

const forestCoverOutput = {
  summary: maharashtraForestSummary,
  totalDistrictsCount: processedForestDistricts.length,
  topForestDistricts: processedForestDistricts.slice(0, 5),
  lowestForestDistricts: processedForestDistricts.slice(-5),
  allDistricts: processedForestDistricts,
};

console.log(`Successfully processed ${processedForestDistricts.length} forest districts.`);

// ----------------------------------------------------
// 4. Write all outputs to src/data/
// ----------------------------------------------------
fs.writeFileSync(
  path.join(outputDataDir, 'airQualityStations.json'),
  JSON.stringify(processedAirStations, null, 2),
  'utf-8'
);
console.log('Saved src/data/airQualityStations.json');

fs.writeFileSync(
  path.join(outputDataDir, 'groundwaterWells.json'),
  JSON.stringify(groundwaterSummary, null, 2),
  'utf-8'
);
console.log('Saved src/data/groundwaterWells.json');

fs.writeFileSync(
  path.join(outputDataDir, 'forestCoverDistricts.json'),
  JSON.stringify(forestCoverOutput, null, 2),
  'utf-8'
);
console.log('Saved src/data/forestCoverDistricts.json');

console.log('\nAll 3 raw datasets successfully processed and saved to src/data/!');
