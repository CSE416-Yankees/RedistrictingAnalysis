package cse416.yankees.data.ginglestable;

import cse416.yankees.common.State;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface GinglesTableRepository extends MongoRepository<GinglesTable, String> {
    Optional<GinglesTable> findByState(State state);
}
