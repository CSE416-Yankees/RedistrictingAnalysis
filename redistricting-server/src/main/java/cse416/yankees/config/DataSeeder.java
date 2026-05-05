package cse416.yankees.config;

import cse416.yankees.common.EnsembleType;
import cse416.yankees.common.Group;
import cse416.yankees.common.Party;
import cse416.yankees.common.State;
import cse416.yankees.data.models.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Seeds MongoDB with sample GUI payload documents when the seed profile is active.
 */
@Component
@Profile("seed")
public class DataSeeder implements CommandLineRunner {

    @Autowired
    private MongoTemplate mongoTemplate;

    @Override
    public void run(String... args) {
        seedStateSummaries();
        seedRepresentationTables();
        seedDistrictPlans();
        seedDemographicHeatMaps();
        seedPlanComparisons();
        seedGinglesAnalyses();
        seedGinglesPrecinctTables();
        seedEICandidateResults();
        seedEnsembleSplits();
        seedBoxWhiskers();
        seedVRAImpactTables();
        seedMinorityEffectiveness();
        seedMinorityEffectivenessHistograms();
        System.out.println("Seed complete.");
    }

    // ─── StateSummary ────────────────────────────────────────────────────────

    private void seedStateSummaries() {
        mongoTemplate.dropCollection(StateSummary.class);

        EnsembleSummaryData mdRB = new EnsembleSummaryData();
        mdRB.setPlanCount(5000);
        mdRB.setPopulationEqualityThresholdPct(1.0);
        mdRB.setRoughProportionality(Map.of(Group.Black, 0.74, Group.Hispanic, 0.40, Group.Asian, 0.29));

        EnsembleSummaryData mdVRA = new EnsembleSummaryData();
        mdVRA.setPlanCount(5000);
        mdVRA.setPopulationEqualityThresholdPct(1.0);
        mdVRA.setRoughProportionality(Map.of(Group.Black, 0.93, Group.Hispanic, 0.61, Group.Asian, 0.38));

        StateSummary md = new StateSummary();
        md.setAbbr(State.MD);
        md.setName("Maryland");
        md.setPopulation(6177224);
        md.setStatewideVote(vote(0.62));
        md.setDemographicSummaries(Arrays.asList(
            demSummary(Group.Black, 0.29, 0.27),
            demSummary(Group.Hispanic, 0.12, 0.10),
            demSummary(Group.Asian, 0.08, 0.07)
        ));
        md.setRedistrictingControl("Democrat");
        md.setRepresentationSummary(repSummary(7));
        md.setEnsembleSummaries(Map.of("RB", mdRB, "VRA", mdVRA));

        EnsembleSummaryData msRB = new EnsembleSummaryData();
        msRB.setPlanCount(5000);
        msRB.setPopulationEqualityThresholdPct(1.0);
        msRB.setRoughProportionality(Map.of(Group.Black, 0.25));

        EnsembleSummaryData msVRA = new EnsembleSummaryData();
        msVRA.setPlanCount(5000);
        msVRA.setPopulationEqualityThresholdPct(1.0);
        msVRA.setRoughProportionality(Map.of(Group.Black, 0.88));

        StateSummary ms = new StateSummary();
        ms.setAbbr(State.MS);
        ms.setName("Mississippi");
        ms.setPopulation(2976149);
        ms.setStatewideVote(vote(0.38));
        ms.setDemographicSummaries(List.of(
            demSummary(Group.Black, 0.38, 0.35)
        ));
        ms.setRedistrictingControl("Republican");
        ms.setRepresentationSummary(repSummary(1));
        ms.setEnsembleSummaries(Map.of("RB", msRB, "VRA", msVRA));

        mongoTemplate.save(md);
        mongoTemplate.save(ms);
    }

    private StatewideVote vote(double demPct) {
        StatewideVote v = new StatewideVote();
        v.setDemPct(demPct);
        return v;
    }

    private DemographicSummaryEntry demSummary(Group group, double popPct, double cvapPct) {
        DemographicSummaryEntry e = new DemographicSummaryEntry();
        e.setGroup(group);
        e.setPopulationPct(popPct);
        e.setCvapPct(cvapPct);
        return e;
    }

