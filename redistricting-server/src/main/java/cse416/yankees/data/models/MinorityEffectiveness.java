package cse416.yankees.data.models;

import cse416.yankees.common.EnsembleType;
import cse416.yankees.common.Group;
import cse416.yankees.common.State;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Map;

@Document("minority_effectiveness")
public class MinorityEffectiveness {
    @Id
    private String id;
    private State state;
    private Map<Group, Map<EnsembleType, BoxStats>> groups;

    public String getId() { return id; }

    public State getState() { return state; }
    public void setState(State state) { this.state = state; }

    public Map<Group, Map<EnsembleType, BoxStats>> getGroups() { return groups; }
    public void setGroups(Map<Group, Map<EnsembleType, BoxStats>> groups) { this.groups = groups; }
}
