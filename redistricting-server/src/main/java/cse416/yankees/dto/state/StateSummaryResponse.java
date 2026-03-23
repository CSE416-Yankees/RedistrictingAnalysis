package cse416.yankees.dto.state;

import java.util.List;

/**
 * Top-level DTO returned from the state summary endpoint.
 *
 * This object includes both the high-level state summary values and
 * the enacted-plan congressional representation table rendered in the
 * summary panel for a single state.
 */
public class StateSummaryResponse {

    /** Two-letter postal abbreviation for the state (e.g., MD, MS). */
    private String abbr;

    /** Full state name (e.g., "Maryland"). */
    private String name;

    /** Total state population (rounded to the nearest whole number). */
    private long population;

    /** Number of congressional districts in the enacted plan. */
    private int congressionalDistricts;

    /**
     * Average minority percentage across districts, expressed as a
     * whole-number percentage (for example 40.9 means 40.9%).
     */
    private double avgMinorityPct;

    /**
     * Average Democratic vote share across districts, expressed as a
     * whole-number percentage (for example 60.8 means 60.8%).
     */
    private double avgDemVotePct;

    /**
     * Number of opportunity districts as defined by the project
     * (for this prototype, districts with at least ~37% minority VAP).
     */
    private int opportunityDistricts;

    /**
     * Whether the state is subject to a preclearance-like requirement
     * for redistricting in the current legal context.
     */
    private boolean preclearance;

    /** Statewide partisan vote breakdown. */
    private StatewideVoteDto statewideVote;

    /** High-level demographic composition of the state. */
    private DemographicSummaryDto demographics;

    /** Short description of which party controls redistricting. */
    private String redistrictingControl;

    /** Summary of how many seats each party currently holds. */
    private RepresentationSummaryDto representativeSummary;

    /** Detailed enacted-plan congressional representation rows. */
    private List<CongressionalRepresentationRowDto> congressionalRepresentation;

    /**
     * Default constructor required for JSON libraries to create
     * instances when deserializing from static JSON files.
     */
    public StateSummaryResponse() {
    }

    public String getAbbr() {
        return abbr;
    }

    public void setAbbr(String abbr) {
        this.abbr = abbr;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public long getPopulation() {
        return population;
    }

    public void setPopulation(long population) {
        this.population = population;
    }

    public int getCongressionalDistricts() {
        return congressionalDistricts;
    }

    public void setCongressionalDistricts(int congressionalDistricts) {
        this.congressionalDistricts = congressionalDistricts;
    }

    public double getAvgMinorityPct() {
        return avgMinorityPct;
    }

    public void setAvgMinorityPct(double avgMinorityPct) {
        this.avgMinorityPct = avgMinorityPct;
    }

    public double getAvgDemVotePct() {
        return avgDemVotePct;
    }

    public void setAvgDemVotePct(double avgDemVotePct) {
        this.avgDemVotePct = avgDemVotePct;
    }

    public int getOpportunityDistricts() {
        return opportunityDistricts;
    }

    public void setOpportunityDistricts(int opportunityDistricts) {
        this.opportunityDistricts = opportunityDistricts;
    }

    public boolean isPreclearance() {
        return preclearance;
    }

    public void setPreclearance(boolean preclearance) {
        this.preclearance = preclearance;
    }

    public StatewideVoteDto getStatewideVote() {
        return statewideVote;
    }

    public void setStatewideVote(StatewideVoteDto statewideVote) {
        this.statewideVote = statewideVote;
    }

    public String getRedistrictingControl() {
        return redistrictingControl;
    }

    public void setRedistrictingControl(String redistrictingControl) {
        this.redistrictingControl = redistrictingControl;
    }

    public RepresentationSummaryDto getRepresentativeSummary() {
        return representativeSummary;
    }

    public void setRepresentativeSummary(RepresentationSummaryDto representativeSummary) {
        this.representativeSummary = representativeSummary;
    }

    public List<CongressionalRepresentationRowDto> getCongressionalRepresentation() {
        return congressionalRepresentation;
    }

    public void setCongressionalRepresentation(List<CongressionalRepresentationRowDto> congressionalRepresentation) {
        this.congressionalRepresentation = congressionalRepresentation;
    }
}
