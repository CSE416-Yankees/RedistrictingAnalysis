package cse416.yankees.data.summary;

import cse416.yankees.common.State;
import cse416.yankees.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class StateSummaryService {

    private final StateSummaryRepository repository;

    public StateSummaryService(StateSummaryRepository repository) {
        this.repository = repository;
    }

    public StateSummary get(State state) {
        return repository.findByState(state)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "StateSummary not found for state=" + state));
    }
}
