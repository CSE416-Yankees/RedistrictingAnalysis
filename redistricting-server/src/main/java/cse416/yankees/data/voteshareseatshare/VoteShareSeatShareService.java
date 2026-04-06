package cse416.yankees.data.voteshareseatshare;

import cse416.yankees.common.EnsembleType;
import cse416.yankees.common.State;
import cse416.yankees.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class VoteShareSeatShareService {

    private final VoteShareSeatShareRepository repository;

    public VoteShareSeatShareService(VoteShareSeatShareRepository repository) {
        this.repository = repository;
    }

    public VoteShareSeatShare get(State state, EnsembleType ensembleType) {
        return repository.findByStateAndEnsembleType(state, ensembleType)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "VoteShareSeatShare not found for state=" + state + " ensembleType=" + ensembleType));
    }
}
