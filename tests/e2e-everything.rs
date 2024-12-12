
trait ActionRelationship {
    fn legal<F: FnOnce -> bool>(Self, F) -> bool;
}

enum ActionsOracle {
    Waiting,
    Calling,
    Whinged,
    Prediction,
    PredictingOver,
    CallingOver,
    SlashingBegun,
    Slashed,
    AnythingTwoDaysOver,
    AnythingGoesSlash,
    AnythingGoesSlashingOver
}

impl ActionRelationship for ActionsOracle {
    fn is_legal<F: FnOnce -> bool>(&self, x: Self, validate_f: F) -> bool {
        true
    }
}

#[test]
fn test_something() {

}
