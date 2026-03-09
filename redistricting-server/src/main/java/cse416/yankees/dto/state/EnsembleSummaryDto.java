package cse416.yankees.dto.state;

/**
 * DTO that summarizes the high-level properties of the ensemble
 * simulations used in the course project (e.g., number of plans).
 *
 * Only a handful of fields are exposed here so the React frontend
 * can easily show an overview without needing to understand all of
 * the underlying geospatial details yet.
 */
public class EnsembleSummaryDto {

    /** Number of race-blind ensemble plans that were generated. */
    private int raceBlindPlans;

    /** Number of VRA-aware ensemble plans that were generated. */
    private int vraPlans;

    /**
     * Population deviation threshold (in percent) that plans in the
     * ensemble were required to satisfy. For example, 1 means 1% deviation.
     */
    private double populationEqualityThresholdPct;

    public EnsembleSummaryDto() {
        // Default constructor required for JSON deserialization.
    }

    public EnsembleSummaryDto(int raceBlindPlans, int vraPlans, double populationEqualityThresholdPct) {
        this.raceBlindPlans = raceBlindPlans;
        this.vraPlans = vraPlans;
        this.populationEqualityThresholdPct = populationEqualityThresholdPct;
    }

    public int getRaceBlindPlans() {
        return raceBlindPlans;
    }

    public void setRaceBlindPlans(int raceBlindPlans) {
        this.raceBlindPlans = raceBlindPlans;
    }

    public int getVraPlans() {
        return vraPlans;
    }

    public void setVraPlans(int vraPlans) {
        this.vraPlans = vraPlans;
    }

    public double getPopulationEqualityThresholdPct() {
        return populationEqualityThresholdPct;
    }

    public void setPopulationEqualityThresholdPct(double populationEqualityThresholdPct) {
        this.populationEqualityThresholdPct = populationEqualityThresholdPct;
    }
}

