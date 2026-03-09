package cse416.yankees.exception;

/**
 * Exception thrown when a requested resource cannot be found.
 *
 * In this project, it is mainly used when a state is not available
 * in the current data source (e.g., no JSON file or no database row).
 *
 * This exception is translated into an HTTP 404 response by the
 * {@link GlobalExceptionHandler}.
 */
public class ResourceNotFoundException extends RuntimeException {

    /**
     * Create a new exception with a human-readable message.
     *
     * @param message description of what was not found
     */
    public ResourceNotFoundException(String message) {
        super(message);
    }
}

