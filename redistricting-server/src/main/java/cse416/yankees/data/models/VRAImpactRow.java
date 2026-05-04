package cse416.yankees.data.models;

import cse416.yankees.common.Group;

public class VRAImpactRow {
    private Group group;
    private ThresholdData enactedThreshold;
    private ThresholdData roughProportionality;
    private ThresholdData jointThreshold;

    public Group getGroup() { return group; }
    public void setGroup(Group group) { this.group = group; }

    public ThresholdData getEnactedThreshold() { return enactedThreshold; }
    public void setEnactedThreshold(ThresholdData enactedThreshold) { this.enactedThreshold = enactedThreshold; }

    public ThresholdData getRoughProportionality() { return roughProportionality; }
    public void setRoughProportionality(ThresholdData roughProportionality) { this.roughProportionality = roughProportionality; }

    public ThresholdData getJointThreshold() { return jointThreshold; }
    public void setJointThreshold(ThresholdData jointThreshold) { this.jointThreshold = jointThreshold; }
}
