#!/usr/bin/env python3

import math
from tabulate import tabulate
import numpy as np
import pytest

class PredMarketNew:
    def __init__(self, liquidity, outcomes, fees = 0.02):
        self.liquidity = liquidity
        self.outcomes = outcomes
        self.outcome_prices = [0] * outcomes
        self.shares = [liquidity] * outcomes
        self.fees = fees # e.g. 2% would be 0.02
        self.fees_collected = 0 # total collected fees for this market


        self.total_shares = [liquidity] * outcomes

        # Track the total outcome shares a user own
        self.user_outcome_shares = [0] * outcomes
        self.user_liquidity_shares = 0
        self.user_wallet_usd = 0
        self.pool_wallet_usd = 0

        self.winning_outcome = None
        self.resolved = False


    def collectfees(self, amount):
        self.fees_collected += amount

    def claimfees(self):
        self.user_wallet_usd += self.fees_collected/self.liquidity*self.user_liquidity_shares

    def transfer_from_user_to_pool(self, amount):
        if amount < 0:
            raise ValueError("Amount must be non-negative")

        self.user_wallet_usd -= amount
        self.pool_wallet_usd += amount

        # Wallet balance can never be negative
        if self.user_wallet_usd < 0 or self.pool_wallet_usd < 0:
            raise ArithmeticError("Underflow error: result is negative")

    def transfer_from_pool_to_user(self, amount):
        if amount < 0:
            raise ValueError("Amount must be non-negative")

        self.user_wallet_usd += amount
        self.pool_wallet_usd -= amount

        # Wallet balance can never be negative
        if self.user_wallet_usd < 0 or self.pool_wallet_usd < 0:
            raise ArithmeticError("Underflow error: result is negative")

    def get_user_positions(self):
        # Update to the latest outcome price
        self.get_outcome_prices()

        positions_in_usd = []
        for i in range(len(self.shares)):
            positions_in_usd.append(self.user_outcome_shares[i] * self.outcome_prices[i])

        return positions_in_usd

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

        print(f"price weight of all outcomes: {price_weight_of_all_outcomes}")

        # price_weight_of_all_outcomes can be zero if no liquidity is added yet. Prevent division by zero error
        if price_weight_of_all_outcomes > 0:
            # Calculate OutcomePrices
            for k in range(len(self.shares)):
                self.outcome_prices[k] = (outcome_price_weights[k] / price_weight_of_all_outcomes)
                print(f"outcome prices: {self.outcome_prices[k]}")

        return self.outcome_prices

    # "amount" is the amount of USD added
    def add_liquidity(self, amount):
        self.only_when_market_not_resolved()
        self.transfer_from_user_to_pool(amount)

        # Update self.outcome_prices to the latest price
        self.get_outcome_prices()

        previous_liquidity = self.liquidity
        print(f"previous liquidity: {previous_liquidity}")

        # mints liquidity shares for a user
        for i in range(len(self.shares)):
            self.shares[i] += amount
            self.total_shares[i] += amount

        previous_shares = self.shares.copy()
        print(f"prev shares: {previous_shares}")

        least_likely = self.shares.index(max(self.shares))
        print(f"least likely amt: {max(self.shares)}")
        # It is possible to have more than one outcome shares with the same max shares. (e.g., OutA=100, OutB=100, OutC=200, OutD=300)
        least_likely_indices = [i for i, s in enumerate(self.shares) if s == max(self.shares)]

        # Recompute all other outcome shares to preserve price ratios
        for i in range(len(self.shares)):
            if i not in least_likely_indices:
                self.shares[i] = (self.shares[least_likely] * self.outcome_prices[least_likely]) / self.outcome_prices[i]
                print(f"new shares[{i}]: {self.shares[i]}")

        product = math.prod(self.shares)
        print(f"shares: {self.shares}")
        print(f"product: {product}")
        self.liquidity = pow(product, 1/len(self.shares))
        print(f"self.liquidity = {self.liquidity}, prev_liquidity: {previous_liquidity}")

        # Record the no. of liquidity shares user received
        self.user_liquidity_shares += (self.liquidity - previous_liquidity)

        # During add liquidity, users will receive all the outcome shares except for the least likely
        for i in range(len(self.shares)):
            outcome_shares_received = previous_shares[i] - self.shares[i]
            # Update the outcome shares received
            self.user_outcome_shares[i] += outcome_shares_received

        return self.shares

     # "amount" is the number of liquidity shares the user give back to the pool
    def remove_liquidity(self, amount):
        self.only_when_market_not_resolved()

        # Update self.outcome_prices to the latest price
        self.get_outcome_prices()

        # amount refers to the liquidity shares
        most_likely = self.shares.index(min(self.shares))
        # It is possible to have more than one outcome shares with the same min shares. (e.g., OutA=100, OutB=100, OutC=200, OutD=300)
        most_likely_indices = [i for i, s in enumerate(self.shares) if s == min(self.shares)]

        least_likely = self.shares.index(max(self.shares))

        # "amount" is the number of liquidity shares the user give back to the pool
        liquiditysharesvalue = (self.shares[most_likely] * amount) / self.liquidity
        self.transfer_from_pool_to_user(liquiditysharesvalue)

        for i in range(len(self.shares)):
            self.shares[i] -= liquiditysharesvalue
            self.total_shares[i] -= liquiditysharesvalue


        previous_shares = self.shares.copy()
        print(f"previous shares: {previous_shares}")

        for i in range(len(self.shares)):
            if i not in most_likely_indices:
                self.shares[i] = (self.shares[most_likely] * self.outcome_prices[most_likely]) / self.outcome_prices[i]

        product = math.prod(self.shares)
        self.liquidity = pow(product, 1/len(self.shares))

         # Deduct the number of liquidity shares the user give back to the pool.
        self.user_liquidity_shares -= amount

        # During remove liquidity, users will receive all the outcome shares except for the most likely
        for i in range(len(self.shares)):
            outcome_shares_received = previous_shares[i] - self.shares[i]
            # Update the outcome shares received
            self.user_outcome_shares[i] += outcome_shares_received

        return self.shares


    def buy(self, outcome, amount): # audit - "amount" is in USD
        self.only_when_market_not_resolved()
        fee_taken = amount*self.fees
        amount -= fee_taken
        self.collectfees(fee_taken)
        self.transfer_from_user_to_pool(amount)

        # Update all shares with the purchase amount
        for i in range(len(self.shares)):
            self.shares[i] += amount
            self.total_shares[i] += amount

        previous_shares = self.shares.copy()

        # Product of all outcome shares except for the one to be bought
        product = math.prod([value for i, value in enumerate(self.shares) if i != outcome])
        # Adjust the specified outcome's share to keep balance
        self.shares[outcome] = pow(self.liquidity, self.outcomes) / product

        # Outcome shares transferred from pool to user
        self.user_outcome_shares[outcome] += (previous_shares[outcome] - self.shares[outcome])

        return self.shares

    def sell(self, outcome, amount):
        self.only_when_market_not_resolved()

        fee_taken = amount*self.fees
        amount -= fee_taken
        self.collectfees(fee_taken)

        # Update all shares with the purchase amount
        for i in range(len(self.shares)):
            self.shares[i] -= amount
            self.total_shares[i] -= amount

        previous_shares = self.shares.copy()

        # Product of all outcome shares except for the one to be bought
        product = math.prod([value for i, value in enumerate(self.shares) if i != outcome])
        # Adjust the specified outcome's share to keep balance
        self.shares[outcome] = pow(self.liquidity, self.outcomes) / product

        # Outcome shares transferred from user to pool
        self.user_outcome_shares[outcome] -= (self.shares[outcome] - previous_shares[outcome])

        self.transfer_from_pool_to_user(amount)

        return self.shares

    def resolve_market(self, winning_outcome):
        self.only_when_market_not_resolved()
        self.winning_outcome = winning_outcome
        self.resolved = True

    # "no_of_winning_outcome_shares" is the number of winning outcome shares the user holds.
    def resolution(self, no_of_winning_outcome_shares):
        self.only_when_market_resolved()

        if no_of_winning_outcome_shares > self.user_outcome_shares[self.winning_outcome]:
            raise ArithmeticError("Insufficient winning outcome shares")

        payoff_per_share = 1
        winning_in_usd = no_of_winning_outcome_shares * payoff_per_share

        self.transfer_from_pool_to_user(winning_in_usd)

        # Burn the user's claimed winning outcome shares to avoid double claim
        self.user_outcome_shares[self.winning_outcome] -= no_of_winning_outcome_shares

        return winning_in_usd

    def claim_liqudity(self, no_of_liquidity_shares):
        self.only_when_market_resolved()

        if no_of_liquidity_shares > self.user_liquidity_shares:
            raise ArithmeticError("Insufficient liquidity shares")

        liqudity_price = self.shares[self.winning_outcome] / self.liquidity
        claimed_amount = no_of_liquidity_shares * liqudity_price

        self.transfer_from_pool_to_user(claimed_amount)

        # Burn the user's claimed liquidity shares to avoid double claim
        self.user_liquidity_shares -= no_of_liquidity_shares

        return claimed_amount

    def only_when_market_resolved(self):
        if not self.resolved:
            raise ValueError("Market has not been resolved yet")

    def only_when_market_not_resolved(self):
        if  self.resolved:
            raise ValueError("Market already resolved")

    # For testing only
    def test_get_market_details(self):
        # Get the outcome prices
        outcome_prices = self.get_outcome_prices()

        # Prepare the data to display in a table
        table_data = []
        for i in range(len(self.shares)):
            if self.winning_outcome is not None and i == self.winning_outcome:
                table_data.append([f"Outcome {i} (Win)", self.shares[i], outcome_prices[i]])
            else:
                table_data.append([f"Outcome {i}", self.shares[i], outcome_prices[i]])

        # Print the table using tabulate
        headers = ["Outcome", "Shares", "Price"]
        print(" === Market Details === ")
        print("Market Liquidty: ", self.liquidity)
        print("Pool Wallet (USD): ", self.pool_wallet_usd)
        print(tabulate(table_data, headers=headers, tablefmt="grid"))

    def test_get_user_details(self):
         # Get the outcome prices
        outcome_prices = self.get_outcome_prices()

         # Prepare the data to display in a table
        table_data = []
        for i in range(len(self.shares)):
            table_data.append([f"Outcome {i}", self.user_outcome_shares[i], outcome_prices[i]])

        headers = ["Outcome", "Shares", "Price"]
        print(" === User Details === ")
        print("User Liquidty Share: ", self.user_liquidity_shares)
        print("User Wallet (USD): ", self.user_wallet_usd)
        print(tabulate(table_data, headers=headers, tablefmt="grid"))

    def test_set_outcome_shares(self, liquidity, new_shares):
        self.liquidity = liquidity
        self.shares = new_shares
        self.get_outcome_prices() # refresh the outcome prices based on updated outcome shares

    def test_reset_user_liquidity_shares(self):
        self.user_liquidity_shares = 0

    def test_has_significant_change_in_outcome_prices(self, before_prices, threshold=0.0001):
        assert self.get_outcome_prices() == pytest.approx(before_prices, rel=0.0001)

    def test_has_significant_change_in_outcome_shares(self, before_shares, threshold=0.0001):
        assert self.shares == pytest.approx(before_shares, rel=0.0001)

 # Adding Liquidity to a binary outcome market (https://help.polkamarkets.com/how-polkamarkets-works/market-liquidity/adding-liquidity#d528195e8f1a449785f8c830bbc4493f)
