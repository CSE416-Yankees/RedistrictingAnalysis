package cse416.yankees.data.summary;

import cse416.yankees.common.EnsembleType;
import cse416.yankees.common.State;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface StateSummaryRepository extends MongoRepository<StateSummary, String> {
    Optional<StateSummary> findByStateAndEnsembleType(State state, EnsembleType ensembleType);
}
