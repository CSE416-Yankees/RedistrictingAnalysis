package cse416.yankees.data.eicandidateresults;

public class GraphPoint {
    private int supportPercent;
    private double asianDensity;
    private double blackDensity;
    private double hispanicDensity;

    public GraphPoint(int supportPercent, double asianDensity, double blackDensity, double hispanicDensity) {
        this.supportPercent = supportPercent;
        this.asianDensity = asianDensity;
        this.blackDensity = blackDensity;
        this.hispanicDensity = hispanicDensity;
    }

    public int getSupportPercent() { return supportPercent; }
    public double getAsianDensity() { return asianDensity; }
    public double getBlackDensity() { return blackDensity; }
    public double getHispanicDensity() { return hispanicDensity; }
}