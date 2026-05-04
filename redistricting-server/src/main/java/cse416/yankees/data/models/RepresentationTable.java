package cse416.yankees.data.models;

import cse416.yankees.common.State;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;

@Document("representation_tables")
public class RepresentationTable {
    @Id
    private String id;
    private State state;
    private List<RepresentativeRow> districtRows;

    public String getId() { return id; }

    public State getState() { return state; }
    public void setState(State state) { this.state = state; }

    public List<RepresentativeRow> getDistrictRows() { return districtRows; }
    public void setDistrictRows(List<RepresentativeRow> districtRows) { this.districtRows = districtRows; }
}
