package cse416.yankees.data.summary;

import cse416.yankees.common.EnsembleType;
import cse416.yankees.common.State;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/{state}/summary")
public class StateSummaryController {

    private final StateSummaryService service;

    public StateSummaryController(StateSummaryService service) {
        this.service = service;
    }

    @GetMapping
    public StateSummary getSummary(
            @PathVariable String state,
            @RequestParam String ensembleType) {
        return service.get(
                State.valueOf(state.toUpperCase()),
                EnsembleType.valueOf(ensembleType.toUpperCase()));
    }
}
