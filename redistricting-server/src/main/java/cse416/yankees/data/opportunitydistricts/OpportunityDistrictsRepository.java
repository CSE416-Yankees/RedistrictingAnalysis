package cse416.yankees.data.opportunitydistricts;

import cse416.yankees.common.EnsembleType;
import cse416.yankees.common.State;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface OpportunityDistrictsRepository extends MongoRepository<OpportunityDistricts, String> {
    Optional<OpportunityDistricts> findByStateAndEnsembleType(State state, EnsembleType ensembleType);
}
