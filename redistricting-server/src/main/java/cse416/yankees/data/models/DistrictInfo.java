package cse416.yankees.data.models;

import java.util.List;

public class DistrictInfo {
    private int districtNumber;
    private List<String> precinctIds;
    private double demVotePct;
    private double repVotePct;
    private double minorityPct;

    public int getDistrictNumber() { return districtNumber; }
    public void setDistrictNumber(int districtNumber) { this.districtNumber = districtNumber; }

    public List<String> getPrecinctIds() { return precinctIds; }
    public void setPrecinctIds(List<String> precinctIds) { this.precinctIds = precinctIds; }

    public double getDemVotePct() { return demVotePct; }
    public void setDemVotePct(double demVotePct) { this.demVotePct = demVotePct; }

    public double getRepVotePct() { return repVotePct; }
    public void setRepVotePct(double repVotePct) { this.repVotePct = repVotePct; }

    public double getMinorityPct() { return minorityPct; }
    public void setMinorityPct(double minorityPct) { this.minorityPct = minorityPct; }
}
