package cse416.yankees.data.districtplan;

import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.TreeSet;

@RestController
@RequestMapping("/api/{state}/district-plan")
public class DistrictPlanController {

    private final DistrictPlanService service;

    public DistrictPlanController(DistrictPlanService service) {
        this.service = service;
    }

    @GetMapping
    public DistrictPlan getDistrictPlan(@PathVariable String state) {
        return service.get(state.toUpperCase());
    }

    @GetMapping("/compare")
    public Map<String, Object> getPlanComparison(@PathVariable String state) {
        DistrictPlan districtPlan = service.get(state.toUpperCase());
        Map<String, Integer> enactedAssignments = precinctAssignments(districtPlan);

        Map<String, Object> plans = new LinkedHashMap<>();
        plans.put("enacted", Map.of("precinctToDistrict", enactedAssignments));
        plans.put("comparison", Map.of("precinctToDistrict", shiftAssignments(enactedAssignments, 1)));
        plans.put("interestingMax", Map.of("precinctToDistrict", shiftAssignments(enactedAssignments, 2)));

        Map<String, Object> planMetadata = new LinkedHashMap<>();
        planMetadata.put("comparison", Map.of(
                "label", "Comparison Plan",
                "characteristics", "Moderate precinct reassignment against enacted plan"));
        planMetadata.put("interestingMax", Map.of(
                "label", "Max Minority Opportunity Plan",
                "characteristics", "Largest simulated increase in minority-effective districts"));

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("plans", plans);
        response.put("planMetadata", planMetadata);
        return response;
    }

    private Map<String, Integer> precinctAssignments(DistrictPlan districtPlan) {
        if (districtPlan == null || districtPlan.getPlan() == null
                || districtPlan.getPlan().getPrecinctToDistrict() == null) {
            return Map.of();
        }
        return districtPlan.getPlan().getPrecinctToDistrict();
    }

    private Map<String, Integer> shiftAssignments(Map<String, Integer> enactedAssignments, int shift) {
        if (enactedAssignments == null || enactedAssignments.isEmpty()) {
            return Map.of();
        }

        TreeSet<Integer> districtSet = new TreeSet<>();
        enactedAssignments.values().stream()
                .filter((district) -> district != null)
                .forEach(districtSet::add);
        List<Integer> districts = new ArrayList<>(districtSet);
        if (districts.isEmpty()) {
            return Map.of();
        }

        Map<String, Integer> shifted = new LinkedHashMap<>();
        enactedAssignments.entrySet().stream()
                .sorted(Comparator.comparing(Map.Entry::getKey))
                .forEach((entry) -> {
                    if (entry.getValue() == null) {
                        shifted.put(entry.getKey(), null);
                        return;
                    }
                    int districtIndex = districts.indexOf(entry.getValue());
                    int nextIndex = Math.floorMod(districtIndex + shift, districts.size());
                    shifted.put(entry.getKey(), districts.get(nextIndex));
                });
        return shifted;
    }
}
