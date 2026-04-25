package cse416.yankees.data.districtplan;

public class StateDisplay {
    private String abbr;
    private String name;
    private double[] center;
    private int zoom;

    public StateDisplay() {}

    public String getAbbr() { return abbr; }
    public String getName() { return name; }
    public double[] getCenter() { return center; }
    public int getZoom() { return zoom; }

    public void setAbbr(String abbr) { this.abbr = abbr; }
    public void setName(String name) { this.name = name; }
    public void setCenter(double[] center) { this.center = center; }
    public void setZoom(int zoom) { this.zoom = zoom; }
}
