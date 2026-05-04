# API Endpoints

All endpoints are prefixed with `/api/{state}` where `{state}` is a case-insensitive state abbreviation.

**Supported states:** `md` (Maryland), `ms` (Mississippi)

**Common enum values:**
- `group`: `Black`, `Hispanic`, `Asian`, `White`
- `ensembleType`: `RB` (Race-Blind), `VRA` (Voting Rights Act)
- `party`: `Democrat`, `Republican`, `Independent`

---

## State Endpoints

### `GET /api/{state}/summary`

Returns a summary of the state including demographics, statewide vote, redistricting control, and ensemble overviews.

**Response**
```json
{
  "id": "string",
  "abbr": "MD",
  "name": "Maryland",
  "population": 6177224,
  "statewideVote": {
    "demPct": 0.62
  },
  "demographicSummaries": [
    {
      "group": "Black",
      "populationPct": 0.29,
      "cvapPct": 0.27
    }
  ],
  "redistrictingControl": "Democrat",
  "representationSummary": {
    "demSeats": 7
  },
  "ensembleSummaries": {
    "RB": {
      "planCount": 5000,
      "populationEqualityThresholdPct": 1.0,
      "roughProportionality": {
        "Black": 0.74,
        "Hispanic": 0.12
      }
    },
    "VRA": {
      "planCount": 5000,
      "populationEqualityThresholdPct": 1.0,
      "roughProportionality": {
        "Black": 0.85
      }
    }
  }
}
```

---

### `GET /api/{state}/representation`

Returns the congressional representation table showing each district's representative, party, demographic group, vote margin, and effectiveness scores.

**Response**
```json
{
  "id": "string",
  "state": "MD",
  "districtRows": [
    {
      "districtNumber": 1,
      "representative": "Andy Harris",
      "party": "Republican",
      "representativeGroup": "White",
      "voteMarginPct": 35.1,
      "effectivenessScore": 0.42,
      "calibratedEffectivenessScore": 0.38
    }
  ]
}
```

---

## Map Data Endpoints

### `GET /api/{state}/district-plan`

Returns the current enacted district plan including precinct-to-district assignments and per-district statistics.

**Response**
```json
{
  "id": "string",
  "state": {
    "abbr": "MD",
    "name": "Maryland",
    "center": [-76.7, 39.0],
    "zoom": 7
  },
  "currentPlan": {
    "precinctToDistrict": {
      "240010001": 1,
      "240010002": 1
    },
    "districts": [
      {
        "districtNumber": 1,
        "precinctIds": ["240010001", "240010002"],
        "demVotePct": 30.2,
        "repVotePct": 65.1,
        "minorityPct": 22.4
      }
    ]
  }
}
```

---

### `GET /api/{state}/map/heat-map?group={group}`

Returns demographic heat map data for a given minority group, including bin definitions and per-precinct bin assignments.

**Query Parameters**

| Parameter | Type | Values | Required |
|-----------|------|--------|----------|
| `group` | string | `Black`, `Hispanic`, `Asian`, `White` | Yes |

**Response**
```json
{
  "id": "string",
  "state": "MD",
  "group": "Black",
  "bins": [
    {
      "bin": 1,
      "minPct": 0,
      "maxPct": 20,
      "color": "#f7fbff"
    },
    {
      "bin": 2,
      "minPct": 20,
      "maxPct": 40,
      "color": "#c6dbef"
    }
  ],
  "precinctBins": {
    "240010001": 2,
    "240010002": 1
  }
}
```

---

### `GET /api/{state}/plan-comparison`

Returns precinct-to-district mappings for multiple named plans (enacted, interesting extremes, etc.) used for side-by-side comparison.

**Response**
```json
{
  "id": "string",
  "state": "MD",
  "plans": {
    "enacted": {
      "precinctToDistrict": {
        "240010001": 1
      }
    },
    "interestingMax": {
      "precinctToDistrict": {
        "240010001": 3
      }
    },
    "interestingMin": {
      "precinctToDistrict": {
        "240010001": 2
      }
    }
  }
}
```

---

## Analysis Endpoints

### `GET /api/{state}/gingles/analysis`

Returns Gingles analysis scatter plot data for each minority group, including regression lines for Democratic and Republican vote share.

**Response**
```json
{
  "id": "string",
  "state": "MD",
  "groups": {
    "Black": {
      "points": [
        { "x": 0.12, "y": 0.55 },
        { "x": 0.45, "y": 0.72 }
      ],
      "regression": {
        "dem": [
          { "x": 0.0, "y": 0.45 },
          { "x": 1.0, "y": 0.90 }
        ],
        "rep": [
          { "x": 0.0, "y": 0.55 },
          { "x": 1.0, "y": 0.10 }
        ]
      }
    }
  }
}
```

`x` = minority percentage in precinct, `y` = party vote share.

---

### `GET /api/{state}/gingles/precinct-table`

Returns the precinct-level data table used to support the Gingles analysis, showing population and vote counts per precinct.

**Response**
```json
{
  "id": "string",
  "state": "MD",
  "rows": [
    {
      "precinctId": "240010001",
      "precinctName": "Precinct 1",
      "totalPopulation": 4200,
      "minorityPopulation": 1050,
      "republicanVotes": 820,
      "democraticVotes": 1540
    }
  ]
}
```

---

### `GET /api/{state}/ei/candidate-results`

Returns ecological inference (EI) candidate-level results, including vote preference density curves per group and pairwise overlap percentages.

