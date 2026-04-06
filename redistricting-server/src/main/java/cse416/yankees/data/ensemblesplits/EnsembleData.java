package cse416.yankees.data.ensemblesplits;

public class EnsembleData {
    private int districtPlans; // number of district plans in the ensemble
    private double popEqThresholdPercent; // population equality threshold percent (0-100)

    public int getDistrictPlans() { return districtPlans; }
    public double getPopEqThresholdPercent() { return popEqThresholdPercent; }

    public void setDistrictPlans(int districtPlans) { this.districtPlans = districtPlans; }
    public void setPopEqThresholdPercent(double popEqThresholdPercent) { this.popEqThresholdPercent = popEqThresholdPercent; }
}
