package cse416.yankees.data.models;

import cse416.yankees.common.Group;

public class DemographicSummaryEntry {
    private Group group;
    private double populationPct;
    private double cvapPct;

    public Group getGroup() { return group; }
    public void setGroup(Group group) { this.group = group; }

    public double getPopulationPct() { return populationPct; }
    public void setPopulationPct(double populationPct) { this.populationPct = populationPct; }

    public double getCvapPct() { return cvapPct; }
    public void setCvapPct(double cvapPct) { this.cvapPct = cvapPct; }
}
