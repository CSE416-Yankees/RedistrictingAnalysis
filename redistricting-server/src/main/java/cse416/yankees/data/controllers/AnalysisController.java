package cse416.yankees.data.controllers;

import cse416.yankees.common.EnsembleType;
import cse416.yankees.common.Group;
import cse416.yankees.common.State;
import cse416.yankees.data.models.*;
import cse416.yankees.data.services.AnalysisService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/{state}")
public class AnalysisController {

    @Autowired
    private AnalysisService analysisService;

    @GetMapping("/gingles/analysis")
    public GinglesAnalysis getGinglesSummary(@PathVariable String state) {
        return analysisService.getGinglesAnalysis(State.valueOf(state.toUpperCase()));
    }

    @GetMapping("/gingles/precinct-table")
    public GinglesPrecinctTable getGinglesTable(@PathVariable String state) {
        return analysisService.getGinglesPrecinctTable(State.valueOf(state.toUpperCase()));
    }

    @GetMapping("/ei/candidate-results")
    public EICandidateResults getEiResults(@PathVariable String state) {
        return analysisService.getEICandidateResults(State.valueOf(state.toUpperCase()));
    }

    @GetMapping("/ensemble/splits")
    public EnsembleSplits getEnsembleSplits(@PathVariable String state) {
        return analysisService.getEnsembleSplits(State.valueOf(state.toUpperCase()));
    }

    @GetMapping("/box-whisker")
    public BoxWhiskerGroupData getBoxWhiskers(
            @PathVariable String state,
            @RequestParam String ensembleType,
            @RequestParam String group) {
        return analysisService.getBoxWhiskers(
                State.valueOf(state.toUpperCase()),
                EnsembleType.valueOf(ensembleType.toUpperCase()),
                Group.valueOf(group));
    }

    @GetMapping("/vra/impact")
    public VRAImpactTable getVraThresholds(@PathVariable String state) {
        return analysisService.getVRAImpactTable(State.valueOf(state.toUpperCase()));
    }

    @GetMapping("/minority-effectiveness")
    public MinorityEffectiveness getMinorityEffectivenessBoxWhiskers(@PathVariable String state) {
        return analysisService.getMinorityEffectiveness(State.valueOf(state.toUpperCase()));
    }

    @GetMapping("/minority-effectiveness/histogram")
    public MinorityEffectivenessHistogram getMinorityEffectivenessHistogram(@PathVariable String state) {
        return analysisService.getMinorityEffectivenessHistogram(State.valueOf(state.toUpperCase()));
    }
}
