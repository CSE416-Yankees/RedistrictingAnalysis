# Redistricting Analysis Endpoint Documentation

## 1. Global Conventions

### Path Variables

Every endpoint begins with `/api/{state}/`. The `{state}` segment is **case-insensitive** — the server calls `.toUpperCase()` before parsing.

| Value | Meaning |
|-------|---------|
| `md`  | Maryland |
| `ms`  | Mississippi |

### Query Parameters

Many endpoints accept an `ensembleType` query parameter. Like `state`, it is **case-insensitive**.

| Value | Meaning                    |
| ----- | -------------------------- |
| `RB`  | Race-Blind ensemble        |
| `VRA` | Voting Rights Act ensemble |

---

## 2. Error Responses

All errors return JSON.

### 404 Not Found
Returned when data for the requested state/ensembleType combination does not exist in the database.
```json
{
  "timestamp": "2025-04-15T12:00:00.000Z",
  "status": 404,
  "error": "Not Found",
  "message": "Resource not found: ...",
  "path": "/api/md/summary"
}
```

### 400 Bad Request
Returned when `state` or `ensembleType` is not a recognized enum value (e.g., `?state=XX`).
```json
{
  "timestamp": "2025-04-15T12:00:00.000Z",
  "status": 400,
  "error": "Bad Request",
  "message": "No enum constant cse416.yankees.common.State.XX",
  "path": "/api/xx/summary"
}
```

### 500 Internal Server Error
```json
{
  "timestamp": "2025-04-15T12:00:00.000Z",
  "status": 500,
  "error": "Internal Server Error",
  "message": "An unexpected error occurred. Please try again later.",
  "path": "/api/md/summary"
}
```

---

## 4. Endpoints

### 4.1 `GET /api/{state}/summary`

Returns high-level statistics about a state for a given ensemble type. This is the primary data source for the state overview panel.

**Parameters**

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `state` | path | yes | string | `md` or `ms` |
| `ensembleType` | query | yes | string | `RB` or `VRA` |

**Example Request**
```
GET /api/md/summary?ensembleType=RB
```

**Example Response**
```json
{
  "state": "MD",
  "ensembleType": "RB",
  "population": 6177224,
  "numCongressionalDistricts": 8,
  "avgMinorityPercent": 38.5,
  "avgDemVotePercent": 62.1,
  "opportunityDistricts": 2,
  "preclearance": false,
  "representativesByParty": {
    "Democrat": 7,
    "Republican": 1
  },
  "redistrictingPartyControl": "Democrat",
  "demVoterDistribution": 63,
  "repVoterDistribution": 37,
  "representatives": [
    {
      "state": "MD",
      "districtNumber": 1,
      "name": "Andy Harris",
      "party": "Republican",
      "racialEthnicGroup": "White",
      "voteMarginPercent": 65,
      "demVotePercent": 32,
      "repVotePercent": 67
    }
  ]
}
```

**Notes**
- `demVoterDistribution + repVoterDistribution = 100`
- `representatives` is a list with one entry per congressional district
- `preclearance` is `true` for states subject to VRA Section 5 preclearance (historically Mississippi)

---

### 4.2 `GET /api/{state}/box-whisker`

Returns box-and-whisker plot data showing the distribution of a minority group's percentage across all districts in the ensemble. Use this to render a box plot per district.

**Parameters**

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `state` | path | yes | string | `md` or `ms` |
| `ensembleType` | query | yes | string | `RB` or `VRA` |
| `group` | query | yes | string | `Minority`, `Black`, `Hispanic`, or `Asian` |

**Example Request**
```
GET /api/md/box-whisker?ensembleType=RB&group=Black
```

**Example Response**
```json
{
  "state": "MD",
  "ensembleType": "RB",
  "group": "Black",
  "districts": [
    {
      "districtNumber": 1,
      "minPercent": 5.2,
      "q1Percent": 10.4,
      "medianPercent": 15.7,
      "q3Percent": 22.1,
      "maxPercent": 41.8,
      "enactedPercent": 14.3,
      "proposedPercent": 18.9
    }
  ]
}
```

