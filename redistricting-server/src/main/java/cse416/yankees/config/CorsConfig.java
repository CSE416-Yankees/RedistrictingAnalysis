package cse416.yankees.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Global CORS configuration for the backend API.
 *
 * This configuration makes it possible for the React frontend
 * (running locally on Vite or deployed on GitHub Pages) to call
 * this Spring Boot server from a different origin.
 */
@Configuration
public class CorsConfig {

    /**
     * Configure CORS mappings for all API endpoints.
     *
     * Local Vite may run on any localhost port; GitHub Pages uses a fixed HTTPS origin.
     *
     * @return a {@link WebMvcConfigurer} with CORS rules applied
     */
    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/**")
                        .allowedOriginPatterns(
                                "http://localhost:*",
                                "https://cse416-yankees.github.io"
                        )
                        // Allow common HTTP methods for REST APIs.
                        .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                        // Allow all headers so the frontend can send JSON, auth, etc. later.
                        .allowedHeaders("*");
            }
        };
    }
}

