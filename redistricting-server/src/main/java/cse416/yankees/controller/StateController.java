package cse416.yankees.controller;

import cse416.yankees.dto.state.StateSummaryResponse;
import cse416.yankees.service.StateSummaryService;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * REST controller that exposes state-related endpoints under
 * the {@code /api/states} URI namespace.
 *
 * For now we only implement the summary endpoint, but this
 * controller is intentionally structured so i can later add
 * additional endpoints such as districts and analysis results.
 */
@RestController
@RequestMapping(path = "/api/states")
public class StateController {

    private final StateSummaryService stateSummaryService;

    public StateController(StateSummaryService stateSummaryService) {
        this.stateSummaryService = stateSummaryService;
    }

    /**
     * Return the high-level summary information for a single state.
     *
     * Example URL that the React frontend can call:
     * {@code GET /api/states/MD/summary}
     *
     * @param abbr two-letter state abbreviation from the route param
     * @return HTTP 200 with {@link StateSummaryResponse} as JSON,
     *         or an error JSON body if the state cannot be found
     */
    @GetMapping(
            path = "/{abbr}/summary",
            produces = MediaType.APPLICATION_JSON_VALUE
    )
    public ResponseEntity<StateSummaryResponse> getStateSummary(@PathVariable("abbr") String abbr) {
        StateSummaryResponse summary = stateSummaryService.getStateSummary(abbr);
        return ResponseEntity.ok(summary);
    }

    /**
     * Planned route for the homepage/catalog view. This intentionally
     * exists now so the frontend can target a stable URI before the
     * backing repository implementation lands.
     */
    @GetMapping(
            produces = MediaType.APPLICATION_JSON_VALUE
    )
    public ResponseEntity<Map<String, Object>> getStatesIndex() {
        return plannedRoute(
                "/api/states",
                "Planned state index route for home-page cards and map markers.",
                Map.of(
                        "futureFields", List.of("abbr", "name", "center", "zoom", "numDistricts", "preclearance", "position")
                )
        );
    }

    /**
     * Planned route for state-level metadata used to initialize the
     * analysis page and map viewport.
     */
    @GetMapping(
            path = "/{abbr}/metadata",
            produces = MediaType.APPLICATION_JSON_VALUE
    )
    public ResponseEntity<Map<String, Object>> getStateMetadata(@PathVariable("abbr") String abbr) {
        return plannedRoute(
                String.format("/api/states/%s/metadata", abbr),
                "Planned state metadata route for map configuration and page-level context.",
                Map.of(
                        "stateAbbr", abbr.toUpperCase(),
                        "futureFields", List.of(
                                "name",
                                "abbr",
                                "center",
                                "zoom",
                                "population",
                                "whitePercent",
                                "blackPercent",
                                "hispanicPercent",
                                "asianPercent",
                                "preclearance",
                                "redistrictingControl",
                                "statewideVoterDistribution"
                        )
                )
        );
    }

    /**
     * Planned route family for district-plan payloads such as current,
     * comparison, and interesting plans.
     */
    @GetMapping(
            path = "/{abbr}/district-plans/{planType}",
            produces = MediaType.APPLICATION_JSON_VALUE
    )
    public ResponseEntity<Map<String, Object>> getStateDistrictPlanData(
            @PathVariable("abbr") String abbr,
            @PathVariable("planType") String planType
    ) {
        return plannedRoute(
                String.format("/api/states/%s/district-plans/%s", abbr, planType),
                "Planned district-plan data route for current/comparison/interesting district metrics.",
                Map.of(
                        "stateAbbr", abbr.toUpperCase(),
                        "requestedPlanType", planType,
                        "supportedPlanTypes", List.of("current", "comparison", "interesting"),
                        "futureFields", List.of("id", "dem", "rep", "minorityPct")
                )
        );
    }

    /**
     * Planned GeoJSON route for district geometries by plan type.
     */
    @GetMapping(
            path = "/{abbr}/geojson/districts/{planType}",
            produces = MediaType.APPLICATION_JSON_VALUE
    )
    public ResponseEntity<Map<String, Object>> getDistrictGeoJson(
            @PathVariable("abbr") String abbr,
            @PathVariable("planType") String planType
    ) {
        return plannedRoute(
                String.format("/api/states/%s/geojson/districts/%s", abbr, planType),
                "Planned GeoJSON route for district boundaries by plan type.",
                Map.of(
                        "stateAbbr", abbr.toUpperCase(),
                        "requestedPlanType", planType,
                        "supportedPlanTypes", List.of("current", "comparison", "interesting")
                )
        );
    }

