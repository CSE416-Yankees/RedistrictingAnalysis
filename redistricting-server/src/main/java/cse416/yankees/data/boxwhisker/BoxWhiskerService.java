package cse416.yankees.data.boxwhisker;

import cse416.yankees.common.EnsembleType;
import cse416.yankees.common.State;
import cse416.yankees.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class BoxWhiskerService {

    private final BoxWhiskerRepository repository;

    public BoxWhiskerService(BoxWhiskerRepository repository) {
        this.repository = repository;
    }

    public BoxWhisker get(State state, EnsembleType ensembleType, String group) {
        return repository.findByStateAndEnsembleTypeAndGroup(state, ensembleType, group)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "BoxWhisker not found for state=" + state + " ensembleType=" + ensembleType + " group=" + group));
    }
}
