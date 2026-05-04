package cse416.yankees.data.controllers;

import cse416.yankees.common.Group;
import cse416.yankees.common.State;
import cse416.yankees.data.models.DemographicHeatMap;
import cse416.yankees.data.models.DistrictPlan;
import cse416.yankees.data.models.PlanComparison;
import cse416.yankees.data.services.MapDataService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/{state}")
public class MapDataController {

    @Autowired
    private MapDataService mapDataService;

    @GetMapping("/district-plan")
    public DistrictPlan getCurrentDistrictPlan(@PathVariable String state) {
        return mapDataService.getDistrictPlan(State.valueOf(state.toUpperCase()));
    }

    @GetMapping("/map/heat-map")
    public DemographicHeatMap getDemographicOverlay(
            @PathVariable String state,
            @RequestParam String group) {
        return mapDataService.getDemographicHeatMap(
                State.valueOf(state.toUpperCase()),
                Group.valueOf(group));
    }

    @GetMapping("/plan-comparison")
    public PlanComparison getInterestingPlans(@PathVariable String state) {
        return mapDataService.getPlanComparison(State.valueOf(state.toUpperCase()));
    }
}