    private RepresentationSummary repSummary(int demSeats) {
        RepresentationSummary r = new RepresentationSummary();
        r.setDemSeats(demSeats);
        return r;
    }

    // ─── RepresentationTable ─────────────────────────────────────────────────

    private void seedRepresentationTables() {
        mongoTemplate.dropCollection(RepresentationTable.class);

        RepresentationTable md = new RepresentationTable();
        md.setState(State.MD);
        md.setDistrictRows(Arrays.asList(
            repRow(1, "Andy Harris",      Party.Republican, Group.White,    35.0, 0.42, 0.38),
            repRow(2, "Dutch Ruppersberger", Party.Democrat, Group.White,   28.0, 0.81, 0.76),
            repRow(3, "John Sarbanes",    Party.Democrat, Group.White,      31.0, 0.79, 0.74),
            repRow(4, "Glenn Ivey",       Party.Democrat, Group.Black,      44.0, 0.92, 0.88),
            repRow(5, "Steny Hoyer",      Party.Democrat, Group.White,      22.0, 0.76, 0.71),
            repRow(6, "David Trone",      Party.Democrat, Group.White,      18.0, 0.73, 0.68),
            repRow(7, "Kweisi Mfume",     Party.Democrat, Group.Black,      55.0, 0.95, 0.91),
            repRow(8, "Jamie Raskin",     Party.Democrat, Group.White,      40.0, 0.85, 0.81)
        ));

        RepresentationTable ms = new RepresentationTable();
        ms.setState(State.MS);
        ms.setDistrictRows(Arrays.asList(
            repRow(1, "Trent Kelly",      Party.Republican, Group.White,    38.0, 0.35, 0.31),
            repRow(2, "Bennie Thompson",  Party.Democrat,   Group.Black,    25.0, 0.88, 0.84),
            repRow(3, "Michael Guest",    Party.Republican, Group.White,    42.0, 0.32, 0.28),
            repRow(4, "Mike Ezell",       Party.Republican, Group.White,    45.0, 0.30, 0.26)
        ));

        mongoTemplate.save(md);
        mongoTemplate.save(ms);
    }

    private RepresentativeRow repRow(int district, String name, Party party, Group group,
                                      double voteMargin, double effectiveness, double calibrated) {
        RepresentativeRow r = new RepresentativeRow();
        r.setDistrictNumber(district);
        r.setRepresentative(name);
        r.setParty(party);
        r.setRepresentativeGroup(group);
        r.setVoteMarginPct(voteMargin);
        r.setEffectivenessScore(effectiveness);
        r.setCalibratedEffectivenessScore(calibrated);
        return r;
    }

    // ─── DistrictPlan ────────────────────────────────────────────────────────

    private void seedDistrictPlans() {
        mongoTemplate.dropCollection(DistrictPlan.class);

        StateDisplay mdDisplay = new StateDisplay();
        mdDisplay.setAbbr(State.MD);
        mdDisplay.setName("Maryland");
        mdDisplay.setCenter(new double[]{-76.7, 39.0});
        mdDisplay.setZoom(7);

        CurrentPlan mdPlan = new CurrentPlan();
        mdPlan.setPrecinctToDistrict(new HashMap<>(Map.of(
            "240010001", 1, "240010002", 1, "240030014", 1,
            "240050011", 2, "240050012", 2
        )));
        mdPlan.setDistricts(Arrays.asList(
            districtInfo(1, List.of("240010001", "240010002", "240030014"), 30.2, 65.1, 22.4),
            districtInfo(2, List.of("240050011", "240050012"), 58.8, 39.0, 41.7)
        ));

        DistrictPlan md = new DistrictPlan();
        md.setState(mdDisplay);
        md.setCurrentPlan(mdPlan);

        StateDisplay msDisplay = new StateDisplay();
        msDisplay.setAbbr(State.MS);
        msDisplay.setName("Mississippi");
        msDisplay.setCenter(new double[]{-89.7, 32.7});
        msDisplay.setZoom(7);

        CurrentPlan msPlan = new CurrentPlan();
        msPlan.setPrecinctToDistrict(new HashMap<>(Map.of(
            "280010001", 1, "280010002", 2
        )));
        msPlan.setDistricts(Arrays.asList(
            districtInfo(1, List.of("280010001"), 42.1, 55.8, 18.3),
            districtInfo(2, List.of("280010002"), 67.4, 30.1, 63.5)
        ));

        DistrictPlan ms = new DistrictPlan();
        ms.setState(msDisplay);
        ms.setCurrentPlan(msPlan);

        mongoTemplate.save(md);
        mongoTemplate.save(ms);
    }

