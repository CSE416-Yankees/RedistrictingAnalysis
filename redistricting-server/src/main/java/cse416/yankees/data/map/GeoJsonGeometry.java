package cse416.yankees.data.map;

import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class GeoJsonGeometry {

    private String type;
    // Object because coordinates shape varies by type: double[] for Point,
    // double[][] for LineString, double[][][] for Polygon, double[][][][] for MultiPolygon
    private Object coordinates;

    public GeoJsonGeometry() {}

    public String getType() { return type; }
    public Object getCoordinates() { return coordinates; }

    public void setType(String type) { this.type = type; }
    public void setCoordinates(Object coordinates) { this.coordinates = coordinates; }
}
