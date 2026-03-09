package cse416.yankees.repository;

import cse416.yankees.dto.state.StateSummaryResponse;

/**
 * Abstraction over whatever data source the application uses
 * to provide state-level information (JSON files today, a database
 * such as MongoDB in the future).
 *
 * Controllers and services should depend on this interface rather
 * than on a specific implementation so that the underlying storage
 * can be swapped out later without changing the API layer.
 */
public interface StateDataRepository {

    /**
     * Look up the summary information for a single state.
     *
     * Implementations are expected to be case-insensitive with respect
     * to the state abbreviation and to throw a
     * {@link cse416.yankees.exception.ResourceNotFoundException}
     * when the state cannot be found.
     *
     * @param abbr two-letter state abbreviation (e.g., "MD")
     * @return summary DTO for the requested state
     */
    StateSummaryResponse getStateSummary(String abbr);
}