    /**
     * Planned GeoJSON route for precinct geometries.
     */
    @GetMapping(
            path = "/{abbr}/geojson/precincts",
            produces = MediaType.APPLICATION_JSON_VALUE
    )
    public ResponseEntity<Map<String, Object>> getPrecinctGeoJson(@PathVariable("abbr") String abbr) {
        return plannedRoute(
                String.format("/api/states/%s/geojson/precincts", abbr),
                "Planned GeoJSON route for precinct geometries and precinct-level attributes.",
                Map.of(
                        "stateAbbr", abbr.toUpperCase()
                )
        );
    }

    /**
     * Planned GeoJSON route for census-block geometries.
     */
    @GetMapping(
            path = "/{abbr}/geojson/blocks",
            produces = MediaType.APPLICATION_JSON_VALUE
    )
    public ResponseEntity<Map<String, Object>> getBlockGeoJson(@PathVariable("abbr") String abbr) {
        return plannedRoute(
                String.format("/api/states/%s/geojson/blocks", abbr),
                "Planned GeoJSON route for census-block geometries and block-level attributes.",
                Map.of(
                        "stateAbbr", abbr.toUpperCase()
                )
        );
    }

    /**
     * Planned route for non-ensemble map overlays so the frontend does
     * not need to synthesize demographic subgroup or partisan layer
     * values in the browser.
     */
    @GetMapping(
            path = "/{abbr}/map-overlays/{geographyLevel}/{metric}",
            produces = MediaType.APPLICATION_JSON_VALUE
    )
    public ResponseEntity<Map<String, Object>> getMapOverlay(
            @PathVariable("abbr") String abbr,
            @PathVariable("geographyLevel") String geographyLevel,
            @PathVariable("metric") String metric
    ) {
        return plannedRoute(
                String.format("/api/states/%s/map-overlays/%s/%s", abbr, geographyLevel, metric),
                "Planned map-overlay route for non-ensemble demographic and partisan layers.",
                Map.of(
                        "stateAbbr", abbr.toUpperCase(),
                        "requestedGeographyLevel", geographyLevel,
                        "requestedMetric", metric,
                        "supportedGeographyLevels", List.of("precinct", "censusBlock"),
                        "supportedMetrics", List.of(
                                "minorityOverall",
                                "minorityBlack",
                                "minorityHispanic",
                                "minorityAsian",
                                "partisan"
                        )
                )
        );
    }

    /**
     * Planned route for box-and-whisker chart data for a single
     * ensemble type. The response should include all relevant
     * demographic groups for the state.
     */
    @GetMapping(
            path = "/{abbr}/ensembles/{ensembleType}/box-whiskers",
            produces = MediaType.APPLICATION_JSON_VALUE
    )
    public ResponseEntity<Map<String, Object>> getBoxWhiskers(
            @PathVariable("abbr") String abbr,
            @PathVariable("ensembleType") String ensembleType
    ) {
        return plannedRoute(
                String.format("/api/states/%s/ensembles/%s/box-whiskers", abbr, ensembleType),
                "Planned box-and-whisker route for district distributions by demographic group.",
                Map.of(
                        "stateAbbr", abbr.toUpperCase(),
                        "requestedEnsembleType", ensembleType,
                        "supportedEnsembleTypes", List.of("raceBlind", "vra"),
                        "futureFields", List.of("groups", "byGroup")
                )
        );
    }

    /**
     * Planned route for ensemble split bar-chart data.
     */
    @GetMapping(
            path = "/{abbr}/ensembles/{ensembleType}/ensemble-splits",
            produces = MediaType.APPLICATION_JSON_VALUE
    )
    public ResponseEntity<Map<String, Object>> getEnsembleSplits(
            @PathVariable("abbr") String abbr,
            @PathVariable("ensembleType") String ensembleType
    ) {
        return plannedRoute(
                String.format("/api/states/%s/ensembles/%s/ensemble-splits", abbr, ensembleType),
                "Planned ensemble-splits route for seat outcome counts and threshold metadata.",
                Map.of(
                        "stateAbbr", abbr.toUpperCase(),
                        "requestedEnsembleType", ensembleType,
                        "supportedEnsembleTypes", List.of("raceBlind", "vra"),
                        "futureFields", List.of("populationEqualityThresholdPct", "totalPlans", "splits")
                )
        );
    }

