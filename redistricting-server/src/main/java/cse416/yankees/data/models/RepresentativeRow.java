package cse416.yankees.data.models;

import cse416.yankees.common.Group;
import cse416.yankees.common.Party;

public class RepresentativeRow {
    private int districtNumber;
    private String representative;
    private Party party;
    private Group representativeGroup;
    private double voteMarginPct;
    private double effectivenessScore;
    private double calibratedEffectivenessScore;

    public int getDistrictNumber() { return districtNumber; }
    public void setDistrictNumber(int districtNumber) { this.districtNumber = districtNumber; }

    public String getRepresentative() { return representative; }
    public void setRepresentative(String representative) { this.representative = representative; }

    public Party getParty() { return party; }
    public void setParty(Party party) { this.party = party; }

    public Group getRepresentativeGroup() { return representativeGroup; }
    public void setRepresentativeGroup(Group representativeGroup) { this.representativeGroup = representativeGroup; }

    public double getVoteMarginPct() { return voteMarginPct; }
    public void setVoteMarginPct(double voteMarginPct) { this.voteMarginPct = voteMarginPct; }

    public double getEffectivenessScore() { return effectivenessScore; }
    public void setEffectivenessScore(double effectivenessScore) { this.effectivenessScore = effectivenessScore; }

    public double getCalibratedEffectivenessScore() { return calibratedEffectivenessScore; }
    public void setCalibratedEffectivenessScore(double calibratedEffectivenessScore) { this.calibratedEffectivenessScore = calibratedEffectivenessScore; }
}
