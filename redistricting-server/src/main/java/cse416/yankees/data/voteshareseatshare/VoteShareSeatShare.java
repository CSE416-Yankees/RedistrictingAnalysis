package cse416.yankees.data.voteshareseatshare;

import cse416.yankees.common.*;

import java.util.Map;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "vote_share_seat_share")
public class VoteShareSeatShare {
    @Id
    private String id;

    private State state;
    private EnsembleType ensembleType;

    private Map<Double, Double> voteShareToSeatShare; // Data point of Vote share (0-100) and corresponding observed seat share (0-100)

    public VoteShareSeatShare() {}

    // getters/setters

    public State getState() { return state; }
    public EnsembleType getEnsembleType() { return ensembleType; }
    public Map<Double, Double> getVoteShareToSeatShare() { return voteShareToSeatShare; }

    public void setState(State state) { this.state = state; }
    public void setEnsembleType(EnsembleType ensembleType) { this.ensembleType = ensembleType; }
    public void setVoteShareToSeatShare(Map<Double, Double> voteShareToSeatShare) { this.voteShareToSeatShare = voteShareToSeatShare; }
}
