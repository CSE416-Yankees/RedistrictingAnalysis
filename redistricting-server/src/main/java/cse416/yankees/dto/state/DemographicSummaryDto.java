package cse416.yankees.dto.state;

/**
 * DTO that summarizes high-level demographic information for a state.
 *
 * All demographic fields are expressed as proportions between 0.0 and 1.0.
 */
public class DemographicSummaryDto {

    private double blackPct;
    private double hispanicPct;
    private double asianPct;
    private double whitePct;
    private double otherPct;

    public DemographicSummaryDto() {
        // Default constructor required for JSON deserialization.
    }

    public DemographicSummaryDto(
            double blackPct,
            double hispanicPct,
            double asianPct,
            double whitePct,
            double otherPct
    ) {
        this.blackPct = blackPct;
        this.hispanicPct = hispanicPct;
        this.asianPct = asianPct;
        this.whitePct = whitePct;
        this.otherPct = otherPct;
    }

    public double getBlackPct() {
        return blackPct;
    }

    public void setBlackPct(double blackPct) {
        this.blackPct = blackPct;
    }

    public double getHispanicPct() {
        return hispanicPct;
    }

    public void setHispanicPct(double hispanicPct) {
        this.hispanicPct = hispanicPct;
    }

    public double getAsianPct() {
        return asianPct;
    }

    public void setAsianPct(double asianPct) {
        this.asianPct = asianPct;
    }

    public double getWhitePct() {
        return whitePct;
    }

    public void setWhitePct(double whitePct) {
        this.whitePct = whitePct;
    }

    public double getOtherPct() {
        return otherPct;
    }

    public void setOtherPct(double otherPct) {
        this.otherPct = otherPct;
    }
}

