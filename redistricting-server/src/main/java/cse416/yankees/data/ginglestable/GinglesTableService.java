package cse416.yankees.data.ginglestable;

import cse416.yankees.common.State;
import cse416.yankees.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class GinglesTableService {

    private final GinglesTableRepository repository;

    public GinglesTableService(GinglesTableRepository repository) {
        this.repository = repository;
    }

    public GinglesTable get(State state) {
        return repository.findByState(state)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "GinglesTable not found for state=" + state));
    }
}
