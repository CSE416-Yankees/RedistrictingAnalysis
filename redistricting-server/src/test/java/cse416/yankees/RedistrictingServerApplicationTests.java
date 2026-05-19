package cse416.yankees;

import com.mongodb.ClientSessionOptions;
import com.mongodb.client.ClientSession;
import com.mongodb.client.MongoDatabase;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.dao.DataAccessException;
import org.springframework.dao.support.PersistenceExceptionTranslator;
import org.springframework.data.mongodb.MongoDatabaseFactory;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.convert.MappingMongoConverter;
import org.springframework.data.mongodb.core.mapping.MongoMappingContext;

@SpringBootTest(properties = {
		"spring.autoconfigure.exclude="
				+ "org.springframework.boot.mongodb.autoconfigure.MongoAutoConfiguration,"
				+ "org.springframework.boot.data.mongodb.autoconfigure.DataMongoAutoConfiguration,"
				+ "org.springframework.boot.data.mongodb.autoconfigure.DataMongoRepositoriesAutoConfiguration"
})
class RedistrictingServerApplicationTests {

	@TestConfiguration
	static class MongoTestConfig {
		@Bean
		MongoDatabaseFactory mongoDatabaseFactory() {
			return new UnconnectedMongoDatabaseFactory();
		}

		@Bean
		MongoMappingContext mongoMappingContext() {
			return new MongoMappingContext();
		}

		@Bean
		MongoTemplate mongoTemplate(
				MongoDatabaseFactory mongoDatabaseFactory,
				MappingMongoConverter mappingMongoConverter) {
			return new MongoTemplate(mongoDatabaseFactory, mappingMongoConverter);
		}
	}

	static class UnconnectedMongoDatabaseFactory implements MongoDatabaseFactory {
		@Override
		public MongoDatabase getMongoDatabase() throws DataAccessException {
			throw new UnsupportedOperationException("MongoDB is not available in context-load tests.");
		}

		@Override
		public MongoDatabase getMongoDatabase(String dbName) throws DataAccessException {
			throw new UnsupportedOperationException("MongoDB is not available in context-load tests.");
		}

		@Override
		public PersistenceExceptionTranslator getExceptionTranslator() {
			return exception -> null;
		}

		@Override
		public ClientSession getSession(ClientSessionOptions options) {
			throw new UnsupportedOperationException("MongoDB is not available in context-load tests.");
		}

		@Override
		public MongoDatabaseFactory withSession(ClientSessionOptions options) {
			return this;
		}

		@Override
		public MongoDatabaseFactory withSession(ClientSession session) {
			return this;
		}
	}

	@Test
	void contextLoads() {
	}

}
