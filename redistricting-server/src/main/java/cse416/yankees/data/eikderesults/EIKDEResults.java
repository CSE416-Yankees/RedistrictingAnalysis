package cse416.yankees.data.eikderesults;

import java.util.Map;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import cse416.yankees.common.*;

@Document(collection = "ei_kde_results")
public class EIKDEResults {
    @Id
    private String id;

    private State state;

    private Map<Integer, Double> districtKDEScores; // mapping of district number to KDE score

    public EIKDEResults() {}

    // getters/setters

    public State getState() { return state; }
    public Map<Integer, Double> getDistrictKDEScores() { return districtKDEScores; }

    public void setState(State state) { this.state = state; }
    public void setDistrictKDEScores(Map<Integer, Double> districtKDEScores) { this.districtKDEScores = districtKDEScores; }
}
