package cse416.yankees.data.eicandidateresults;

import java.util.List;
import java.util.Map;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import cse416.yankees.common.*;

@Document(collection = "ei_candidate_results")
public class EICandidateResults {
    @Id
    private String id;

    private State state;
    private EnsembleType ensembleType;

    // String is either "DEM", "REP", "IND"
    private Map<String, List<GraphPoint>> graphPoints; // Map of candidate to list of graph points

    private List<TableRow> tableRows;

    public EICandidateResults() {}

    // getters/setters

    public State getState() { return state; }
    public EnsembleType getEnsembleType() { return ensembleType; }
    public Map<String, List<GraphPoint>> getGraphPoints() { return graphPoints; }
    public List<TableRow> getTableRows() { return tableRows; }
}