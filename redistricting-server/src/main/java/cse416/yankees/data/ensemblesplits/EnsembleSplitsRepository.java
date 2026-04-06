package cse416.yankees.data.ensemblesplits;

import cse416.yankees.common.State;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface EnsembleSplitsRepository extends MongoRepository<EnsembleSplits, String> {
    Optional<EnsembleSplits> findByState(State state);
}
