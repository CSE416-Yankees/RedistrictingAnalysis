package cse416.yankees.data.map;

import cse416.yankees.common.GeographyLevel;
import cse416.yankees.common.State;
import cse416.yankees.exception.ResourceNotFoundException;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;
import tools.jackson.databind.json.JsonMapper;

import java.io.IOException;
import java.io.InputStream;

@Service
public class MapDataService {

    private final MapDataRepository repository;
    private final JsonMapper jsonMapper;

    public MapDataService(MapDataRepository repository, JsonMapper jsonMapper) {
        this.repository = repository;
        this.jsonMapper = jsonMapper;
    }

    /**
     * Loads map geometry from Mongo when present; otherwise falls back to bundled
     * GeoJSON under {@code classpath:geo/{STATE}/{LEVEL}.json} (same shapes as the frontend static files).
     */
    public MapData get(State state, GeographyLevel level) {
        return repository.findByStateAndLevel(state, level)
                .orElseGet(() -> loadBundledGeoJson(state, level));
    }

    private MapData loadBundledGeoJson(State state, GeographyLevel level) {
        String relativePath = "geo/" + state.name() + "/" + level.name() + ".json";
        ClassPathResource resource = new ClassPathResource(relativePath);
        if (!resource.exists()) {
            throw new ResourceNotFoundException(
                    "MapData not found for state=" + state + " level=" + level + " (no DB row and no " + relativePath + ")");
        }
        try (InputStream in = resource.getInputStream()) {
            GeoJsonFeatureCollection fc = jsonMapper.readValue(in, GeoJsonFeatureCollection.class);
            if (fc.getFeatures() == null || fc.getFeatures().isEmpty()) {
                throw new ResourceNotFoundException("Bundled map GeoJSON is empty: " + relativePath);
            }
            MapData mapData = new MapData();
            mapData.setState(state);
            mapData.setLevel(level);
            mapData.setFeatureCollection(fc);
            return mapData;
        } catch (IOException ex) {
            throw new ResourceNotFoundException("Failed to read bundled map GeoJSON: " + relativePath + " (" + ex.getMessage() + ")");
        }
    }
}
