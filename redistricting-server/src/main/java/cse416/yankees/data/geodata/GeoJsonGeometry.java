package cse416.yankees.data.geodata;

import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class GeoJsonGeometry {

    private String type;
    private Object coordinates;
    private Object bbox;

    public GeoJsonGeometry() {}

    public String getType() { return type; }
    public Object getCoordinates() { return coordinates; }
    public Object getBbox() { return bbox; }

    public void setType(String type) { this.type = type; }
    public void setCoordinates(Object coordinates) { this.coordinates = coordinates; }
    public void setBbox(Object bbox) { this.bbox = bbox; }
}
