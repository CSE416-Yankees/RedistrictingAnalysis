package cse416.yankees.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import cse416.yankees.data.models.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.stereotype.Component;

import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Seeds MongoDB from the preprocessing JSON output files.
 * Activate with --spring.profiles.active=seed.
 * The source directory is configurable via seeder.json.path (default: ../preprocessing/Output).
 */
@Component
@Profile("seed")
public class JsonDataSeeder implements CommandLineRunner {

    @Autowired private MongoTemplate mongoTemplate;
    @Autowired private ObjectMapper objectMapper;

    @Value("${seeder.json.path:../preprocessing/Output}")
    private String jsonPath;

    private static final String[] STATES = { "md", "ms" };
    private static final String[] HEAT_MAP_GROUPS = { "black", "hispanic", "asian", "white" };

    @Override
    public void run(String... args) throws Exception {
        Path dir = Path.of(jsonPath);
        System.out.println("Loading JSON seed data from: " + dir.toAbsolutePath());

        loadStateSummaries(dir);
        loadRepresentationTables(dir);
        loadDistrictPlans(dir);
        loadDemographicHeatMaps(dir);
        loadPlanComparisons(dir);
        loadGinglesAnalyses(dir);
        loadGinglesPrecinctTables(dir);
        loadEICandidateResults(dir);
        loadEnsembleSplits(dir);
        loadBoxWhiskers(dir);
        loadVRAImpactTables(dir);
        loadMinorityEffectiveness(dir);
        loadMinorityEffectivenessHistograms(dir);

        System.out.println("JSON seed complete.");
    }

    // ─── StateSummary ────────────────────────────────────────────────────────

    private void loadStateSummaries(Path dir) throws Exception {
        mongoTemplate.dropCollection(StateSummary.class);
        for (String state : STATES) {
            StateSummary doc = load(dir, state + "_summary.json", StateSummary.class);
            if (doc != null) mongoTemplate.save(doc);
            else System.err.println("WARN: missing " + state + "_summary.json");
        }
    }

    // ─── RepresentationTable ─────────────────────────────────────────────────

    private void loadRepresentationTables(Path dir) throws Exception {
        mongoTemplate.dropCollection(RepresentationTable.class);
        for (String state : STATES) {
            RepresentationTable doc = load(dir, state + "_representation.json", RepresentationTable.class);
            if (doc != null) mongoTemplate.save(doc);
            else System.err.println("WARN: missing " + state + "_representation.json");
        }
    }

    // ─── DistrictPlan ────────────────────────────────────────────────────────

    private void loadDistrictPlans(Path dir) throws Exception {
        mongoTemplate.dropCollection(DistrictPlan.class);
        for (String state : STATES) {
            DistrictPlan doc = load(dir, state + "_district_plan.json", DistrictPlan.class);
            if (doc == null) { System.err.println("WARN: missing " + state + "_district_plan.json"); continue; }
            populatePrecinctIdsIfEmpty(doc);
            mongoTemplate.save(doc);
        }
    }

    private void populatePrecinctIdsIfEmpty(DistrictPlan doc) {
        CurrentPlan plan = doc.getCurrentPlan();
        Map<String, Integer> p2d = plan.getPrecinctToDistrict();
        List<DistrictInfo> districts = plan.getDistricts();
        if (p2d == null || p2d.isEmpty() || districts == null || districts.isEmpty()) return;
        boolean anyEmpty = districts.stream().anyMatch(d -> d.getPrecinctIds() == null || d.getPrecinctIds().isEmpty());
        if (!anyEmpty) return;
        Map<Integer, List<String>> inv = new HashMap<>();
        for (Map.Entry<String, Integer> e : p2d.entrySet())
            inv.computeIfAbsent(e.getValue(), k -> new ArrayList<>()).add(e.getKey());
        for (DistrictInfo d : districts)
            if (d.getPrecinctIds() == null || d.getPrecinctIds().isEmpty())
                d.setPrecinctIds(inv.getOrDefault(d.getDistrictNumber(), List.of()));
    }

    // ─── DemographicHeatMap ──────────────────────────────────────────────────

    private void loadDemographicHeatMaps(Path dir) throws Exception {
        mongoTemplate.dropCollection(DemographicHeatMap.class);
        for (String state : STATES) {
            for (String group : HEAT_MAP_GROUPS) {
                String filename = state + "_heat_map_" + group + ".json";
                DemographicHeatMap doc = load(dir, filename, DemographicHeatMap.class);
                if (doc != null) mongoTemplate.save(doc);
                // missing group files (e.g. ms_heat_map_hispanic.json) are silently skipped
            }
        }
    }

    // ─── PlanComparison ──────────────────────────────────────────────────────

