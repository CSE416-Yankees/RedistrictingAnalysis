package cse416.yankees.data.models;

import java.util.List;
import java.util.Map;

public class CurrentPlan {
    private Map<String, Integer> precinctToDistrict;
    private List<DistrictInfo> districts;

    public Map<String, Integer> getPrecinctToDistrict() { return precinctToDistrict; }
    public void setPrecinctToDistrict(Map<String, Integer> precinctToDistrict) { this.precinctToDistrict = precinctToDistrict; }

    public List<DistrictInfo> getDistricts() { return districts; }
    public void setDistricts(List<DistrictInfo> districts) { this.districts = districts; }
}
