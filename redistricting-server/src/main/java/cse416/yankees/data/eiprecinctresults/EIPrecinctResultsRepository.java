package cse416.yankees.data.eiprecinctresults;

import cse416.yankees.common.State;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface EIPrecinctResultsRepository extends MongoRepository<EIPrecinctResults, String> {
    Optional<EIPrecinctResults> findByState(State state);
}
