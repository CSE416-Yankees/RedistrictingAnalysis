package cse416.yankees.data.districtplan;

import java.util.Map;

public class PlanData {
    private String planType;
    private Map<String, Integer> precinctToDistrict;
    private Map<String, DistrictSummary> districtSummaries;

    public PlanData() {}

    public String getPlanType() { return planType; }
    public Map<String, Integer> getPrecinctToDistrict() { return precinctToDistrict; }
    public Map<String, DistrictSummary> getDistrictSummaries() { return districtSummaries; }

    public void setPlanType(String planType) { this.planType = planType; }
    public void setPrecinctToDistrict(Map<String, Integer> precinctToDistrict) { this.precinctToDistrict = precinctToDistrict; }
    public void setDistrictSummaries(Map<String, DistrictSummary> districtSummaries) { this.districtSummaries = districtSummaries; }
}