**Notes**
- All `*Percent` fields are `0.0–100.0`
- `enactedPercent` = current enacted map's minority % for this district
- `proposedPercent` = proposed plan's minority % for this district
- `districts` is ordered by `districtNumber`
- `group` values are **case-sensitive** in the query param — use exactly `Minority`, `Black`, `Hispanic`, or `Asian`

---

### 4.3 `GET /api/{state}/opportunity-districts`

Returns a histogram of how many plans in the ensemble contain a given number of opportunity districts.

**Parameters**

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `state` | path | yes | string | `md` or `ms` |
| `ensembleType` | query | yes | string | `RB` or `VRA` |

**Example Request**
```
GET /api/md/opportunity-districts?ensembleType=VRA
```

**Example Response**
```json
{
  "state": "MD",
  "ensembleType": "VRA",
  "opportunityDistrictsToPlans": {
    "1": 320,
    "2": 4210,
    "3": 1470
  }
}
```

**Notes**
- `opportunityDistrictsToPlans` is a map: **key** = number of opportunity districts (integer), **value** = number of plans in the ensemble that have that count
- Use this to render a bar chart / histogram

---

### 4.4 `GET /api/{state}/party-seat-share`

Returns a histogram of how many plans in the ensemble result in a given number of Republican-held seats.

**Parameters**

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `state` | path | yes | string | `md` or `ms` |
| `ensembleType` | query | yes | string | `RB` or `VRA` |

**Example Request**
```
GET /api/md/party-seat-share?ensembleType=RB
```

**Example Response**
```json
{
  "state": "MD",
  "ensembleType": "RB",
  "republicanSeatsToPlans": {
    "0": 120,
    "1": 3800,
    "2": 2080
  }
}
```

**Notes**
- `republicanSeatsToPlans`: **key** = number of Republican seats (integer), **value** = number of plans with that outcome
- Use this to render a histogram of partisan seat outcomes

---

### 4.5 `GET /api/{state}/vote-share-seat-share`

Returns a mapping from Democratic vote share (%) to seat share (proportion) across the ensemble — the classic "seats-votes curve" data.

**Parameters**

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `state` | path | yes | string | `md` or `ms` |
| `ensembleType` | query | yes | string | `RB` or `VRA` |

**Example Request**
```
GET /api/md/vote-share-seat-share?ensembleType=RB
```

**Example Response**
```json
{
  "state": "MD",
  "ensembleType": "RB",
  "voteShareToSeatShare": {
    "40": 0.125,
    "45": 0.25,
    "50": 0.5,
    "55": 0.75,
    "60": 0.875
  }
}
```

**Notes**
- `voteShareToSeatShare`: **key** = Democratic vote share as integer percentage (e.g., `50` = 50%), **value** = seat share as a decimal `0.0–1.0` (e.g., `0.5` = 50% of seats)
- Use this to render a seats-votes curve chart

---

### 4.6 `GET /api/{state}/ensemble/splits`

Returns metadata about the ensembles (plan counts, population equality thresholds) and a seat outcome breakdown for both ensemble types.

**Parameters**

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `state` | path | yes | string | `md` or `ms` |

No `ensembleType` parameter — returns data for **both** ensemble types at once.

**Example Request**
```
GET /api/md/ensemble/splits
```

**Example Response**
```json
{
  "state": "MD",
  "districtPlans": 10000,
  "popEqThresholdPercent": 1.0,
  "ensembles": {
    "RB": {
      "districtPlans": 10000,
      "popEqThresholdPercent": 1.0
    },
    "VRA": {
      "districtPlans": 10000,
      "popEqThresholdPercent": 1.0
    }
  },
  "seatOutcomes": {
    "RB": {
      "0": 50,
      "1": 3200,
      "2": 6750
    },
    "VRA": {
      "1": 1800,
      "2": 8200
    }
  }
}
```

**Notes**
- `ensembles` is a map keyed by ensemble type (`"RB"`, `"VRA"`) to `EnsembleData`
- `seatOutcomes` is a nested map: ensemble type → (seats won → plan count)
- `popEqThresholdPercent` is the population equality deviation allowed (`0.0–100.0`)

---

### 4.7 `GET /api/{state}/ensemble/comparison`

