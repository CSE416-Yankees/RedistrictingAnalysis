package cse416.yankees.data.models;

import java.util.List;

public class GroupDistribution {
    private List<DistributionBin> minorityEffectiveDistricts;
    private List<DistributionBin> majorityMinorityDistricts;

    public List<DistributionBin> getMinorityEffectiveDistricts() { return minorityEffectiveDistricts; }
    public void setMinorityEffectiveDistricts(List<DistributionBin> minorityEffectiveDistricts) { this.minorityEffectiveDistricts = minorityEffectiveDistricts; }

    public List<DistributionBin> getMajorityMinorityDistricts() { return majorityMinorityDistricts; }
    public void setMajorityMinorityDistricts(List<DistributionBin> majorityMinorityDistricts) { this.majorityMinorityDistricts = majorityMinorityDistricts; }
}
