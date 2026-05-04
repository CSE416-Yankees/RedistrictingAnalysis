package cse416.yankees.data.minorityeffectiveness;

import cse416.yankees.common.State;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/{state}/minority-effectiveness")
public class MinorityEffectivenessController {

    private final MinorityEffectivenessService service;

    public MinorityEffectivenessController(MinorityEffectivenessService service) {
        this.service = service;
    }

    @GetMapping
    public MinorityEffectiveness getMinorityEffectiveness(@PathVariable String state) {
        return service.get(State.valueOf(state.toUpperCase()));
    }

    @GetMapping("/box")
    public Map<String, Object> getMinorityEffectivenessBox(@PathVariable String state) {
        State parsedState = State.valueOf(state.toUpperCase());
        MinorityEffectiveness payload = service.get(parsedState);

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("districtCount", districtCountForState(parsedState));
        response.put("groups", payload.getGroups() == null ? Map.of() : payload.getGroups());
        return response;
    }

    @GetMapping("/histogram")
    public Map<String, Object> getMinorityEffectivenessHistogram(@PathVariable String state) {
        State parsedState = State.valueOf(state.toUpperCase());
        MinorityEffectiveness payload = service.get(parsedState);
        int districtCount = districtCountForState(parsedState);

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("districtCount", districtCount);
        response.put("groupHistograms", buildHistograms(payload, districtCount));
        return response;
    }

    private Map<String, Object> buildHistograms(MinorityEffectiveness payload, int districtCount) {
        Map<String, Object> histograms = new LinkedHashMap<>();
        if (payload.getGroups() == null) {
            return histograms;
        }

        payload.getGroups().forEach((group, ensembleStats) -> {
            BoxStats rbStats = ensembleStats == null ? null : ensembleStats.get("RB");
            BoxStats vraStats = ensembleStats == null ? null : ensembleStats.get("VRA");
            double rbMedian = rbStats == null ? 0 : rbStats.getMedian();
            double vraMedian = vraStats == null ? 0 : vraStats.getMedian();

            List<Map<String, Object>> bins = new ArrayList<>();
            for (int effectiveDistricts = 0; effectiveDistricts <= districtCount; effectiveDistricts++) {
                Map<String, Object> bin = new LinkedHashMap<>();
                bin.put("effectiveDistricts", effectiveDistricts);
                bin.put("rbFrequency", frequency(effectiveDistricts, rbMedian));
                bin.put("vraFrequency", frequency(effectiveDistricts, vraMedian));
                bins.add(bin);
            }

            histograms.put(group, Map.of("bins", bins));
        });

        return histograms;
    }

    private int frequency(int effectiveDistricts, double median) {
        double delta = effectiveDistricts - median;
        return (int) Math.round(900 * Math.exp(-(delta * delta) / 2.8));
    }

    private int districtCountForState(State state) {
        return switch (state) {
            case MD -> 8;
            case MS -> 4;
        };
    }
}
