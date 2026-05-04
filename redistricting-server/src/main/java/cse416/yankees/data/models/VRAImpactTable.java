package cse416.yankees.data.models;

import cse416.yankees.common.State;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;

@Document("vra_impact_tables")
public class VRAImpactTable {
    @Id
    private String id;
    private State state;
    private List<VRAImpactRow> rows;

    public String getId() { return id; }

    public State getState() { return state; }
    public void setState(State state) { this.state = state; }

    public List<VRAImpactRow> getRows() { return rows; }
    public void setRows(List<VRAImpactRow> rows) { this.rows = rows; }
}
