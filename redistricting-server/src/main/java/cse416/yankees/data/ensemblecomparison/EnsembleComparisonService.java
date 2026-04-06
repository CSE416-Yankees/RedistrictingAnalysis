package cse416.yankees.data.ensemblecomparison;

import cse416.yankees.common.State;
import cse416.yankees.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class EnsembleComparisonService {

    private final EnsembleComparisonRepository repository;

    public EnsembleComparisonService(EnsembleComparisonRepository repository) {
        this.repository = repository;
    }

    public EnsembleComparison get(State state) {
        return repository.findByState(state)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "EnsembleComparison not found for state=" + state));
    }
}
