package cse416.yankees.data.map;

import cse416.yankees.common.GeographyLevel;
import cse416.yankees.common.State;
import cse416.yankees.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class MapDataService {

    private final MapDataRepository repository;

    public MapDataService(MapDataRepository repository) {
        this.repository = repository;
    }

    public MapData get(State state, GeographyLevel level) {
        return repository.findByStateAndLevel(state, level)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "MapData not found for state=" + state + " level=" + level));
    }
}
