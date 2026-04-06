package cse416.yankees.data.ginglessummary;

import cse416.yankees.common.EnsembleType;
import cse416.yankees.common.State;
import cse416.yankees.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class GinglesSummaryService {

    private final GinglesSummaryRepository repository;

    public GinglesSummaryService(GinglesSummaryRepository repository) {
        this.repository = repository;
    }

    public GinglesSummary get(State state, EnsembleType ensembleType) {
        return repository.findByStateAndEnsembleType(state, ensembleType)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "GinglesSummary not found for state=" + state + " ensembleType=" + ensembleType));
    }
}
