package cse416.yankees.data.map;

import cse416.yankees.common.GeographyLevel;
import cse416.yankees.common.State;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "map_data")
public class MapData {

    @Id
    private String id;

    private State state;
    private GeographyLevel level;
    private GeoJsonFeatureCollection featureCollection;

    public MapData() {}

    public String getId() { return id; }
    public State getState() { return state; }
    public GeographyLevel getLevel() { return level; }
    public GeoJsonFeatureCollection getFeatureCollection() { return featureCollection; }

    public void setState(State state) { this.state = state; }
    public void setLevel(GeographyLevel level) { this.level = level; }
    public void setFeatureCollection(GeoJsonFeatureCollection featureCollection) { this.featureCollection = featureCollection; }
}
