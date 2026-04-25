package cse416.yankees.data.minorityeffectiveness;

public class BoxStats {
    private double min;
    private double q1;
    private double median;
    private double q3;
    private double max;
    private double enacted;

    public BoxStats() {}

    public double getMin() { return min; }
    public double getQ1() { return q1; }
    public double getMedian() { return median; }
    public double getQ3() { return q3; }
    public double getMax() { return max; }
    public double getEnacted() { return enacted; }

    public void setMin(double min) { this.min = min; }
    public void setQ1(double q1) { this.q1 = q1; }
    public void setMedian(double median) { this.median = median; }
    public void setQ3(double q3) { this.q3 = q3; }
    public void setMax(double max) { this.max = max; }
    public void setEnacted(double enacted) { this.enacted = enacted; }
}
