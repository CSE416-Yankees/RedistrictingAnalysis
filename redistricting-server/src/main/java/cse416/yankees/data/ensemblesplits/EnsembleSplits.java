package cse416.yankees.data.ensemblesplits;

import java.util.Map;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import cse416.yankees.common.*;

@Document(collection = "ensemble_splits")
public class EnsembleSplits {
    @Id
    private String id;

    private State state;
    private Map<EnsembleType, EnsembleData> ensembles;

    private int districtPlans; // number of district plans in the ensemble
    private double popEqThresholdPercent; // population equality threshold percent (0-100)

    private Map<EnsembleType, Map<Integer, Integer>> seatOutcomes; // for each ensemble type, a mapping of number of seats won to number of plans with that outcome

    public EnsembleSplits() {}

    // getters/setters
    public State getState() { return state; }
    public Map<EnsembleType, EnsembleData> getEnsembles() { return ensembles; }
    public int getDistrictPlans() { return districtPlans; }
    public double getPopEqThresholdPercent() { return popEqThresholdPercent; }
    public Map<EnsembleType, Map<Integer, Integer>> getSeatOutcomes() { return seatOutcomes; }

    public void setState(State state) { this.state = state; }
    public void setEnsembles(Map<EnsembleType, EnsembleData> ensembles) { this.ensembles = ensembles; }
    public void setDistrictPlans(int districtPlans) { this.districtPlans = districtPlans; }
    public void setPopEqThresholdPercent(double popEqThresholdPercent) { this.popEqThresholdPercent = popEqThresholdPercent; }
    public void setSeatOutcomes(Map<EnsembleType, Map<Integer, Integer>> seatOutcomes) { this.seatOutcomes = seatOutcomes; }
}
