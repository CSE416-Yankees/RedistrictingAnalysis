package cse416.yankees.config;

import com.mongodb.lang.NonNull;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.mongodb.MongoDatabaseFactory;
import org.springframework.data.mongodb.core.convert.DbRefResolver;
import org.springframework.data.mongodb.core.convert.DefaultDbRefResolver;
import org.springframework.data.mongodb.core.convert.DefaultMongoTypeMapper;
import org.springframework.data.mongodb.core.convert.MappingMongoConverter;
import org.springframework.data.mongodb.core.mapping.MongoMappingContext;

@Configuration
public class MongoConfig {

    /**
     * Disable the _class discriminator field that Spring Data MongoDB writes and
     * queries by default. Our documents have a fixed schema with no polymorphism,
     * so the discriminator is unnecessary and breaks queries against data inserted
     * outside of Spring (e.g. seed scripts).
     */
    @Bean
    public MappingMongoConverter mappingMongoConverter(
            @NonNull MongoDatabaseFactory factory,
            @NonNull MongoMappingContext context) {
        DbRefResolver resolver = new DefaultDbRefResolver(factory);
        MappingMongoConverter converter = new MappingMongoConverter(resolver, context);
        converter.setTypeMapper(new DefaultMongoTypeMapper(null));
        return converter;
    }
}
