package cse416.yankees.data.partyseatshare;

import java.util.Map;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import cse416.yankees.common.*;

@Document(collection = "party_seat_share")
public class PartySeatShare {
    @Id
    private String id;

    private State state;
    private EnsembleType ensembleType;

    private Map<Integer, Integer> republicanSeatsToPlans; // Map of number of Republican seats to number of plans with that many Republican seats

    public PartySeatShare() {}

    // getters/setters

    public State getState() { return state; }
    public EnsembleType getEnsembleType() { return ensembleType; }
    public Map<Integer, Integer> getRepublicanSeatsToPlans() { return republicanSeatsToPlans; }
}