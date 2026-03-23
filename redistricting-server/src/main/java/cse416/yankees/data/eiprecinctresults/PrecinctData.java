package cse416.yankees.data.eiprecinctresults;

public class PrecinctData {
    private double minorityTurnoutPercentage;
    private double whiteTurnoutPercentage;

    public PrecinctData(double minorityTurnoutPercentage, double whiteTurnoutPercentage) {
        this.minorityTurnoutPercentage = minorityTurnoutPercentage;
        this.whiteTurnoutPercentage = whiteTurnoutPercentage;
    }

    public double getMinorityTurnoutPercentage() { return minorityTurnoutPercentage; }
    public double getWhiteTurnoutPercentage() { return whiteTurnoutPercentage; }
}