    private DistrictInfo districtInfo(int number, List<String> precincts,
                                       double dem, double rep, double minority) {
        DistrictInfo d = new DistrictInfo();
        d.setDistrictNumber(number);
        d.setPrecinctIds(precincts);
        d.setDemVotePct(dem);
        d.setRepVotePct(rep);
        d.setMinorityPct(minority);
        return d;
    }

    // ─── DemographicHeatMap ──────────────────────────────────────────────────

    private void seedDemographicHeatMaps() {
        mongoTemplate.dropCollection(DemographicHeatMap.class);

        mongoTemplate.save(heatMap(State.MD, Group.Black,
            Arrays.asList(bin(0, 0, 9, "#f7fbff"), bin(1, 10, 19, "#deebf7"),
                          bin(2, 20, 29, "#c6dbef"), bin(3, 30, 39, "#9ecae1"),
                          bin(4, 40, 49, "#6baed6")),
            Map.of("240010001", 1, "240010002", 3, "240010003", 0, "240010004", 4)));

        mongoTemplate.save(heatMap(State.MD, Group.Hispanic,
            Arrays.asList(bin(0, 0, 9, "#fff5eb"), bin(1, 10, 19, "#fee6ce"),
                          bin(2, 20, 29, "#fdd0a2")),
            Map.of("240010001", 0, "240010002", 1, "240010003", 0, "240010004", 2)));

        mongoTemplate.save(heatMap(State.MD, Group.Asian,
            Arrays.asList(bin(0, 0, 9, "#f7fcf5"), bin(1, 10, 19, "#e5f5e0"),
                          bin(2, 20, 29, "#c7e9c0")),
            Map.of("240010001", 0, "240010002", 0, "240010003", 1, "240010004", 2)));

        mongoTemplate.save(heatMap(State.MS, Group.Black,
            Arrays.asList(bin(0, 0, 9, "#f7fbff"), bin(1, 10, 19, "#deebf7"),
                          bin(2, 20, 29, "#c6dbef"), bin(3, 30, 39, "#9ecae1"),
                          bin(4, 40, 49, "#6baed6"), bin(5, 50, 59, "#4292c6"),
                          bin(6, 60, 69, "#2171b5")),
            Map.of("280010001", 2, "280010002", 5, "280010003", 6, "280010004", 1)));
    }

    private DemographicHeatMap heatMap(State state, Group group, List<HeatMapBin> bins,
                                        Map<String, Integer> precinctBins) {
        DemographicHeatMap hm = new DemographicHeatMap();
        hm.setState(state);
        hm.setGroup(group);
        hm.setBins(bins);
        hm.setPrecinctBins(new HashMap<>(precinctBins));
        return hm;
    }

    private HeatMapBin bin(int bin, int min, int max, String color) {
        HeatMapBin b = new HeatMapBin();
        b.setBin(bin);
        b.setMinPct(min);
        b.setMaxPct(max);
        b.setColor(color);
        return b;
    }

    // ─── PlanComparison ──────────────────────────────────────────────────────

    private void seedPlanComparisons() {
        mongoTemplate.dropCollection(PlanComparison.class);

        PlanMapping enacted = new PlanMapping();
        enacted.setPrecinctToDistrict(new HashMap<>(Map.of(
            "240010001", 1, "240010002", 1, "240010003", 2, "240010004", 2
        )));

        PlanMapping interestingMax = new PlanMapping();
        interestingMax.setPrecinctToDistrict(new HashMap<>(Map.of(
            "240010001", 1, "240010002", 2, "240010003", 2, "240010004", 3
        )));

        PlanComparison md = new PlanComparison();
        md.setState(State.MD);
        md.setPlans(Map.of("enacted", enacted, "interestingMax", interestingMax));

        PlanMapping msEnacted = new PlanMapping();
        msEnacted.setPrecinctToDistrict(new HashMap<>(Map.of(
            "280010001", 1, "280010002", 2
        )));

        PlanComparison ms = new PlanComparison();
        ms.setState(State.MS);
        ms.setPlans(Map.of("enacted", msEnacted));

        mongoTemplate.save(md);
        mongoTemplate.save(ms);
    }

