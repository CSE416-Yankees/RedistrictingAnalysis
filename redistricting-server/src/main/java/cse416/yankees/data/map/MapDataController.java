package cse416.yankees.data.map;

import cse416.yankees.common.GeographyLevel;
import cse416.yankees.common.State;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/{state}/map")
public class MapDataController {

    private final MapDataService service;
    private final DemographicHeatMapService heatMapService;

    public MapDataController(MapDataService service, DemographicHeatMapService heatMapService) {
        this.service = service;
        this.heatMapService = heatMapService;
    }

    @GetMapping
    public GeoJsonFeatureCollection getMapData(
            @PathVariable String state,
            @RequestParam String level) {
        return service.get(
                State.valueOf(state.toUpperCase()),
                GeographyLevel.valueOf(level.toUpperCase()))
                .getFeatureCollection();
    }

    @GetMapping("/heat-map")
    public DemographicHeatMap getHeatMap(
            @PathVariable String state,
            @RequestParam String group) {
        return heatMapService.get(State.valueOf(state.toUpperCase()), group);
    }
}