Returns a side-by-side comparison of opportunity district counts between the RB and VRA ensembles, useful for rendering grouped bar charts.

**Parameters**

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `state` | path | yes | string | `md` or `ms` |

No `ensembleType` parameter — returns data for **both** ensemble types at once.

**Example Request**
```
GET /api/md/ensemble/comparison
```

**Example Response**
```json
{
  "state": "MD",
  "rbAvgOpportunityDistricts": 1.8,
  "vraAvgOpportunityDistricts": 2.4,
  "totalPlansEach": 10000,
  "opportunityDistrictData": {
    "1": {
      "RBPlans": 3200,
      "VRAPlans": 1100
    },
    "2": {
      "RBPlans": 5800,
      "VRAPlans": 6900
    },
    "3": {
      "RBPlans": 1000,
      "VRAPlans": 2000
    }
  }
}
```

**Notes**
- `opportunityDistrictData`: **key** = number of opportunity districts (integer), **value** = `{ RBPlans, VRAPlans }` — how many plans in each ensemble had that many opportunity districts
- `rbAvgOpportunityDistricts` / `vraAvgOpportunityDistricts` = mean opportunity district count across all plans in each respective ensemble
- `totalPlansEach` = number of plans in each ensemble (same for both)

---

### 4.8 `GET /api/{state}/gingles/summary`

Returns aggregated Gingles test metrics (cohesion, bloc voting, compactness) and scatter plot data points for a given ensemble.

**Parameters**

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `state` | path | yes | string | `md` or `ms` |
| `ensembleType` | query | yes | string | `RB` or `VRA` |

**Example Request**
```
GET /api/md/gingles/summary?ensembleType=RB
```

**Example Response**
```json
{
  "state": "MD",
  "ensembleType": "RB",
  "numMajorityMinorityDistricts": 2,
  "cohesion": 0.78,
  "blocVoting": 0.65,
  "compactness": 0.52,
  "vraIssueFlagged": false,
  "dataPoints": [
    {
      "group": "Black",
      "district": 4,
      "precinct": 12,
      "minorityPercentage": 58.3,
      "republicanVotePercentage": 18.2,
      "democraticVotePercentage": 81.8
    }
  ]
}
```

**Notes**
- `cohesion`, `blocVoting`, `compactness` are `0.0–1.0` (higher = stronger signal)
- `vraIssueFlagged`: `true` if the analysis flagged a potential VRA concern
- `dataPoints` is the raw scatter plot data — each point is one precinct within a district, for a particular minority group
- `group` in `dataPoints` is one of `"Black"`, `"Hispanic"`, `"Asian"`
- `minorityPercentage`, `republicanVotePercentage`, `democraticVotePercentage` are `0.0–100.0`

---

### 4.9 `GET /api/{state}/gingles/table`

Returns per-district Gingles metrics as a flat table, without filtering by ensemble type.

**Parameters**

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `state` | path | yes | string | `md` or `ms` |

No `ensembleType` parameter.

**Example Request**
```
GET /api/md/gingles/table
```

**Example Response**
```json
{
  "state": "MD",
  "rows": [
    {
      "district": 1,
      "minorityPercentage": 22,
      "cohesion": 0.61,
      "blocVoting": 0.48,
      "compactness": 0.55,
      "thresholdMet": false
    },
    {
      "district": 4,
      "minorityPercentage": 62,
      "cohesion": 0.89,
      "blocVoting": 0.83,
      "compactness": 0.71,
      "thresholdMet": true
    }
  ]
}
```

**Notes**
- `minorityPercentage` is an integer `0–100`
- `cohesion`, `blocVoting`, `compactness` are `0.0–1.0`
- `thresholdMet`: `true` when this district passes the Gingles preconditions threshold

---

### 4.10 `GET /api/{state}/ei/candidate-results`

Returns Ecological Inference results showing how demographic groups support each candidate, plus a table of per-district candidate support.

**Parameters**

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `state` | path | yes | string | `md` or `ms` |
| `ensembleType` | query | yes | string | `RB` or `VRA` |

**Example Request**
```
GET /api/md/ei/candidate-results?ensembleType=RB
```

