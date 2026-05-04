package cse416.yankees.data.vraimpactthresholds;

import cse416.yankees.common.State;
import cse416.yankees.data.minorityeffectiveness.BoxStats;
import cse416.yankees.data.minorityeffectiveness.MinorityEffectiveness;
import cse416.yankees.data.minorityeffectiveness.MinorityEffectivenessService;
import cse416.yankees.data.summary.DemographicSummary;
import cse416.yankees.data.summary.StateSummary;
import cse416.yankees.data.summary.StateSummaryService;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/{state}/vra-impact-thresholds")
public class VraImpactThresholdsController {

    private final StateSummaryService stateSummaryService;
    private final MinorityEffectivenessService minorityEffectivenessService;

    public VraImpactThresholdsController(
            StateSummaryService stateSummaryService,
            MinorityEffectivenessService minorityEffectivenessService) {
        this.stateSummaryService = stateSummaryService;
        this.minorityEffectivenessService = minorityEffectivenessService;
    }

    @GetMapping
    public Map<String, Object> getVraImpactThresholds(@PathVariable String state) {
        State parsedState = State.valueOf(state.toUpperCase());
        StateSummary summary = stateSummaryService.get(parsedState);
        MinorityEffectiveness effectiveness = minorityEffectivenessService.get(parsedState);
        int districtCount = districtCountForState(parsedState);
        List<DemographicSummary> demographics = summary.getDemographicSummaries() == null
                ? List.of()
                : summary.getDemographicSummaries();

        List<Map<String, Object>> rows = demographics.stream()
                .map((demographic) -> buildRow(demographic, effectiveness, districtCount))
                .toList();

        return Map.of("rows", rows);
    }

    private Map<String, Object> buildRow(
            DemographicSummary demographic,
            MinorityEffectiveness effectiveness,
            int districtCount) {
        Map<String, BoxStats> groupStats = effectiveness.getGroups() == null
                ? Map.of()
                : effectiveness.getGroups().getOrDefault(demographic.getGroup(), Map.of());
        BoxStats rbStats = groupStats.get("RB");
        BoxStats vraStats = groupStats.get("VRA");
        double cvapPct = demographic.getCvapPct() <= 1
                ? demographic.getCvapPct()
                : demographic.getCvapPct() / 100.0;

        double rbEffectiveShare = effectiveDistrictShare(rbStats, districtCount);
        double vraEffectiveShare = effectiveDistrictShare(vraStats, districtCount);
        double rbRoughProportionality = roughProportionality(rbEffectiveShare, cvapPct);
        double vraRoughProportionality = roughProportionality(vraEffectiveShare, cvapPct);

        Map<String, Object> row = new LinkedHashMap<>();
        row.put("group", demographic.getGroup());
        row.put("enactedThreshold", pctPair(rbEffectiveShare, vraEffectiveShare));
        row.put("roughProportionality", pctPair(rbRoughProportionality, vraRoughProportionality));
        row.put("jointThreshold", pctPair(
                Math.min(rbEffectiveShare, rbRoughProportionality) * 0.9,
                Math.min(vraEffectiveShare, vraRoughProportionality) * 0.9));
        return row;
    }

    private Map<String, Double> pctPair(double rbPct, double vraPct) {
        Map<String, Double> pair = new LinkedHashMap<>();
        pair.put("rbPct", round2(clamp(rbPct)));
        pair.put("vraPct", round2(clamp(vraPct)));
        return pair;
    }

    private double effectiveDistrictShare(BoxStats stats, int districtCount) {
        if (stats == null || districtCount <= 0) {
            return 0;
        }
        return stats.getMedian() / districtCount;
    }

    private double roughProportionality(double effectiveShare, double cvapPct) {
        if (cvapPct <= 0) {
            return 0;
        }
        return effectiveShare / cvapPct;
    }

    private double clamp(double value) {
        return Math.max(0, Math.min(1, value));
    }

    private double round2(double value) {
        return Math.round(value * 100.0) / 100.0;
    }

    private int districtCountForState(State state) {
        return switch (state) {
            case MD -> 8;
            case MS -> 4;
        };
    }
}