    /**
     * Planned route for vote-share vs seat-share curve data.
     */
    @GetMapping(
            path = "/{abbr}/ensembles/{ensembleType}/vote-seat-curve",
            produces = MediaType.APPLICATION_JSON_VALUE
    )
    public ResponseEntity<Map<String, Object>> getVoteSeatCurve(
            @PathVariable("abbr") String abbr,
            @PathVariable("ensembleType") String ensembleType
    ) {
        return plannedRoute(
                String.format("/api/states/%s/ensembles/%s/vote-seat-curve", abbr, ensembleType),
                "Planned vote-share vs seat-share route.",
                Map.of(
                        "stateAbbr", abbr.toUpperCase(),
                        "requestedEnsembleType", ensembleType,
                        "supportedEnsembleTypes", List.of("raceBlind", "vra")
                )
        );
    }

    /**
     * Planned route for the Gingles summary card.
     */
    @GetMapping(
            path = "/{abbr}/ensembles/{ensembleType}/gingles/summary",
            produces = MediaType.APPLICATION_JSON_VALUE
    )
    public ResponseEntity<Map<String, Object>> getGinglesSummary(
            @PathVariable("abbr") String abbr,
            @PathVariable("ensembleType") String ensembleType
    ) {
        return plannedRoute(
                String.format("/api/states/%s/ensembles/%s/gingles/summary", abbr, ensembleType),
                "Planned Gingles summary route.",
                Map.of(
                        "stateAbbr", abbr.toUpperCase(),
                        "requestedEnsembleType", ensembleType,
                        "supportedEnsembleTypes", List.of("raceBlind", "vra"),
                        "futureFields", List.of(
                                "precondition1MajorityMinorityDistricts",
                                "precondition2PoliticalCohesion",
                                "precondition3BlocVoting",
                                "compactnessScore",
                                "likelyVraViolation",
                                "scatter"
                        )
                )
        );
    }

    /**
     * Planned route for the Gingles 2/3 table.
     */
    @GetMapping(
            path = "/{abbr}/ensembles/{ensembleType}/gingles/table",
            produces = MediaType.APPLICATION_JSON_VALUE
    )
    public ResponseEntity<Map<String, Object>> getGinglesTable(
            @PathVariable("abbr") String abbr,
            @PathVariable("ensembleType") String ensembleType
    ) {
        return plannedRoute(
                String.format("/api/states/%s/ensembles/%s/gingles/table", abbr, ensembleType),
                "Planned Gingles 2/3 table route.",
                Map.of(
                        "stateAbbr", abbr.toUpperCase(),
                        "requestedEnsembleType", ensembleType,
                        "supportedEnsembleTypes", List.of("raceBlind", "vra")
                )
        );
    }

    /**
     * Planned route for EI candidate results, including candidate
     * support tables and group probability densities.
     */
    @GetMapping(
            path = "/{abbr}/ensembles/{ensembleType}/ei/candidate-results",
            produces = MediaType.APPLICATION_JSON_VALUE
    )
    public ResponseEntity<Map<String, Object>> getEiCandidateResults(
            @PathVariable("abbr") String abbr,
            @PathVariable("ensembleType") String ensembleType
    ) {
        return plannedRoute(
                String.format("/api/states/%s/ensembles/%s/ei/candidate-results", abbr, ensembleType),
                "Planned EI candidate-results route for candidate support and density data.",
                Map.of(
                        "stateAbbr", abbr.toUpperCase(),
                        "requestedEnsembleType", ensembleType,
                        "supportedEnsembleTypes", List.of("raceBlind", "vra"),
                        "futureFields", List.of("candidateSupport", "candidateDensity", "candidateSupportChart")
                )
        );
    }

    /**
     * Planned route for EI precinct bar-chart data.
     */
    @GetMapping(
            path = "/{abbr}/ensembles/{ensembleType}/ei/precinct-bar",
            produces = MediaType.APPLICATION_JSON_VALUE
    )
    public ResponseEntity<Map<String, Object>> getEiPrecinctBar(
            @PathVariable("abbr") String abbr,
            @PathVariable("ensembleType") String ensembleType
    ) {
        return plannedRoute(
                String.format("/api/states/%s/ensembles/%s/ei/precinct-bar", abbr, ensembleType),
                "Planned EI precinct-bar route.",
                Map.of(
                        "stateAbbr", abbr.toUpperCase(),
                        "requestedEnsembleType", ensembleType,
                        "supportedEnsembleTypes", List.of("raceBlind", "vra")
                )
        );
    }

    /**
     * Planned route for EI KDE data.
     */
    @GetMapping(
            path = "/{abbr}/ensembles/{ensembleType}/ei/kde",
            produces = MediaType.APPLICATION_JSON_VALUE
    )
    public ResponseEntity<Map<String, Object>> getEiKde(
            @PathVariable("abbr") String abbr,
            @PathVariable("ensembleType") String ensembleType
    ) {
        return plannedRoute(
                String.format("/api/states/%s/ensembles/%s/ei/kde", abbr, ensembleType),
                "Planned EI KDE route.",
                Map.of(
                        "stateAbbr", abbr.toUpperCase(),
                        "requestedEnsembleType", ensembleType,
                        "supportedEnsembleTypes", List.of("raceBlind", "vra")
                )
        );
    }

