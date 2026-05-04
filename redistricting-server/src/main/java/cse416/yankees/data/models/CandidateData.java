package cse416.yankees.data.models;

import cse416.yankees.common.Group;
import java.util.List;
import java.util.Map;

public class CandidateData {
    private Map<Group, List<XYPoint>> curves;
    private Map<Group, Map<Group, Double>> overlapPct;

    public Map<Group, List<XYPoint>> getCurves() { return curves; }
    public void setCurves(Map<Group, List<XYPoint>> curves) { this.curves = curves; }

    public Map<Group, Map<Group, Double>> getOverlapPct() { return overlapPct; }
    public void setOverlapPct(Map<Group, Map<Group, Double>> overlapPct) { this.overlapPct = overlapPct; }
}
