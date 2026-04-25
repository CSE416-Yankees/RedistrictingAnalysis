package cse416.yankees.config;

import cse416.yankees.common.EnsembleType;
import cse416.yankees.common.State;
import cse416.yankees.data.boxwhisker.BoxWhisker;
import cse416.yankees.data.boxwhisker.BoxWhiskerRepository;
import cse416.yankees.data.boxwhisker.DistrictBox;
import cse416.yankees.data.districtplan.DistrictPlan;
import cse416.yankees.data.districtplan.DistrictPlanRepository;
import cse416.yankees.data.districtplan.DistrictSummary;
import cse416.yankees.data.districtplan.PlanData;
import cse416.yankees.data.districtplan.StateDisplay;
import cse416.yankees.data.eicandidateresults.EICandidateResults;
import cse416.yankees.data.eicandidateresults.EICandidateResultsRepository;
import cse416.yankees.data.eicandidateresults.GraphPoint;
import cse416.yankees.data.eicandidateresults.TableRow;
import cse416.yankees.data.eikderesults.EIKDEResults;
import cse416.yankees.data.eikderesults.EIKDEResultsRepository;
import cse416.yankees.data.eiprecinctresults.EIPrecinctResults;
import cse416.yankees.data.eiprecinctresults.EIPrecinctResultsRepository;
import cse416.yankees.data.eiprecinctresults.PrecinctData;
import cse416.yankees.data.ensemblecomparison.EnsembleComparison;
import cse416.yankees.data.ensemblecomparison.EnsembleComparisonRepository;
import cse416.yankees.data.ensemblecomparison.OpportunityDistrictData;
import cse416.yankees.data.ensemblesplits.EnsembleData;
import cse416.yankees.data.ensemblesplits.EnsembleSplits;
import cse416.yankees.data.ensemblesplits.EnsembleSplitsRepository;
import cse416.yankees.data.ginglessummary.GinglesDataPoint;
import cse416.yankees.data.ginglessummary.GinglesSummary;
import cse416.yankees.data.ginglessummary.GinglesSummaryRepository;
import cse416.yankees.data.ginglestable.GinglesTable;
import cse416.yankees.data.ginglestable.GinglesTableRepository;
import cse416.yankees.data.map.DemographicHeatMap;
import cse416.yankees.data.map.DemographicHeatMapRepository;
import cse416.yankees.data.map.HeatMapBin;
import cse416.yankees.data.minorityeffectiveness.BoxStats;
import cse416.yankees.data.minorityeffectiveness.MinorityEffectiveness;
import cse416.yankees.data.minorityeffectiveness.MinorityEffectivenessRepository;
import cse416.yankees.data.opportunitydistricts.OpportunityDistricts;
import cse416.yankees.data.opportunitydistricts.OpportunityDistrictsRepository;
import cse416.yankees.data.partyseatshare.PartySeatShare;
import cse416.yankees.data.partyseatshare.PartySeatShareRepository;
import cse416.yankees.data.summary.DemographicSummary;
import cse416.yankees.data.summary.EnsembleSummary;
import cse416.yankees.data.summary.RepresentationSummary;
import cse416.yankees.data.summary.StateSummary;
import cse416.yankees.data.summary.StateSummaryRepository;
import cse416.yankees.data.summary.StatewideVote;
import cse416.yankees.data.voteshareseatshare.VoteShareSeatShare;
import cse416.yankees.data.voteshareseatshare.VoteShareSeatShareRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Component
@Profile("seed")
public class DataSeeder implements CommandLineRunner {

    private final StateSummaryRepository stateSummaryRepo;
    private final DistrictPlanRepository districtPlanRepo;
    private final DemographicHeatMapRepository demographicHeatMapRepo;
    private final MinorityEffectivenessRepository minorityEffectivenessRepo;
    private final BoxWhiskerRepository boxWhiskerRepo;
    private final EICandidateResultsRepository eiCandidateRepo;
    private final EIKDEResultsRepository eiKDERepo;
    private final EIPrecinctResultsRepository eiPrecinctRepo;
    private final EnsembleComparisonRepository ensembleComparisonRepo;
    private final EnsembleSplitsRepository ensembleSplitsRepo;
    private final GinglesSummaryRepository ginglesSummaryRepo;
    private final GinglesTableRepository ginglesTableRepo;
    private final OpportunityDistrictsRepository opportunityDistrictsRepo;
    private final PartySeatShareRepository partySeatShareRepo;
    private final VoteShareSeatShareRepository voteShareSeatShareRepo;

