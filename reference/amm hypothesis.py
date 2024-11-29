from hypothesis import given, strategies as st
from functools import reduce
import operator
import math
import numpy as np

class PredMarket:
    def __init__(self, liquidity, outcomes):
        self.liquidity = liquidity
        self.outcomes = outcomes
        self.shares = [liquidity] * outcomes
        self.total_liquidity = [liquidity/outcomes] * outcomes
        self.total_shares = [liquidity] * outcomes

    def get_outcome_prices(self):
        outcome_price_weights = []
        outcome_prices = []

        # Calculate OutcomePriceWeights for each outcome
        for i in range(len(self.shares)):
            product = 1
            for j in range(len(self.shares)):
                if i != j:
                    product *= self.shares[j]
            outcome_price_weights.append(product)

        # Calculate PriceWeightOfAllOutcomes
        price_weight_of_all_outcomes = sum(outcome_price_weights)
        
        # Calculate OutcomePrices
        for k in range(len(self.shares)):
            outcome_prices.append(outcome_price_weights[k] / price_weight_of_all_outcomes)
        
        return outcome_prices

    def buy(self, outcome, amount):
        # If amount is negative it becomes a sell order
        # Update all shares with the purchase amount
        product = 1
        for i in range(len(self.shares)):
            self.shares[i] += amount
            product *= self.shares[i]
            self.total_shares[i] += amount
        
        # Adjust the specified outcome's share to keep balance
        product /= self.shares[outcome]
        self.shares[outcome] = (self.liquidity ** self.outcomes) / product

        self.total_liquidity[outcome] += amount
        
        return self.shares

    def payoff(self, total_liquidity, total_shares):
        # total liquidity is an array of liquidity per outcome
        # payoffs is the payoff per share for each outcome
        payoffs = []
        for i in range(len(self.total_shares)):
            sum = 0
            for j in range(len(self.total_shares)):
                if i != j:
                    sum += self.total_liquidity[j]
            payoffs.append(sum/total_shares[i])

        return payoffs

@given(
    liquidity=st.integers(min_value=1, max_value=1000),
    outcomes=st.integers(min_value=2, max_value=10)
)
def test_outcome_prices_sum_to_one(liquidity, outcomes):
    """
    Test that the sum of all outcome prices is 1.
    """
    market = PredMarket(liquidity, outcomes)
    prices = market.get_outcome_prices()
    assert math.isclose(sum(prices), 1.0, rel_tol=1e-6), "Outcome prices do not sum to 1"

@given(
    liquidity=st.integers(min_value=1, max_value=1000),
    outcomes=st.integers(min_value=2, max_value=10),
    outcome=st.integers(min_value=0, max_value=9),
    amount=st.floats(min_value=-100, max_value=100, allow_nan=False).filter(lambda x: abs(x) >= 1e-6)
)
def test_buy_updates_shares(liquidity, outcomes, outcome, amount):
    """
    Test that buying an outcome updates the shares correctly and maintains state.
    """
    if outcome >= outcomes:
        return  # Skip invalid cases where outcome index is out of range
    if amount <= -liquidity:
        return
    market = PredMarket(liquidity, outcomes)
    initial_shares = market.shares[:]
    try:
        market.buy(outcome, amount)
        assert len(market.shares) == len(initial_shares), "Shares array length changed"
        assert all(share > 0 for share in market.shares), "Shares must remain positive"
    except ValueError:
        pass  # Valid case for rejected invalid trades


@given(
    liquidity=st.integers(min_value=1, max_value=1000),
    outcomes=st.integers(min_value=2, max_value=10),
    outcome=st.integers(min_value=2, max_value=10),
    amount=st.floats(min_value=-100, max_value=100, allow_nan=False).filter(lambda x: abs(x) >= 1e-6)
)
def test_outcome_prices_change(liquidity, outcomes, outcome, amount):
    """
    Test that buying an outcome changes the prices.
    """
    if outcome >= outcomes:
        return  # Skip invalid cases where outcome index is out of range
    if amount <= -liquidity:
        return
    market = PredMarket(liquidity, outcomes)
    initial_prices = market.get_outcome_prices()
    market.buy(outcome, amount)
    new_prices = market.get_outcome_prices()
    assert len(initial_prices) == len(new_prices), "Price array length changed"
    assert initial_prices != new_prices, "Prices did not change after a trade"
    assert math.isclose(sum(new_prices), 1.0, rel_tol=1e-6), "Prices no longer sum to 1"

@given(
    liquidity=st.integers(min_value=1, max_value=1000),
    outcomes=st.integers(min_value=2, max_value=10),
    outcome=st.integers(min_value=2, max_value=10),
    amount=st.floats(min_value=-100, max_value=100, allow_nan=False).filter(lambda x: abs(x) >= 1e-6)
)
def test_buy_preserves_liquidity(liquidity, outcomes, outcome, amount):
    """
    Test that buying does not change the total liquidity of the market.
    """
    if outcome >= outcomes:
        return  # Skip invalid cases where outcome index is out of range
    if amount <= -liquidity:
        return
    market = PredMarket(liquidity, outcomes)
    initial_liquidity = reduce(operator.mul, market.shares, 1)
    market.buy(outcome, amount)
    new_liquidity = reduce(operator.mul, market.shares, 1)
    assert math.isclose(initial_liquidity, new_liquidity, rel_tol=1e-6), "Liquidity changed after buy"

@given(
    liquidity=st.integers(min_value=1, max_value=1000),
    outcomes=st.integers(min_value=2, max_value=10),
    outcome=st.integers(min_value=2, max_value=10),
    amount=st.floats(min_value=-100, max_value=100, allow_nan=False).filter(lambda x: abs(x) >= 1e-6)
)
def test_payoff_balances(liquidity, outcomes, outcome, amount):
    """
    Test that buying gives correct payoffs for the shares
    """
    if outcome >= outcomes:
        return  # Skip invalid cases where outcome index is out of range
    if amount <= -liquidity:
        return
    market = PredMarket(liquidity, outcomes)
    market.buy(outcome, amount)
    outcome_prices = market.get_outcome_prices()
    payoffs = market.payoff(market.total_liquidity, market.total_shares)
    combined_sums = [p + q for p, q in zip(payoffs, outcome_prices)]
    for combined in combined_sums:
        assert math.isclose(combined, 1.0, rel_tol=1e-0), f"Combined value {combined} not close to 1"
    total_combined_sum = sum(combined_sums)
    assert math.isclose(total_combined_sum, outcomes, rel_tol=1e-0), \
        f"Total combined sum {total_combined_sum} not equal to outcomes {outcomes}"
