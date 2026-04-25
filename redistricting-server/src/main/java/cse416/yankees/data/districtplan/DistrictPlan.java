package cse416.yankees.data.districtplan;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "district_plans")
public class DistrictPlan {

    @Id
    private String id;

    // Named "state" to match the GUI-2 JSON structure exactly.
    // Queried by state.abbr (e.g. "MD") via findByStateAbbr.
    private StateDisplay state;
    private PlanData plan;

    public DistrictPlan() {}

    public String getId() { return id; }
    public StateDisplay getState() { return state; }
    public PlanData getPlan() { return plan; }

    public void setState(StateDisplay state) { this.state = state; }
    public void setPlan(PlanData plan) { this.plan = plan; }
}
