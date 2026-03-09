package cse416.yankees.repository;

import cse416.yankees.dto.state.StateSummaryResponse;
import cse416.yankees.exception.ResourceNotFoundException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Repository;

import java.io.IOException;
import java.io.InputStream;

/**
 * Repository implementation that reads state data from static JSON
 * files located under {@code src/main/resources/mock}.
 *
 * This class is intended as a clean stepping stone: it lets the
 * frontend talk to a real Spring Boot backend while the course team
 * is still preparing a database or more advanced data source.
 *
 * Later on, you can create a new implementation such as
 * {@code MongoStateDataRepository} that also implements
 * {@link StateDataRepository} and switch the Spring configuration
 * without changing the controller or service layers.
 */
@Repository
public class StaticJsonStateDataRepository implements StateDataRepository {

    private final ObjectMapper objectMapper;

    /**
     * Spring will automatically inject the shared {@link ObjectMapper}
     * instance that it uses for JSON serialization.
     *
     * @param objectMapper Jackson object mapper
     */
    public StaticJsonStateDataRepository(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    @Override
    public StateSummaryResponse getStateSummary(String abbr) {
        // Normalize to lowercase for folder naming (mock/states/md/summary.json).
        String lowerAbbr = abbr.toLowerCase();

        String resourcePath = String.format("mock/states/%s/summary.json", lowerAbbr);
        ClassPathResource resource = new ClassPathResource(resourcePath);

        if (!resource.exists()) {
            throw new ResourceNotFoundException(
                    "State summary not found for abbreviation: " + abbr.toUpperCase()
            );
        }

        try (InputStream inputStream = resource.getInputStream()) {
            return objectMapper.readValue(inputStream, StateSummaryResponse.class);
        } catch (IOException e) {
            // For a course project it is reasonable to treat IO issues as
            // an internal server error rather than exposing details.
            throw new IllegalStateException(
                    "Failed to load state summary JSON for abbreviation: " + abbr.toUpperCase(), e
            );
        }
    }
}

