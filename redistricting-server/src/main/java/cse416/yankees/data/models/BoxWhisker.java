package cse416.yankees.data.models;

import cse416.yankees.common.EnsembleType;
import cse416.yankees.common.State;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Map;

@Document("box_whiskers")
public class BoxWhisker {
    @Id
    private String id;
    private State state;
    private Map<EnsembleType, BoxWhiskerEnsemble> ensembles;

    public String getId() { return id; }

    public State getState() { return state; }
    public void setState(State state) { this.state = state; }

    public Map<EnsembleType, BoxWhiskerEnsemble> getEnsembles() { return ensembles; }
    public void setEnsembles(Map<EnsembleType, BoxWhiskerEnsemble> ensembles) { this.ensembles = ensembles; }
}
