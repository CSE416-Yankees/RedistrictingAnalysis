package cse416.yankees.data.models;

public class HistogramBin {
    private int effectiveDistricts;
    private int rbFrequency;
    private int vraFrequency;

    public int getEffectiveDistricts() { return effectiveDistricts; }
    public void setEffectiveDistricts(int effectiveDistricts) { this.effectiveDistricts = effectiveDistricts; }

    public int getRbFrequency() { return rbFrequency; }
    public void setRbFrequency(int rbFrequency) { this.rbFrequency = rbFrequency; }

    public int getVraFrequency() { return vraFrequency; }
    public void setVraFrequency(int vraFrequency) { this.vraFrequency = vraFrequency; }
}