def simulate_market_1():
    market = PredMarketNew(liquidity=0, outcomes=2)
    market.user_wallet_usd = 1100 # Fund Alice's wallet 1100 USD
    market.add_liquidity(100)
    market.test_get_market_details()
    market.test_get_user_details()

    # Example 1: Adding liquidity to a market with equal outcome prices
    # Alice add liquidity of 1000 USDC
    before_outcome_prices = market.get_outcome_prices()
    market.add_liquidity(1000)
    market.test_get_market_details()
    market.test_get_user_details()
    market.test_has_significant_change_in_outcome_prices(before_outcome_prices)

    # Verify that the end state is aligned with the scenario
    assert market.liquidity == pytest.approx(1100, rel=0.03)
    assert market.shares[0] == pytest.approx(1100, rel=0.03)
    assert market.shares[1] == pytest.approx(1100, rel=0.03)
    assert market.outcome_prices[0] == pytest.approx(0.5, rel=0.03)
    assert market.outcome_prices[1] == pytest.approx(0.5, rel=0.03)
    assert market.user_liquidity_shares == pytest.approx(1100, rel=0.03)

    return market

# Adding Liquidity to a binary outcome market (https://help.polkamarkets.com/how-polkamarkets-works/market-liquidity/adding-liquidity#d528195e8f1a449785f8c830bbc4493f)
def simulate_market_2():
    market = PredMarketNew(liquidity=0, outcomes=2)

    # Example 2: Adding liquidity to a market with unequal outcome prices
    market.pool_wallet_usd = 10000 # This is a testing value
    market.test_set_outcome_shares(1100, [861.17, 1405.07])
    market.test_reset_user_liquidity_shares() # reset to zero
    market.test_get_market_details()
    market.test_get_user_details()

    # Bob add liquidity worth of 1000 USDC
    before_outcome_prices = market.get_outcome_prices()
    market.user_wallet_usd = 1000
    market.add_liquidity(1000)
    market.test_get_market_details()
    market.test_get_user_details() # Polkamarket stated that the final user's liquidity share is ~882, which is incorrect. It should be ~782 instead because the result should be (1882 - 1100)

    # Add liquidity should not change the outcome prices
    market.test_has_significant_change_in_outcome_prices(before_outcome_prices)

    # Verify that the end state is aligned with the scenario
    assert market.liquidity == pytest.approx(1882.88, rel=0.03)
    assert market.shares[0] == pytest.approx(1474.07, rel=0.03)
    assert market.shares[1] == pytest.approx(2405.07, rel=0.03)
    assert market.outcome_prices[0] == pytest.approx(0.62, rel=0.03)
    assert market.outcome_prices[1] == pytest.approx(0.38, rel=0.03)
    assert market.user_liquidity_shares == pytest.approx(782.88, rel=0.03)  # Polkamarket stated that the final user's liquidity share is ~882, which is incorrect. It should be ~782 instead because the result should be (1882 - 1100)
    assert market.user_outcome_shares[0] == pytest.approx(387.10, rel=0.03)

    return market

