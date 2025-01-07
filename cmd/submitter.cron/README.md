
# Submitter (cron)

Every 30 minutes, check if any contracts have begun the state of needing to have
commitments revealed. If so, then we submit them on behalf of the user, drawing
down on the moderation fee that we have, with a multicall.
