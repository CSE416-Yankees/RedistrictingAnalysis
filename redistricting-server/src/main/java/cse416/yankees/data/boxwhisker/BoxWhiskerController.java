package cse416.yankees.data.boxwhisker;

import cse416.yankees.common.EnsembleType;
import cse416.yankees.common.State;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/{state}/box-whisker")
public class BoxWhiskerController {

    private final BoxWhiskerService service;

    public BoxWhiskerController(BoxWhiskerService service) {
        this.service = service;
    }

    @GetMapping
    public BoxWhisker getBoxWhisker(
            @PathVariable String state,
            @RequestParam String ensembleType,
            @RequestParam String group) {
        return service.get(
                State.valueOf(state.toUpperCase()),
                EnsembleType.valueOf(ensembleType.toUpperCase()),
                group);
    }
}
