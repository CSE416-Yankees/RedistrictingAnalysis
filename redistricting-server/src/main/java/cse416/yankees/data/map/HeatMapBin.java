package cse416.yankees.data.map;

public class HeatMapBin {
    private int bin;
    private int minPct;
    private int maxPct;
    private String color;

    public HeatMapBin() {}

    public int getBin() { return bin; }
    public int getMinPct() { return minPct; }
    public int getMaxPct() { return maxPct; }
    public String getColor() { return color; }

    public void setBin(int bin) { this.bin = bin; }
    public void setMinPct(int minPct) { this.minPct = minPct; }
    public void setMaxPct(int maxPct) { this.maxPct = maxPct; }
    public void setColor(String color) { this.color = color; }
}
