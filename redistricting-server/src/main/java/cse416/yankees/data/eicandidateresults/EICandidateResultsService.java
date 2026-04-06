package cse416.yankees.data.eicandidateresults;

import cse416.yankees.common.EnsembleType;
import cse416.yankees.common.State;
import cse416.yankees.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class EICandidateResultsService {

    private final EICandidateResultsRepository repository;

    public EICandidateResultsService(EICandidateResultsRepository repository) {
        this.repository = repository;
    }

    public EICandidateResults get(State state, EnsembleType ensembleType) {
        return repository.findByStateAndEnsembleType(state, ensembleType)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "EICandidateResults not found for state=" + state + " ensembleType=" + ensembleType));
    }
}
