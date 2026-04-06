package cse416.yankees.data.ensemblecomparison;

import cse416.yankees.common.State;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface EnsembleComparisonRepository extends MongoRepository<EnsembleComparison, String> {
    Optional<EnsembleComparison> findByState(State state);
}
