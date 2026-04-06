package cse416.yankees.data.opportunitydistricts;

import cse416.yankees.common.EnsembleType;
import cse416.yankees.common.State;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/{state}/opportunity-districts")
public class OpportunityDistrictsController {

    private final OpportunityDistrictsService service;

    public OpportunityDistrictsController(OpportunityDistrictsService service) {
        this.service = service;
    }

    @GetMapping
    public OpportunityDistricts getOpportunityDistricts(
            @PathVariable String state,
            @RequestParam String ensembleType) {
        return service.get(
                State.valueOf(state.toUpperCase()),
                EnsembleType.valueOf(ensembleType.toUpperCase()));
    }
}
