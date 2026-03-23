package cse416.yankees.data.summary;

import cse416.yankees.common.*;

public class Representative {
    private State state;
    private int districtNumber;
    private String name;
    private String party;
    private String racialEthnicGroup;
    private int voteMarginPercent; // 0-100
    private int demVotePercent; // 0-100
    private int repVotePercent; // 0-100

    public Representative(State state, int districtNumber, String name, String party, String racialEthnicGroup,
                          int voteMarginPercent, int demVotePercent, int repVotePercent) {
        this.state = state;
        this.districtNumber = districtNumber;
        this.name = name;
        this.party = party;
        this.racialEthnicGroup = racialEthnicGroup;
        this.voteMarginPercent = voteMarginPercent;
        this.demVotePercent = demVotePercent;
        this.repVotePercent = repVotePercent;
    }

    // getters/setters
    public State getState() { return state; }
    public int getDistrictNumber() { return districtNumber; }
    public String getName() { return name; }
    public String getParty() { return party; }
    public String getRacialEthnicGroup() { return racialEthnicGroup; }
    public int getVoteMarginPercent() { return voteMarginPercent; }
    public int getDemVotePercent() { return demVotePercent; }
    public int getRepVotePercent() { return repVotePercent; }
}