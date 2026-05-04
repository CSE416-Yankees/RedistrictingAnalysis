package cse416.yankees.data.models;

import cse416.yankees.common.State;

public class StateDisplay {
    private State abbr;
    private String name;
    private double[] center;
    private int zoom;

    public State getAbbr() { return abbr; }
    public void setAbbr(State abbr) { this.abbr = abbr; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public double[] getCenter() { return center; }
    public void setCenter(double[] center) { this.center = center; }

    public int getZoom() { return zoom; }
    public void setZoom(int zoom) { this.zoom = zoom; }
}
