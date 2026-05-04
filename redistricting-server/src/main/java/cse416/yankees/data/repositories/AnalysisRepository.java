package cse416.yankees.data.repositories;

import cse416.yankees.common.State;
import cse416.yankees.data.models.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Repository;

@Repository
public class AnalysisRepository {

    @Autowired
    private MongoTemplate mongoTemplate;

    public GinglesAnalysis findGinglesAnalysis(State state) {
        Query query = Query.query(Criteria.where("state").is(state));
        return mongoTemplate.findOne(query, GinglesAnalysis.class);
    }

    public GinglesPrecinctTable findGinglesPrecinctTable(State state) {
        Query query = Query.query(Criteria.where("state").is(state));
        return mongoTemplate.findOne(query, GinglesPrecinctTable.class);
    }

    public EICandidateResults findEICandidateResults(State state) {
        Query query = Query.query(Criteria.where("state").is(state));
        return mongoTemplate.findOne(query, EICandidateResults.class);
    }

    public EnsembleSplits findEnsembleSplits(State state) {
        Query query = Query.query(Criteria.where("state").is(state));
        return mongoTemplate.findOne(query, EnsembleSplits.class);
    }

    public BoxWhisker findBoxWhisker(State state) {
        Query query = Query.query(Criteria.where("state").is(state));
        return mongoTemplate.findOne(query, BoxWhisker.class);
    }

    public VRAImpactTable findVRAImpactTable(State state) {
        Query query = Query.query(Criteria.where("state").is(state));
        return mongoTemplate.findOne(query, VRAImpactTable.class);
    }

    public MinorityEffectiveness findMinorityEffectiveness(State state) {
        Query query = Query.query(Criteria.where("state").is(state));
        return mongoTemplate.findOne(query, MinorityEffectiveness.class);
    }

    public MinorityEffectivenessHistogram findMinorityEffectivenessHistogram(State state) {
        Query query = Query.query(Criteria.where("state").is(state));
        return mongoTemplate.findOne(query, MinorityEffectivenessHistogram.class);
    }
}
