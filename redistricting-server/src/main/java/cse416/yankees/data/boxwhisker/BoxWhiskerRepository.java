package cse416.yankees.data.boxwhisker;

import cse416.yankees.common.EnsembleType;
import cse416.yankees.common.State;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface BoxWhiskerRepository extends MongoRepository<BoxWhisker, String> {
    Optional<BoxWhisker> findByStateAndEnsembleTypeAndGroup(State state, EnsembleType ensembleType, String group);
}
