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
}