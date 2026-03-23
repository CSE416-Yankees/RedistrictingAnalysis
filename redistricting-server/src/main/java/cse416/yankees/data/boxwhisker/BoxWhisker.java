package cse416.yankees.data.boxwhisker;

import java.util.List;
import cse416.yankees.common.*;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "box_whiskers")
public class BoxWhisker {
    @Id
    private String id;

    private State state;
    private EnsembleType ensembleType;
    private String group; // "Minority", "Black", "Hispanic", "Asian"

    private List<DistrictBox> districts;

    public BoxWhisker() {}
    
    // getters/setters

    public State getState() { return state; }
    public EnsembleType getEnsembleType() { return ensembleType; }
    public String getGroup() { return group; }
    public List<DistrictBox> getDistricts() { return districts; }
}