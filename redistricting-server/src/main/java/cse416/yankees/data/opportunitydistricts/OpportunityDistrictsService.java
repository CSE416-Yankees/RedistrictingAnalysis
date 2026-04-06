package cse416.yankees.data.opportunitydistricts;

import cse416.yankees.common.EnsembleType;
import cse416.yankees.common.State;
import cse416.yankees.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class OpportunityDistrictsService {

    private final OpportunityDistrictsRepository repository;

    public OpportunityDistrictsService(OpportunityDistrictsRepository repository) {
        this.repository = repository;
    }

    public OpportunityDistricts get(State state, EnsembleType ensembleType) {
        return repository.findByStateAndEnsembleType(state, ensembleType)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "OpportunityDistricts not found for state=" + state + " ensembleType=" + ensembleType));
    }
}