    public DataSeeder(StateSummaryRepository stateSummaryRepo,
                      DistrictPlanRepository districtPlanRepo,
                      DemographicHeatMapRepository demographicHeatMapRepo,
                      MinorityEffectivenessRepository minorityEffectivenessRepo,
                      BoxWhiskerRepository boxWhiskerRepo,
                      EICandidateResultsRepository eiCandidateRepo,
                      EIKDEResultsRepository eiKDERepo,
                      EIPrecinctResultsRepository eiPrecinctRepo,
                      EnsembleComparisonRepository ensembleComparisonRepo,
                      EnsembleSplitsRepository ensembleSplitsRepo,
                      GinglesSummaryRepository ginglesSummaryRepo,
                      GinglesTableRepository ginglesTableRepo,
                      OpportunityDistrictsRepository opportunityDistrictsRepo,
                      PartySeatShareRepository partySeatShareRepo,
                      VoteShareSeatShareRepository voteShareSeatShareRepo) {
        this.stateSummaryRepo = stateSummaryRepo;
        this.districtPlanRepo = districtPlanRepo;
        this.demographicHeatMapRepo = demographicHeatMapRepo;
        this.minorityEffectivenessRepo = minorityEffectivenessRepo;
        this.boxWhiskerRepo = boxWhiskerRepo;
        this.eiCandidateRepo = eiCandidateRepo;
        this.eiKDERepo = eiKDERepo;
        this.eiPrecinctRepo = eiPrecinctRepo;
        this.ensembleComparisonRepo = ensembleComparisonRepo;
        this.ensembleSplitsRepo = ensembleSplitsRepo;
        this.ginglesSummaryRepo = ginglesSummaryRepo;
        this.ginglesTableRepo = ginglesTableRepo;
        this.opportunityDistrictsRepo = opportunityDistrictsRepo;
        this.partySeatShareRepo = partySeatShareRepo;
        this.voteShareSeatShareRepo = voteShareSeatShareRepo;
    }

    @Override
    public void run(String... args) {
        seedStateSummaries();
        seedDistrictPlans();
        seedDemographicHeatMaps();
        seedMinorityEffectiveness();
        seedBoxWhiskers();
        seedEICandidateResults();
        seedEIKDEResults();
        seedEIPrecinctResults();
        seedEnsembleComparison();
        seedEnsembleSplits();
        seedGinglesSummaries();
        seedGinglesTables();
        seedOpportunityDistricts();
        seedPartySeatShare();
        seedVoteShareSeatShare();
        System.out.println("Seed complete.");
    }

