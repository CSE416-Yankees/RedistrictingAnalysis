package cse416.yankees.data.services;

import cse416.yankees.common.State;
import cse416.yankees.data.models.RepresentationTable;
import cse416.yankees.data.models.StateSummary;
import cse416.yankees.data.repositories.StateRepository;
import cse416.yankees.exception.ResourceNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class StateService {

    @Autowired
    private StateRepository stateRepository;

    // Return a 404-style error when MongoDB has no summary for the requested state.
    public StateSummary getStateSummary(State state) {
        StateSummary result = stateRepository.findStateSummary(state);
        if (result == null) throw new ResourceNotFoundException("StateSummary not found for state: " + state);
        return result;
    }

    public RepresentationTable getRepresentationTable(State state) {
        RepresentationTable result = stateRepository.findRepresentationTable(state);
        if (result == null) throw new ResourceNotFoundException("RepresentationTable not found for state: " + state);
        return result;
    }
}