# Adding Liquidity to a multiple outcome market (https://help.polkamarkets.com/how-polkamarkets-works/market-liquidity/adding-liquidity#bd8ad99092f84fbbb0410ca6faf96304)
def simulate_market_3():
    market = PredMarketNew(liquidity=0, outcomes=4)
    market.test_get_market_details()

    # Example 3
    market.pool_wallet_usd = 10000 # This is a testing value
    market.test_set_outcome_shares(1000, [461.53, 1294, 1294, 1294])
    market.test_reset_user_liquidity_shares() # reset to zero
    market.test_get_market_details()

    # Dylan decides to add 1000 USD
    before_outcome_prices = market.get_outcome_prices()
    market.user_wallet_usd = 1000
    market.add_liquidity(1000)
    market.test_get_market_details()
    market.test_get_user_details()

    # Add liquidity should not change the outcome prices
    market.test_has_significant_change_in_outcome_prices(before_outcome_prices)

    # Verify that the end state is aligned with the scenario
    assert market.liquidity == pytest.approx(1769.68, rel=0.03)
    assert market.shares[0] == pytest.approx(812.46, rel=0.03)
    assert market.shares[1] == pytest.approx(2294, rel=0.03)
    assert market.shares[2] == pytest.approx(2294, rel=0.03)
    assert market.shares[3] == pytest.approx(2294, rel=0.03)
    assert market.outcome_prices[0] == pytest.approx(0.48, rel=0.03)
    assert market.outcome_prices[1] == pytest.approx(0.17, rel=0.03)
    assert market.outcome_prices[2] == pytest.approx(0.17, rel=0.03)
    assert market.outcome_prices[3] == pytest.approx(0.17, rel=0.03)
    assert market.user_liquidity_shares == pytest.approx(769.68, rel=0.03)
    assert market.user_outcome_shares[0] == pytest.approx(649.07, rel=0.03)

    return market

