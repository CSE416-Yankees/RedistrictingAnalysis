package cse416.yankees.data.partyseatshare;

import cse416.yankees.common.EnsembleType;
import cse416.yankees.common.State;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/{state}/party-seat-share")
public class PartySeatShareController {

    private final PartySeatShareService service;

    public PartySeatShareController(PartySeatShareService service) {
        this.service = service;
    }

    @GetMapping
    public PartySeatShare getPartySeatShare(
            @PathVariable String state,
            @RequestParam String ensembleType) {
        return service.get(
                State.valueOf(state.toUpperCase()),
                EnsembleType.valueOf(ensembleType.toUpperCase()));
    }
}
