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

    private Map<Integer, Double> voteShareToSeatShare; // Keys are vote share as integer percentage (e.g. 45 = 45%), values are seat share (0.0-1.0)

    public VoteShareSeatShare() {}

    // getters/setters

    public State getState() { return state; }
    public EnsembleType getEnsembleType() { return ensembleType; }
    public Map<Integer, Double> getVoteShareToSeatShare() { return voteShareToSeatShare; }

    public void setState(State state) { this.state = state; }
    public void setEnsembleType(EnsembleType ensembleType) { this.ensembleType = ensembleType; }
    public void setVoteShareToSeatShare(Map<Integer, Double> voteShareToSeatShare) { this.voteShareToSeatShare = voteShareToSeatShare; }
}