    /**
     * Planned route for seat-share distribution data.
     */
    @GetMapping(
            path = "/{abbr}/ensembles/{ensembleType}/seat-share-distribution",
            produces = MediaType.APPLICATION_JSON_VALUE
    )
    public ResponseEntity<Map<String, Object>> getSeatShareDistribution(
            @PathVariable("abbr") String abbr,
            @PathVariable("ensembleType") String ensembleType
    ) {
        return plannedRoute(
                String.format("/api/states/%s/ensembles/%s/seat-share-distribution", abbr, ensembleType),
                "Planned seat-share distribution route.",
                Map.of(
                        "stateAbbr", abbr.toUpperCase(),
                        "requestedEnsembleType", ensembleType,
                        "supportedEnsembleTypes", List.of("raceBlind", "vra")
                )
        );
    }

    /**
     * Planned route for opportunity-district distribution data.
     */
    @GetMapping(
            path = "/{abbr}/ensembles/{ensembleType}/opportunity-districts",
            produces = MediaType.APPLICATION_JSON_VALUE
    )
    public ResponseEntity<Map<String, Object>> getOpportunityDistricts(
            @PathVariable("abbr") String abbr,
            @PathVariable("ensembleType") String ensembleType
    ) {
        return plannedRoute(
                String.format("/api/states/%s/ensembles/%s/opportunity-districts", abbr, ensembleType),
                "Planned opportunity-districts route.",
                Map.of(
                        "stateAbbr", abbr.toUpperCase(),
                        "requestedEnsembleType", ensembleType,
                        "supportedEnsembleTypes", List.of("raceBlind", "vra"),
                        "futureFields", List.of("distribution", "avgOpportunityDistricts")
                )
        );
    }

    /**
     * Planned route for ensemble-dependent map overlays so EI layer
     * values can come from the backend instead of being derived in the
     * frontend.
     */
    @GetMapping(
            path = "/{abbr}/ensembles/{ensembleType}/map-overlays/{geographyLevel}/{metric}",
            produces = MediaType.APPLICATION_JSON_VALUE
    )
    public ResponseEntity<Map<String, Object>> getEnsembleMapOverlay(
            @PathVariable("abbr") String abbr,
            @PathVariable("ensembleType") String ensembleType,
            @PathVariable("geographyLevel") String geographyLevel,
            @PathVariable("metric") String metric
    ) {
        return plannedRoute(
                String.format(
                        "/api/states/%s/ensembles/%s/map-overlays/%s/%s",
                        abbr,
                        ensembleType,
                        geographyLevel,
                        metric
                ),
                "Planned ensemble map-overlay route for EI and other ensemble-dependent choropleth layers.",
                Map.of(
                        "stateAbbr", abbr.toUpperCase(),
                        "requestedEnsembleType", ensembleType,
                        "requestedGeographyLevel", geographyLevel,
                        "requestedMetric", metric,
                        "supportedEnsembleTypes", List.of("raceBlind", "vra"),
                        "supportedGeographyLevels", List.of("precinct", "censusBlock"),
                        "supportedMetrics", List.of("eiCandidateSupport", "eiTurnoutGap")
                )
        );
    }

    /**
     * Planned route for comparing race-blind and VRA-constrained
     * ensemble outputs side by side.
     */
    @GetMapping(
            path = "/{abbr}/ensembles/comparison",
            produces = MediaType.APPLICATION_JSON_VALUE
    )
    public ResponseEntity<Map<String, Object>> getEnsembleComparison(@PathVariable("abbr") String abbr) {
        return plannedRoute(
                String.format("/api/states/%s/ensembles/comparison", abbr),
                "Planned ensemble comparison route for race-blind vs VRA-constrained outputs.",
                Map.of(
                        "stateAbbr", abbr.toUpperCase(),
                        "comparedEnsembleTypes", List.of("raceBlind", "vra")
                )
        );
    }

    private ResponseEntity<Map<String, Object>> plannedRoute(
            String route,
            String message,
            Map<String, Object> metadata
    ) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("status", "not_implemented");
        body.put("route", route);
        body.put("message", message);
        body.putAll(metadata);
        return ResponseEntity.status(HttpStatus.NOT_IMPLEMENTED).body(body);
    }
}
