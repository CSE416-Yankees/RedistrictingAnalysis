package cse416.yankees.data.ginglessummary;

public class GinglesDataPoint {
    private String group; // "Black", "Hispanic", "Asian"
    private int district;
    private int precinct;
    private double minorityPercentage;
    private double republicanVotePercentage;
    private double democraticVotePercentage;

    public GinglesDataPoint(String group, int district, int precinct, double minorityPercentage,
            double republicanVotePercentage, double democraticVotePercentage) {
        this.group = group;
        this.district = district;
        this.precinct = precinct;
        this.minorityPercentage = minorityPercentage;
        this.republicanVotePercentage = republicanVotePercentage;
        this.democraticVotePercentage = democraticVotePercentage;
    }

    public String getGroup() { return group; }
    public int getDistrict() { return district; }
    public int getPrecinct() { return precinct; }
    public double getMinorityPercentage() { return minorityPercentage; }
    public double getRepublicanVotePercentage() { return republicanVotePercentage; }
    public double getDemocraticVotePercentage() { return democraticVotePercentage; }
}
