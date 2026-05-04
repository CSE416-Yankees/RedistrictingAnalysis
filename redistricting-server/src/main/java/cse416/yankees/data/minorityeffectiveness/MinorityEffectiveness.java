package cse416.yankees.data.minorityeffectiveness;

import cse416.yankees.common.State;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Map;

@Document(collection = "minority_effectiveness")
public class MinorityEffectiveness {

    @Id
    private String id;

    private State state;

    // group name ("Black", "Hispanic", "Asian") -> ensemble type string ("RB", "VRA") -> box stats
    private Map<String, Map<String, BoxStats>> groups;

    public MinorityEffectiveness() {}

    public String getId() { return id; }
    public State getState() { return state; }
    public Map<String, Map<String, BoxStats>> getGroups() { return groups; }

    public void setState(State state) { this.state = state; }
    public void setGroups(Map<String, Map<String, BoxStats>> groups) { this.groups = groups; }
}
