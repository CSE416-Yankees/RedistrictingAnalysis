package cse416.yankees.data.ensemblesplits;

import cse416.yankees.common.State;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/{state}/ensemble/splits")
public class EnsembleSplitsController {

    private final EnsembleSplitsService service;

    public EnsembleSplitsController(EnsembleSplitsService service) {
        this.service = service;
    }

    @GetMapping
    public EnsembleSplits getSplits(@PathVariable String state) {
        return service.get(State.valueOf(state.toUpperCase()));
    }
}
