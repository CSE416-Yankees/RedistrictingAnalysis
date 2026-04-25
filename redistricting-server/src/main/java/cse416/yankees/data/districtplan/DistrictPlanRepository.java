package cse416.yankees.data.districtplan;

import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface DistrictPlanRepository extends MongoRepository<DistrictPlan, String> {
    Optional<DistrictPlan> findByStateAbbr(String abbr);
}
