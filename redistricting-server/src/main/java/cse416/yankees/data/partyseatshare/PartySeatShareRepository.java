package cse416.yankees.data.partyseatshare;

import cse416.yankees.common.EnsembleType;
import cse416.yankees.common.State;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface PartySeatShareRepository extends MongoRepository<PartySeatShare, String> {
    Optional<PartySeatShare> findByStateAndEnsembleType(State state, EnsembleType ensembleType);
}