    // ─── GinglesAnalysis ─────────────────────────────────────────────────────

    private void seedGinglesAnalyses() {
        mongoTemplate.dropCollection(GinglesAnalysis.class);

        GinglesGroup mdBlack = new GinglesGroup();
        mdBlack.setPoints(Arrays.asList(gpt(0.62, 0.78), gpt(0.55, 0.72), gpt(0.71, 0.81)));
        GinglesRegression mdBlackReg = new GinglesRegression();
        mdBlackReg.setDem(Arrays.asList(gpt(0.0, 0.35), gpt(0.5, 0.65), gpt(1.0, 0.90)));
        mdBlackReg.setRep(Arrays.asList(gpt(0.0, 0.65), gpt(0.5, 0.35), gpt(1.0, 0.10)));
        mdBlack.setRegression(mdBlackReg);

        GinglesGroup mdHispanic = new GinglesGroup();
        mdHispanic.setPoints(Arrays.asList(gpt(0.38, 0.61), gpt(0.45, 0.66)));
        GinglesRegression mdHispanicReg = new GinglesRegression();
        mdHispanicReg.setDem(Arrays.asList(gpt(0.0, 0.30), gpt(0.5, 0.58), gpt(1.0, 0.85)));
        mdHispanicReg.setRep(Arrays.asList(gpt(0.0, 0.70), gpt(0.5, 0.42), gpt(1.0, 0.15)));
        mdHispanic.setRegression(mdHispanicReg);

        GinglesAnalysis md = new GinglesAnalysis();
        md.setState(State.MD);
        md.setGroups(Map.of(Group.Black, mdBlack, Group.Hispanic, mdHispanic));

        GinglesGroup msBlack = new GinglesGroup();
        msBlack.setPoints(Arrays.asList(gpt(0.68, 0.85), gpt(0.72, 0.88)));
        GinglesRegression msBlackReg = new GinglesRegression();
        msBlackReg.setDem(Arrays.asList(gpt(0.0, 0.25), gpt(0.5, 0.62), gpt(1.0, 0.92)));
        msBlackReg.setRep(Arrays.asList(gpt(0.0, 0.75), gpt(0.5, 0.38), gpt(1.0, 0.08)));
        msBlack.setRegression(msBlackReg);

        GinglesAnalysis ms = new GinglesAnalysis();
        ms.setState(State.MS);
        ms.setGroups(Map.of(Group.Black, msBlack));

        mongoTemplate.save(md);
        mongoTemplate.save(ms);
    }

    private GinglesPoint gpt(double x, double y) {
        GinglesPoint p = new GinglesPoint();
        p.setX(x);
        p.setY(y);
        return p;
    }

    // ─── GinglesPrecinctTable ────────────────────────────────────────────────

    private void seedGinglesPrecinctTables() {
        mongoTemplate.dropCollection(GinglesPrecinctTable.class);

        GinglesPrecinctTable md = new GinglesPrecinctTable();
        md.setState(State.MD);
        md.setRows(Arrays.asList(
            precinctRow("240010001", "Precinct 1", 5230, 2145, 1320, 2875),
            precinctRow("240010002", "Precinct 2", 4810, 1730, 1540, 2410),
            precinctRow("240030014", "Precinct 3", 3920, 2610, 880,  2890)
        ));

        GinglesPrecinctTable ms = new GinglesPrecinctTable();
        ms.setState(State.MS);
        ms.setRows(Arrays.asList(
            precinctRow("280010001", "Precinct 1", 6100, 1210, 3200, 2700),
            precinctRow("280010002", "Precinct 2", 5400, 3510, 1100, 4100)
        ));

        mongoTemplate.save(md);
        mongoTemplate.save(ms);
    }

    private GinglesPrecinctRow precinctRow(String id, String name, int total, int minority,
                                            int rep, int dem) {
        GinglesPrecinctRow r = new GinglesPrecinctRow();
        r.setPrecinctId(id);
        r.setPrecinctName(name);
        r.setTotalPopulation(total);
        r.setMinorityPopulation(minority);
        r.setRepublicanVotes(rep);
        r.setDemocraticVotes(dem);
        return r;
    }