# Removing liquidity from a binary outcome market (https://help.polkamarkets.com/how-polkamarkets-works/market-liquidity/removing-liquidity#268041f4d78448c89abbfd41e2aac271)
def simulate_market_4():
    market = simulate_market_2()

    # Nearing expiration date and market change
    market.pool_wallet_usd = 10000 # This is a testing value
    market.test_set_outcome_shares(5600, [3578.97, 8762.30])
    market.test_get_market_details()
    market.test_get_user_details()

    # Bob give back all his ~782 liquidity shares
    before_outcome_prices = market.get_outcome_prices()
    market.remove_liquidity(market.user_liquidity_shares)
    market.test_get_market_details()
    market.test_get_user_details()

    # Remove liquidity must not lead to any change to the outcome prices
    market.test_has_significant_change_in_outcome_prices(before_outcome_prices)

        # Verify that the end state is aligned with the scenario
    assert market.liquidity == pytest.approx(4817.12, rel=0.03)
    assert market.shares[0] == pytest.approx(3078.629, rel=0.03)
    assert market.shares[1] == pytest.approx(7537.33, rel=0.03)
    assert market.outcome_prices[0] == pytest.approx(0.71, rel=0.03)
    assert market.outcome_prices[1] == pytest.approx(0.29, rel=0.03)
    assert market.user_liquidity_shares == pytest.approx(0, rel=0.03)
    assert market.user_outcome_shares[0] == pytest.approx(387.10, rel=0.03)
    assert market.user_outcome_shares[1] == pytest.approx(724.63, rel=0.03)


