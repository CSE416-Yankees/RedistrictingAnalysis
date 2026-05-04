package cse416.yankees.data.models;

import cse416.yankees.common.Group;
import java.util.Map;

public class EnsembleSummaryData {
    private int planCount;
    private double populationEqualityThresholdPct;
    private Map<Group, Double> roughProportionality;

    public int getPlanCount() { return planCount; }
    public void setPlanCount(int planCount) { this.planCount = planCount; }

    public double getPopulationEqualityThresholdPct() { return populationEqualityThresholdPct; }
    public void setPopulationEqualityThresholdPct(double populationEqualityThresholdPct) { this.populationEqualityThresholdPct = populationEqualityThresholdPct; }

    public Map<Group, Double> getRoughProportionality() { return roughProportionality; }
    public void setRoughProportionality(Map<Group, Double> roughProportionality) { this.roughProportionality = roughProportionality; }
}
