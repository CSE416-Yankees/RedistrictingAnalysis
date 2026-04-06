package cse416.yankees.data.ginglestable;

import cse416.yankees.common.State;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/{state}/gingles/table")
public class GinglesTableController {

    private final GinglesTableService service;

    public GinglesTableController(GinglesTableService service) {
        this.service = service;
    }

    @GetMapping
    public GinglesTable getGinglesTable(@PathVariable String state) {
        return service.get(State.valueOf(state.toUpperCase()));
    }
}