    private void loadPlanComparisons(Path dir) throws Exception {
        mongoTemplate.dropCollection(PlanComparison.class);
        for (String state : STATES) {
            PlanComparison doc = load(dir, state + "_plan_comparison.json", PlanComparison.class);
            if (doc != null) mongoTemplate.save(doc);
            else System.err.println("WARN: missing " + state + "_plan_comparison.json");
        }
    }

    // ─── GinglesAnalysis ─────────────────────────────────────────────────────

    private void loadGinglesAnalyses(Path dir) throws Exception {
        mongoTemplate.dropCollection(GinglesAnalysis.class);
        for (String state : STATES) {
            GinglesAnalysis doc = load(dir, state + "_gingles_analysis.json", GinglesAnalysis.class);
            if (doc != null) mongoTemplate.save(doc);
            else System.err.println("WARN: missing " + state + "_gingles_analysis.json");
        }
    }

    // ─── GinglesPrecinctTable ────────────────────────────────────────────────

    private void loadGinglesPrecinctTables(Path dir) throws Exception {
        mongoTemplate.dropCollection(GinglesPrecinctTable.class);
        for (String state : STATES) {
            GinglesPrecinctTable doc = load(dir, state + "_gingles_precinct_table.json", GinglesPrecinctTable.class);
            if (doc != null) mongoTemplate.save(doc);
            else System.err.println("WARN: missing " + state + "_gingles_precinct_table.json");
        }
    }

    // ─── EICandidateResults ──────────────────────────────────────────────────

    private void loadEICandidateResults(Path dir) throws Exception {
        mongoTemplate.dropCollection(EICandidateResults.class);
        for (String state : STATES) {
            EICandidateResults doc = load(dir, state + "_ei_candidate_results.json", EICandidateResults.class);
            if (doc != null) mongoTemplate.save(doc);
            else System.err.println("WARN: missing " + state + "_ei_candidate_results.json");
        }
    }

    // ─── EnsembleSplits ──────────────────────────────────────────────────────

    private void loadEnsembleSplits(Path dir) throws Exception {
        mongoTemplate.dropCollection(EnsembleSplits.class);
        for (String state : STATES) {
            EnsembleSplits doc = load(dir, state + "_ensemble_splits.json", EnsembleSplits.class);
            if (doc != null) mongoTemplate.save(doc);
            else System.err.println("WARN: missing " + state + "_ensemble_splits.json");
            // groupDistributions will be null if not yet present in the JSON — this is safe
        }
    }

    // ─── BoxWhisker ──────────────────────────────────────────────────────────

    private void loadBoxWhiskers(Path dir) throws Exception {
        mongoTemplate.dropCollection(BoxWhisker.class);
        for (String state : STATES) {
            BoxWhisker doc = load(dir, state + "_box_whisker.json", BoxWhisker.class);
            if (doc != null) mongoTemplate.save(doc);
            else System.err.println("WARN: missing " + state + "_box_whisker.json");
        }
    }

    // ─── VRAImpactTable ──────────────────────────────────────────────────────

    private void loadVRAImpactTables(Path dir) throws Exception {
        mongoTemplate.dropCollection(VRAImpactTable.class);
        for (String state : STATES) {
            VRAImpactTable doc = load(dir, state + "_vra_impact.json", VRAImpactTable.class);
            if (doc != null) mongoTemplate.save(doc);
            else System.err.println("WARN: missing " + state + "_vra_impact.json");
        }
    }

    // ─── MinorityEffectiveness ───────────────────────────────────────────────

    private void loadMinorityEffectiveness(Path dir) throws Exception {
        mongoTemplate.dropCollection(MinorityEffectiveness.class);
        for (String state : STATES) {
            MinorityEffectiveness doc = load(dir, state + "_minority_effectiveness.json", MinorityEffectiveness.class);
            if (doc != null) mongoTemplate.save(doc);
            else System.err.println("WARN: missing " + state + "_minority_effectiveness.json");
        }
    }

    // ─── MinorityEffectivenessHistogram ──────────────────────────────────────

    private void loadMinorityEffectivenessHistograms(Path dir) throws Exception {
        mongoTemplate.dropCollection(MinorityEffectivenessHistogram.class);
        for (String state : STATES) {
            MinorityEffectivenessHistogram doc = load(dir, state + "_minority_effectiveness_histogram.json", MinorityEffectivenessHistogram.class);
            if (doc != null) mongoTemplate.save(doc);
            else System.err.println("WARN: missing " + state + "_minority_effectiveness_histogram.json");
        }
    }

    // ─── Helper ──────────────────────────────────────────────────────────────

    private <T> T load(Path dir, String filename, Class<T> type) throws Exception {
        Path file = dir.resolve(filename);
        if (!Files.exists(file)) return null;
        return objectMapper.readValue(file.toFile(), type);
    }
}