    private void seedStateSummaries() {
        stateSummaryRepo.deleteAll();

        StatewideVote mdVote = new StatewideVote();
        mdVote.setDemPct(0.62);

        DemographicSummary mdBlack = new DemographicSummary();
        mdBlack.setGroup("Black");
        mdBlack.setPopulationPct(0.29);
        mdBlack.setCvapPct(0.27);
        mdBlack.setRoughProportionality(0.74);

        DemographicSummary mdHispanic = new DemographicSummary();
        mdHispanic.setGroup("Hispanic");
        mdHispanic.setPopulationPct(0.12);
        mdHispanic.setCvapPct(0.10);
        mdHispanic.setRoughProportionality(0.40);

        DemographicSummary mdAsian = new DemographicSummary();
        mdAsian.setGroup("Asian");
        mdAsian.setPopulationPct(0.08);
        mdAsian.setCvapPct(0.07);
        mdAsian.setRoughProportionality(0.29);

        RepresentationSummary mdRep = new RepresentationSummary();
        mdRep.setDemSeats(7);

        EnsembleSummary mdRBSummary = new EnsembleSummary();
        mdRBSummary.setPlanCount(5000);
        mdRBSummary.setPopulationEqualityThresholdPct(1.0);

        EnsembleSummary mdVRASummary = new EnsembleSummary();
        mdVRASummary.setPlanCount(5000);
        mdVRASummary.setPopulationEqualityThresholdPct(1.0);

        StateSummary md = new StateSummary();
        md.setState(State.MD);
        md.setAbbr("MD");
        md.setName("Maryland");
        md.setPopulation(6177224);
        md.setStatewideVote(mdVote);
        md.setDemographicSummaries(Arrays.asList(mdBlack, mdHispanic, mdAsian));
        md.setRedistrictingControl("Democrat");
        md.setRepresentationSummary(mdRep);
        md.setEnsembleSummaries(Map.of("RB", mdRBSummary, "VRA", mdVRASummary));

        StatewideVote msVote = new StatewideVote();
        msVote.setDemPct(0.38);

        DemographicSummary msBlack = new DemographicSummary();
        msBlack.setGroup("Black");
        msBlack.setPopulationPct(0.38);
        msBlack.setCvapPct(0.35);
        msBlack.setRoughProportionality(0.25);

        RepresentationSummary msRep = new RepresentationSummary();
        msRep.setDemSeats(1);

        EnsembleSummary msRBSummary = new EnsembleSummary();
        msRBSummary.setPlanCount(5000);
        msRBSummary.setPopulationEqualityThresholdPct(1.0);

        EnsembleSummary msVRASummary = new EnsembleSummary();
        msVRASummary.setPlanCount(5000);
        msVRASummary.setPopulationEqualityThresholdPct(1.0);

        StateSummary ms = new StateSummary();
        ms.setState(State.MS);
        ms.setAbbr("MS");
        ms.setName("Mississippi");
        ms.setPopulation(2976149);
        ms.setStatewideVote(msVote);
        ms.setDemographicSummaries(List.of(msBlack));
        ms.setRedistrictingControl("Republican");
        ms.setRepresentationSummary(msRep);
        ms.setEnsembleSummaries(Map.of("RB", msRBSummary, "VRA", msVRASummary));

        stateSummaryRepo.saveAll(Arrays.asList(md, ms));
    }

    private void seedDistrictPlans() {
        districtPlanRepo.deleteAll();

        StateDisplay mdDisplay = new StateDisplay();
        mdDisplay.setAbbr("MD");
        mdDisplay.setName("Maryland");
        mdDisplay.setCenter(new double[]{-76.7, 39.0});
        mdDisplay.setZoom(7);

        DistrictSummary mdDistrict1 = new DistrictSummary();
        mdDistrict1.setDemVotePct(30.2);
        mdDistrict1.setRepVotePct(65.1);
        mdDistrict1.setMinorityPct(22.4);

        DistrictSummary mdDistrict2 = new DistrictSummary();
        mdDistrict2.setDemVotePct(58.8);
        mdDistrict2.setRepVotePct(39.0);
        mdDistrict2.setMinorityPct(41.7);

        PlanData mdPlan = new PlanData();
        mdPlan.setPlanType("current");
        mdPlan.setPrecinctToDistrict(new HashMap<>(Map.of(
            "240010001", 1,
            "240010002", 1,
            "240030014", 1,
            "240050011", 2,
            "240050012", 2
        )));
        mdPlan.setDistrictSummaries(Map.of("1", mdDistrict1, "2", mdDistrict2));

        DistrictPlan md = new DistrictPlan();
        md.setState(mdDisplay);
        md.setPlan(mdPlan);

        StateDisplay msDisplay = new StateDisplay();
        msDisplay.setAbbr("MS");
        msDisplay.setName("Mississippi");
        msDisplay.setCenter(new double[]{-89.7, 32.7});
        msDisplay.setZoom(7);

        DistrictSummary msDistrict1 = new DistrictSummary();
        msDistrict1.setDemVotePct(42.1);
        msDistrict1.setRepVotePct(55.8);
        msDistrict1.setMinorityPct(18.3);

        DistrictSummary msDistrict2 = new DistrictSummary();
        msDistrict2.setDemVotePct(67.4);
        msDistrict2.setRepVotePct(30.1);
        msDistrict2.setMinorityPct(63.5);

        PlanData msPlan = new PlanData();
        msPlan.setPlanType("current");
        msPlan.setPrecinctToDistrict(new HashMap<>(Map.of(
            "280010001", 1,
            "280010002", 2
        )));
        msPlan.setDistrictSummaries(Map.of("1", msDistrict1, "2", msDistrict2));

        DistrictPlan ms = new DistrictPlan();
        ms.setState(msDisplay);
        ms.setPlan(msPlan);

        districtPlanRepo.saveAll(Arrays.asList(md, ms));
    }

