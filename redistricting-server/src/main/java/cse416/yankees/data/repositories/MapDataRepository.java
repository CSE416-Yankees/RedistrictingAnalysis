package cse416.yankees.data.repositories;

import cse416.yankees.common.Group;
import cse416.yankees.common.State;
import cse416.yankees.data.models.DemographicHeatMap;
import cse416.yankees.data.models.DistrictPlan;
import cse416.yankees.data.models.PlanComparison;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Repository;

@Repository
public class MapDataRepository {

    @Autowired
    private MongoTemplate mongoTemplate;

    public DistrictPlan findDistrictPlan(State state) {
        Query query = Query.query(Criteria.where("state.abbr").is(state));
        return mongoTemplate.findOne(query, DistrictPlan.class);
    }

    public DemographicHeatMap findDemographicHeatMap(State state, Group group) {
        Query query = Query.query(Criteria.where("state").is(state).and("group").is(group));
        return mongoTemplate.findOne(query, DemographicHeatMap.class);
    }

    public PlanComparison findPlanComparison(State state) {
        Query query = Query.query(Criteria.where("state").is(state));
        return mongoTemplate.findOne(query, PlanComparison.class);
    }
}
