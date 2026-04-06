package cse416.yankees.data.partyseatshare;

import cse416.yankees.common.EnsembleType;
import cse416.yankees.common.State;
import cse416.yankees.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class PartySeatShareService {

    private final PartySeatShareRepository repository;

    public PartySeatShareService(PartySeatShareRepository repository) {
        this.repository = repository;
    }

    public PartySeatShare get(State state, EnsembleType ensembleType) {
        return repository.findByStateAndEnsembleType(state, ensembleType)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "PartySeatShare not found for state=" + state + " ensembleType=" + ensembleType));
    }
}