# Removing liquidity from a multiple outcome market (https://help.polkamarkets.com/how-polkamarkets-works/market-liquidity/removing-liquidity#cd72f255bbd74ca4a0261f0cd6272030)
def simulate_market_5():
    market = PredMarketNew(liquidity=0, outcomes=4)
    market.pool_wallet_usd = 10000 # This is a testing value
    market.test_set_outcome_shares(1769.68, [812.46, 2294, 2294, 2294])
    market.user_liquidity_shares = 1000
    market.test_get_market_details()
    market.test_get_user_details()

    # Charlie give back 300 liquidity shares to pool
    before_outcome_prices = market.get_outcome_prices()
    market.remove_liquidity(300)
    market.test_get_market_details()
    market.test_get_user_details()

    # Remove liquidity must not lead to any change to the outcome prices
    market.test_has_significant_change_in_outcome_prices(before_outcome_prices)

    # Verify that the end state is aligned with the scenario
    assert market.liquidity == pytest.approx(1265.59, rel=0.03)
    assert market.shares[0] == pytest.approx(581.03, rel=0.03)
    assert market.shares[1] == pytest.approx(1640.55, rel=0.03)
    assert market.shares[2] == pytest.approx(1640.55, rel=0.03)
    assert market.shares[3] == pytest.approx(1640.55, rel=0.03)
    assert market.outcome_prices[0] == pytest.approx(0.48, rel=0.03)
    assert market.outcome_prices[1] == pytest.approx(0.17, rel=0.03)
    assert market.outcome_prices[2] == pytest.approx(0.17, rel=0.03)
    assert market.outcome_prices[3] == pytest.approx(0.17, rel=0.03)
    assert market.user_liquidity_shares == pytest.approx(700, rel=0.03)
    assert market.user_outcome_shares[1] == pytest.approx(422.02, rel=0.03)
    assert market.user_outcome_shares[2] == pytest.approx(422.02, rel=0.03)
    assert market.user_outcome_shares[3] == pytest.approx(422.02, rel=0.03)

