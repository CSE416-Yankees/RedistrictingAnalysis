package cse416.yankees.data.eikderesults;

import cse416.yankees.common.State;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface EIKDEResultsRepository extends MongoRepository<EIKDEResults, String> {
    Optional<EIKDEResults> findByState(State state);
}
