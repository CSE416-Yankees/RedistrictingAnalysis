package cse416.yankees.data.geodata;

import cse416.yankees.common.GeographyLevel;
import cse416.yankees.common.State;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface GeoDataRepository extends MongoRepository<GeoData, String> {
    Optional<GeoData> findByStateAndLevel(State state, GeographyLevel level);
}
