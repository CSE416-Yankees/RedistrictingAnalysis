package cse416.yankees.data.minorityeffectiveness;

import cse416.yankees.common.State;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface MinorityEffectivenessRepository extends MongoRepository<MinorityEffectiveness, String> {
    Optional<MinorityEffectiveness> findByState(State state);
}
