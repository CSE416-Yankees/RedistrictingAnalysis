package cse416.yankees.dto.state;

/**
 * DTO that summarizes how many seats each party holds in the
 * current congressional delegation for a given state.
 *
 * This information is displayed in the state summary panel and
 * is intentionally small and frontend-friendly.
 */
public class RepresentationSummaryDto {

    /** Number of Democratic representatives currently elected. */
    private int democrats;

    /** Number of Republican representatives currently elected. */
    private int republicans;

    /**
     * Default constructor needed by JSON libraries such as Jackson.
     */
    public RepresentationSummaryDto() {
    }

    /**
     * Convenience constructor for quickly building instances in code.
     */
    public RepresentationSummaryDto(int democrats, int republicans) {
        this.democrats = democrats;
        this.republicans = republicans;
    }

    public int getDemocrats() {
        return democrats;
    }

    public void setDemocrats(int democrats) {
        this.democrats = democrats;
    }

    public int getRepublicans() {
        return republicans;
    }

    public void setRepublicans(int republicans) {
        this.republicans = republicans;
    }
}

