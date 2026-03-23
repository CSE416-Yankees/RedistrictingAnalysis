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
}