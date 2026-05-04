package cse416.yankees.data.models;

import java.util.List;

public class GinglesGroup {
    private List<GinglesPoint> points;
    private GinglesRegression regression;

    public List<GinglesPoint> getPoints() { return points; }
    public void setPoints(List<GinglesPoint> points) { this.points = points; }

    public GinglesRegression getRegression() { return regression; }
    public void setRegression(GinglesRegression regression) { this.regression = regression; }
}
