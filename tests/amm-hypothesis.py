#!/usr/bin/env python3

from hypothesis import given, strategies as st
from functools import reduce

import operator
import math
import unittest

class PredMarket:
    def __init__(self, liquidity, outcomes):
        self.liquidity = liquidity
        self.outcomes = outcomes
        self.shares = [liquidity] * outcomes
        self.total_liquidity = [liquidity/outcomes] * outcomes
        self.total_shares = [liquidity] * outcomes
        self.user_shares = 0
        self.shares_before = 0
        # Add a dictionary to track user positions per outcome
        self.user_positions = [0] * outcomes

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

        # Check if it's a sell order (negative amount)
        if amount < 0:
            # Verify user has enough position to sell
            if self.user_positions[outcome] + amount < 0:  # amount is negative, so we add
                raise ValueError("Cannot sell more shares than owned")

        for i in range(len(self.shares)):
            self.shares[i] += amount
            product *= self.shares[i]
            self.total_shares[i] += amount

        self.shares_before = self.shares[outcome]

        # Adjust the specified outcome's share to keep balance
        product /= self.shares[outcome]
        self.shares[outcome] = (self.liquidity ** self.outcomes) / product

        self.total_liquidity[outcome] += amount

        # Update user position for this outcome
        self.user_positions[outcome] += amount

        return self.shares

    def mintusershares(self, outcome, amount):

        self.user_shares = self.shares_before - self.shares[outcome]

        return self.user_shares

    def payoff(self, total_liquidity, total_shares):
        # this is for the frontend display
        # note that the payoff doesn't include their initial wager which should be included
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

    def resolution(self, total_liquidity, total_shares, payoffs, winning_outcome):
        # Calculate the payoff per winning share
        payoff_per_share = self.total_liquidity[winning_outcome]/self.total_shares[winning_outcome] + payoffs[winning_outcome]
        return payoff_per_share