    private void seedDemographicHeatMaps() {
        demographicHeatMapRepo.deleteAll();

        demographicHeatMapRepo.saveAll(Arrays.asList(
            buildHeatMap(State.MD, "Black", Arrays.asList(
                buildBin(0, 0, 9, "#f7fbff"),
                buildBin(1, 10, 19, "#deebf7"),
                buildBin(2, 20, 29, "#c6dbef"),
                buildBin(3, 30, 39, "#9ecae1"),
                buildBin(4, 40, 49, "#6baed6")
            ), new HashMap<>(Map.of(
                "240010001", 1,
                "240010002", 3,
                "240010003", 0,
                "240010004", 4
            ))),
            buildHeatMap(State.MD, "Hispanic", Arrays.asList(
                buildBin(0, 0, 9, "#fff5eb"),
                buildBin(1, 10, 19, "#fee6ce"),
                buildBin(2, 20, 29, "#fdd0a2")
            ), new HashMap<>(Map.of(
                "240010001", 0,
                "240010002", 1,
                "240010003", 0,
                "240010004", 2
            ))),
            buildHeatMap(State.MD, "Asian", Arrays.asList(
                buildBin(0, 0, 9, "#f7fcf5"),
                buildBin(1, 10, 19, "#e5f5e0"),
                buildBin(2, 20, 29, "#c7e9c0")
            ), new HashMap<>(Map.of(
                "240010001", 0,
                "240010002", 0,
                "240010003", 1,
                "240010004", 2
            ))),
            buildHeatMap(State.MS, "Black", Arrays.asList(
                buildBin(0, 0, 9, "#f7fbff"),
                buildBin(1, 10, 19, "#deebf7"),
                buildBin(2, 20, 29, "#c6dbef"),
                buildBin(3, 30, 39, "#9ecae1"),
                buildBin(4, 40, 49, "#6baed6"),
                buildBin(5, 50, 59, "#4292c6"),
                buildBin(6, 60, 69, "#2171b5")
            ), new HashMap<>(Map.of(
                "280010001", 2,
                "280010002", 5,
                "280010003", 6,
                "280010004", 1
            )))
        ));
    }

    private DemographicHeatMap buildHeatMap(State state, String group, List<HeatMapBin> bins, Map<String, Integer> precinctBins) {
        DemographicHeatMap hm = new DemographicHeatMap();
        hm.setState(state);
        hm.setGroup(group);
        hm.setBins(bins);
        hm.setPrecinctBins(precinctBins);
        return hm;
    }

    private HeatMapBin buildBin(int bin, int minPct, int maxPct, String color) {
        HeatMapBin b = new HeatMapBin();
        b.setBin(bin);
        b.setMinPct(minPct);
        b.setMaxPct(maxPct);
        b.setColor(color);
        return b;
    }

