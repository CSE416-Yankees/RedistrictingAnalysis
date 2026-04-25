package cse416.yankees.data.ginglessummary;

import java.util.List;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import cse416.yankees.common.EnsembleType;
import cse416.yankees.common.State;

@Document(collection = "gingles_summaries")
public class GinglesSummary {
    @Id
    private String id;

    private State state;
    private EnsembleType ensembleType;

    private List<GinglesDataPoint> dataPoints; // List of data points for each group/district/precinct

    private int numMajorityMinorityDistricts;
    private double cohesion; // 0-1, higher is more cohesive
    private double blocVoting; // 0-1, higher is more bloc voting
    private double compactness; // 0-1, higher is more compact
    private boolean vraIssueFlagged;

    public GinglesSummary() {}

    // getters/setters

    public State getState() { return state; }
    public EnsembleType getEnsembleType() { return ensembleType; }
    public List<GinglesDataPoint> getDataPoints() { return dataPoints; }
    public int getNumMajorityMinorityDistricts() { return numMajorityMinorityDistricts; }
    public double getCohesion() { return cohesion; }
    public double getBlocVoting() { return blocVoting; }
    public double getCompactness() { return compactness; }
    public boolean isVraIssueFlagged() { return vraIssueFlagged; }

    public void setState(State state) { this.state = state; }
    public void setEnsembleType(EnsembleType ensembleType) { this.ensembleType = ensembleType; }
    public void setDataPoints(List<GinglesDataPoint> dataPoints) { this.dataPoints = dataPoints; }
    public void setNumMajorityMinorityDistricts(int numMajorityMinorityDistricts) { this.numMajorityMinorityDistricts = numMajorityMinorityDistricts; }
    public void setCohesion(double cohesion) { this.cohesion = cohesion; }
    public void setBlocVoting(double blocVoting) { this.blocVoting = blocVoting; }
    public void setCompactness(double compactness) { this.compactness = compactness; }
    public void setVraIssueFlagged(boolean vraIssueFlagged) { this.vraIssueFlagged = vraIssueFlagged; }
}