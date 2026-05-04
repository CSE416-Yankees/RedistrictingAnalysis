package cse416.yankees.data.models;

import java.util.List;

public class BoxWhiskerGroupData {
    private List<BoxWhiskerBin> orderedBins;

    public List<BoxWhiskerBin> getOrderedBins() { return orderedBins; }
    public void setOrderedBins(List<BoxWhiskerBin> orderedBins) { this.orderedBins = orderedBins; }
}
