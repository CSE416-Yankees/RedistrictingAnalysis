package cse416.yankees.config;

import cse416.yankees.common.EnsembleType;
import cse416.yankees.common.State;
import cse416.yankees.data.boxwhisker.BoxWhisker;
import cse416.yankees.data.boxwhisker.BoxWhiskerRepository;
import cse416.yankees.data.boxwhisker.DistrictBox;
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
import cse416.yankees.data.opportunitydistricts.OpportunityDistricts;
import cse416.yankees.data.opportunitydistricts.OpportunityDistrictsRepository;
import cse416.yankees.data.partyseatshare.PartySeatShare;
import cse416.yankees.data.partyseatshare.PartySeatShareRepository;
import cse416.yankees.data.summary.Representative;
import cse416.yankees.data.summary.StateSummary;
import cse416.yankees.data.summary.StateSummaryRepository;
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

        StateSummary mdRB = new StateSummary();
        mdRB.setState(State.MD);
        mdRB.setEnsembleType(EnsembleType.RB);
        mdRB.setPopulation(6177224);
        mdRB.setNumCongressionalDistricts(8);
        mdRB.setAvgMinorityPercent(42.3);
        mdRB.setAvgDemVotePercent(55.1);
        mdRB.setOpportunityDistricts(3);
        mdRB.setPreclearance(false);
        mdRB.setRepresentativesByParty(Map.of("Democrat", 7, "Republican", 1));
        mdRB.setRedistrictingPartyControl("Democrat");
        mdRB.setDemVoterDistribution(60);
        mdRB.setRepVoterDistribution(40);
        mdRB.setRepresentatives(Arrays.asList(
            new Representative(State.MD, 1, "Andy Harris", "Republican", "White", 65, 30, 65),
            new Representative(State.MD, 4, "Glenn Ivey", "Democrat", "Black", 70, 70, 25)
        ));

        StateSummary mdVRA = new StateSummary();
        mdVRA.setState(State.MD);
        mdVRA.setEnsembleType(EnsembleType.VRA);
        mdVRA.setPopulation(6177224);
        mdVRA.setNumCongressionalDistricts(8);
        mdVRA.setAvgMinorityPercent(44.1);
        mdVRA.setAvgDemVotePercent(56.3);
        mdVRA.setOpportunityDistricts(4);
        mdVRA.setPreclearance(false);
        mdVRA.setRepresentativesByParty(Map.of("Democrat", 7, "Republican", 1));
        mdVRA.setRedistrictingPartyControl("Democrat");
        mdVRA.setDemVoterDistribution(62);
        mdVRA.setRepVoterDistribution(38);
        mdVRA.setRepresentatives(List.of(
            new Representative(State.MD, 1, "Andy Harris", "Republican", "White", 65, 30, 65)
        ));

        StateSummary msRB = new StateSummary();
        msRB.setState(State.MS);
        msRB.setEnsembleType(EnsembleType.RB);
        msRB.setPopulation(2976149);
        msRB.setNumCongressionalDistricts(4);
        msRB.setAvgMinorityPercent(37.8);
        msRB.setAvgDemVotePercent(40.2);
        msRB.setOpportunityDistricts(1);
        msRB.setPreclearance(true);
        msRB.setRepresentativesByParty(Map.of("Democrat", 1, "Republican", 3));
        msRB.setRedistrictingPartyControl("Republican");
        msRB.setDemVoterDistribution(40);
        msRB.setRepVoterDistribution(60);
        msRB.setRepresentatives(List.of(
            new Representative(State.MS, 2, "Bennie Thompson", "Democrat", "Black", 67, 67, 30)
        ));

        stateSummaryRepo.saveAll(Arrays.asList(mdRB, mdVRA, msRB));
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