    // ─── EICandidateResults ──────────────────────────────────────────────────

    private void seedEICandidateResults() {
        mongoTemplate.dropCollection(EICandidateResults.class);

        CandidateData candidate1 = new CandidateData();
        candidate1.setCurves(Map.of(
            Group.Asian, Arrays.asList(xy(0.60, 0.4), xy(0.70, 2.8), xy(0.80, 4.2)),
            Group.Black, Arrays.asList(xy(0.45, 0.8), xy(0.55, 2.1), xy(0.65, 3.7)),
            Group.Hispanic, Arrays.asList(xy(0.35, 0.9), xy(0.45, 2.7), xy(0.55, 3.1))
        ));
        candidate1.setOverlapPct(Map.of(
            Group.Asian, Map.of(Group.Black, 0.11, Group.Hispanic, 0.08),
            Group.Black, Map.of(Group.Asian, 0.11, Group.Hispanic, 0.19),
            Group.Hispanic, Map.of(Group.Asian, 0.08, Group.Black, 0.19)
        ));

        CandidateData candidate2 = new CandidateData();
        candidate2.setCurves(Map.of(
            Group.Asian, Arrays.asList(xy(0.10, 0.4), xy(0.20, 1.8), xy(0.30, 3.2)),
            Group.Black, Arrays.asList(xy(0.30, 0.6), xy(0.40, 2.0), xy(0.50, 3.9))
        ));
        candidate2.setOverlapPct(Map.of(
            Group.Asian, Map.of(Group.Black, 0.14),
            Group.Black, Map.of(Group.Asian, 0.14)
        ));

        EICandidateResults md = new EICandidateResults();
        md.setState(State.MD);
        md.setCandidateResults(Map.of("Candidate1", candidate1, "Candidate2", candidate2));

        EICandidateResults ms = new EICandidateResults();
        ms.setState(State.MS);
        CandidateData msCandidate1 = new CandidateData();
        msCandidate1.setCurves(Map.of(
            Group.Black, Arrays.asList(xy(0.55, 1.2), xy(0.65, 3.4), xy(0.75, 4.8))
        ));
        msCandidate1.setOverlapPct(Map.of());
        ms.setCandidateResults(Map.of("Candidate1", msCandidate1));

        mongoTemplate.save(md);
        mongoTemplate.save(ms);
    }

    private XYPoint xy(double x, double y) {
        XYPoint p = new XYPoint();
        p.setX(x);
        p.setY(y);
        return p;
    }

    // ─── EnsembleSplits ──────────────────────────────────────────────────────

    private void seedEnsembleSplits() {
        mongoTemplate.dropCollection(EnsembleSplits.class);

        EnsembleSplits md = new EnsembleSplits();
        md.setState(State.MD);
        md.setDistrictCount(8);
        md.setSplits(Arrays.asList(
            splitRow(0, 8, 12,  3),
            splitRow(1, 7, 184, 96),
            splitRow(2, 6, 921, 811),
            splitRow(3, 5, 403, 557),
            splitRow(4, 4, 27,  41),
            splitRow(5, 3, 6,   2)
        ));

        EnsembleSplits ms = new EnsembleSplits();
        ms.setState(State.MS);
        ms.setDistrictCount(4);
        ms.setSplits(Arrays.asList(
            splitRow(1, 3, 420,  180),
            splitRow(2, 2, 3200, 2800),
            splitRow(3, 1, 1380, 2020)
        ));

        mongoTemplate.save(md);
        mongoTemplate.save(ms);
    }

    private SplitRow splitRow(int rep, int dem, int rb, int vra) {
        SplitRow r = new SplitRow();
        r.setRepWins(rep);
        r.setDemWins(dem);
        r.setRbFrequency(rb);
        r.setVraFrequency(vra);
        return r;
    }

    // ─── BoxWhisker ──────────────────────────────────────────────────────────

