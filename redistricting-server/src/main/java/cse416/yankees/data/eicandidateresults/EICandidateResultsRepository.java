package cse416.yankees.data.eicandidateresults;

import cse416.yankees.common.EnsembleType;
import cse416.yankees.common.State;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface EICandidateResultsRepository extends MongoRepository<EICandidateResults, String> {
    Optional<EICandidateResults> findByStateAndEnsembleType(State state, EnsembleType ensembleType);
}
