package cse416.yankees.data.models;

import cse416.yankees.common.State;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Map;

@Document("plan_comparisons")
public class PlanComparison {
    @Id
    private String id;
    private State state;
    private Map<String, PlanMapping> plans;

    public String getId() { return id; }

    public State getState() { return state; }
    public void setState(State state) { this.state = state; }

    public Map<String, PlanMapping> getPlans() { return plans; }
    public void setPlans(Map<String, PlanMapping> plans) { this.plans = plans; }
}