    private void seedBoxWhiskers() {
        mongoTemplate.dropCollection(BoxWhisker.class);

        BoxWhisker md = new BoxWhisker();
        md.setState(State.MD);
        md.setEnsembles(Map.of(
            EnsembleType.RB, bwEnsemble(Map.of(
                Group.Black, bwGroupData(Arrays.asList(
                    bwBin(1, 5.2,  8.1,  12.3, 18.4, 28.0, 14.2, 15.0),
                    bwBin(2, 10.0, 14.5, 19.2, 24.0, 32.5, 20.1, 21.0),
                    bwBin(3, 45.0, 52.0, 58.5, 63.0, 71.0, 60.1, 62.0)
                )),
                Group.Hispanic, bwGroupData(List.of(
                    bwBin(1, 2.1, 4.0, 6.5, 9.0, 14.0, 7.2, 7.5)
                )),
                Group.Asian, bwGroupData(List.of(
                    bwBin(1, 1.0, 2.5, 4.0, 6.0, 9.5, 4.8, 5.0)
                ))
            )),
            EnsembleType.VRA, bwEnsemble(Map.of(
                Group.Black, bwGroupData(Arrays.asList(
                    bwBin(1, 12.0, 18.0, 24.0, 30.0, 37.0, 22.0, 25.0),
                    bwBin(2, 15.0, 21.0, 26.0, 31.0, 40.0, 24.0, 28.0)
                )),
                Group.Hispanic, bwGroupData(List.of(
                    bwBin(1, 3.0, 5.5, 8.0, 11.0, 16.0, 9.0, 9.5)
                )),
                Group.Asian, bwGroupData(List.of(
                    bwBin(1, 2.0, 4.0, 6.5, 8.5, 12.0, 7.0, 7.5)
                ))
            ))
        ));

        BoxWhisker ms = new BoxWhisker();
        ms.setState(State.MS);
        ms.setEnsembles(Map.of(
            EnsembleType.RB, bwEnsemble(Map.of(
                Group.Black, bwGroupData(List.of(
                    bwBin(1, 52.0, 58.0, 63.5, 68.0, 74.0, 64.1, 65.0)
                ))
            )),
            EnsembleType.VRA, bwEnsemble(Map.of(
                Group.Black, bwGroupData(List.of(
                    bwBin(1, 58.0, 63.0, 68.0, 72.0, 78.0, 67.0, 70.0)
                ))
            ))
        ));

        mongoTemplate.save(md);
        mongoTemplate.save(ms);
    }

    private BoxWhiskerEnsemble bwEnsemble(Map<Group, BoxWhiskerGroupData> groups) {
        BoxWhiskerEnsemble e = new BoxWhiskerEnsemble();
        e.setGroups(groups);
        return e;
    }

    private BoxWhiskerGroupData bwGroupData(List<BoxWhiskerBin> bins) {
        BoxWhiskerGroupData g = new BoxWhiskerGroupData();
        g.setOrderedBins(bins);
        return g;
    }

    private BoxWhiskerBin bwBin(int order, double min, double q1, double median,
                                  double q3, double max, double enacted, double proposed) {
        BoxWhiskerBin b = new BoxWhiskerBin();
        b.setOrder(order);
        b.setMin(min);
        b.setQ1(q1);
        b.setMedian(median);
        b.setQ3(q3);
        b.setMax(max);
        b.setEnactedDot(enacted);
        b.setProposedDot(proposed);
        return b;
    }

    // ─── VRAImpactTable ──────────────────────────────────────────────────────

    private void seedVRAImpactTables() {
        mongoTemplate.dropCollection(VRAImpactTable.class);

        VRAImpactTable md = new VRAImpactTable();
        md.setState(State.MD);
        md.setRows(Arrays.asList(
            vraRow(Group.Black,    thresh(0.18, 0.74), thresh(0.11, 0.63), thresh(0.07, 0.58)),
            vraRow(Group.Hispanic, thresh(0.09, 0.41), thresh(0.05, 0.36), thresh(0.03, 0.29)),
            vraRow(Group.Asian,    thresh(0.02, 0.19), thresh(0.01, 0.14), thresh(0.00, 0.10))
        ));

        VRAImpactTable ms = new VRAImpactTable();
        ms.setState(State.MS);
        ms.setRows(List.of(
            vraRow(Group.Black, thresh(0.22, 0.81), thresh(0.14, 0.70), thresh(0.10, 0.64))
        ));

        mongoTemplate.save(md);
        mongoTemplate.save(ms);
    }

