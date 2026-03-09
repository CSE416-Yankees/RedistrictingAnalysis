package cse416.yankees.dto.state;

/**
 * Top-level DTO returned from the state summary endpoint.
 *
 * This object is deliberately small and focused on the data the
 * React frontend needs to render the high-level summary panel for
 * a single state.
 */
public class StateSummaryResponse {

    /** Two-letter postal abbreviation for the state (e.g., MD, MS). */
    private String abbr;

    /** Full state name (e.g., "Maryland"). */
    private String name;

    /** Total state population (rounded to the nearest whole number). */
    private long population;

    /** Statewide partisan vote breakdown. */
    private StatewideVoteDto statewideVote;

    /** High-level demographic composition of the state. */
    private DemographicSummaryDto demographics;

    /** Short description of which party controls redistricting. */
    private String redistrictingControl;

    /** Summary of how many seats each party currently holds. */
    private RepresentationSummaryDto representativeSummary;

    /** High-level overview of the ensembles used for analysis. */
    private EnsembleSummaryDto ensembleSummary;

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

    public StatewideVoteDto getStatewideVote() {
        return statewideVote;
    }

    public void setStatewideVote(StatewideVoteDto statewideVote) {
        this.statewideVote = statewideVote;
    }

    public DemographicSummaryDto getDemographics() {
        return demographics;
    }

    public void setDemographics(DemographicSummaryDto demographics) {
        this.demographics = demographics;
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

    public EnsembleSummaryDto getEnsembleSummary() {
        return ensembleSummary;
    }

    public void setEnsembleSummary(EnsembleSummaryDto ensembleSummary) {
        this.ensembleSummary = ensembleSummary;
    }
}

