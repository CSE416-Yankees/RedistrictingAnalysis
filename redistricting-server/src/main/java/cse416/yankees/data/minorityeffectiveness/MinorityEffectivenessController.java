package cse416.yankees.data.minorityeffectiveness;

import cse416.yankees.common.State;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/{state}/minority-effectiveness")
public class MinorityEffectivenessController {

    private final MinorityEffectivenessService service;

    public MinorityEffectivenessController(MinorityEffectivenessService service) {
        this.service = service;
    }

    @GetMapping
    public MinorityEffectiveness getMinorityEffectiveness(@PathVariable String state) {
        return service.get(State.valueOf(state.toUpperCase()));
    }
}