**Example Response**
```json
{
  "state": "MD",
  "ensembleType": "RB",
  "graphPoints": {
    "DEM": [
      {
        "supportPercent": 72,
        "asianDensity": 0.14,
        "blackDensity": 0.82,
        "hispanicDensity": 0.31
      }
    ],
    "REP": [
      {
        "supportPercent": 28,
        "asianDensity": 0.08,
        "blackDensity": 0.11,
        "hispanicDensity": 0.19
      }
    ],
    "IND": []
  },
  "tableRows": [
    {
      "district": 1,
      "candidateAPercentage": 65,
      "candidateBPercentage": 30,
      "candidateCPercentage": 5
    }
  ]
}
```

**Notes**
- `graphPoints` keys are `"DEM"`, `"REP"`, `"IND"`
- Each `GraphPoint` represents one observation: at `supportPercent`% support for this candidate, here is the density of Asian/Black/Hispanic voter support
- `*Density` fields indicate the density of that group at that support level (used for a scatter/density plot)
- `tableRows`: one row per congressional district with percentage support for each of three candidates (A, B, C — mapped to DEM, REP, IND respectively)
- `candidateAPercentage`, `candidateBPercentage`, `candidateCPercentage` are integers `0–100`

---

### 4.11 `GET /api/{state}/ei/kde-results`

Returns a Kernel Density Estimation score per district — a single numeric measure of how cohesive minority voting behavior is in that district.

**Parameters**

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `state` | path | yes | string | `md` or `ms` |

No `ensembleType` parameter.

**Example Request**
```
GET /api/md/ei/kde-results
```

**Example Response**
```json
{
  "state": "MD",
  "districtKDEScores": {
    "1": 0.12,
    "2": 0.47,
    "3": 0.88,
    "4": 0.93
  }
}
```

**Notes**
- `districtKDEScores`: **key** = district number (integer as string in JSON), **value** = KDE score (`double`)
- Higher KDE score indicates stronger minority voter cohesion in that district

---

### 4.12 `GET /api/{state}/ei/precinct-results`

Returns precinct-level voter turnout percentages broken down by minority vs. white voters — raw EI input data.

**Parameters**

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `state` | path | yes | string | `md` or `ms` |

No `ensembleType` parameter.

**Example Request**
```
GET /api/md/ei/precinct-results
```

**Example Response**
```json
{
  "state": "MD",
  "precinctData": {
    "1001": {
      "minorityTurnoutPercentage": 54.3,
      "whiteTurnoutPercentage": 71.8
    },
    "1002": {
      "minorityTurnoutPercentage": 48.1,
      "whiteTurnoutPercentage": 68.5
    }
  }
}
```

**Notes**
- `precinctData`: **key** = precinct number (integer as string in JSON), **value** = `PrecinctData`
- `minorityTurnoutPercentage` and `whiteTurnoutPercentage` are `0.0–100.0`
- This data is not filtered by ensemble type — it reflects the state's actual precinct-level turnout data

---

### 4.13 `GET /api/{state}/geo-data`

Returns a GeoJSON FeatureCollection containing all geographic features for the given state at the requested geography level. The response is a valid GeoJSON object consumable directly by Leaflet.

**Parameters**

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `state` | path | yes | string | `md` or `ms` |
| `level` | query | yes | string | `DISTRICT`, `PRECINCT`, or `CENSUS_BLOCK` (case-insensitive) |

**Example Request**
```
GET /api/md/geo-data?level=DISTRICT
```

**Example Response**
```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "geometry": {
        "type": "MultiPolygon",
        "coordinates": [[[[[-76.6, 39.2], [-76.5, 39.3], [-76.6, 39.2]]]]]
      },
      "properties": {
        "district": 1,
        "name": "District 1",
        "Code": "MD-01",
        "District": "Maryland 1st",
        "color": "#e63946"
      }
    }
  ]
}
```

