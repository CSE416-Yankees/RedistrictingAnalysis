package cse416.yankees.data.map;

import cse416.yankees.common.State;
import cse416.yankees.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class DemographicHeatMapService {

    private final DemographicHeatMapRepository repository;

    public DemographicHeatMapService(DemographicHeatMapRepository repository) {
        this.repository = repository;
    }

    public DemographicHeatMap get(State state, String group) {
        return repository.findByStateAndGroup(state, group)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "DemographicHeatMap not found for state=" + state + " group=" + group));
    }
}
