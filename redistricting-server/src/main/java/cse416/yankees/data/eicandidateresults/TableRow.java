package cse416.yankees.data.eicandidateresults;

public class TableRow {
    private int district;
    private int candidateAPercentage;
    private int candidateBPercentage;
    private int candidateCPercentage;

    public TableRow() {}

    public TableRow(int district, int candidateAPercentage, int candidateBPercentage, int candidateCPercentage) {
        this.district = district;
        this.candidateAPercentage = candidateAPercentage;
        this.candidateBPercentage = candidateBPercentage;
        this.candidateCPercentage = candidateCPercentage;
    }

    // getters/setters
    public int getDistrict() { return district; }
    public int getCandidateAPercentage() { return candidateAPercentage; }
    public int getCandidateBPercentage() { return candidateBPercentage; }
    public int getCandidateCPercentage() { return candidateCPercentage; }
}