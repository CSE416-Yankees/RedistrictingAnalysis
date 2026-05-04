package cse416.yankees.data.models;

import cse416.yankees.common.State;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Map;

@Document("ei_candidate_results")
public class EICandidateResults {
    @Id
    private String id;
    private State state;
    private Map<String, CandidateData> candidateResults;

    public String getId() { return id; }

    public State getState() { return state; }
    public void setState(State state) { this.state = state; }

    public Map<String, CandidateData> getCandidateResults() { return candidateResults; }
    public void setCandidateResults(Map<String, CandidateData> candidateResults) { this.candidateResults = candidateResults; }
}
