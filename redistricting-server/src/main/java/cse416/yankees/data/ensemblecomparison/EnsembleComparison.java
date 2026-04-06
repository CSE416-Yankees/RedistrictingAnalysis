package cse416.yankees.data.ensemblecomparison;

import java.util.Map;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import cse416.yankees.common.*;

@Document(collection = "ensemble_comparison")
public class EnsembleComparison {
    @Id
    private String id;

    private State state;

    private Map<Integer, OpportunityDistrictData> opportunityDistrictData; // Map of district number to opportunity district data
    private double rbAvgOpportunityDistricts; // Average number of opportunity districts across the ensemble
    private double vraAvgOpportunityDistricts; // Average number of opportunity districts across the ensemble
    private int totalPlansEach; // Total number of plans in each ensemble

    public EnsembleComparison() {}

    // getters/setters

    public State getState() { return state; }
    public Map<Integer, OpportunityDistrictData> getOpportunityDistrictData() { return opportunityDistrictData; }
    public double getRbAvgOpportunityDistricts() { return rbAvgOpportunityDistricts; }
    public double getVraAvgOpportunityDistricts() { return vraAvgOpportunityDistricts; }
    public int getTotalPlansEach() { return totalPlansEach; }

    public void setState(State state) { this.state = state; }
    public void setOpportunityDistrictData(Map<Integer, OpportunityDistrictData> opportunityDistrictData) { this.opportunityDistrictData = opportunityDistrictData; }
    public void setRbAvgOpportunityDistricts(double rbAvgOpportunityDistricts) { this.rbAvgOpportunityDistricts = rbAvgOpportunityDistricts; }
    public void setVraAvgOpportunityDistricts(double vraAvgOpportunityDistricts) { this.vraAvgOpportunityDistricts = vraAvgOpportunityDistricts; }
    public void setTotalPlansEach(int totalPlansEach) { this.totalPlansEach = totalPlansEach; }
}
