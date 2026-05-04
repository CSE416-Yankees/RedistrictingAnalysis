package cse416.yankees.data.services;

import cse416.yankees.common.Group;
import cse416.yankees.common.State;
import cse416.yankees.data.models.DemographicHeatMap;
import cse416.yankees.data.models.DistrictPlan;
import cse416.yankees.data.models.PlanComparison;
import cse416.yankees.data.repositories.MapDataRepository;
import cse416.yankees.exception.ResourceNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;

import java.util.Set;

@Service
public class MapDataService {

    @Autowired
    private MapDataRepository mapDataRepository;

    private static final Set<String> GEOJSON_LEVELS = Set.of("DISTRICT", "PRECINCT", "CENSUS_BLOCK");

    public DistrictPlan getDistrictPlan(State state) {
        DistrictPlan result = mapDataRepository.findDistrictPlan(state);
        if (result == null) throw new ResourceNotFoundException("DistrictPlan not found for state: " + state);
        return result;
    }

    public DemographicHeatMap getDemographicHeatMap(State state, Group group) {
        DemographicHeatMap result = mapDataRepository.findDemographicHeatMap(state, group);
        if (result == null) throw new ResourceNotFoundException("DemographicHeatMap not found for state: " + state + ", group: " + group);
        return result;
    }

    public PlanComparison getPlanComparison(State state) {
        PlanComparison result = mapDataRepository.findPlanComparison(state);
        if (result == null) throw new ResourceNotFoundException("PlanComparison not found for state: " + state);
        return result;
    }

    public Resource getGeoJsonResource(State state, String level) {
        String normalizedLevel = level == null ? "" : level.trim().toUpperCase();
        if (!GEOJSON_LEVELS.contains(normalizedLevel)) {
            throw new ResourceNotFoundException("Unsupported map level: " + level);
        }

        String relativePath = "geo/" + state.name() + "/" + normalizedLevel + ".json";
        ClassPathResource resource = new ClassPathResource(relativePath);
        if (!resource.exists()) {
            throw new ResourceNotFoundException("GeoJSON not found: " + relativePath);
        }
        return resource;
    }
}
