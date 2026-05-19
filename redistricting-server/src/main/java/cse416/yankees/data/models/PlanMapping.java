package cse416.yankees.data.models;

import java.util.Map;

public class PlanMapping {
    private Map<String, Integer> precinctToDistrict;
    private String interestingReason;
    private Map<String, Object> interestingMetrics;

    public Map<String, Integer> getPrecinctToDistrict() { return precinctToDistrict; }
    public void setPrecinctToDistrict(Map<String, Integer> precinctToDistrict) { this.precinctToDistrict = precinctToDistrict; }

    public String getInterestingReason() { return interestingReason; }
    public void setInterestingReason(String interestingReason) { this.interestingReason = interestingReason; }

    public Map<String, Object> getInterestingMetrics() { return interestingMetrics; }
    public void setInterestingMetrics(Map<String, Object> interestingMetrics) { this.interestingMetrics = interestingMetrics; }
}
