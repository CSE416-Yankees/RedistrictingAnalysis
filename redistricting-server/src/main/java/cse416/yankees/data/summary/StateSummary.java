package cse416.yankees.data.summary;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;
import java.util.Map;
import cse416.yankees.common.*;

@Document(collection = "state_summaries")
public class StateSummary {

    @Id
    private String id;

    private State state; // "MD", "MS"
    private EnsembleType ensembleType; // "RB", "VRA"

    // Basic stats
    private int population;
    private int numCongressionalDistricts;
    private double avgMinorityPercent;
    private double avgDemVotePercent;

    private int opportunityDistricts;
    private boolean preclearance;

    private Map<String, Integer> representativesByParty;
    private String redistrictingPartyControl;
    private int demVoterDistribution; // 0-100
    private int repVoterDistribution; // 0-100: should be 100 - demVoterDistribution
    
    private List<Representative> representatives;

    public StateSummary() {}

    // getters/setters

    public State getState() { return state; }
    public EnsembleType getEnsembleType() { return ensembleType; }
    public int getPopulation() { return population; }
    public int getNumCongressionalDistricts() { return numCongressionalDistricts; }
    public double getAvgMinorityPercent() { return avgMinorityPercent; }
    public double getAvgDemVotePercent() { return avgDemVotePercent; }
    public int getOpportunityDistricts() { return opportunityDistricts; }
    public boolean isPreclearance() { return preclearance; }
    public Map<String, Integer> getRepresentativesByParty() { return representativesByParty; }
    public String getRedistrictingPartyControl() { return redistrictingPartyControl; }
    public int getDemVoterDistribution() { return demVoterDistribution; }
    public int getRepVoterDistribution() { return repVoterDistribution; }
    public List<Representative> getRepresentatives() { return representatives; }

    public void setState(State state) { this.state = state; }
    public void setEnsembleType(EnsembleType ensembleType) { this.ensembleType = ensembleType; }
    public void setPopulation(int population) { this.population = population; }
    public void setNumCongressionalDistricts(int numCongressionalDistricts) { this.numCongressionalDistricts = numCongressionalDistricts; }
    public void setAvgMinorityPercent(double avgMinorityPercent) { this.avgMinorityPercent = avgMinorityPercent; }
    public void setAvgDemVotePercent(double avgDemVotePercent) { this.avgDemVotePercent = avgDemVotePercent; }
    public void setOpportunityDistricts(int opportunityDistricts) { this.opportunityDistricts = opportunityDistricts; }
    public void setPreclearance(boolean preclearance) { this.preclearance = preclearance; }
    public void setRepresentativesByParty(Map<String, Integer> representativesByParty) { this.representativesByParty = representativesByParty; }
    public void setRedistrictingPartyControl(String redistrictingPartyControl) { this.redistrictingPartyControl = redistrictingPartyControl; }
    public void setDemVoterDistribution(int demVoterDistribution) { this.demVoterDistribution = demVoterDistribution; }
    public void setRepVoterDistribution(int repVoterDistribution) { this.repVoterDistribution = repVoterDistribution; }
    public void setRepresentatives(List<Representative> representatives) { this.representatives = representatives; }
}