# Buy - Binary Outcome Market (https://help.polkamarkets.com/how-polkamarkets-works/trading-and-price-calculation#11a1b917582f4bf991864b5b66d61a0c)
def simulate_market_6():
    market = PredMarketNew(liquidity=0, outcomes=2)
    market.user_wallet_usd = 1294
    market.add_liquidity(1000)
    market.test_get_market_details()
    market.test_get_user_details()

    # Bob buy 294 USD worth of Outcome A shares (index 0)
    market.buy(0, 294)
    market.test_get_market_details()
    market.test_get_user_details()

    # Verify that the end state is aligned with the scenario
    assert market.liquidity == pytest.approx(1000, rel=0.03)
    assert market.shares[0] == pytest.approx(773, rel=0.03)
    assert market.shares[1] == pytest.approx(1294, rel=0.03)
    assert market.outcome_prices[0] == pytest.approx(0.63, rel=0.03)
    assert market.outcome_prices[1] == pytest.approx(0.37, rel=0.03)
    assert market.user_outcome_shares[0] == pytest.approx(521, rel=0.03)


# Buy - Multiple Outcome Market (https://help.polkamarkets.com/how-polkamarkets-works/trading-and-price-calculation#1c3acda77f744efd8e2ad7dccb4b2f86)
def simulate_market_7():
    market = PredMarketNew(liquidity=0, outcomes=4)
    market.user_wallet_usd = 1294
    market.add_liquidity(1000)
    market.test_get_market_details()
    market.test_get_user_details()

    # Bob buy 294 USD worth of Outcome A shares (index 0)
    market.buy(0, 294)
    market.test_get_market_details()
    market.test_get_user_details()

    # Verify that the end state is aligned with the scenario
    assert market.liquidity == pytest.approx(1000, rel=0.03)
    assert market.shares[0] == pytest.approx(461.53, rel=0.03)
    assert market.shares[1] == pytest.approx(1294, rel=0.03)
    assert market.shares[2] == pytest.approx(1294, rel=0.03)
    assert market.shares[3] == pytest.approx(1294, rel=0.03)
    assert market.outcome_prices[0] == pytest.approx(0.48, rel=0.03)
    assert market.outcome_prices[1] == pytest.approx(0.17, rel=0.03)
    assert market.outcome_prices[2] == pytest.approx(0.17, rel=0.03)
    assert market.outcome_prices[3] == pytest.approx(0.17, rel=0.03)
    assert market.user_outcome_shares[0] == pytest.approx(832.47, rel=0.03)

# Sell - Multiple Outcome Market
def simulate_market_8():
    market = PredMarketNew(liquidity=0, outcomes=4)
    market.user_wallet_usd = 1300
    market.add_liquidity(1000)
    market.test_get_market_details()
    market.test_get_user_details()

    before_outcome_prices = market.get_outcome_prices()
    before_shares = market.shares.copy()

    # Bob buy 300 USD worth of Outcome A shares (index 0)
    market.buy(0, 300)
    market.test_get_market_details()
    market.test_get_user_details()
    # Bob's wallet should be 0 USD, while pool's wallet should be 1300 USD (1000 + 300)
    assert market.user_wallet_usd == 0
    assert market.pool_wallet_usd == 1300

    # Bob sell 300 USD worth of Outcome A shares (index 0)
    market.sell(0, 300)
    market.test_get_market_details()
    market.test_get_user_details()
    # Bob should receive 300 USD
    assert market.user_wallet_usd == 300

    # If Bob buy and sell immediately, the state should revert back to the initial state. There should be no change to outcome share prices
    market.test_has_significant_change_in_outcome_prices(before_outcome_prices)
    market.test_has_significant_change_in_outcome_shares(before_shares)


