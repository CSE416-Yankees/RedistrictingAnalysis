package cse416.yankees.data.ensemblecomparison;

import cse416.yankees.common.State;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/{state}/ensemble/comparison")
public class EnsembleComparisonController {

    private final EnsembleComparisonService service;

    public EnsembleComparisonController(EnsembleComparisonService service) {
        this.service = service;
    }

    @GetMapping
    public EnsembleComparison getComparison(@PathVariable String state) {
        return service.get(State.valueOf(state.toUpperCase()));
    }
}
