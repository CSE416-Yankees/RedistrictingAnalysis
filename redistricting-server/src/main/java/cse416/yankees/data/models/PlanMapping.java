package cse416.yankees.data.models;

import java.util.Map;

public class PlanMapping {
    private Map<String, Integer> precinctToDistrict;

    public Map<String, Integer> getPrecinctToDistrict() { return precinctToDistrict; }
    public void setPrecinctToDistrict(Map<String, Integer> precinctToDistrict) { this.precinctToDistrict = precinctToDistrict; }
}
