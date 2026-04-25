package cse416.yankees.data.map;

import cse416.yankees.common.State;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface DemographicHeatMapRepository extends MongoRepository<DemographicHeatMap, String> {
    Optional<DemographicHeatMap> findByStateAndGroup(State state, String group);
}
