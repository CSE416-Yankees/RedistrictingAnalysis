package cse416.yankees.data.eicandidateresults;

import cse416.yankees.common.EnsembleType;
import cse416.yankees.common.State;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/{state}/ei/candidate-results")
public class EICandidateResultsController {

    private final EICandidateResultsService service;

    public EICandidateResultsController(EICandidateResultsService service) {
        this.service = service;
    }

    @GetMapping
    public EICandidateResults getCandidateResults(
            @PathVariable String state,
            @RequestParam String ensembleType) {
        return service.get(
                State.valueOf(state.toUpperCase()),
                EnsembleType.valueOf(ensembleType.toUpperCase()));
    }
}
