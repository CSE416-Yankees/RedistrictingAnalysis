package cse416.yankees.data.voteshareseatshare;

import cse416.yankees.common.EnsembleType;
import cse416.yankees.common.State;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/{state}/vote-share-seat-share")
public class VoteShareSeatShareController {

    private final VoteShareSeatShareService service;

    public VoteShareSeatShareController(VoteShareSeatShareService service) {
        this.service = service;
    }

    @GetMapping
    public VoteShareSeatShare getVoteShareSeatShare(
            @PathVariable String state,
            @RequestParam String ensembleType) {
        return service.get(
                State.valueOf(state.toUpperCase()),
                EnsembleType.valueOf(ensembleType.toUpperCase()));
    }
}
