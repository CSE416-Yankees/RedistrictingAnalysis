package cse416.yankees.data.eikderesults;

import cse416.yankees.common.State;
import cse416.yankees.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class EIKDEResultsService {

    private final EIKDEResultsRepository repository;

    public EIKDEResultsService(EIKDEResultsRepository repository) {
        this.repository = repository;
    }

    public EIKDEResults get(State state) {
        return repository.findByState(state)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "EIKDEResults not found for state=" + state));
    }
}