**Notes**
- One response contains **all features** for the requested state and geography level — not a single district
- `DISTRICT` returns 8 features for MD (one MultiPolygon per congressional district)
- `PRECINCT` returns all precinct polygons for the state (hundreds of features); feature properties include `geoid`, `GEOID20`, `VTDST20`, `STATEFP20`, `COUNTYFP20`, `ALAND20`, `AWATER20`, `INTPTLAT20`, `INTPTLON20`, `district` (int, links to district number), `minorityPct`, `demPct`
- `CENSUS_BLOCK` returns all census block polygons (thousands of features); same property schema as `PRECINCT`
- District-level geometry type is `MultiPolygon`; precinct and census block geometry type is `Polygon`
- Precinct and census block responses may include a top-level `fileName` field (non-standard GeoJSON extension, ignored by Leaflet)
- `bbox` on geometry objects is omitted when not present in the source data

---

## 5. Full Response Schemas

### `StateSummary`
```ts
{
  state:                    "MD" | "MS"
  ensembleType:             "RB" | "VRA"
  population:               number           // total state population
  numCongressionalDistricts: number          // total number of districts
  avgMinorityPercent:       number           // 0.0–100.0
  avgDemVotePercent:        number           // 0.0–100.0
  opportunityDistricts:     number           // count of opportunity districts
  preclearance:             boolean          // VRA Section 5 preclearance required
  representativesByParty:   Record<string, number>  // e.g. { "Democrat": 7, "Republican": 1 }
  redistrictingPartyControl: string          // party controlling redistricting
  demVoterDistribution:     number           // integer 0–100 (Democrat %)
  repVoterDistribution:     number           // integer 0–100 (Republican %, = 100 - dem)
  representatives:          Representative[]
}

Representative {
  state:              "MD" | "MS"
  districtNumber:     number
  name:               string
  party:              string          // e.g. "Democrat", "Republican"
  racialEthnicGroup:  string          // e.g. "White", "Black", "Hispanic"
  voteMarginPercent:  number          // integer 0–100 (winner's margin)
  demVotePercent:     number          // integer 0–100
  repVotePercent:     number          // integer 0–100
}
```

### `BoxWhisker`
```ts
{
  state:        "MD" | "MS"
  ensembleType: "RB" | "VRA"
  group:        "Minority" | "Black" | "Hispanic" | "Asian"
  districts:    DistrictBox[]
}

DistrictBox {
  districtNumber:  number
  minPercent:      number   // 0.0–100.0
  q1Percent:       number   // 0.0–100.0
  medianPercent:   number   // 0.0–100.0
  q3Percent:       number   // 0.0–100.0
  maxPercent:      number   // 0.0–100.0
  enactedPercent:  number   // 0.0–100.0 (current enacted map)
  proposedPercent: number   // 0.0–100.0 (proposed plan)
}
```

### `OpportunityDistricts`
```ts
{
  state:                        "MD" | "MS"
  ensembleType:                 "RB" | "VRA"
  opportunityDistrictsToPlans:  Record<number, number>  // { numOpportunityDistricts: planCount }
}
```

### `PartySeatShare`
```ts
{
  state:                  "MD" | "MS"
  ensembleType:           "RB" | "VRA"
  republicanSeatsToPlans: Record<number, number>  // { repSeatCount: planCount }
}
```

### `VoteShareSeatShare`
```ts
{
  state:                "MD" | "MS"
  ensembleType:         "RB" | "VRA"
  voteShareToSeatShare: Record<number, number>   // { voteShareIntPct: seatShareDecimal }
  // e.g. { 50: 0.5 } means 50% vote share → 50% seat share
}
```

### `EnsembleSplits`
```ts
{
  state:                "MD" | "MS"
  districtPlans:        number
  popEqThresholdPercent: number               // 0.0–100.0
  ensembles:            Record<"RB" | "VRA", EnsembleData>
  seatOutcomes:         Record<"RB" | "VRA", Record<number, number>>
  // seatOutcomes["RB"][2] = number of RB plans where Republicans won 2 seats
}

EnsembleData {
  districtPlans:        number
  popEqThresholdPercent: number   // 0.0–100.0
}
```

