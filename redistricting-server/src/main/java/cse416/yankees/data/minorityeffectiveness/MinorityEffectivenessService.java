package cse416.yankees.data.minorityeffectiveness;

import cse416.yankees.common.State;
import cse416.yankees.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class MinorityEffectivenessService {

    private final MinorityEffectivenessRepository repository;

    public MinorityEffectivenessService(MinorityEffectivenessRepository repository) {
        this.repository = repository;
    }

    public MinorityEffectiveness get(State state) {
        return repository.findByState(state)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "MinorityEffectiveness not found for state=" + state));
    }
}
