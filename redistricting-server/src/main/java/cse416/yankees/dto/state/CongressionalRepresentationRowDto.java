package cse416.yankees.dto.state;

/**
 * Detailed enacted-plan congressional representation row displayed in
 * the state summary panel.
 */
public class CongressionalRepresentationRowDto {

    private String district;
    private int districtNumber;
    private String representative;
    private String party;
    private String representativeRaceEthnicity;
    private double voteMarginPct;
    private double demVotePct;
    private double repVotePct;

    public CongressionalRepresentationRowDto() {
    }

    public String getDistrict() {
        return district;
    }

    public void setDistrict(String district) {
        this.district = district;
    }

    public int getDistrictNumber() {
        return districtNumber;
    }

    public void setDistrictNumber(int districtNumber) {
        this.districtNumber = districtNumber;
    }

    public String getRepresentative() {
        return representative;
    }

    public void setRepresentative(String representative) {
        this.representative = representative;
    }

    public String getParty() {
        return party;
    }

    public void setParty(String party) {
        this.party = party;
    }

    public String getRepresentativeRaceEthnicity() {
        return representativeRaceEthnicity;
    }

    public void setRepresentativeRaceEthnicity(String representativeRaceEthnicity) {
        this.representativeRaceEthnicity = representativeRaceEthnicity;
    }

    public double getVoteMarginPct() {
        return voteMarginPct;
    }

    public void setVoteMarginPct(double voteMarginPct) {
        this.voteMarginPct = voteMarginPct;
    }

    public double getDemVotePct() {
        return demVotePct;
    }

    public void setDemVotePct(double demVotePct) {
        this.demVotePct = demVotePct;
    }

    public double getRepVotePct() {
        return repVotePct;
    }

    public void setRepVotePct(double repVotePct) {
        this.repVotePct = repVotePct;
    }
}
