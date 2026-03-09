package cse416.yankees.service;

import cse416.yankees.dto.state.StateSummaryResponse;
import cse416.yankees.repository.StateDataRepository;
import org.springframework.stereotype.Service;

/**
 * Service layer that contains the business logic for fetching
 * state summary information.
 *
 * The controller calls this class, and this class in turn calls
 * the {@link StateDataRepository} abstraction. This keeps web
 * concerns separate from data access concerns.
 */
@Service
public class StateSummaryService {

    private final StateDataRepository stateDataRepository;

    public StateSummaryService(StateDataRepository stateDataRepository) {
        this.stateDataRepository = stateDataRepository;
    }

    /**
     * Fetch the summary information for a given state abbreviation.
     *
     * @param abbr two-letter state abbreviation from the client route param
     * @return a populated {@link StateSummaryResponse} DTO
     * @throws IllegalArgumentException if the abbreviation is missing or invalid
     */
    public StateSummaryResponse getStateSummary(String abbr) {
        if (abbr == null) {
            throw new IllegalArgumentException("State abbreviation must not be null.");
        }

        String trimmed = abbr.trim();
        if (trimmed.length() != 2) {
            throw new IllegalArgumentException("State abbreviation must be exactly 2 letters: " + abbr);
        }

        if (!trimmed.chars().allMatch(Character::isLetter)) {
            throw new IllegalArgumentException("State abbreviation must contain only letters: " + abbr);
        }

        // Normalize to uppercase for the domain model (e.g., "MD").
        String normalized = trimmed.toUpperCase();

        StateSummaryResponse response = stateDataRepository.getStateSummary(normalized);

        // Ensure the abbreviation field is always set in the response.
        if (response.getAbbr() == null || response.getAbbr().isBlank()) {
            response.setAbbr(normalized);
        }

        return response;
    }
}