    private void seedMinorityEffectiveness() {
        minorityEffectivenessRepo.deleteAll();

        MinorityEffectiveness md = new MinorityEffectiveness();
        md.setState(State.MD);
        md.setGroups(Map.of(
            "Black", Map.of(
                "RB",  buildBoxStats(0, 1, 2, 3, 4, 2),
                "VRA", buildBoxStats(1, 2, 3, 4, 5, 3)
            ),
            "Hispanic", Map.of(
                "RB",  buildBoxStats(0, 0, 1, 1, 2, 1),
                "VRA", buildBoxStats(0, 1, 1, 2, 2, 1)
            ),
            "Asian", Map.of(
                "RB",  buildBoxStats(0, 0, 0, 1, 1, 0),
                "VRA", buildBoxStats(0, 0, 1, 1, 2, 1)
            )
        ));

        MinorityEffectiveness ms = new MinorityEffectiveness();
        ms.setState(State.MS);
        ms.setGroups(Map.of(
            "Black", Map.of(
                "RB",  buildBoxStats(0, 1, 1, 2, 2, 1),
                "VRA", buildBoxStats(1, 1, 2, 2, 3, 2)
            ),
            "Hispanic", Map.of(
                "RB",  buildBoxStats(0, 0, 0, 1, 1, 0),
                "VRA", buildBoxStats(0, 0, 1, 1, 1, 0)
            )
        ));

        minorityEffectivenessRepo.saveAll(Arrays.asList(md, ms));
    }

    private BoxStats buildBoxStats(double min, double q1, double median, double q3, double max, double enacted) {
        BoxStats bs = new BoxStats();
        bs.setMin(min);
        bs.setQ1(q1);
        bs.setMedian(median);
        bs.setQ3(q3);
        bs.setMax(max);
        bs.setEnacted(enacted);
        return bs;
    }

    private void seedBoxWhiskers() {
        boxWhiskerRepo.deleteAll();

        boxWhiskerRepo.saveAll(Arrays.asList(
            buildBoxWhisker(State.MD, EnsembleType.RB, "Black", Arrays.asList(
                buildDistrictBox(1, 5.2, 8.1, 12.3, 18.4, 28.0, 14.2, 15.0),
                buildDistrictBox(4, 45.0, 52.0, 58.5, 63.0, 71.0, 60.1, 62.0)
            )),
            buildBoxWhisker(State.MD, EnsembleType.RB, "Hispanic", List.of(
                buildDistrictBox(1, 2.1, 4.0, 6.5, 9.0, 14.0, 7.2, 7.5)
            )),
            buildBoxWhisker(State.MS, EnsembleType.RB, "Black", List.of(
                buildDistrictBox(2, 52.0, 58.0, 63.5, 68.0, 74.0, 64.1, 65.0)
            ))
        ));
    }

    private BoxWhisker buildBoxWhisker(State state, EnsembleType type, String group, List<DistrictBox> districts) {
        BoxWhisker bw = new BoxWhisker();
        bw.setState(state);
        bw.setEnsembleType(type);
        bw.setGroup(group);
        bw.setDistricts(districts);
        return bw;
    }

    private DistrictBox buildDistrictBox(int district, double min, double q1, double median,
                                          double q3, double max, double enacted, double proposed) {
        DistrictBox db = new DistrictBox();
        db.setDistrictNumber(district);
        db.setMinPercent(min);
        db.setQ1Percent(q1);
        db.setMedianPercent(median);
        db.setQ3Percent(q3);
        db.setMaxPercent(max);
        db.setEnactedPercent(enacted);
        db.setProposedPercent(proposed);
        return db;
    }

    private void seedEICandidateResults() {
        eiCandidateRepo.deleteAll();

        EICandidateResults mdRB = new EICandidateResults();
        mdRB.setState(State.MD);
        mdRB.setEnsembleType(EnsembleType.RB);
        mdRB.setGraphPoints(Map.of(
            "Democrat", Arrays.asList(
                new GraphPoint(72, 0.12, 0.45, 0.22),
                new GraphPoint(68, 0.10, 0.40, 0.20)
            ),
            "Republican", List.of(
                new GraphPoint(28, 0.08, 0.10, 0.15)
            )
        ));
        mdRB.setTableRows(Arrays.asList(
            new TableRow(1, 30, 65, 5),
            new TableRow(4, 70, 25, 5)
        ));

        eiCandidateRepo.save(mdRB);
    }

