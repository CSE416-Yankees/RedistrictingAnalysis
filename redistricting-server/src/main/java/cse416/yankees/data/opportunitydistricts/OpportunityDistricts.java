package cse416.yankees.data.opportunitydistricts;

import java.util.Map;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import cse416.yankees.common.*;

@Document(collection = "opportunity_districts")
public class OpportunityDistricts {
    @Id
    private String id;

    private State state;
    private EnsembleType ensembleType;

    private Map<Integer, Integer> opportunityDistrictsToPlans; // Map of number of opportunity districts to number of plans with that many opportunity districts

    public OpportunityDistricts() {}

    // getters/setters

    public State getState() { return state; }
    public EnsembleType getEnsembleType() { return ensembleType; }
    public Map<Integer, Integer> getOpportunityDistrictsToPlans() { return opportunityDistrictsToPlans; }

    public void setState(State state) { this.state = state; }
    public void setEnsembleType(EnsembleType ensembleType) { this.ensembleType = ensembleType; }
    public void setOpportunityDistrictsToPlans(Map<Integer, Integer> opportunityDistrictsToPlans) { this.opportunityDistrictsToPlans = opportunityDistrictsToPlans; }
}
