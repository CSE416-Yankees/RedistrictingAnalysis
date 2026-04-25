package cse416.yankees.data.summary;

import cse416.yankees.common.State;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;
import java.util.Map;

@Document(collection = "state_summaries")
public class StateSummary {

    @Id
    private String id;

    private State state;

    private String abbr;
    private String name;
    private int population;
    private StatewideVote statewideVote;
    private List<DemographicSummary> demographicSummaries;
    private String redistrictingControl;
    private RepresentationSummary representationSummary;
    private Map<String, EnsembleSummary> ensembleSummaries;

    public StateSummary() {}

    public String getId() { return id; }
    public State getState() { return state; }
    public String getAbbr() { return abbr; }
    public String getName() { return name; }
    public int getPopulation() { return population; }
    public StatewideVote getStatewideVote() { return statewideVote; }
    public List<DemographicSummary> getDemographicSummaries() { return demographicSummaries; }
    public String getRedistrictingControl() { return redistrictingControl; }
    public RepresentationSummary getRepresentationSummary() { return representationSummary; }
    public Map<String, EnsembleSummary> getEnsembleSummaries() { return ensembleSummaries; }

    public void setState(State state) { this.state = state; }
    public void setAbbr(String abbr) { this.abbr = abbr; }
    public void setName(String name) { this.name = name; }
    public void setPopulation(int population) { this.population = population; }
    public void setStatewideVote(StatewideVote statewideVote) { this.statewideVote = statewideVote; }
    public void setDemographicSummaries(List<DemographicSummary> demographicSummaries) { this.demographicSummaries = demographicSummaries; }
    public void setRedistrictingControl(String redistrictingControl) { this.redistrictingControl = redistrictingControl; }
    public void setRepresentationSummary(RepresentationSummary representationSummary) { this.representationSummary = representationSummary; }
    public void setEnsembleSummaries(Map<String, EnsembleSummary> ensembleSummaries) { this.ensembleSummaries = ensembleSummaries; }
}
