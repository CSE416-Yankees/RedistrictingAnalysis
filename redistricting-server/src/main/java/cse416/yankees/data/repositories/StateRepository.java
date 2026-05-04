package cse416.yankees.data.repositories;

import cse416.yankees.common.State;
import cse416.yankees.data.models.RepresentationTable;
import cse416.yankees.data.models.StateSummary;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Repository;

@Repository
public class StateRepository {

    @Autowired
    private MongoTemplate mongoTemplate;

    public StateSummary findStateSummary(State state) {
        Query query = Query.query(Criteria.where("abbr").is(state));
        return mongoTemplate.findOne(query, StateSummary.class);
    }

    public RepresentationTable findRepresentationTable(State state) {
        Query query = Query.query(Criteria.where("state").is(state));
        return mongoTemplate.findOne(query, RepresentationTable.class);
    }
}
