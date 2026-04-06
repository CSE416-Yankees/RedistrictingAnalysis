package cse416.yankees.data.ginglessummary;

import cse416.yankees.common.EnsembleType;
import cse416.yankees.common.State;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface GinglesSummaryRepository extends MongoRepository<GinglesSummary, String> {
    Optional<GinglesSummary> findByStateAndEnsembleType(State state, EnsembleType ensembleType);
}
