package cse416.yankees.data.ginglessummary;

import cse416.yankees.common.EnsembleType;
import cse416.yankees.common.State;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/{state}/gingles/summary")
public class GinglesSummaryController {

    private final GinglesSummaryService service;

    public GinglesSummaryController(GinglesSummaryService service) {
        this.service = service;
    }

    @GetMapping
    public GinglesSummary getGinglesSummary(
            @PathVariable String state,
            @RequestParam String ensembleType) {
        return service.get(
                State.valueOf(state.toUpperCase()),
                EnsembleType.valueOf(ensembleType.toUpperCase()));
    }
}
