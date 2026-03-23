package cse416.yankees.data.ginglestable;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import cse416.yankees.common.*;

@Document(collection = "gingles_tables")
public class GinglesTable {
    @Id
    private String id;

    private State state;
    private EnsembleType ensembleType;
    
}