### `EnsembleComparison`
```ts
{
  state:                       "MD" | "MS"
  rbAvgOpportunityDistricts:   number
  vraAvgOpportunityDistricts:  number
  totalPlansEach:              number
  opportunityDistrictData:     Record<number, OpportunityDistrictData>
  // key = number of opportunity districts
}

OpportunityDistrictData {
  RBPlans:  number   // plans in RB ensemble with this many opportunity districts
  VRAPlans: number   // plans in VRA ensemble with this many opportunity districts
}
```

### `GinglesSummary`
```ts
{
  state:                       "MD" | "MS"
  ensembleType:                "RB" | "VRA"
  numMajorityMinorityDistricts: number
  cohesion:                    number   // 0.0–1.0
  blocVoting:                  number   // 0.0–1.0
  compactness:                 number   // 0.0–1.0
  vraIssueFlagged:             boolean
  dataPoints:                  GinglesDataPoint[]
}

GinglesDataPoint {
  group:                    "Black" | "Hispanic" | "Asian"
  district:                 number
  precinct:                 number
  minorityPercentage:       number   // 0.0–100.0
  republicanVotePercentage: number   // 0.0–100.0
  democraticVotePercentage: number   // 0.0–100.0
}
```

### `GinglesTable`
```ts
{
  state: "MD" | "MS"
  rows:  GinglesTableRow[]
}

GinglesTableRow {
  district:          number
  minorityPercentage: number   // integer 0–100
  cohesion:          number    // 0.0–1.0
  blocVoting:        number    // 0.0–1.0
  compactness:       number    // 0.0–1.0
  thresholdMet:      boolean
}
```

### `EICandidateResults`
```ts
{
  state:        "MD" | "MS"
  ensembleType: "RB" | "VRA"
  graphPoints:  Record<"DEM" | "REP" | "IND", GraphPoint[]>
  tableRows:    EICandidateTableRow[]
}

GraphPoint {
  supportPercent:   number   // integer 0–100
  asianDensity:     number   // density value (double)
  blackDensity:     number   // density value (double)
  hispanicDensity:  number   // density value (double)
}

EICandidateTableRow {
  district:              number
  candidateAPercentage:  number   // integer 0–100 (Democrat)
  candidateBPercentage:  number   // integer 0–100 (Republican)
  candidateCPercentage:  number   // integer 0–100 (Independent)
}
```

### `EIKDEResults`
```ts
{
  state:              "MD" | "MS"
  districtKDEScores:  Record<number, number>   // { districtNumber: kdeScore }
}
```

### `EIPrecinctResults`
```ts
{
  state:        "MD" | "MS"
  precinctData: Record<number, PrecinctData>   // { precinctNumber: data }
}

PrecinctData {
  minorityTurnoutPercentage: number   // 0.0–100.0
  whiteTurnoutPercentage:    number   // 0.0–100.0
}
```

### `GeoData` (geo-data endpoint)
```ts
// Root response — valid GeoJSON FeatureCollection
GeoJsonFeatureCollection {
  type:     "FeatureCollection"
  features: GeoJsonFeature[]
  fileName?: string   // non-standard field present on precinct/block responses only
}

GeoJsonFeature {
  type:       "Feature"
  geometry:   GeoJsonGeometry
  properties: Record<string, any>   // schema varies by level (see 4.13 Notes)
}

GeoJsonGeometry {
  type:         "Polygon" | "MultiPolygon"
  coordinates:  number[][][][]   // Polygon, or number[][][][][] for MultiPolygon
  bbox?:        number[]         // present on precinct/block geometries only
}

// District-level properties
DistrictProperties {
  district:  number    // 1-based district ID
  name:      string    // e.g. "District 1"
  Code:      string    // e.g. "MD-01"
  District:  string    // e.g. "Maryland 1st"
  color:     string    // hex color string
}

// Precinct and census block properties
PrecinctBlockProperties {
  district:    number    // district this feature belongs to
  geoid:       string
  GEOID20:     string
  VTDST20:     string
  name:        string
  STATEFP20:   string
  COUNTYFP20:  string
  ALAND20:     number    // land area (sq meters)
  AWATER20:    number    // water area (sq meters)
  INTPTLAT20:  string    // interior point latitude
  INTPTLON20:  string    // interior point longitude
  minorityPct: number    // 0.0–100.0
  demPct:      number    // 0.0–100.0
}
```
