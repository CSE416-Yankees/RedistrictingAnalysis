package cse416.yankees.data.summary;

public class DemographicSummary {
    private String group;
    private double populationPct;
    private double cvapPct;
    private double roughProportionality;

    public DemographicSummary() {}

    public String getGroup() { return group; }
    public double getPopulationPct() { return populationPct; }
    public double getCvapPct() { return cvapPct; }
    public double getRoughProportionality() { return roughProportionality; }

    public void setGroup(String group) { this.group = group; }
    public void setPopulationPct(double populationPct) { this.populationPct = populationPct; }
    public void setCvapPct(double cvapPct) { this.cvapPct = cvapPct; }
    public void setRoughProportionality(double roughProportionality) { this.roughProportionality = roughProportionality; }
}
