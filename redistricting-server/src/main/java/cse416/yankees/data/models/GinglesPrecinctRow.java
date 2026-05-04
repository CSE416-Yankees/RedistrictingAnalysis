package cse416.yankees.data.models;

public class GinglesPrecinctRow {
    private String precinctId;
    private String precinctName;
    private int totalPopulation;
    private int minorityPopulation;
    private int republicanVotes;
    private int democraticVotes;

    public String getPrecinctId() { return precinctId; }
    public void setPrecinctId(String precinctId) { this.precinctId = precinctId; }

    public String getPrecinctName() { return precinctName; }
    public void setPrecinctName(String precinctName) { this.precinctName = precinctName; }

    public int getTotalPopulation() { return totalPopulation; }
    public void setTotalPopulation(int totalPopulation) { this.totalPopulation = totalPopulation; }

    public int getMinorityPopulation() { return minorityPopulation; }
    public void setMinorityPopulation(int minorityPopulation) { this.minorityPopulation = minorityPopulation; }

    public int getRepublicanVotes() { return republicanVotes; }
    public void setRepublicanVotes(int republicanVotes) { this.republicanVotes = republicanVotes; }

    public int getDemocraticVotes() { return democraticVotes; }
    public void setDemocraticVotes(int democraticVotes) { this.democraticVotes = democraticVotes; }
}
