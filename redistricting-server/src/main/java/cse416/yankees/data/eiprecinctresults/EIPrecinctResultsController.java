package cse416.yankees.data.eiprecinctresults;

import cse416.yankees.common.State;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/{state}/ei/precinct-results")
public class EIPrecinctResultsController {

    private final EIPrecinctResultsService service;

    public EIPrecinctResultsController(EIPrecinctResultsService service) {
        this.service = service;
    }

    @GetMapping
    public EIPrecinctResults getPrecinctResults(@PathVariable String state) {
        return service.get(State.valueOf(state.toUpperCase()));
    }
}
