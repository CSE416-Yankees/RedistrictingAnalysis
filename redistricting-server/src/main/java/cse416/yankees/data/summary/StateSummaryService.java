package cse416.yankees.data.summary;

import cse416.yankees.common.EnsembleType;
import cse416.yankees.common.State;
import cse416.yankees.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class StateSummaryService {

    private final StateSummaryRepository repository;

    public StateSummaryService(StateSummaryRepository repository) {
        this.repository = repository;
    }

    public StateSummary get(State state, EnsembleType ensembleType) {
        return repository.findByStateAndEnsembleType(state, ensembleType)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "StateSummary not found for state=" + state + " ensembleType=" + ensembleType));
    }
}
