package cse416.yankees.data.districtplan;

import cse416.yankees.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class DistrictPlanService {

    private final DistrictPlanRepository repository;

    public DistrictPlanService(DistrictPlanRepository repository) {
        this.repository = repository;
    }

    public DistrictPlan get(String abbr) {
        return repository.findByStateAbbr(abbr)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "DistrictPlan not found for state=" + abbr));
    }
}