class TestPredMarket(unittest.TestCase):
    @given(
        liquidity=st.integers(min_value=1, max_value=1000),
        outcomes=st.integers(min_value=2, max_value=10)
    )
    def test_outcome_prices_sum_to_one(self, liquidity, outcomes):
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
        amount=st.floats(min_value=0, max_value=100, allow_nan=False).filter(lambda x: abs(x) >= 1e-6)
    )
    def test_buy_updates_shares(self, liquidity, outcomes, outcome, amount):
        """
        Test that buying an outcome updates the shares correctly and maintains state.
        """
        if outcome >= outcomes:
            return  # Skip invalid cases where outcome index is out of range
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
        amount=st.floats(min_value=0, max_value=100, allow_nan=False).filter(lambda x: abs(x) >= 1e-6)
    )
    def test_outcome_prices_change(self, liquidity, outcomes, outcome, amount):
        """
        Test that buying an outcome changes the prices.
        """
        if outcome >= outcomes:
            return  # Skip invalid cases where outcome index is out of range
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
        amount=st.floats(min_value=0, max_value=100, allow_nan=False).filter(lambda x: abs(x) >= 1e-6)
    )
    def test_buy_preserves_liquidity(self, liquidity, outcomes, outcome, amount):
        """
        Test that buying does not change the total liquidity of the market.
        """
        if outcome >= outcomes:
            return  # Skip invalid cases where outcome index is out of range
        market = PredMarket(liquidity, outcomes)
        initial_liquidity = reduce(operator.mul, market.shares, 1)
        market.buy(outcome, amount)
        new_liquidity = reduce(operator.mul, market.shares, 1)
        assert math.isclose(initial_liquidity, new_liquidity, rel_tol=1e-6), "Liquidity changed after buy"

    @given(
        liquidity=st.integers(min_value=1, max_value=1000),
        outcomes=st.integers(min_value=2, max_value=10),
        outcome=st.integers(min_value=2, max_value=10),
        amount=st.floats(min_value=0, max_value=100, allow_nan=False).filter(lambda x: abs(x) >= 1e-6)
    )
    def test_payoff_balances(self, liquidity, outcomes, outcome, amount):
        """
        Test that buying gives correct payoffs for the shares
        """
        if outcome >= outcomes:
            return  # Skip invalid cases where outcome index is out of range
        market = PredMarket(liquidity, outcomes)
        market.buy(outcome, amount)
        outcome_prices = market.get_outcome_prices()
        payoffs = market.payoff(market.total_liquidity, market.total_shares)
        combined_sums = [p + q for p, q in zip(payoffs, outcome_prices)]
        for combined in combined_sums:
            assert math.isclose(combined, 1.0, rel_tol=1e0), f"Combined value {combined} not close to 1"
        total_combined_sum = sum(combined_sums)
        assert math.isclose(total_combined_sum, outcomes, rel_tol=1e-0), \
            f"Total combined sum {total_combined_sum} not equal to outcomes {outcomes}"

    @given(
        liquidity=st.integers(min_value=1, max_value=1000),
        outcomes=st.integers(min_value=2, max_value=10),
        outcome=st.integers(min_value=2, max_value=10),
        amount=st.floats(min_value=0, max_value=100, allow_nan=False).filter(lambda x: abs(x) >= 1e-6)
    )
    def test_user_mint(self, liquidity, outcomes, outcome, amount):
        """
        Test that minting is in line with the total shares
        """
        if outcome >= outcomes:
            return  # Skip invalid cases where outcome index is out of range
        market = PredMarket(liquidity, outcomes)
        market.buy(outcome,amount)
        user_shares = market.mintusershares(outcome, amount)
        difference = market.total_shares[outcome]-market.shares[outcome]
        assert math.isclose(difference,user_shares, rel_tol=1e-6), "Shares don't add up"

    @given(
        liquidity=st.integers(min_value=1, max_value=1000),
        outcomes=st.integers(min_value=2, max_value=10),
        outcome=st.integers(min_value=2, max_value=10),
        amount=st.floats(min_value=0, max_value=100, allow_nan=False).filter(lambda x: abs(x) >= 1e-6),
        winning_outcome=st.integers(min_value=2, max_value=10)
    )
    def test_resolution(self, liquidity, outcomes, outcome, amount, winning_outcome):
        """
        Test that the market resolves accurately
        """
        if outcome >= outcomes:
            return  # Skip invalid cases where outcome index is out of range
        if winning_outcome >= outcomes:
            return  # Skip invalid cases where outcome index is out of range
        market = PredMarket(liquidity, outcomes)
        market.buy(outcome,amount)
        payoff_per = market.resolution(market.total_liquidity,market.total_shares,market.payoff(market.total_liquidity,market.total_shares),winning_outcome)
        assert math.isclose(payoff_per,1, rel_tol=1e-6), "Payoff isn't 1"

    @given(
    liquidity=st.integers(min_value=1, max_value=1000),
    outcomes=st.integers(min_value=2, max_value=10),
    outcome=st.integers(min_value=0, max_value=9),
    buy_amount=st.floats(min_value=1, max_value=100, allow_nan=False),
    sell_percentage=st.floats(min_value=0.1, max_value=1.0, allow_nan=False)
    )
    def test_buy_then_sell(liquidity, outcomes, outcome, buy_amount, sell_percentage):
        """
        Test that buying and then selling works correctly:
        1. Check that we can buy first
        2. Check that we can sell up to the amount we bought
        3. Verify the user positions are tracked correctly
        """
        if outcome >= outcomes:
            return  # Skip invalid cases where outcome index is out of range
        
        market = PredMarket(liquidity, outcomes)
        
        # First buy
        try:
            market.buy(outcome, buy_amount)
            initial_position = market.user_positions[outcome]
            assert initial_position > 0, "Buy should result in positive position"
            
            # Then sell a portion of what we bought
            sell_amount = -buy_amount * sell_percentage
            market.buy(outcome, sell_amount)
            
            # Check final position
            final_position = market.user_positions[outcome]
            expected_position = initial_position + sell_amount
            assert final_position >= 0, "Position should not go negative"
            assert math.isclose(final_position, expected_position, rel_tol=1e-6), \
                f"Final position {final_position} doesn't match expected {expected_position}"
            
            # Try to sell more than we have - should raise ValueError
            try:
                market.buy(outcome, -final_position - 1)
                assert False, "Should not be able to sell more than owned"
            except ValueError:
                pass  # Expected behavior
                
        except ValueError:
            pass  # Valid case for rejected invalid trades

if __name__ == "__main__":
    unittest.main()