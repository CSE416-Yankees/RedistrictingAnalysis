package cse416.yankees.data.map;

import cse416.yankees.common.GeographyLevel;
import cse416.yankees.common.State;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface MapDataRepository extends MongoRepository<MapData, String> {
    Optional<MapData> findByStateAndLevel(State state, GeographyLevel level);
}
