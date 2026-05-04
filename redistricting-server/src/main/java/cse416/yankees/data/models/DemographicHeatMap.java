package cse416.yankees.data.models;

import cse416.yankees.common.Group;
import cse416.yankees.common.State;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;
import java.util.Map;

@Document("demographic_heat_maps")
public class DemographicHeatMap {
    @Id
    private String id;
    private State state;
    private Group group;
    private List<HeatMapBin> bins;
    private Map<String, Integer> precinctBins;

    public String getId() { return id; }

    public State getState() { return state; }
    public void setState(State state) { this.state = state; }

    public Group getGroup() { return group; }
    public void setGroup(Group group) { this.group = group; }

    public List<HeatMapBin> getBins() { return bins; }
    public void setBins(List<HeatMapBin> bins) { this.bins = bins; }

    public Map<String, Integer> getPrecinctBins() { return precinctBins; }
    public void setPrecinctBins(Map<String, Integer> precinctBins) { this.precinctBins = precinctBins; }
}
