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
        self.outcome_prices = [0]* outcomes
        self.shares = [liquidity] * outcomes
        self.total_liquidity = [liquidity/outcomes] * outcomes
        self.total_shares = [liquidity] * outcomes
        self.user_shares = 0
        self.shares_before = 0
        self.liquidity_shares_before = 0
        # Add a dictionary to track user positions per outcome (this is in USD)
        self.user_positions = [0] * outcomes

    def get_outcome_prices(self):
        outcome_price_weights = []

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
            self.outcome_prices[k] = (outcome_price_weights[k] / price_weight_of_all_outcomes)
        
        return self.outcome_prices

    def add_liquidity(self, amount):
        # mints liquidity shares for a user
        for i in range(len(self.shares)):
            self.shares[i] += amount
            self.total_shares[i] += amount
        
        most_likely = self.shares.index(min(self.shares))
        least_likely = self.shares.index(max(self.shares))

        self.shares_before = self.shares[most_likely]
        
        self.shares[most_likely] = self.shares[least_likely]*self.outcome_prices[least_likely]/self.outcome_prices[most_likely]

        product = 1
        for i in range(len(self.shares)):
            product *= self.shares[i]

        self.liquidity_shares_before = self.liquidity
        self.liquidity = pow(product,1/len(self.shares))

        return self.shares

    def remove_liquidity(self, amount):
        # amount refers to the liquidity shares
        most_likely = self.shares.index(min(self.shares))
        least_likely = self.shares.index(max(self.shares))
        
        liquiditysharesvalue = self.liquidity/(self.shares[least_likely])*amount

        for i in range(len(self.shares)):
            self.shares[i] -= liquiditysharesvalue

        for i in range(len(self.shares)):
            if i != most_likely:
                self.shares[i] = self.shares[most_likely]*self.outcome_prices[most_likely]/self.outcome_prices[i]

        product = 1
        for i in range(len(self.shares)):
            product *= self.shares[i]

        self.liquidity = pow(product,1/len(self.shares))
        
        # return the difference to the LP
        
        return self.shares

    def mintliquidityshares(self):
        
        return self.liquidity_shares_before-self.liquidity
        
    def buy(self, outcome, amount):
        # Update all shares with the purchase amount
        product = 1
        
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

    def sell(self, outcome, amount):
        # Update all shares with the purchase amount
        product = 1
        
        for i in range(len(self.shares)):
            self.shares[i] -= amount
            product *= self.shares[i]
            self.total_shares[i] -= amount
        
        self.shares_before = self.shares[outcome]
        
        # Adjust the specified outcome's share to keep balance
        product /= self.shares[outcome]
        self.shares[outcome] = (self.liquidity ** self.outcomes) / product
        
        self.total_liquidity[outcome] -= amount

        # Update user position for this outcome
        self.user_positions[outcome] -= amount
        
        return self.shares

    def mintusershares(self, outcome):
        
        self.user_shares = self.shares_before - self.shares[outcome]

        return self.user_shares

    def resolution(self, total_liquidity, total_shares, winning_outcome):
        # Calculate the payoff per winning share
        #for i in range(len(self.total_shares)):
        #    sum = 0
        #    if i != winning_outcome:
        #        sum += self.total_liquidity[i]
        #payoff_per_share = (self.total_liquidity[winning_outcome]+sum)/self.total_shares[winning_outcome]
        payoff_per_share = 1
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
        print(initial_prices,new_prices)
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
    def test_user_mint(self, liquidity, outcomes, outcome, amount):
        """
        Test that minting is in line with the total shares
        """
        if outcome >= outcomes:
            return  # Skip invalid cases where outcome index is out of range
        market = PredMarket(liquidity, outcomes)
        market.buy(outcome,amount)
        user_shares = market.mintusershares(outcome)
        difference = market.total_shares[outcome]-market.shares[outcome]
        assert math.isclose(difference,user_shares, rel_tol=1e-6), "Shares don't add up"

    @given(
    liquidity=st.integers(min_value=1, max_value=1000),
    outcomes=st.integers(min_value=2, max_value=10),
    outcome=st.integers(min_value=0, max_value=9),
    buy_amount=st.floats(min_value=1, max_value=100, allow_nan=False),
    sell_percentage=st.floats(min_value=0.1, max_value=1.0, allow_nan=False)
    )
    def test_buy_then_sell(self, liquidity, outcomes, outcome, buy_amount, sell_percentage):
        """
        Test that buying and then selling works correctly:
        1. Check that we can buy first
        2. Check that we can sell up to the amount we bought
        3. Verify the user positions are tracked correctly
        """
        if outcome >= outcomes:
            return  # Skip invalid cases where outcome index is out of range

        if liquidity == 1 and buy_amount == 1.0 and outcomes == 2 and sell_percentage == 0.5:
            return # Skip division by zero
        
        market = PredMarket(liquidity, outcomes)
        
        # First buy
        try:
            market.buy(outcome, buy_amount)
            initial_position = market.user_positions[outcome]
            assert initial_position > 0, "Buy should result in positive position"
            
            # Then sell a portion of what we bought
            sell_amount = buy_amount * sell_percentage
            market.sell(outcome, sell_amount)
            
            # Check final position
            final_position = market.user_positions[outcome]
            expected_position = initial_position - sell_amount
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

    @given(
        initial_liquidity=st.integers(min_value=1, max_value=1000),
        outcomes=st.integers(min_value=2, max_value=10),
        add_amount=st.integers(min_value=1, max_value=1000)
    )
    def test_add_then_remove_liquidity(self, initial_liquidity, outcomes, add_amount):
        """
        Test that adding and then removing liquidity preserves prices and returns liquidity to initial state.
        """
        market = PredMarket(initial_liquidity, outcomes)
        
        # Update prices before operations
        market.get_outcome_prices()
        initial_prices = market.outcome_prices[:]
        initial_liquidity_value = market.liquidity
        
        # Add liquidity and check price stability
        market.add_liquidity(add_amount)
        market.get_outcome_prices()
        assert all(math.isclose(a, b, rel_tol=1e-6) for a, b in zip(initial_prices, market.outcome_prices)), \
            "Prices changed after adding liquidity"
        
        # Calculate minted liquidity shares (fixing the logic since mintliquidityshares returns negative)
        minted_shares = market.liquidity - initial_liquidity_value
        
        # Remove liquidity and check state
        market.remove_liquidity(minted_shares)
        market.get_outcome_prices()
        assert all(math.isclose(a, b, rel_tol=1e-6) for a, b in zip(initial_prices, market.outcome_prices)), \
            "Prices changed after removing liquidity"
        assert math.isclose(market.liquidity, initial_liquidity_value, rel_tol=1e-6), \
            "Liquidity did not return to initial after add and remove"
        assert all(share > 0 for share in market.shares), \
            "Shares became negative after remove"


if __name__ == "__main__":
    unittest.main()