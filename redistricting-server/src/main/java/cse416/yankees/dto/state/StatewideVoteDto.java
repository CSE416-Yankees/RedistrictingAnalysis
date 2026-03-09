package cse416.yankees.dto.state;

/**
 * DTO that represents the statewide partisan vote breakdown
 * used in the state summary panel.
 */
public class StatewideVoteDto {

    /** Proportion of votes for Democratic candidates (0.0 - 1.0). */
    private double democraticPct;

    /** Proportion of votes for Republican candidates (0.0 - 1.0). */
    private double republicanPct;

    public StatewideVoteDto() {
        // Default constructor required for JSON deserialization.
    }

    public StatewideVoteDto(double democraticPct, double republicanPct) {
        this.democraticPct = democraticPct;
        this.republicanPct = republicanPct;
    }

    public double getDemocraticPct() {
        return democraticPct;
    }

    public void setDemocraticPct(double democraticPct) {
        this.democraticPct = democraticPct;
    }

    public double getRepublicanPct() {
        return republicanPct;
    }

    public void setRepublicanPct(double republicanPct) {
        this.republicanPct = republicanPct;
    }
}