    private VRAImpactRow vraRow(Group group, ThresholdData enacted,
                                 ThresholdData roughProp, ThresholdData joint) {
        VRAImpactRow r = new VRAImpactRow();
        r.setGroup(group);
        r.setEnactedThreshold(enacted);
        r.setRoughProportionality(roughProp);
        r.setJointThreshold(joint);
        return r;
    }

    private ThresholdData thresh(double rb, double vra) {
        ThresholdData t = new ThresholdData();
        t.setRbPct(rb);
        t.setVraPct(vra);
        return t;
    }

    // ─── MinorityEffectiveness ───────────────────────────────────────────────

    private void seedMinorityEffectiveness() {
        mongoTemplate.dropCollection(MinorityEffectiveness.class);

        MinorityEffectiveness md = new MinorityEffectiveness();
        md.setState(State.MD);
        md.setGroups(Map.of(
            Group.Black, Map.of(
                EnsembleType.RB,  bs(0, 1, 2, 3, 4, 2),
                EnsembleType.VRA, bs(1, 2, 3, 4, 5, 3)
            ),
            Group.Hispanic, Map.of(
                EnsembleType.RB,  bs(0, 0, 1, 1, 2, 1),
                EnsembleType.VRA, bs(0, 1, 1, 2, 2, 1)
            ),
            Group.Asian, Map.of(
                EnsembleType.RB,  bs(0, 0, 0, 1, 1, 0),
                EnsembleType.VRA, bs(0, 0, 1, 1, 2, 1)
            )
        ));

        MinorityEffectiveness ms = new MinorityEffectiveness();
        ms.setState(State.MS);
        ms.setGroups(Map.of(
            Group.Black, Map.of(
                EnsembleType.RB,  bs(0, 1, 1, 2, 2, 1),
                EnsembleType.VRA, bs(1, 1, 2, 2, 3, 2)
            )
        ));

        mongoTemplate.save(md);
        mongoTemplate.save(ms);
    }

    private BoxStats bs(double min, double q1, double median, double q3, double max, double enacted) {
        BoxStats b = new BoxStats();
        b.setMin(min);
        b.setQ1(q1);
        b.setMedian(median);
        b.setQ3(q3);
        b.setMax(max);
        b.setEnacted(enacted);
        return b;
    }

    // ─── MinorityEffectivenessHistogram ──────────────────────────────────────

    private void seedMinorityEffectivenessHistograms() {
        mongoTemplate.dropCollection(MinorityEffectivenessHistogram.class);

        MinorityEffectivenessHistogram md = new MinorityEffectivenessHistogram();
        md.setState(State.MD);
        md.setDistrictCount(8);
        md.setGroupHistograms(Map.of(
            Group.Black, histGroup(Arrays.asList(
                hbin(0,  12,   0),
                hbin(1,  184,  41),
                hbin(2,  921,  388),
                hbin(3,  403,  977),
                hbin(4,  27,   594)
            )),
            Group.Hispanic, histGroup(Arrays.asList(
                hbin(0, 55,  9),
                hbin(1, 302, 144),
                hbin(2, 611, 703),
                hbin(3, 80,  290)
            )),
            Group.Asian, histGroup(Arrays.asList(
                hbin(0, 401, 120),
                hbin(1, 522, 640),
                hbin(2, 77,  240)
            ))
        ));

        MinorityEffectivenessHistogram ms = new MinorityEffectivenessHistogram();
        ms.setState(State.MS);
        ms.setDistrictCount(4);
        ms.setGroupHistograms(Map.of(
            Group.Black, histGroup(Arrays.asList(
                hbin(0, 120, 20),
                hbin(1, 3800, 2200),
                hbin(2, 6080, 7780)
            ))
        ));

        mongoTemplate.save(md);
        mongoTemplate.save(ms);
    }

    private MinorityHistogramGroup histGroup(List<HistogramBin> bins) {
        MinorityHistogramGroup g = new MinorityHistogramGroup();
        g.setBins(bins);
        return g;
    }

    private HistogramBin hbin(int effective, int rb, int vra) {
        HistogramBin b = new HistogramBin();
        b.setEffectiveDistricts(effective);
        b.setRbFrequency(rb);
        b.setVraFrequency(vra);
        return b;
    }
}