# Simulate market resolution (Binary Outcome Market) after adding liquidity and buy
def simulate_market_9():
    market = PredMarketNew(liquidity=0, outcomes=2)
    market.test_get_market_details()
    market.test_get_user_details()

    market.user_wallet_usd = 1500
    market.add_liquidity(1000)
    market.test_get_market_details()
    market.test_get_user_details()

    market.buy(0, 500)
    market.test_get_market_details()
    market.test_get_user_details()

    # Resolve the market - Winning == Outcome 0
    market.resolve_market(0)

    # User claim all their winning Outcome 0 shares
    no_of_winning_outcome_shares = market.user_outcome_shares[0]
    market.resolution(no_of_winning_outcome_shares)
    market.test_get_market_details()
    market.test_get_user_details()
    # Verify user received the winning outcome shares (1:1 ratio)
    assert market.user_wallet_usd == no_of_winning_outcome_shares

    # User claim all their liquidity shares
    market.claim_liqudity(market.user_liquidity_shares)
    market.test_get_market_details()
    market.test_get_user_details()

    # Users deposited 1500 USD to the pool. Verify that users received back 1500 USD after market resolution and the pool is empty after all claims are completed
    assert market.user_wallet_usd == 1500
    assert market.pool_wallet_usd == 0

# Simulate market resolution (Multiple Outcome Market) after adding liquidity and buy
def simulate_market_10():
    market = PredMarketNew(liquidity=0, outcomes=4)
    market.test_get_market_details()
    market.test_get_user_details()

    market.user_wallet_usd = 1200
    market.add_liquidity(1000)
    market.test_get_market_details()
    market.test_get_user_details()

    market.buy(0, 200)
    market.test_get_market_details()
    market.test_get_user_details()

    # Resolve the market - Winning == Outcome 0
    market.resolve_market(0)

    # User claim all their winning Outcome 0 shares
    no_of_winning_outcome_shares = market.user_outcome_shares[0]
    market.resolution(no_of_winning_outcome_shares)
    market.test_get_market_details()
    market.test_get_user_details()
    # Verify user received the winning outcome shares (1:1 ratio)
    assert market.user_wallet_usd == no_of_winning_outcome_shares

    # User claim all their liquidity shares
    market.claim_liqudity(market.user_liquidity_shares)
    market.test_get_market_details()
    market.test_get_user_details()

    # Users deposited 1200 USD to the pool. Verify that users received back 1200 USD after market resolution and the pool is empty after all claims are completed
    assert market.user_wallet_usd == 1200
    assert market.pool_wallet_usd == 0

# Simulate market resolution (Multiple Outcome Market) after adding liquidity and buy. Buyer lose, LP win all
def simulate_market_11():
    market = PredMarketNew(liquidity=0, outcomes=4)
    market.test_get_market_details()
    market.test_get_user_details()

    market.user_wallet_usd = 1200
    market.add_liquidity(1000)
    market.test_get_market_details()
    market.test_get_user_details()

    market.buy(0, 200)
    market.test_get_market_details()
    market.test_get_user_details()

    # Resolve the market - Winning == Outcome 3
    market.resolve_market(3)

    # User has nothing to claim as user only owns Outcome 0 shares
    pass

    # User claim all their liquidity shares
    market.claim_liqudity(market.user_liquidity_shares)
    market.test_get_market_details()
    market.test_get_user_details()

    # LP deposited 1200 USD to the pool. Verify that LP gets back all 1200 USD after market resolution and the pool is empty after all claims are completed
    assert market.user_wallet_usd == 1200
    assert market.pool_wallet_usd == 0

