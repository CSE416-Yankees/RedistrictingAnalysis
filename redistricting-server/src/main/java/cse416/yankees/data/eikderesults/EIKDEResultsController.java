package cse416.yankees.data.eikderesults;

import cse416.yankees.common.State;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/{state}/ei/kde-results")
public class EIKDEResultsController {

    private final EIKDEResultsService service;

    public EIKDEResultsController(EIKDEResultsService service) {
        this.service = service;
    }

    @GetMapping
    public EIKDEResults getKDEResults(@PathVariable String state) {
        return service.get(State.valueOf(state.toUpperCase()));
    }
}
