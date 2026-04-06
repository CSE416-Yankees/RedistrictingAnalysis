package cse416.yankees.data.ensemblesplits;

import cse416.yankees.common.State;
import cse416.yankees.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class EnsembleSplitsService {

    private final EnsembleSplitsRepository repository;

    public EnsembleSplitsService(EnsembleSplitsRepository repository) {
        this.repository = repository;
    }

    public EnsembleSplits get(State state) {
        return repository.findByState(state)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "EnsembleSplits not found for state=" + state));
    }
}