# Simulate the "Multiple most likely (or least likely) outcomes were not correctly handled during add/remove liquidity - Instance 1" issue fix
def simulate_market_12():
    market = PredMarketNew(liquidity=0, outcomes=4)
    market.pool_wallet_usd = 10000 # This is a testing value
    market.test_set_outcome_shares(141.4213562, [100, 100, 200, 200])
    market.test_get_market_details()
    market.test_get_user_details()

    market.user_wallet_usd = 0
    market.user_liquidity_shares = 10
    market.remove_liquidity(5)
    market.test_get_market_details()
    market.test_get_user_details()

    # When removing liquidity, the users will receive shares of all the outcomes except for the most likely (i.e. most expensive) outcome.
    # Verify that users receive Outcome Share C and D, but not A and B
    assert market.user_outcome_shares[0] == 0
    assert market.user_outcome_shares[1] == 0
    assert market.user_outcome_shares[2] > 0
    assert market.user_outcome_shares[3] > 0

# Simulate the "Multiple most likely (or least likely) outcomes were not correctly handled during add/remove liquidity - Instance 2" issue fix
def simulate_market_13():
    market = PredMarketNew(liquidity=0, outcomes=4)

    market.user_wallet_usd = 3500
    market.add_liquidity(1000)
    market.test_get_market_details()
    market.test_get_user_details()

    market.buy(0, 1000)
    market.buy(1, 1000)
    market.test_get_market_details() # Outcome shares = [A=1125, B=98, C=3000, D=3000]
    market.test_get_user_details()

    # When adding liquidity, the users will receive shares of all the outcomes except for the least likely (i.e. least expensive) outcome.
    # Verify that users receive Outcome Share A and B, but not C and D
    previous_user_outcome_shares = market.user_outcome_shares.copy()
    market.add_liquidity(500)
    assert (market.user_outcome_shares[0] - previous_user_outcome_shares[0]) > 0
    assert (market.user_outcome_shares[1] - previous_user_outcome_shares[1]) > 0
    assert (market.user_outcome_shares[2] - previous_user_outcome_shares[2]) == 0
    assert (market.user_outcome_shares[3] - previous_user_outcome_shares[3]) == 0

# Simulate the "Multiple most likely (or least likely) outcomes were not correctly handled during add/remove liquidity - Instance 2" issue fix
# Also simulate market resolution
def simulate_market_14():
    market = PredMarketNew(liquidity=0, outcomes=4)

    market.user_wallet_usd = 3500
    market.add_liquidity(1000)
    market.test_get_market_details()
    market.test_get_user_details()

    market.buy(0, 1000)
    market.buy(1, 1000)
    market.test_get_market_details() # Outcome shares = [A=1125, B=98, C=3000, D=3000]
    market.test_get_user_details()

    # When adding liquidity, the users will receive shares of all the outcomes except for the least likely (i.e. least expensive) outcome.
    # Verify that users receive Outcome Share A and B, but not C and D
    previous_user_outcome_shares = market.user_outcome_shares.copy()
    market.add_liquidity(500)
    market.test_get_market_details()
    market.test_get_user_details()
    assert (market.user_outcome_shares[0] - previous_user_outcome_shares[0]) > 0
    assert (market.user_outcome_shares[1] - previous_user_outcome_shares[1]) > 0
    assert (market.user_outcome_shares[2] - previous_user_outcome_shares[2]) == 0
    assert (market.user_outcome_shares[3] - previous_user_outcome_shares[3]) == 0

    market.resolve_market(0) # Resolve Outcome 0 as winner
    market.claim_liqudity(market.user_liquidity_shares) # Claim all liquidity shares
    market.resolution(market.user_outcome_shares[0]) # Claim all outcome 0 shares
    market.test_get_market_details()
    market.test_get_user_details()
    # User should get back all 3500 USD, while pool should be empty (0 USD)
    assert market.user_wallet_usd == 3500
    assert market.pool_wallet_usd == 0

if __name__ == "__main__":
    #simulate_market_1()
    #simulate_market_2()
    #simulate_market_3()
    simulate_market_4()
    exit(0)
    simulate_market_5()
    simulate_market_6()
    simulate_market_7()
    simulate_market_8()
    simulate_market_9()
    simulate_market_10()
    simulate_market_11()
    simulate_market_13()
    simulate_market_14()