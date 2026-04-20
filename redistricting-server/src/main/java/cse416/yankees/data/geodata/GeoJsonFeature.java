package cse416.yankees.data.geodata;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.util.Map;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class GeoJsonFeature {

    private String type;
    private GeoJsonGeometry geometry;
    private Map<String, Object> properties;

    public GeoJsonFeature() {}

    public String getType() { return type; }
    public GeoJsonGeometry getGeometry() { return geometry; }
    public Map<String, Object> getProperties() { return properties; }

    public void setType(String type) { this.type = type; }
    public void setGeometry(GeoJsonGeometry geometry) { this.geometry = geometry; }
    public void setProperties(Map<String, Object> properties) { this.properties = properties; }
}
