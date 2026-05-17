import { MapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet';
import { useEffect, useMemo, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { mapGeoEndpoints } from '../geo/mapGeoUrls';
import './StateMap.css';

const HEAT_SCALE = [
  { t: 0 / 9, color: '#ffffcc' },
  { t: 1 / 9, color: '#ffeda0' },
  { t: 2 / 9, color: '#fed976' },
  { t: 3 / 9, color: '#feb24c' },
  { t: 4 / 9, color: '#fd8d3c' },
  { t: 5 / 9, color: '#fc4e2a' },
  { t: 6 / 9, color: '#e31a1c' },
  { t: 7 / 9, color: '#bd0026' },
  { t: 8 / 9, color: '#8c0d11' },
  { t: 9 / 9, color: '#5c0008' },
];

const DEMOGRAPHIC_SCALE = [
  '#f1f8f2',
  '#d8efdb',
  '#bfe7c5',
  '#9fdaaa',
  '#78ca8a',
  '#53b86f',
  '#369e57',
  '#1f7f42',
  '#145e30',
];

const DIVERGING_SCALE = [
  { t: 0 / 14, color: '#5c0000' },
  { t: 1 / 14, color: '#8b0000' },
  { t: 2 / 14, color: '#a52a2a' },
  { t: 3 / 14, color: '#b22222' },
  { t: 4 / 14, color: '#c0392b' },
  { t: 5 / 14, color: '#e57373' },
  { t: 6 / 14, color: '#ef9a9a' },
  { t: 7 / 14, color: '#eeeeee' },
  { t: 8 / 14, color: '#90caf9' },
  { t: 9 / 14, color: '#64b5f6' },
  { t: 10 / 14, color: '#42a5f5' },
  { t: 11 / 14, color: '#1976d2' },
  { t: 12 / 14, color: '#1565c0' },
  { t: 13 / 14, color: '#0d47a1' },
  { t: 14 / 14, color: '#002171' },
];

const DISTRICT_PALETTE = [
  '#1f6f78',
  '#f18f5d',
  '#7b1fa2',
  '#2ca02c',
  '#d62728',
  '#9467bd',
  '#8c564b',
  '#1f77b4',
  '#ff7f0e',
  '#17becf',
  '#bcbd22',
  '#e377c2',
];

function colorForDistrict(districtId) {
  const value = Number(districtId);
  if (!Number.isFinite(value)) return '#d1d5db';
  const idx = ((value - 1) % DISTRICT_PALETTE.length + DISTRICT_PALETTE.length) % DISTRICT_PALETTE.length;
  return DISTRICT_PALETTE[idx];
}

function interpolateColor(t, scale) {
  for (let i = scale.length - 1; i >= 0; i--) {
    if (t >= scale[i].t) {
      const next = scale[i + 1] || scale[i];
      const curr = scale[i];
      const span = next.t - curr.t;
      const frac = span > 0 ? (t - curr.t) / span : 1;
      return frac < 1 ? curr.color : next.color;
    }
  }
  return scale[0].color;
}

function normalizeDistrictId(properties) {
  const raw = properties?.district
    ?? properties?.DISTRICT
    ?? properties?.district_id
    ?? properties?.districtId
    ?? properties?.cd116fp
    ?? properties?.CD116FP;
  const value = Number(raw);
  return Number.isFinite(value) ? value : null;
}

function featureIdCandidates(properties) {
  return [
    properties?.precinctId,
    properties?.precinct_id,
    properties?.geoid,
    properties?.GEOID,
    properties?.GEOID20,
    properties?.vtdst,
    properties?.VTDST20,
    properties?.name,
    properties?.NAME20,
  ]
    .filter((value) => value != null)
    .map((value) => String(value));
}

function normalizeAssignmentMap(rawMap) {
  if (!rawMap) return {};
  return Object.fromEntries(
    Object.entries(rawMap)
      .filter(([, value]) => value != null && value !== '')
      .map(([key, value]) => [String(key), Number(value)])
      .filter(([, value]) => Number.isFinite(value)),
  );
}

function districtFromMockPrecinctId(precinctId) {
  const match = String(precinctId).match(/^\d{2}(\d{3})\d{4}$/);
  if (!match) return null;
  const value = Number(match[1]);
  return Number.isFinite(value) && value > 0 ? value : null;
}

function bucketValueForFeature(properties, bucket) {
  if (!bucket?.length) return null;
  const seed = featureIdCandidates(properties)[0] || properties?.district || properties?.name || '';
  return bucket[hashString(seed) % bucket.length];
}

function normalizePlanModel(payload) {
  const plan = payload?.currentPlan || payload?.plan || payload || {};
  const precinctToDistrict = normalizeAssignmentMap(plan.precinctToDistrict);

  if (Array.isArray(plan.districts)) {
    plan.districts.forEach((district) => {
      const districtNumber = Number(district.districtNumber ?? district.id);
      if (!Number.isFinite(districtNumber)) return;
      (district.precinctIds || []).forEach((precinctId) => {
        precinctToDistrict[String(precinctId)] = districtNumber;
      });
    });
  }

  return {
    precinctToDistrict,
  };
}

function normalizeComparisonPlan(payload, selectedPlanKey) {
  const plans = payload?.plans || {};
  const fallbackKey = Object.keys(plans).find((key) => key !== 'enacted');
  const activeKey = selectedPlanKey && plans[selectedPlanKey] ? selectedPlanKey : fallbackKey;
  const enacted = normalizeAssignmentMap(plans.enacted?.precinctToDistrict);
  const selected = normalizeAssignmentMap(plans[activeKey]?.precinctToDistrict);
  const selectedByCurrentDistrict = {};
  const modalSelectedByCurrentDistrict = {};

  Object.entries(enacted).forEach(([precinctId, currentDistrict]) => {
    const selectedDistrict = selected[precinctId];
    if (!Number.isFinite(currentDistrict) || !Number.isFinite(selectedDistrict)) return;
    selectedByCurrentDistrict[currentDistrict] ||= [];
    selectedByCurrentDistrict[currentDistrict].push(selectedDistrict);
  });

  Object.entries(selectedByCurrentDistrict).forEach(([currentDistrict, destinations]) => {
    const currentNum = Number(currentDistrict);
    const counts = new Map();
    destinations.forEach((dest) => {
      counts.set(dest, (counts.get(dest) || 0) + 1);
    });
    // Score destinations by count; on ties, prefer destinations that are
    // not equal to the current district (otherwise uniform mock data would
    // collapse the comparison view back to looking identical to enacted).
    let bestValue = null;
    let bestScore = -Infinity;
    counts.forEach((count, value) => {
      const sameAsCurrent = Number(value) === currentNum;
      const score = count + (sameAsCurrent ? -0.5 : 0);
      if (
        score > bestScore
        || (score === bestScore && (bestValue == null || Number(value) < Number(bestValue)))
      ) {
        bestValue = value;
        bestScore = score;
      }
    });
    if (bestValue != null) {
      modalSelectedByCurrentDistrict[currentNum] = bestValue;
    }
  });

  return {
    enacted,
    selected,
    selectedByCurrentDistrict,
    modalSelectedByCurrentDistrict,
    selectedKey: activeKey,
  };
}

function assignedDistrictForFeature(properties, assignmentLookup, districtFallbacks = null, fallbackDistrictId = null) {
  const ids = featureIdCandidates(properties);
  for (const id of ids) {
    const assigned = assignmentLookup[id];
    if (Number.isFinite(assigned)) return assigned;
  }
  if (fallbackDistrictId != null && districtFallbacks) {
    const assigned = bucketValueForFeature(properties, districtFallbacks[fallbackDistrictId]);
    if (Number.isFinite(assigned)) return assigned;
  }
  return null;
}

function normalizeHeatMapPayload(payload) {
  if (!payload?.bins?.length || !payload?.precinctBins) return null;
  const bins = payload.bins
    .map((bin) => ({
      bin: Number(bin.bin),
      minPct: Number(bin.minPct),
      maxPct: Number(bin.maxPct),
      color: bin.color,
    }))
    .filter((bin) => Number.isFinite(bin.bin) && Number.isFinite(bin.minPct) && Number.isFinite(bin.maxPct) && bin.color);
  const precinctBins = Object.fromEntries(
    Object.entries(payload.precinctBins)
      .filter(([, value]) => value != null && value !== '')
      .map(([key, value]) => [String(key), Number(value)]),
  );
  if (!bins.length || !Object.keys(precinctBins).length) return null;
  const binsByDistrict = {};
  Object.entries(precinctBins).forEach(([precinctId, binId]) => {
    const district = districtFromMockPrecinctId(precinctId);
    if (district == null || !Number.isFinite(binId)) return;
    binsByDistrict[district] ||= [];
    binsByDistrict[district].push(binId);
  });
  return {
    group: payload.group,
    bins,
    precinctBins,
    binsByDistrict,
  };
}

function heatMapBinForFeature(feature, heatMap, fallbackDistrictId = null) {
  if (!heatMap) return null;
  const ids = featureIdCandidates(feature.properties || {});
  for (const id of ids) {
    const binId = heatMap.precinctBins[id];
    if (!Number.isFinite(binId)) continue;
    const bin = heatMap.bins.find((entry) => entry.bin === binId);
    if (bin) return bin;
  }
  if (fallbackDistrictId != null) {
    const binId = bucketValueForFeature(feature.properties || {}, heatMap.binsByDistrict?.[fallbackDistrictId]);
    if (Number.isFinite(binId)) {
      return heatMap.bins.find((entry) => entry.bin === binId) || null;
    }
  }
  return null;
}

function hashString(input) {
  const value = String(input ?? '');
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = ((hash << 5) - hash) + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function clampNumber(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function findNumericProperty(properties, keys) {
  for (const key of keys) {
    const raw = properties?.[key];
    if (raw == null) continue;
    const value = Number(raw);
    if (Number.isFinite(value)) return value;
  }
  return null;
}

function FlyTo({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, zoom, { duration: 1 });
  }, [center, zoom, map]);
  return null;
}

function FitGeoData({ data, maxZoom = 8 }) {
  const map = useMap();

  useEffect(() => {
    if (!data?.features?.length) return;
    const layer = L.geoJSON(data);
    const bounds = layer.getBounds();
    if (bounds.isValid()) {
      map.fitBounds(bounds, {
        animate: true,
        duration: 0.8,
        maxZoom,
        padding: [34, 34],
      });
    }
  }, [data, map, maxZoom]);

  return null;
}

function SyncMapSize() {
  const map = useMap();
  useEffect(() => {
    const resize = () => map.invalidateSize({ pan: false });
    const raf = requestAnimationFrame(resize);
    const container = map.getContainer();

    if (typeof ResizeObserver === 'function') {
      const observer = new ResizeObserver(() => resize());
      observer.observe(container);
      return () => {
        cancelAnimationFrame(raf);
        observer.disconnect();
      };
    }

    window.addEventListener('resize', resize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, [map]);

  return null;
}

async function fetchGeoJson(url, signal, { quiet = false } = {}) {
  try {
    const response = await fetch(url, { signal });
    if (!response.ok) return null;
    return await response.json();
  } catch (err) {
    if (!quiet && err.name !== 'AbortError') {
      console.error(`Failed to load ${url}`, err);
    }
    return null;
  }
}

async function fetchGeoJsonWithFallback(primaryUrl, fallbackUrl, signal) {
  const primary = await fetchGeoJson(primaryUrl, signal, { quiet: true });
  if (primary?.features?.length) return primary;
  return fallbackUrl ? fetchGeoJson(fallbackUrl, signal) : null;
}

export default function StateMap({
  stateAbbr,
  center,
  zoom,
  districtData,
  currentPlanPayload,
  planComparisonPayload,
  selectedComparisonPlan,
  heatMapPayload,
  stateDemographics,
  planMode,
  highlightedDistrict,
  onDistrictSelect,
  mapMetric,
  onMapMetricChange,
  mapDemographicGroup,
  onMapDemographicGroupChange,
  showDistrictOutlines = true,
  showOverlayControls = true,
  usePrecinctLayer = false,
}) {
  const [geoData, setGeoData] = useState(null);
  const [precinctData, setPrecinctData] = useState(null);
  const [internalMetric, setInternalMetric] = useState('demographic');
  const [internalDemographicGroup, setInternalDemographicGroup] = useState('overall');

  const metric = mapMetric ?? internalMetric;
  const setMetric = onMapMetricChange ?? setInternalMetric;
  const demographicGroup = mapDemographicGroup ?? internalDemographicGroup;
  const setDemographicGroup = onMapDemographicGroupChange ?? setInternalDemographicGroup;

  const isDeltaMode = planMode === 'delta';
  const activeMetric = metric;
  const isDemographicMetric = activeMetric === 'demographic';
  const activeHeatMap = useMemo(() => normalizeHeatMapPayload(heatMapPayload), [heatMapPayload]);
  const currentPlanModel = useMemo(() => normalizePlanModel(currentPlanPayload), [currentPlanPayload]);
  const comparisonPlanModel = useMemo(
    () => normalizeComparisonPlan(planComparisonPayload, selectedComparisonPlan),
    [planComparisonPayload, selectedComparisonPlan],
  );
  const currentAssignmentLookup = Object.keys(comparisonPlanModel.enacted).length > 0
    ? comparisonPlanModel.enacted
    : currentPlanModel.precinctToDistrict;
  const selectedAssignmentLookup = comparisonPlanModel.selected;
  const hasAssignmentComparison = Object.keys(currentAssignmentLookup).length > 0
    && Object.keys(selectedAssignmentLookup).length > 0;
  const isAssignmentDeltaMode = isDeltaMode && hasAssignmentComparison;
  const isPlanComparisonMode = (planMode === 'comparison' || planMode === 'interesting') && hasAssignmentComparison;

  const resolveDistrictId = (feature, assignmentLookup = null) => {
    if (assignmentLookup) {
      const assigned = assignedDistrictForFeature(feature.properties || {}, assignmentLookup);
      if (assigned != null) return assigned;
    }

    if (planMode === 'comparison' || planMode === 'interesting') {
      const currentDistrictFallback = normalizeDistrictId(feature.properties);
      const directSelected = assignedDistrictForFeature(feature.properties || {}, selectedAssignmentLookup);
      if (directSelected != null) return directSelected;
      const modal = currentDistrictFallback != null
        ? comparisonPlanModel.modalSelectedByCurrentDistrict?.[Number(currentDistrictFallback)]
        : null;
      if (Number.isFinite(modal)) return modal;
      const selectedAssigned = assignedDistrictForFeature(
        feature.properties || {},
        selectedAssignmentLookup,
        comparisonPlanModel.selectedByCurrentDistrict,
        currentDistrictFallback,
      );
      if (selectedAssigned != null) return selectedAssigned;
    }

    const currentAssigned = assignedDistrictForFeature(feature.properties || {}, currentPlanModel.precinctToDistrict);
    if (currentAssigned != null) return currentAssigned;
    return normalizeDistrictId(feature.properties);
  };

  const assignmentDeltaValue = (feature) => {
    if (!hasAssignmentComparison) return null;
    const properties = feature.properties || {};
    const currentDistrictFallback = normalizeDistrictId(properties);
    const currentAssigned = assignedDistrictForFeature(properties, currentAssignmentLookup)
      ?? currentDistrictFallback;
    let selectedAssigned = assignedDistrictForFeature(properties, selectedAssignmentLookup);
    if (selectedAssigned == null) {
      const modal = currentAssigned != null
        ? comparisonPlanModel.modalSelectedByCurrentDistrict?.[Number(currentAssigned)]
        : null;
      if (Number.isFinite(modal)) selectedAssigned = modal;
    }
    if (selectedAssigned == null) {
      selectedAssigned = assignedDistrictForFeature(
        properties,
        selectedAssignmentLookup,
        comparisonPlanModel.selectedByCurrentDistrict,
        currentAssigned ?? currentDistrictFallback,
      );
    }
    if (currentAssigned == null || selectedAssigned == null) return null;
    return currentAssigned !== selectedAssigned ? 1 : 0;
  };

  const assignmentChanged = (feature) => {
    return assignmentDeltaValue(feature) === 1;
  };

  const districtDataLookup = useMemo(() => {
    const lookup = {};
    districtData?.forEach((district) => {
      lookup[district.id] = district;
    });
    return lookup;
  }, [districtData]);

  const districtOutlines = useMemo(() => {
    if (!geoData?.features?.length) return null;
    return {
      type: 'FeatureCollection',
      features: geoData.features.map((feature) => ({
        type: 'Feature',
        geometry: feature.geometry,
        properties: {
          district: normalizeDistrictId(feature.properties),
          name: `District ${normalizeDistrictId(feature.properties)}`,
        },
      })),
    };
  }, [geoData]);

  const activeGeoData = useMemo(() => {
    if (usePrecinctLayer && precinctData?.features?.length) return precinctData;
    return geoData;
  }, [usePrecinctLayer, precinctData, geoData]);

  const demographicShareTotal = (stateDemographics?.blackPercent || 0)
    + (stateDemographics?.hispanicPercent || 0)
    + (stateDemographics?.asianPercent || 0);
  const demographicShares = {
    black: demographicShareTotal > 0 ? (stateDemographics?.blackPercent || 0) / demographicShareTotal : 0.5,
    hispanic: demographicShareTotal > 0 ? (stateDemographics?.hispanicPercent || 0) / demographicShareTotal : 0.3,
    asian: demographicShareTotal > 0 ? (stateDemographics?.asianPercent || 0) / demographicShareTotal : 0.2,
  };

  const resolveDemographicValue = (feature, district) => {
    const fallbackDistrictId = district?.id ?? normalizeDistrictId(feature.properties);
    const heatBin = demographicGroup !== 'overall'
      ? heatMapBinForFeature(feature, activeHeatMap, fallbackDistrictId)
      : null;
    if (heatBin) return (heatBin.minPct + heatBin.maxPct) / 2;

    const properties = feature.properties || {};
    const minorityPct = district?.minorityPct
      ?? findNumericProperty(properties, ['minorityPct', 'minority_pct', 'MINORITY_PCT'])
      ?? null;
    if (minorityPct == null) return null;
    if (demographicGroup === 'overall') return minorityPct;

    const directKeyMap = {
      black: ['blackPct', 'black_pct', 'BLACK_PCT', 'blackPercent'],
      hispanic: ['hispanicPct', 'hispanic_pct', 'HISPANIC_PCT', 'latinoPct', 'hispanicPercent'],
      asian: ['asianPct', 'asian_pct', 'ASIAN_PCT', 'asianPercent'],
    };
    const directValue = findNumericProperty(properties, directKeyMap[demographicGroup] || []);
    if (directValue != null) return clampNumber(directValue, 0, minorityPct);

    // Placeholder when group-level precinct data is missing: split minority % by statewide shares with stable local variation.
    const base = minorityPct * (demographicShares[demographicGroup] || 0);
    const seed = `${properties.geoid || properties.name || ''}-${properties.district || district?.id || ''}`;
    const jitter = ((hashString(seed) % 1000) / 1000 - 0.5) * 0.24;
    return clampNumber(base * (1 + jitter), 0, minorityPct);
  };

  const valueForFeature = (feature) => {
    const districtId = resolveDistrictId(feature);
    const district = districtId != null ? districtDataLookup[districtId] : null;
    if (planMode === 'delta') {
      return assignmentDeltaValue(feature);
    }
    if (activeMetric === 'district') {
      return districtId;
    }
    if (isDemographicMetric) {
      return resolveDemographicValue(feature, district);
    }
    if (activeMetric === 'partisan') {
      if (district) return district.dem * 100;
      return feature.properties?.demPct ?? null;
    }
    const overallMinority = feature.properties?.minorityPct;
    if (overallMinority != null) return overallMinority;
    return district?.minorityPct ?? null;
  };

  const { minVal, maxVal } = (() => {
    if (isAssignmentDeltaMode) {
      return { minVal: 0, maxVal: 1 };
    }

    let min = Infinity;
    let max = -Infinity;
    activeGeoData?.features?.forEach((feature) => {
      const value = valueForFeature(feature);
      if (value == null || Number.isNaN(value)) return;
      min = Math.min(min, value);
      max = Math.max(max, value);
    });
    if (min === Infinity) {
      districtData?.forEach((district) => {
        let value = district.minorityPct;
        if (isDemographicMetric) {
          if (demographicGroup === 'overall') {
            value = district.minorityPct;
          } else {
            value = district.minorityPct * (demographicShares[demographicGroup] || 0);
          }
        }
        if (activeMetric === 'partisan') value = district.dem * 100;
        min = Math.min(min, value);
        max = Math.max(max, value);
      });
    }
    return {
        minVal: min === Infinity ? 0 : min,
        maxVal: max === -Infinity ? 100 : max,
      };
  })();

  const demographicBins = (() => {
    if (!isDemographicMetric) return [];
    if (activeHeatMap && demographicGroup !== 'overall') {
      const usedBinIds = new Set(Object.values(activeHeatMap.precinctBins).map((value) => Number(value)));
      const usedBins = activeHeatMap.bins
        .filter((bin) => usedBinIds.has(bin.bin))
        .sort((left, right) => left.minPct - right.minPct)
        .map((bin) => ({
          start: bin.minPct,
          end: bin.maxPct,
          count: Object.values(activeHeatMap.precinctBins).filter((value) => Number(value) === bin.bin).length,
        }));
      return usedBins.map((bin, index) => {
        const colorIndex = usedBins.length === 1
          ? DEMOGRAPHIC_SCALE.length - 2
          : Math.round((index / (usedBins.length - 1)) * (DEMOGRAPHIC_SCALE.length - 1));
        return { ...bin, color: DEMOGRAPHIC_SCALE[colorIndex] };
      });
    }

    const values = [];
    activeGeoData?.features?.forEach((feature) => {
      const value = valueForFeature(feature);
      if (value == null || Number.isNaN(value)) return;
      values.push(value);
    });
    if (!values.length && districtData?.length) {
      districtData.forEach((district) => {
        let value = district.minorityPct;
        if (demographicGroup !== 'overall') {
          value = district.minorityPct * (demographicShares[demographicGroup] || 0);
        }
        values.push(value);
      });
    }
    if (!values.length) return [];

    const minInt = Math.floor(Math.min(...values));
    const maxInt = Math.ceil(Math.max(...values));
    const binCount = 8;
    const binWidth = Math.max(1, Math.ceil((maxInt - minInt + 1) / binCount));
    const bins = [];
    for (let i = 0; i < binCount; i++) {
      const start = minInt + i * binWidth;
      if (start > maxInt) break;
      const end = i === binCount - 1 ? maxInt : Math.min(maxInt, start + binWidth - 1);
      const count = values.filter((value) => value >= start && value <= end).length;
      bins.push({ start, end, count });
    }
    const usedBins = bins.filter((bin) => bin.count > 0);
    return usedBins.map((bin, index) => {
      const colorIndex = usedBins.length === 1
        ? DEMOGRAPHIC_SCALE.length - 2
        : Math.round((index / (usedBins.length - 1)) * (DEMOGRAPHIC_SCALE.length - 1));
      return { ...bin, color: DEMOGRAPHIC_SCALE[colorIndex] };
    });
  })();

  const createColor = (value) => {
    if (value == null) return '#d1d5db';
    if (isDeltaMode && (value === 0 || value === 1)) {
      return value === 1 ? '#f97316' : '#e5e7eb';
    }
    if (activeMetric === 'district') {
      return colorForDistrict(value);
    }
    if (!usePrecinctLayer && activeMetric === 'partisan' && planMode !== 'delta') {
      return value >= 50 ? '#2f6fbd' : '#d14b45';
    }
    if (isDemographicMetric) {
      if (!demographicBins.length) return DEMOGRAPHIC_SCALE[2];
      const bin = demographicBins.find((entry) => value >= entry.start && value <= entry.end);
      if (bin) return bin.color;
      if (value < demographicBins[0].start) return demographicBins[0].color;
      return demographicBins[demographicBins.length - 1].color;
    }
    if (activeMetric === 'partisan') {
      const t = Math.max(0, Math.min(1, value / 100));
      return interpolateColor(t, DIVERGING_SCALE);
    }
    if (minVal === maxVal) return HEAT_SCALE[4].color;
    const t = (value - minVal) / (maxVal - minVal);
    return interpolateColor(Math.max(0, Math.min(1, t)), HEAT_SCALE);
  };

  const createFeatureStyle = (feature) => {
    const districtId = resolveDistrictId(feature);
    const isHighlighted = highlightedDistrict != null && districtId != null
      && Number(districtId) === Number(highlightedDistrict);
    const value = valueForFeature(feature);
    const color = createColor(value);
    const isChanged = isPlanComparisonMode && assignmentChanged(feature);
    if (activeMetric === 'district' && !usePrecinctLayer && isPlanComparisonMode) {
      return {
        fillColor: color,
        weight: isHighlighted ? 3.2 : isChanged ? 2.2 : 0.6,
        opacity: 1,
        color: isHighlighted ? '#1f6f78' : isChanged ? '#f97316' : '#3d5c63',
        dashArray: isChanged ? '6 4' : undefined,
        fillOpacity: isHighlighted ? 0.92 : 0.78,
      };
    }
    return {
      fillColor: color,
      weight: isHighlighted ? 1.4 : isChanged ? 1 : 0,
      opacity: 1,
      color: isHighlighted ? '#1f6f78' : isChanged ? '#f97316' : color,
      fillOpacity: isHighlighted ? 0.92 : isChanged ? 0.86 : 0.72,
    };
  };

  const createPopupText = (feature) => {
    const districtId = resolveDistrictId(feature);
    const district = districtId != null ? districtDataLookup[districtId] : null;
    const name = feature.properties?.name || feature.properties?.geoid || `District ${districtId ?? 'N/A'}`;

    let detailLine;
    if (planMode === 'delta') {
      const delta = assignmentDeltaValue(feature);
      detailLine = delta == null
        ? 'Plan assignment: unavailable'
        : `Plan assignment: ${delta === 1 ? 'changed' : 'same district'}`;
    } else if (activeMetric === 'district') {
      detailLine = districtId != null ? `Assigned to District ${districtId}` : 'District assignment unavailable';
    } else if (isDemographicMetric) {
      const demographicValue = valueForFeature(feature);
      const heatBin = demographicGroup !== 'overall'
        ? heatMapBinForFeature(feature, activeHeatMap, district?.id ?? normalizeDistrictId(feature.properties))
        : null;
      const labels = {
        overall: 'Minority',
        black: 'Black',
        hispanic: 'Hispanic',
        asian: 'Asian',
      };
      detailLine = heatBin
        ? `${labels[demographicGroup] || 'Minority'}: ${heatBin.minPct}% - ${heatBin.maxPct}%`
        : `${labels[demographicGroup] || 'Minority'}: ${demographicValue != null ? demographicValue.toFixed(1) : 'N/A'}%`;
    } else if (activeMetric === 'partisan') {
      const demPct = district ? district.dem * 100 : feature.properties?.demPct;
      const repPct = demPct != null ? 100 - demPct : null;
      detailLine = `Dem: ${demPct != null ? demPct.toFixed(1) : 'N/A'}% / Rep: ${repPct != null ? repPct.toFixed(1) : 'N/A'}%`;
    } else {
      const minorityPct = feature.properties?.minorityPct ?? district?.minorityPct;
      detailLine = `Minority: ${minorityPct != null ? Number(minorityPct).toFixed(1) : 'N/A'}%`;
    }

    return `<div style="text-align:center;padding:6px;">
      <strong>${name}</strong><br/>
      <span style="font-size:12px;color:rgb(85 98 109);">${detailLine}</span>
    </div>`;
  };

  function onEachFeature(feature, layer) {
    layer.bindPopup(createPopupText(feature));
    layer.on({
      click: () => {
        const districtId = resolveDistrictId(feature);
        if (districtId != null) onDistrictSelect(districtId);
      },
      mouseover: (event) => {
        event.target.setStyle({ fillOpacity: 0.94, weight: 1.5, color: '#1f6f78' });
      },
      mouseout: (event) => {
        event.target.setStyle(createFeatureStyle(feature));
      },
    });
  }

  function onEachOutline(feature, layer) {
    const districtId = normalizeDistrictId(feature.properties);
    layer.bindPopup(`<strong>District ${districtId}</strong>`);
    layer.on({
      click: () => {
        if (districtId != null) onDistrictSelect(districtId);
      },
    });
  }

  useEffect(() => {
    const controller = new AbortController();
    let isActive = true;
    const base = import.meta.env.BASE_URL;
    const urls = mapGeoEndpoints(stateAbbr, base);

    Promise.all([
      fetchGeoJsonWithFallback(urls.districtPrimary, urls.districtFallback, controller.signal),
      usePrecinctLayer
        ? fetchGeoJsonWithFallback(urls.precinctPrimary, urls.precinctFallback, controller.signal)
        : Promise.resolve(null),
    ]).then(([districts, precincts]) => {
      if (!isActive) return;
      setGeoData(districts);
      setPrecinctData(usePrecinctLayer ? precincts : null);
    });
    return () => {
      isActive = false;
      controller.abort();
    };
  }, [stateAbbr, usePrecinctLayer]);

  const isLoading = !geoData && !precinctData;
  const demographicGroupLabel = {
    overall: 'All Minority',
    black: 'Black',
    hispanic: 'Hispanic',
    asian: 'Asian',
  }[demographicGroup] || 'All Minority';
  const legendScale = isDemographicMetric
    ? []
    : activeMetric === 'partisan'
      ? DIVERGING_SCALE
      : HEAT_SCALE;
  const districtIdsForLegend = useMemo(() => {
    if (activeMetric !== 'district') return [];
    const ids = new Set();
    activeGeoData?.features?.forEach((feature) => {
      const id = resolveDistrictId(feature);
      if (id != null && Number.isFinite(Number(id))) ids.add(Number(id));
    });
    if (ids.size === 0) {
      districtData?.forEach((district) => {
        if (district?.id != null) ids.add(Number(district.id));
      });
    }
    return [...ids].sort((left, right) => left - right);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeMetric, activeGeoData, districtData, selectedAssignmentLookup, currentAssignmentLookup, planMode]);
  const legendTitle = isDeltaMode
    ? (hasAssignmentComparison
      ? 'Plan difference (same vs changed assignment)'
      : 'Plan difference — pick comparison or interesting plan')
    : activeMetric === 'district'
      ? (planMode === 'comparison' || planMode === 'interesting'
        ? 'District assignment under selected plan'
        : 'District assignment under enacted plan')
      : isDemographicMetric
        ? `${demographicGroupLabel} population % (precinct bins)`
        : activeMetric === 'partisan'
          ? (!usePrecinctLayer && planMode !== 'delta'
            ? (planMode === 'comparison' || planMode === 'interesting' ? 'Selected plan district winner' : 'Current plan district winner')
            : 'Democrat vs Republican %')
          : 'Minority population %';
  const activeGeoJsonKey = [
    stateAbbr,
    planMode,
    activeMetric,
    demographicGroup,
    selectedComparisonPlan || 'none',
    usePrecinctLayer ? 'precinct-layer' : 'district-layer',
    highlightedDistrict ?? 'none',
    Object.keys(currentPlanModel.precinctToDistrict).length,
    Object.keys(selectedAssignmentLookup).length,
    activeHeatMap?.group || 'none',
    Object.keys(activeHeatMap?.precinctBins || {}).length,
  ].join('-');

  return (
    <div className="state-map">
      <MapContainer
        center={center}
        zoom={zoom}
        minZoom={5}
        maxZoom={12}
        style={{ height: '100%', width: '100%' }}
        zoomControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <SyncMapSize />
        {activeGeoData?.features?.length > 0 ? (
          <FitGeoData data={activeGeoData} maxZoom={usePrecinctLayer ? 9 : 8} />
        ) : (
          <FlyTo center={center} zoom={zoom} />
        )}
        {activeGeoData?.features?.length > 0 && (
          <GeoJSON
            key={activeGeoJsonKey}
            data={activeGeoData}
            style={createFeatureStyle}
            onEachFeature={onEachFeature}
          />
        )}
        {showDistrictOutlines && districtOutlines && (
          <GeoJSON
            key={`${stateAbbr}-outlines-${highlightedDistrict ?? 'none'}`}
            data={districtOutlines}
            style={(feature) => {
              const districtId = normalizeDistrictId(feature.properties);
              const isOutlineHighlight = highlightedDistrict != null && districtId != null
                && Number(highlightedDistrict) === Number(districtId);
              return {
                fillColor: 'none',
                fillOpacity: 0,
                weight: isOutlineHighlight ? 4 : 2.5,
                color: isOutlineHighlight ? '#1f6f78' : '#3d5c63',
                opacity: isOutlineHighlight ? 1 : 0.7,
              };
            }}
            onEachFeature={onEachOutline}
          />
        )}
      </MapContainer>

      {isLoading && <div className="state-map__loading">Loading...</div>}

      {(activeGeoData || districtData) && (
        <div className="choropleth-legend">
          <div className="choropleth-legend__title">{legendTitle}</div>
          {isDeltaMode ? (
            isAssignmentDeltaMode ? (
              <div className="choropleth-legend__bins">
                <div className="choropleth-legend__bin-row">
                  <span className="choropleth-legend__bin-swatch" style={{ background: '#e5e7eb' }} />
                  <span className="choropleth-legend__bin-range">Same district</span>
                </div>
                <div className="choropleth-legend__bin-row">
                  <span className="choropleth-legend__bin-swatch" style={{ background: '#f97316' }} />
                  <span className="choropleth-legend__bin-range">Changed district</span>
                </div>
              </div>
            ) : (
              <div className="choropleth-legend__bins">
                <div className="choropleth-legend__bin-row">
                  <span className="choropleth-legend__bin-range">
                    Map is neutral until a comparison plan with precinct assignments is available.
                  </span>
                </div>
              </div>
            )
          ) : activeMetric === 'district' ? (
            <div className="choropleth-legend__bins">
              {districtIdsForLegend.length > 0 ? (
                districtIdsForLegend.map((id) => (
                  <div key={`district-${id}`} className="choropleth-legend__bin-row">
                    <span className="choropleth-legend__bin-swatch" style={{ background: colorForDistrict(id) }} />
                    <span className="choropleth-legend__bin-range">District {id}</span>
                  </div>
                ))
              ) : (
                <div className="choropleth-legend__bin-row">
                  <span className="choropleth-legend__bin-range">No districts available</span>
                </div>
              )}
            </div>
          ) : isDemographicMetric ? (
            <div className="choropleth-legend__bins">
              {demographicBins.length > 0 ? (
                demographicBins.map((bin) => (
                  <div key={`${bin.start}-${bin.end}`} className="choropleth-legend__bin-row">
                    <span className="choropleth-legend__bin-swatch" style={{ background: bin.color }} />
                    <span className="choropleth-legend__bin-range">{bin.start}% – {bin.end}%</span>
                  </div>
                ))
              ) : (
                <div className="choropleth-legend__bin-row">
                  <span className="choropleth-legend__bin-range">No values available</span>
                </div>
              )}
            </div>
          ) : !usePrecinctLayer && planMode !== 'delta' && activeMetric === 'partisan' ? (
            <div className="choropleth-legend__bins">
              <div className="choropleth-legend__bin-row">
                <span className="choropleth-legend__bin-swatch" style={{ background: '#d14b45' }} />
                <span className="choropleth-legend__bin-range">Republican district</span>
              </div>
              <div className="choropleth-legend__bin-row">
                <span className="choropleth-legend__bin-swatch" style={{ background: '#2f6fbd' }} />
                <span className="choropleth-legend__bin-range">Democratic district</span>
              </div>
            </div>
          ) : (
            <>
              <div className="choropleth-legend__scale">
                {legendScale.length > 0 ? legendScale.map((step, index) => (
                  <div
                    key={index}
                    className="choropleth-legend__swatch"
                    style={{ background: step.color }}
                  />
                )) : (
                  <div className="choropleth-legend__bin-row">
                    <span className="choropleth-legend__bin-range">No scale available</span>
                  </div>
                )}
              </div>
              <div className="choropleth-legend__labels">
                {activeMetric === 'partisan' ? (
                  <>
                    <span>Rep</span>
                    <span>Dem</span>
                  </>
                ) : (
                  <>
                    <span>{Number(minVal).toFixed(0)}%</span>
                    <span>{Number(maxVal).toFixed(0)}%</span>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {showOverlayControls && (activeGeoData || districtData) && (
        <div className="choropleth-controls">
          <div className="choropleth-metric">
            <label htmlFor="metric-select">Color By:</label>
            <select
              id="metric-select"
              value={activeMetric}
              disabled={isDeltaMode}
              onChange={(event) => setMetric(event.target.value)}
            >
              <option value="demographic">Demographic Heat Map</option>
              <option value="partisan">Democrat vs Republican</option>
            </select>
          </div>
          {isDemographicMetric && (
            <div className="choropleth-metric">
              <label htmlFor="group-select">Minority Group:</label>
              <select
                id="group-select"
                value={demographicGroup}
                onChange={(event) => setDemographicGroup(event.target.value)}
              >
                <option value="overall">All Minority</option>
                <option value="black">Black</option>
                <option value="hispanic">Hispanic</option>
                <option value="asian">Asian</option>
              </select>
            </div>
          )}
          {planMode === 'interesting' && (
            <div className="choropleth-note">
              Showing an "interesting" plan variant designed to surface notable district shifts.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
