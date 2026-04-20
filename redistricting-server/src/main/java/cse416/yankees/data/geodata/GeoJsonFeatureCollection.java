package cse416.yankees.data.geodata;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.util.List;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class GeoJsonFeatureCollection {

    private String type;
    private List<GeoJsonFeature> features;
    private String fileName;

    public GeoJsonFeatureCollection() {}

    public String getType() { return type; }
    public List<GeoJsonFeature> getFeatures() { return features; }
    public String getFileName() { return fileName; }

    public void setType(String type) { this.type = type; }
    public void setFeatures(List<GeoJsonFeature> features) { this.features = features; }
    public void setFileName(String fileName) { this.fileName = fileName; }
}