    private void seedEIKDEResults() {
        eiKDERepo.deleteAll();

        EIKDEResults md = new EIKDEResults();
        md.setState(State.MD);
        md.setDistrictKDEScores(Map.of(1, 0.42, 2, 0.67, 3, 0.55, 4, 0.89, 5, 0.33, 6, 0.71, 7, 0.61, 8, 0.48));

        EIKDEResults ms = new EIKDEResults();
        ms.setState(State.MS);
        ms.setDistrictKDEScores(Map.of(1, 0.38, 2, 0.82, 3, 0.45, 4, 0.51));

        eiKDERepo.saveAll(Arrays.asList(md, ms));
    }

    private void seedEIPrecinctResults() {
        eiPrecinctRepo.deleteAll();

        EIPrecinctResults md = new EIPrecinctResults();
        md.setState(State.MD);
        md.setPrecinctData(Map.of(
            1, new PrecinctData(58.3, 72.1),
            2, new PrecinctData(61.5, 68.4),
            3, new PrecinctData(55.0, 74.2)
        ));

        eiPrecinctRepo.save(md);
    }

    private void seedEnsembleComparison() {
        ensembleComparisonRepo.deleteAll();

        EnsembleComparison md = new EnsembleComparison();
        md.setState(State.MD);
        md.setOpportunityDistrictData(Map.of(
            2, new OpportunityDistrictData(1200, 3800),
            3, new OpportunityDistrictData(5400, 4200),
            4, new OpportunityDistrictData(3400, 2000)
        ));
        md.setRbAvgOpportunityDistricts(3.1);
        md.setVraAvgOpportunityDistricts(3.4);
        md.setTotalPlansEach(10000);

        ensembleComparisonRepo.save(md);
    }

    private void seedEnsembleSplits() {
        ensembleSplitsRepo.deleteAll();

        EnsembleData rbData = new EnsembleData();
        rbData.setDistrictPlans(10000);
        rbData.setPopEqThresholdPercent(1.0);

        EnsembleData vraData = new EnsembleData();
        vraData.setDistrictPlans(10000);
        vraData.setPopEqThresholdPercent(1.0);

        Map<Integer, Integer> rbSeats = new HashMap<>();
        rbSeats.put(5, 1200); rbSeats.put(6, 4800); rbSeats.put(7, 3600); rbSeats.put(8, 400);

        Map<Integer, Integer> vraSeats = new HashMap<>();
        vraSeats.put(6, 2000); vraSeats.put(7, 5500); vraSeats.put(8, 2500);

        EnsembleSplits md = new EnsembleSplits();
        md.setState(State.MD);
        md.setDistrictPlans(10000);
        md.setPopEqThresholdPercent(1.0);
        md.setEnsembles(Map.of(EnsembleType.RB, rbData, EnsembleType.VRA, vraData));
        md.setSeatOutcomes(Map.of(EnsembleType.RB, rbSeats, EnsembleType.VRA, vraSeats));

        ensembleSplitsRepo.save(md);
    }

    private void seedGinglesSummaries() {
        ginglesSummaryRepo.deleteAll();

        GinglesSummary mdRB = new GinglesSummary();
        mdRB.setState(State.MD);
        mdRB.setEnsembleType(EnsembleType.RB);
        mdRB.setDataPoints(Arrays.asList(
            new GinglesDataPoint("Black", 4, 101, 62.5, 18.0, 78.0),
            new GinglesDataPoint("Black", 4, 102, 55.3, 22.0, 74.0),
            new GinglesDataPoint("Hispanic", 8, 201, 38.1, 35.0, 61.0)
        ));
        mdRB.setNumMajorityMinorityDistricts(3);
        mdRB.setCohesion(0.82);
        mdRB.setBlocVoting(0.74);
        mdRB.setCompactness(0.61);
        mdRB.setVraIssueFlagged(false);

        GinglesSummary msRB = new GinglesSummary();
        msRB.setState(State.MS);
        msRB.setEnsembleType(EnsembleType.RB);
        msRB.setDataPoints(List.of(
            new GinglesDataPoint("Black", 2, 301, 68.2, 12.0, 85.0)
        ));
        msRB.setNumMajorityMinorityDistricts(1);
        msRB.setCohesion(0.91);
        msRB.setBlocVoting(0.88);
        msRB.setCompactness(0.55);
        msRB.setVraIssueFlagged(true);

        ginglesSummaryRepo.saveAll(Arrays.asList(mdRB, msRB));
    }

