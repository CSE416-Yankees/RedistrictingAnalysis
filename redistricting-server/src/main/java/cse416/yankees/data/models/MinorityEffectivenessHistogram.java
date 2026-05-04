package cse416.yankees.data.models;

import cse416.yankees.common.Group;
import cse416.yankees.common.State;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Map;

@Document("minority_effectiveness_histograms")
public class MinorityEffectivenessHistogram {
    @Id
    private String id;
    private State state;
    private int districtCount;
    private Map<Group, MinorityHistogramGroup> groupHistograms;

    public String getId() { return id; }

    public State getState() { return state; }
    public void setState(State state) { this.state = state; }

    public int getDistrictCount() { return districtCount; }
    public void setDistrictCount(int districtCount) { this.districtCount = districtCount; }

    public Map<Group, MinorityHistogramGroup> getGroupHistograms() { return groupHistograms; }
    public void setGroupHistograms(Map<Group, MinorityHistogramGroup> groupHistograms) { this.groupHistograms = groupHistograms; }
}
