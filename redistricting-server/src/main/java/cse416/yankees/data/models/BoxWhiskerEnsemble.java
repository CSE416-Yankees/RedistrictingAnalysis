package cse416.yankees.data.models;

import cse416.yankees.common.Group;
import java.util.Map;

public class BoxWhiskerEnsemble {
    private Map<Group, BoxWhiskerGroupData> groups;

    public Map<Group, BoxWhiskerGroupData> getGroups() { return groups; }
    public void setGroups(Map<Group, BoxWhiskerGroupData> groups) { this.groups = groups; }
}
