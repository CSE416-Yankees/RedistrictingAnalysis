package cse416.yankees.data.geodata;

import cse416.yankees.common.GeographyLevel;
import cse416.yankees.common.State;
import cse416.yankees.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class GeoDataService {

    private final GeoDataRepository repository;

    public GeoDataService(GeoDataRepository repository) {
        this.repository = repository;
    }

    public GeoData get(State state, GeographyLevel level) {
        return repository.findByStateAndLevel(state, level)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "GeoData not found for state=" + state + " level=" + level));
    }
}
