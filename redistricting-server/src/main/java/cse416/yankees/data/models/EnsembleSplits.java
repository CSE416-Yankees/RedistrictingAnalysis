package cse416.yankees.data.models;

import cse416.yankees.common.State;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;

@Document("ensemble_splits")
public class EnsembleSplits {
    @Id
    private String id;
    private State state;
    private int districtCount;
    private List<SplitRow> splits;

    public String getId() { return id; }

    public State getState() { return state; }
    public void setState(State state) { this.state = state; }

    public int getDistrictCount() { return districtCount; }
    public void setDistrictCount(int districtCount) { this.districtCount = districtCount; }

    public List<SplitRow> getSplits() { return splits; }
    public void setSplits(List<SplitRow> splits) { this.splits = splits; }
}
