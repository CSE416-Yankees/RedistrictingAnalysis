package cse416.yankees.data.models;

import cse416.yankees.common.State;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;
import java.util.Map;

@Document("state_summaries")
public class StateSummary {
    @Id
    private String id;
    private State abbr;
    private String name;
    private long population;
    private StatewideVote statewideVote;
    private List<DemographicSummaryEntry> demographicSummaries;
    private String redistrictingControl;
    private RepresentationSummary representationSummary;
    private Map<String, EnsembleSummaryData> ensembleSummaries;

    public String getId() { return id; }

    public State getAbbr() { return abbr; }
    public void setAbbr(State abbr) { this.abbr = abbr; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public long getPopulation() { return population; }
    public void setPopulation(long population) { this.population = population; }

    public StatewideVote getStatewideVote() { return statewideVote; }
    public void setStatewideVote(StatewideVote statewideVote) { this.statewideVote = statewideVote; }

    public List<DemographicSummaryEntry> getDemographicSummaries() { return demographicSummaries; }
    public void setDemographicSummaries(List<DemographicSummaryEntry> demographicSummaries) { this.demographicSummaries = demographicSummaries; }

    public String getRedistrictingControl() { return redistrictingControl; }
    public void setRedistrictingControl(String redistrictingControl) { this.redistrictingControl = redistrictingControl; }

    public RepresentationSummary getRepresentationSummary() { return representationSummary; }
    public void setRepresentationSummary(RepresentationSummary representationSummary) { this.representationSummary = representationSummary; }

    public Map<String, EnsembleSummaryData> getEnsembleSummaries() { return ensembleSummaries; }
    public void setEnsembleSummaries(Map<String, EnsembleSummaryData> ensembleSummaries) { this.ensembleSummaries = ensembleSummaries; }
}
