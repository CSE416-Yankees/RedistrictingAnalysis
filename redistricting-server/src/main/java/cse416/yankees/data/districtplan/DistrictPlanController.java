package cse416.yankees.data.districtplan;

import org.springframework.web.bind.annotation.*;

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
}
