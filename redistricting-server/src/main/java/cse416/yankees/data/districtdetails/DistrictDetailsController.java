package cse416.yankees.data.districtdetails;

import cse416.yankees.data.districtplan.DistrictPlan;
import cse416.yankees.data.districtplan.DistrictPlanService;
import cse416.yankees.data.districtplan.DistrictSummary;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/{state}/district-details")
public class DistrictDetailsController {

    private final DistrictPlanService districtPlanService;

    public DistrictDetailsController(DistrictPlanService districtPlanService) {
        this.districtPlanService = districtPlanService;
    }

    @GetMapping
    public Map<String, Object> getDistrictDetails(@PathVariable String state) {
        DistrictPlan districtPlan = districtPlanService.get(state.toUpperCase());
        Map<String, DistrictSummary> summaries = districtPlan.getPlan() == null
                ? Map.of()
                : districtPlan.getPlan().getDistrictSummaries();
        if (summaries == null) {
            summaries = Map.of();
        }

        List<Map<String, Object>> districtRows = summaries.entrySet().stream()
                .sorted(Comparator.comparingInt((entry) -> parseDistrictNumber(entry.getKey())))
                .map((entry) -> rowForDistrict(entry.getKey(), entry.getValue()))
                .toList();

        return Map.of("districtRows", districtRows);
    }

    private Map<String, Object> rowForDistrict(String districtKey, DistrictSummary summary) {
        int districtNumber = parseDistrictNumber(districtKey);
        double demVotePct = summary == null ? 0 : summary.getDemVotePct();
        double repVotePct = summary == null ? 0 : summary.getRepVotePct();
        double minorityPct = summary == null ? 0 : summary.getMinorityPct();
        String party = demVotePct >= repVotePct ? "Democrat" : "Republican";
        double effectivenessScore = round2(clamp((minorityPct / 100.0 * 0.7) + (demVotePct / 100.0 * 0.3)));

        Map<String, Object> row = new LinkedHashMap<>();
        row.put("districtNumber", districtNumber);
        row.put("representative", "District " + districtNumber + " Representative");
        row.put("party", party);
        row.put("representativeGroup", "Data pending");
        row.put("voteMarginPct", round2(Math.abs(demVotePct - repVotePct)));
        row.put("effectivenessScore", effectivenessScore);
        row.put("calibratedEffectivenessScore", round2(effectivenessScore * 0.92));
        return row;
    }

    private int parseDistrictNumber(String districtKey) {
        if (districtKey == null) {
            return 0;
        }
        String digits = districtKey.replaceAll("\\D+", "");
        return digits.isEmpty() ? 0 : Integer.parseInt(digits);
    }

    private double clamp(double value) {
        return Math.max(0, Math.min(1, value));
    }

    private double round2(double value) {
        return Math.round(value * 100.0) / 100.0;
    }
}
