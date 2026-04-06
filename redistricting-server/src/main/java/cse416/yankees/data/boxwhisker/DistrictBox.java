package cse416.yankees.data.boxwhisker;

public class DistrictBox {

    private int districtNumber;

    private double minPercent;
    private double q1Percent;
    private double medianPercent;
    private double q3Percent;
    private double maxPercent;

    private double enactedPercent;
    private double proposedPercent;

    public int getDistrictNumber() { return districtNumber; }

    public double getMinPercent() { return minPercent; }
    public double getQ1Percent() { return q1Percent; }
    public double getMedianPercent() { return medianPercent; }
    public double getQ3Percent() { return q3Percent; }
    public double getMaxPercent() { return maxPercent; }

    public double getEnactedPercent() { return enactedPercent; }
    public double getProposedPercent() { return proposedPercent; }

    public void setDistrictNumber(int districtNumber) { this.districtNumber = districtNumber; }
    public void setMinPercent(double minPercent) { this.minPercent = minPercent; }
    public void setQ1Percent(double q1Percent) { this.q1Percent = q1Percent; }
    public void setMedianPercent(double medianPercent) { this.medianPercent = medianPercent; }
    public void setQ3Percent(double q3Percent) { this.q3Percent = q3Percent; }
    public void setMaxPercent(double maxPercent) { this.maxPercent = maxPercent; }
    public void setEnactedPercent(double enactedPercent) { this.enactedPercent = enactedPercent; }
    public void setProposedPercent(double proposedPercent) { this.proposedPercent = proposedPercent; }
}