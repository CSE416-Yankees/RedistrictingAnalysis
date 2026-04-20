package cse416.yankees.data.geodata;

import cse416.yankees.common.GeographyLevel;
import cse416.yankees.common.State;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/{state}/geo-data")
public class GeoDataController {

    private final GeoDataService service;

    public GeoDataController(GeoDataService service) {
        this.service = service;
    }

    @GetMapping
    public GeoJsonFeatureCollection getGeoData(
            @PathVariable String state,
            @RequestParam String level) {
        return service.get(
                State.valueOf(state.toUpperCase()),
                GeographyLevel.valueOf(level.toUpperCase()))
                .getFeatureCollection();
    }
}
