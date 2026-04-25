package cse416.yankees.data.districtplan;

public class DistrictSummary {
    private double demVotePct;
    private double repVotePct;
    private double minorityPct;

    public DistrictSummary() {}

    public double getDemVotePct() { return demVotePct; }
    public double getRepVotePct() { return repVotePct; }
    public double getMinorityPct() { return minorityPct; }

    public void setDemVotePct(double demVotePct) { this.demVotePct = demVotePct; }
    public void setRepVotePct(double repVotePct) { this.repVotePct = repVotePct; }
    public void setMinorityPct(double minorityPct) { this.minorityPct = minorityPct; }
}
