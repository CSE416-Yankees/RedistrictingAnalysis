package cse416.yankees.data.ginglestable;

public class TableRow {
    private int district;
    private int minorityPercentage; // 0-100
    private double cohesion; // 0-1, higher is more cohesive
    private double blocVoting; // 0-1, higher is more bloc voting
    private double compactness; // 0-1, higher is more compact
    private boolean thresholdMet;

    public TableRow(int district, int minorityPercentage, double cohesion, double blocVoting, double compactness, boolean thresholdMet) {
        this.district = district;
        this.minorityPercentage = minorityPercentage;
        this.cohesion = cohesion;
        this.blocVoting = blocVoting;
        this.compactness = compactness;
        this.thresholdMet = thresholdMet;
    }

    // getters/setters

    public int getDistrict() { return district; }
    public int getMinorityPercentage() { return minorityPercentage; }
    public double getCohesion() { return cohesion; }
    public double getBlocVoting() { return blocVoting; }
    public double getCompactness() { return compactness; }
    public boolean isThresholdMet() { return thresholdMet; }
}