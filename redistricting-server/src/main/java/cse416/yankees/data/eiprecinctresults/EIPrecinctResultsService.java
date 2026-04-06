package cse416.yankees.data.eiprecinctresults;

import cse416.yankees.common.State;
import cse416.yankees.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class EIPrecinctResultsService {

    private final EIPrecinctResultsRepository repository;

    public EIPrecinctResultsService(EIPrecinctResultsRepository repository) {
        this.repository = repository;
    }

    public EIPrecinctResults get(State state) {
        return repository.findByState(state)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "EIPrecinctResults not found for state=" + state));
    }
}
