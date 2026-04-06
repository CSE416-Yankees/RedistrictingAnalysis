package cse416.yankees.data.ginglestable;

import java.util.List;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import cse416.yankees.common.State;

@Document(collection = "gingles_tables")
public class GinglesTable {
    @Id
    private String id;

    private State state;

    private List<TableRow> rows; // List of rows for the table

    public GinglesTable() {}

    // getters/setters

    public State getState() { return state; }
    public List<TableRow> getRows() { return rows; }

    public void setState(State state) { this.state = state; }
    public void setRows(List<TableRow> rows) { this.rows = rows; }
}
