package cse416.yankees.data.summary;

public class EnsembleSummary {
    private int planCount;
    private double populationEqualityThresholdPct;

    public EnsembleSummary() {}

    public int getPlanCount() { return planCount; }
    public double getPopulationEqualityThresholdPct() { return populationEqualityThresholdPct; }

    public void setPlanCount(int planCount) { this.planCount = planCount; }
    public void setPopulationEqualityThresholdPct(double populationEqualityThresholdPct) { this.populationEqualityThresholdPct = populationEqualityThresholdPct; }
}
