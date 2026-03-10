package cse416.yankees.controller;

import cse416.yankees.dto.state.StateSummaryResponse;
import cse416.yankees.service.StateSummaryService;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * REST controller that exposes state-related endpoints under
 * the {@code /api/states} URI namespace.
 *
 * For now we only implement the summary endpoint, but this
 * controller is intentionally structured so i can later add
 * additional endpoints such as representation, districts, and
 * analysis results.
 */
@RestController
@RequestMapping(path = "/api/states")
public class StateController {

    private final StateSummaryService stateSummaryService;

    public StateController(StateSummaryService stateSummaryService) {
        this.stateSummaryService = stateSummaryService;
    }

    /**
     * Return the high-level summary information for a single state.
     *
     * Example URL that the React frontend can call:
     * {@code GET /api/states/MD/summary}
     *
     * @param abbr two-letter state abbreviation from the route param
     * @return HTTP 200 with {@link StateSummaryResponse} as JSON,
     *         or an error JSON body if the state cannot be found
     */
    @GetMapping(
            path = "/{abbr}/summary",
            produces = MediaType.APPLICATION_JSON_VALUE
    )
    public ResponseEntity<StateSummaryResponse> getStateSummary(@PathVariable("abbr") String abbr) {
        StateSummaryResponse summary = stateSummaryService.getStateSummary(abbr);
        return ResponseEntity.ok(summary);
    }
}

