package cse416.yankees.data.controllers;

import cse416.yankees.common.State;
import cse416.yankees.data.models.RepresentationTable;
import cse416.yankees.data.models.StateSummary;
import cse416.yankees.data.services.StateService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/{state}")
public class StateController {

    @Autowired
    private StateService stateService;

    @GetMapping("/summary")
    public StateSummary getStateSummary(@PathVariable String state) {
        return stateService.getStateSummary(State.valueOf(state.toUpperCase()));
    }

    @GetMapping("/representation")
    public RepresentationTable getCongressionalRepresentation(@PathVariable String state) {
        return stateService.getRepresentationTable(State.valueOf(state.toUpperCase()));
    }
}
