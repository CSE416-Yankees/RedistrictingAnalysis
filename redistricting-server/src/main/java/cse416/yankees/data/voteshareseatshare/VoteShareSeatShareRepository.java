package cse416.yankees.data.voteshareseatshare;

import cse416.yankees.common.EnsembleType;
import cse416.yankees.common.State;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface VoteShareSeatShareRepository extends MongoRepository<VoteShareSeatShare, String> {
    Optional<VoteShareSeatShare> findByStateAndEnsembleType(State state, EnsembleType ensembleType);
}