**Response**
```json
{
  "id": "string",
  "state": "MD",
  "candidateResults": {
    "John Smith (D)": {
      "curves": {
        "Black": [
          { "x": 0.0, "y": 0.0 },
          { "x": 0.5, "y": 2.1 },
          { "x": 1.0, "y": 0.0 }
        ],
        "White": [
          { "x": 0.0, "y": 0.0 },
          { "x": 0.4, "y": 1.8 },
          { "x": 1.0, "y": 0.0 }
        ]
      },
      "overlapPct": {
        "Black": {
          "White": 0.32
        }
      }
    }
  }
}
```

`curves` are KDE probability density curves where `x` is vote share (0–1) and `y` is density. `overlapPct` is the pairwise overlap percentage between two groups' curves.

---

### `GET /api/{state}/ensemble/splits`

Returns the distribution of Democrat/Republican seat splits across all plans in both ensembles.

**Response**
```json
{
  "id": "string",
  "state": "MD",
  "districtCount": 8,
  "splits": [
    {
      "repWins": 1,
      "demWins": 7,
      "rbFrequency": 1200,
      "vraFrequency": 850
    },
    {
      "repWins": 2,
      "demWins": 6,
      "rbFrequency": 2300,
      "vraFrequency": 2100
    }
  ]
}
```

`rbFrequency` and `vraFrequency` are the number of plans in each ensemble that produced that split.

---

### `GET /api/{state}/box-whisker?ensembleType={ensembleType}&group={group}`

Returns box-and-whisker plot data for a specific ensemble type and minority group, showing the distribution of minority population percentage across ranked districts for all plans in the ensemble.

**Query Parameters**

| Parameter | Type | Values | Required |
|-----------|------|--------|----------|
| `ensembleType` | string | `RB`, `VRA` | Yes |
| `group` | string | `Black`, `Hispanic`, `Asian`, `White` | Yes |

**Response**
```json
{
  "orderedBins": [
    {
      "order": 1,
      "min": 0.04,
      "q1": 0.08,
      "median": 0.11,
      "q3": 0.15,
      "max": 0.22,
      "enactedDot": 0.10,
      "proposedDot": 0.13
    },
    {
      "order": 2,
      "min": 0.18,
      "q1": 0.24,
      "median": 0.30,
      "q3": 0.38,
      "max": 0.47,
      "enactedDot": 0.28,
      "proposedDot": 0.35
    }
  ]
}
```

Each bin corresponds to the Nth-ranked district (by minority percentage) across all plans in the ensemble. `enactedDot` and `proposedDot` mark where the enacted and proposed plans fall.

---

### `GET /api/{state}/vra/impact`

Returns the VRA impact table showing what percentage of plans in each ensemble meet various minority representation thresholds, broken down by group.

**Response**
```json
{
  "id": "string",
  "state": "MD",
  "rows": [
    {
      "group": "Black",
      "enactedThreshold": {
        "rbPct": 0.62,
        "vraPct": 0.88
      },
      "roughProportionality": {
        "rbPct": 0.74,
        "vraPct": 0.91
      },
      "jointThreshold": {
        "rbPct": 0.55,
        "vraPct": 0.83
      }
    }
  ]
}
```

`rbPct` and `vraPct` are the fraction of plans in the Race-Blind and VRA ensembles (respectively) that meet the threshold.

---

### `GET /api/{state}/minority-effectiveness`

Returns box-and-whisker statistics for minority effectiveness scores across both ensembles, broken down by group.

**Response**
```json
{
  "id": "string",
  "state": "MD",
  "groups": {
    "Black": {
      "RB": {
        "min": 0.1,
        "q1": 0.3,
        "median": 0.5,
        "q3": 0.7,
        "max": 0.9,
        "enacted": 0.55
      },
      "VRA": {
        "min": 0.2,
        "q1": 0.4,
        "median": 0.6,
        "q3": 0.8,
        "max": 0.95,
        "enacted": 0.65
      }
    },
    "Hispanic": {
      "RB": { "min": 0.05, "q1": 0.2, "median": 0.35, "q3": 0.5, "max": 0.7, "enacted": 0.3 },
      "VRA": { "min": 0.1, "q1": 0.25, "median": 0.4, "q3": 0.55, "max": 0.75, "enacted": 0.38 }
    }
  }
}
```

`enacted` marks where the currently enacted plan falls within the ensemble distribution.

---

### `GET /api/{state}/minority-effectiveness/histogram`

Returns histogram data showing how many effective minority districts each plan produces, broken down by group across both ensembles.

**Response**
```json
{
  "id": "string",
  "state": "MD",
  "districtCount": 8,
  "groupHistograms": {
    "Black": {
      "bins": [
        {
          "effectiveDistricts": 1,
          "rbFrequency": 500,
          "vraFrequency": 200
        },
        {
          "effectiveDistricts": 2,
          "rbFrequency": 2800,
          "vraFrequency": 3500
        },
        {
          "effectiveDistricts": 3,
          "rbFrequency": 1700,
          "vraFrequency": 1300
        }
      ]
    },
    "Hispanic": {
      "bins": [
        {
          "effectiveDistricts": 0,
          "rbFrequency": 3200,
          "vraFrequency": 1800
        },
        {
          "effectiveDistricts": 1,
          "rbFrequency": 1800,
          "vraFrequency": 3200
        }
      ]
    }
  }
}
```

`effectiveDistricts` is the number of districts in a plan where the minority group crosses the effectiveness threshold. `rbFrequency` and `vraFrequency` are the number of plans in each ensemble with that count.

---

## Error Responses

| Status | Condition |
|--------|-----------|
| `404 Not Found` | Requested state has no data in the collection |
| `400 Bad Request` | Invalid `state`, `group`, or `ensembleType` value |
| `500 Internal Server Error` | Unexpected server error |
