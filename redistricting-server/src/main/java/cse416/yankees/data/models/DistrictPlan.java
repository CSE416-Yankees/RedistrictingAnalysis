package cse416.yankees.data.models;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document("district_plans")
public class DistrictPlan {
    @Id
    private String id;
    private StateDisplay state;
    private CurrentPlan currentPlan;

    public String getId() { return id; }

    public StateDisplay getState() { return state; }
    public void setState(StateDisplay state) { this.state = state; }

    public CurrentPlan getCurrentPlan() { return currentPlan; }
    public void setCurrentPlan(CurrentPlan currentPlan) { this.currentPlan = currentPlan; }
}
