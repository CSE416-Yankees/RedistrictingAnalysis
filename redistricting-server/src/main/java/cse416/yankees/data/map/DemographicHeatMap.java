package cse416.yankees.data.map;

import cse416.yankees.common.State;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;
import java.util.Map;

@Document(collection = "demographic_heat_maps")
public class DemographicHeatMap {

    @Id
    private String id;

    private State state;
    private String group;
    private List<HeatMapBin> bins;
    private Map<String, Integer> precinctBins;

    public DemographicHeatMap() {}

    public String getId() { return id; }
    public State getState() { return state; }
    public String getGroup() { return group; }
    public List<HeatMapBin> getBins() { return bins; }
    public Map<String, Integer> getPrecinctBins() { return precinctBins; }

    public void setState(State state) { this.state = state; }
    public void setGroup(String group) { this.group = group; }
    public void setBins(List<HeatMapBin> bins) { this.bins = bins; }
    public void setPrecinctBins(Map<String, Integer> precinctBins) { this.precinctBins = precinctBins; }
}
