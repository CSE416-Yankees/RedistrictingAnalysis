package cse416.yankees.data.models;

import java.util.List;

public class GinglesRegression {
    private List<GinglesPoint> dem;
    private List<GinglesPoint> rep;

    public List<GinglesPoint> getDem() { return dem; }
    public void setDem(List<GinglesPoint> dem) { this.dem = dem; }

    public List<GinglesPoint> getRep() { return rep; }
    public void setRep(List<GinglesPoint> rep) { this.rep = rep; }
}
