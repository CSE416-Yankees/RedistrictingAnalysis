package cse416.yankees.data.eiprecinctresults;

import java.util.Map;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import cse416.yankees.common.*;

@Document(collection = "ei_precinct_results")
public class EIPrecinctResults {
    @Id
    private String id;

    private State state;

    private Map<Integer, PrecinctData> precinctData; // Map of precinct number to data for that precinct

    public EIPrecinctResults() {}

    // getters/setters

    public State getState() { return state; }
    public Map<Integer, PrecinctData> getPrecinctData() { return precinctData; }
}
