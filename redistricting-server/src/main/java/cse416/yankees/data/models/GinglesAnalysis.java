package cse416.yankees.data.models;

import cse416.yankees.common.Group;
import cse416.yankees.common.State;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Map;

@Document("gingles_analyses")
public class GinglesAnalysis {
    @Id
    private String id;
    private State state;
    private Map<Group, GinglesGroup> groups;

    public String getId() { return id; }

    public State getState() { return state; }
    public void setState(State state) { this.state = state; }

    public Map<Group, GinglesGroup> getGroups() { return groups; }
    public void setGroups(Map<Group, GinglesGroup> groups) { this.groups = groups; }
}
