package cse416.yankees.data.services;

import cse416.yankees.common.EnsembleType;
import cse416.yankees.common.Group;
import cse416.yankees.common.State;
import cse416.yankees.data.models.*;
import cse416.yankees.data.repositories.AnalysisRepository;
import cse416.yankees.exception.ResourceNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class AnalysisService {

    @Autowired
    private AnalysisRepository analysisRepository;

    public GinglesAnalysis getGinglesAnalysis(State state) {
        GinglesAnalysis result = analysisRepository.findGinglesAnalysis(state);
        if (result == null) throw new ResourceNotFoundException("GinglesAnalysis not found for state: " + state);
        return result;
    }

    public GinglesPrecinctTable getGinglesPrecinctTable(State state) {
        GinglesPrecinctTable result = analysisRepository.findGinglesPrecinctTable(state);
        if (result == null) throw new ResourceNotFoundException("GinglesPrecinctTable not found for state: " + state);
        return result;
    }

    public EICandidateResults getEICandidateResults(State state) {
        EICandidateResults result = analysisRepository.findEICandidateResults(state);
        if (result == null) throw new ResourceNotFoundException("EICandidateResults not found for state: " + state);
        return result;
    }

    public EnsembleSplits getEnsembleSplits(State state) {
        EnsembleSplits result = analysisRepository.findEnsembleSplits(state);
        if (result == null) throw new ResourceNotFoundException("EnsembleSplits not found for state: " + state);
        return result;
    }

    public BoxWhiskerGroupData getBoxWhiskers(State state, EnsembleType ensembleType, Group group) {
        BoxWhisker doc = analysisRepository.findBoxWhisker(state);
        if (doc == null) throw new ResourceNotFoundException("BoxWhisker not found for state: " + state);
        BoxWhiskerEnsemble ensemble = doc.getEnsembles().get(ensembleType);
        if (ensemble == null) throw new ResourceNotFoundException("BoxWhisker ensemble not found: " + ensembleType);
        BoxWhiskerGroupData groupData = ensemble.getGroups().get(group);
        if (groupData == null) throw new ResourceNotFoundException("BoxWhisker group not found: " + group);
        return groupData;
    }

    public VRAImpactTable getVRAImpactTable(State state) {
        VRAImpactTable result = analysisRepository.findVRAImpactTable(state);
        if (result == null) throw new ResourceNotFoundException("VRAImpactTable not found for state: " + state);
        return result;
    }

    public MinorityEffectiveness getMinorityEffectiveness(State state) {
        MinorityEffectiveness result = analysisRepository.findMinorityEffectiveness(state);
        if (result == null) throw new ResourceNotFoundException("MinorityEffectiveness not found for state: " + state);
        return result;
    }

    public MinorityEffectivenessHistogram getMinorityEffectivenessHistogram(State state) {
        MinorityEffectivenessHistogram result = analysisRepository.findMinorityEffectivenessHistogram(state);
        if (result == null) throw new ResourceNotFoundException("MinorityEffectivenessHistogram not found for state: " + state);
        return result;
    }
}
