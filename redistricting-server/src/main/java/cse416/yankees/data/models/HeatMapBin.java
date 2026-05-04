package cse416.yankees.data.models;

public class HeatMapBin {
    private int bin;
    private int minPct;
    private int maxPct;
    private String color;

    public int getBin() { return bin; }
    public void setBin(int bin) { this.bin = bin; }

    public int getMinPct() { return minPct; }
    public void setMinPct(int minPct) { this.minPct = minPct; }

    public int getMaxPct() { return maxPct; }
    public void setMaxPct(int maxPct) { this.maxPct = maxPct; }

    public String getColor() { return color; }
    public void setColor(String color) { this.color = color; }
}