    private void seedGinglesTables() {
        ginglesTableRepo.deleteAll();

        GinglesTable md = new GinglesTable();
        md.setState(State.MD);
        md.setRows(Arrays.asList(
            new cse416.yankees.data.ginglestable.TableRow(4, 62, 0.82, 0.74, 0.61, true),
            new cse416.yankees.data.ginglestable.TableRow(8, 38, 0.65, 0.55, 0.70, false)
        ));

        GinglesTable ms = new GinglesTable();
        ms.setState(State.MS);
        ms.setRows(List.of(
            new cse416.yankees.data.ginglestable.TableRow(2, 68, 0.91, 0.88, 0.55, true)
        ));

        ginglesTableRepo.saveAll(Arrays.asList(md, ms));
    }

    private void seedOpportunityDistricts() {
        opportunityDistrictsRepo.deleteAll();

        opportunityDistrictsRepo.saveAll(Arrays.asList(
            buildOpportunityDistricts(State.MD, EnsembleType.RB, Map.of(2, 1200, 3, 5400, 4, 3400)),
            buildOpportunityDistricts(State.MD, EnsembleType.VRA, Map.of(3, 4200, 4, 4800, 5, 1000)),
            buildOpportunityDistricts(State.MS, EnsembleType.RB, Map.of(1, 6200, 2, 3800))
        ));
    }

    private OpportunityDistricts buildOpportunityDistricts(State state, EnsembleType type, Map<Integer, Integer> plans) {
        OpportunityDistricts od = new OpportunityDistricts();
        od.setState(state);
        od.setEnsembleType(type);
        od.setOpportunityDistrictsToPlans(plans);
        return od;
    }

    private void seedPartySeatShare() {
        partySeatShareRepo.deleteAll();

        partySeatShareRepo.saveAll(Arrays.asList(
            buildPartySeatShare(State.MD, EnsembleType.RB, Map.of(1, 2200, 2, 5800, 3, 2000)),
            buildPartySeatShare(State.MD, EnsembleType.VRA, Map.of(1, 3000, 2, 5000, 3, 2000)),
            buildPartySeatShare(State.MS, EnsembleType.RB, Map.of(2, 1500, 3, 5500, 4, 3000))
        ));
    }

    private PartySeatShare buildPartySeatShare(State state, EnsembleType type, Map<Integer, Integer> plans) {
        PartySeatShare pss = new PartySeatShare();
        pss.setState(state);
        pss.setEnsembleType(type);
        pss.setRepublicanSeatsToPlans(plans);
        return pss;
    }

    private void seedVoteShareSeatShare() {
        voteShareSeatShareRepo.deleteAll();

        voteShareSeatShareRepo.saveAll(Arrays.asList(
            buildVoteShareSeatShare(State.MD, EnsembleType.RB, Map.of(45, 0.125, 50, 0.375, 55, 0.750, 60, 0.875)),
            buildVoteShareSeatShare(State.MD, EnsembleType.VRA, Map.of(45, 0.125, 50, 0.500, 55, 0.750, 60, 1.0)),
            buildVoteShareSeatShare(State.MS, EnsembleType.RB, Map.of(40, 0.25, 50, 0.50, 55, 0.75))
        ));
    }

    private VoteShareSeatShare buildVoteShareSeatShare(State state, EnsembleType type, Map<Integer, Double> data) {
        VoteShareSeatShare vsss = new VoteShareSeatShare();
        vsss.setState(state);
        vsss.setEnsembleType(type);
        vsss.setVoteShareToSeatShare(data);
        return vsss;
    }
}
