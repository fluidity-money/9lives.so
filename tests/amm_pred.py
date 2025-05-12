#!/usr/bin/env python3

import math
from tabulate import tabulate # pip3 install tabulate
import numpy as np # pip3 install numpy
import pytest # pip3 install pytest
import copy

class PredMarketNew:
    def __init__(self, liquidity, outcomes, fees=0.00):
        self.liquidity = liquidity
        self.outcomes = outcomes
        self.outcome_prices = [0] * outcomes
        self.shares = [liquidity] * outcomes

        self.total_shares = [liquidity] * outcomes

		# Track the total outcome shares a user own
        self.user_outcome_shares = {}
        self.user_liquidity_shares = {}
        self.user_wallet_usd = {}
        self.pool_wallet_usd = 0

        self.winning_outcome = None
        self.resolved = False

        self.fees = fees
        self.fees_collected_weighted = 0
        self.fees_collected_usd = 0
        self.fees_claimed = {}

    def add_user(self, *users):
        for user in users:
            self.user_outcome_shares[user] = [0] * self.outcomes
            self.user_liquidity_shares[user] = 0
            self.user_wallet_usd[user] = 0
            self.fees_claimed[user] = 0

    def collect_fees(self, amount):
        print("Collecting fee of: ", amount)
        self.fees_collected_weighted += amount
        self.fees_collected_usd += amount

    def transfer_from_user_to_pool(self, amount, user):
        if amount < 0:
            raise ValueError("Amount must be non-negative")

        self.user_wallet_usd[user] -= amount
        self.pool_wallet_usd += amount

        # Wallet balance can never be negative
        if self.user_wallet_usd[user] < 0 or self.pool_wallet_usd < 0:
            raise ArithmeticError("Underflow error: result is negative")

    def transfer_from_pool_to_user(self, amount, user):
        if amount < 0:
            raise ValueError("Amount must be non-negative")

        self.user_wallet_usd[user] += amount
        self.pool_wallet_usd -= amount

        # Wallet balance can never be negative
        if self.user_wallet_usd[user] < 0 or self.pool_wallet_usd < 0:
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

        # price_weight_of_all_outcomes can be zero if no liquidity is added yet. Prevent division by zero error
        if price_weight_of_all_outcomes > 0:
            # Calculate OutcomePrices
            for k in range(len(self.shares)):
                self.outcome_prices[k] = (outcome_price_weights[k] / price_weight_of_all_outcomes)

        return self.outcome_prices

    # "amount" is the amount of USD added
    def add_liquidity(self, amount, user):
        self.only_when_market_not_resolved()
        self.transfer_from_user_to_pool(amount, user)

        # Update self.outcome_prices to the latest price
        self.get_outcome_prices()

        previous_liquidity = self.liquidity

        # mints liquidity shares for a user
        for i in range(len(self.shares)):
            self.shares[i] += amount
            self.total_shares[i] += amount

        previous_shares = self.shares.copy()

        least_likely = self.shares.index(max(self.shares))
        print(f"least likely index: {least_likely}")
        # It is possible to have more than one outcome shares with the same max shares. (e.g., OutA=100, OutB=100, OutC=200, OutD=300)
        print(f"max shares: {max(self.shares)}, shares: {self.shares}")
        least_likely_indices = [i for i, s in enumerate(self.shares) if s == max(self.shares)]
        print(f"least likely indices: {least_likely_indices}")

        # Recompute all other outcome shares to preserve price ratios
        for i in range(len(self.shares)):
            if i not in least_likely_indices:
                self.shares[i] = (self.shares[least_likely] * self.outcome_prices[least_likely]) / self.outcome_prices[i]
                print(f"self shares now: {self.shares[i]}")

        print(f"shares inside add liq: {self.shares}")
        product = math.prod(self.shares)
        print(f"product inside add liq: {product}")
        print(f"about to pow inside add liq: {product}, {1/len(self.shares)}")
        new_liquidity = pow(product, 1/len(self.shares))
        print(f"new liquidity inside add liq: {new_liquidity}")
        print(f"prev liquidity inside add liq: {previous_liquidity}")

        liquidity_shares_minted = (new_liquidity - previous_liquidity)
        print(f"liquidity shares minted: {liquidity_shares_minted}")

        # Don't need to rebalance if the liquidity shares is zero
        if (self.liquidity > 0):
            self.rebalanceFee(liquidity_shares_minted, user, "add")

        self.liquidity = new_liquidity

        # Record the no. of liquidity shares user received
        self.user_liquidity_shares[user] += liquidity_shares_minted

        # During add liquidity, users will receive all the outcome shares except for the least likely
        for i in range(len(self.shares)):
            outcome_shares_received = previous_shares[i] - self.shares[i]
            # Update the outcome shares received
            self.user_outcome_shares[user][i] += outcome_shares_received

        return self.shares

     # "amount" is the number of liquidity shares the user give back to the pool
    def remove_liquidity(self, amount, user):
        self.only_when_market_not_resolved()

        # Update self.outcome_prices to the latest price
        self.get_outcome_prices()

        # Claim fee before removing the user's liquidity shares. Otherwise, those fee will be lost
        self.claim_fee(user)

        # Rebalance the weighted fee
        self.rebalanceFee(amount, user, "remove")

        previous_liquidity = self.liquidity

        # amount refers to the liquidity shares
        most_likely = self.shares.index(min(self.shares))
        # It is possible to have more than one outcome shares with the same min shares. (e.g., OutA=100, OutB=100, OutC=200, OutD=300)
        most_likely_indices = [i for i, s in enumerate(self.shares) if s == min(self.shares)]

        least_likely = self.shares.index(max(self.shares))

        # "amount" is the number of liquidity shares the user give back to the pool
        # Incorrect: liquiditysharesvalue = self.liquidity / self.shares[least_likely] * amount
        liquiditysharesvalue = (self.shares[most_likely] * amount) / self.liquidity
        print("liquiditysharesvalue = ", liquiditysharesvalue)
        self.transfer_from_pool_to_user(liquiditysharesvalue, user)

        for i in range(len(self.shares)):
            self.shares[i] -= liquiditysharesvalue
            print(f"taking from total shares {self.total_shares[i]} - {liquiditysharesvalue}")
            self.total_shares[i] -= liquiditysharesvalue

        previous_shares = self.shares.copy()

        for i in range(len(self.shares)):
            if i not in most_likely_indices:
                self.shares[i] = (self.shares[most_likely] * self.outcome_prices[most_likely]) / self.outcome_prices[i]
                print("Removed self.shares[{}] = {}".format(i, self.shares[i]))

        product = math.prod(self.shares)

        # Below math is same as "self.liquidity = self.liquidity - amount"
        self.liquidity = pow(product, 1/len(self.shares))

         # Deduct the number of liquidity shares the user give back to the pool.
        self.user_liquidity_shares[user] -= amount

        # During remove liquidity, users will receive all the outcome shares except for the most likely
        for i in range(len(self.shares)):
            outcome_shares_received = previous_shares[i] - self.shares[i]
            # Update the outcome shares received
            self.user_outcome_shares[user][i] += outcome_shares_received

        return self.shares


    def buy(self, outcome, amount, user): # audit - "amount" is in USD
        self.only_when_market_not_resolved()
        self.transfer_from_user_to_pool(amount, user) # Transfer the USD to this pool

        # Fee collection logic
        fee = self.fees * amount
        self.collect_fees(fee)
        self.pool_wallet_usd -= fee # A portion of the "amount" transfer into the pool belong to the fee address. Thus, it must be transfer from the pool to fee address.
        amount_without_fee = amount - fee # Deduct the fee from the amount

        print(f"amount without fee: {amount_without_fee}")

        # Update all shares with the purchase amount
        for i in range(len(self.shares)):
            self.shares[i] += amount_without_fee
            self.total_shares[i] += amount_without_fee

        previous_shares = self.shares.copy()

        # Product of all outcome shares except for the one to be bought
        product = math.prod([value for i, value in enumerate(self.shares) if i != outcome])
        # Adjust the specified outcome's share to keep balance
        self.shares[outcome] = pow(self.liquidity, self.outcomes) / product

        # Outcome shares transferred from pool to user
        print(f"Transferring some outcome shares to user: previous_shares[outcome] ({previous_shares[outcome]}) - self.shares[outcome] ({self.shares[outcome]})")
        self.user_outcome_shares[user][outcome] += (previous_shares[outcome] - self.shares[outcome])

        return self.shares

    def inverse_sell(self, outcome, shares_to_sell, user, tolerance=1e-6, max_iterations=1000):
        """
        Find how many USD you would receive for selling a specific number of shares.

        Args:
            outcome: The outcome index
            shares_to_sell: Number of outcome shares the user wants to sell
            user: User identifier
            tolerance: Acceptable error in the result
            max_iterations: Maximum number of binary search iterations

        Returns:
            The USD amount the user would receive
        """
        # Check if user has enough shares
        if shares_to_sell > self.user_outcome_shares[user][outcome]:
            raise ArithmeticError("Insufficient shares to sell")

        # Initial lower and upper bounds for binary search
        # Start with reasonable bounds for the USD amount
        lower_bound = 0.0
        # Set upper bound assuming worst case scenario (1:1 exchange rate + fees)
        upper_bound = shares_to_sell * 2  # Generous upper bound

        iteration = 0
        current_usd = (lower_bound + upper_bound) / 2

        while iteration < max_iterations:
            # Create a deep copy of the market state to avoid modifying it
            market_copy = copy.deepcopy(self)

            print(f"current usd: {current_usd}")

            try:
                # Call sell function and observe how many shares would be deducted
                old_shares = market_copy.user_outcome_shares[user][outcome]
                market_copy.sell(outcome, current_usd, user)
                shares_deducted = old_shares - market_copy.user_outcome_shares[user][outcome]

                # Compare with our target
                error = shares_deducted - shares_to_sell

                if abs(error) < tolerance:
                    # We've found a close enough solution
                    return current_usd

                if error > 0:  # We deducted too many shares
                    # This means our USD amount is too high
                    upper_bound = current_usd
                else:  # We deducted too few shares
                    # This means our USD amount is too low
                    lower_bound = current_usd

                # Update our guess
                current_usd = (lower_bound + upper_bound) / 2

            except ArithmeticError:
                # If the sell operation fails, our USD amount is too high
                upper_bound = current_usd
                current_usd = (lower_bound + upper_bound) / 2

            iteration += 1

        # If we've reached the max iterations, return our best guess
        return current_usd

    def sell(self, outcome, amount, user):
        self.only_when_market_not_resolved()

        # Fee Logic
        # Assume the fee is 2% (0.02) and user wants to withdraw 100 USD (amount=100)
        # Compute X where after charging 2% fee against X, the remaining X will be 100
        # Formula to use: X = 100/(1 - fee) = 100/(1-0.02) = 100/0.98 = 102.04081632653062
        # Charging 2% fee against 102.04081632653062. 102.04081632653062 - (102.04081632653062 * 0.02) = 100
        # Formula for fee: amount/(1 - fee) - amount => re-arrange => (amount * fee) / (1 - fee)
        fee = (amount * self.fees) / (1 - self.fees)
        # Add fee to the amount
        amount_with_fee = amount + fee

        # Update all shares with the purchase amount
        for i in range(len(self.shares)):
            print(f"self shares[i] ({self.shares[i]}) - amount with fee ({amount_with_fee}): {self.shares[i] - amount_with_fee}")
            self.shares[i] -= amount_with_fee
            self.total_shares[i] -= amount_with_fee

        previous_shares = self.shares.copy()

        # Product of all outcome shares except for the one to be bought
        product = math.prod([value for i, value in enumerate(self.shares) if i != outcome])
        # Adjust the specified outcome's share to keep balance
        self.shares[outcome] = pow(self.liquidity, self.outcomes) / product

        # Outcome shares transferred from user to pool
        user_deducted_by = (self.shares[outcome] - previous_shares[outcome])
        if user_deducted_by > self.user_outcome_shares[user][outcome]:
            raise ArithmeticError("Insufficient shares to sell")

        self.user_outcome_shares[user][outcome] -= user_deducted_by

        self.transfer_from_pool_to_user(amount, user)
        self.collect_fees(fee)
        self.pool_wallet_usd -= fee # The fee computed must be transfer from the pool to fee address.

        return self.shares

    def resolve_market(self, winning_outcome):
        self.only_when_market_not_resolved()
        self.winning_outcome = winning_outcome
        self.resolved = True

    # "no_of_winning_outcome_shares" is the number of winning outcome shares the user holds.
    def resolution(self, no_of_winning_outcome_shares, user):
        self.only_when_market_resolved()

        if no_of_winning_outcome_shares > self.user_outcome_shares[user][self.winning_outcome]:
            raise ArithmeticError("Insufficient winning outcome shares")

        payoff_per_share = 1
        winning_in_usd = no_of_winning_outcome_shares * payoff_per_share

        self.transfer_from_pool_to_user(winning_in_usd, user)

        # Burn the user's claimed winning outcome shares to avoid double claim
        self.user_outcome_shares[user][self.winning_outcome] -= no_of_winning_outcome_shares

        return winning_in_usd

    def claim_liqudity(self, no_of_liquidity_shares, user):
        self.only_when_market_resolved()

        if no_of_liquidity_shares > self.user_liquidity_shares[user]:
            raise ArithmeticError("Insufficient liquidity shares")

        liqudity_price = self.shares[self.winning_outcome] / self.liquidity
        claimed_amount = no_of_liquidity_shares * liqudity_price

        self.transfer_from_pool_to_user(claimed_amount, user)

        # Burn the user's claimed liquidity shares to avoid double claim
        self.user_liquidity_shares[user] -= no_of_liquidity_shares

        return claimed_amount

    def claim_fee(self, user):
        fee_entitled = (self.user_liquidity_shares[user] * self.fees_collected_weighted) / self.liquidity
        print(f"{user} - claim_fee: ({self.user_liquidity_shares[user]} * {self.fees_collected_weighted}) / {self.liquidity} = {(self.user_liquidity_shares[user] * self.fees_collected_weighted) / self.liquidity}")

        if (fee_entitled <= self.fees_claimed[user]):
            return 0

        amount_not_claimed = fee_entitled - self.fees_claimed[user]

        self.fees_collected_usd -= amount_not_claimed

        self.user_wallet_usd[user] += amount_not_claimed
        self.fees_claimed[user] += amount_not_claimed # This ensure that user cannot double-claim the fee

    def rebalanceFee(self, liquidity_shares, user, operation):
        fee_weight = (liquidity_shares * self.fees_collected_weighted) / self.liquidity
        print(f"{user} - rebalanceFee: ({liquidity_shares} * {self.fees_collected_weighted}) / {self.liquidity} = {(liquidity_shares * self.fees_collected_weighted) / self.liquidity}")

        if (operation == "add"):
            self.fees_collected_weighted += fee_weight
            self.fees_claimed[user] += fee_weight
        elif (operation == "remove"):
            self.fees_collected_weighted -= fee_weight
            self.fees_claimed[user] -= fee_weight
        else:
            raise ValueError("Invalid operation")

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
        print("Fees Collected (Weighted): ", self.fees_collected_weighted)
        print("Fees Balance in the Pool (USD): ", self.fees_collected_usd)
        print(tabulate(table_data, headers=headers, tablefmt="grid"))

    def test_get_user_details(self, user):
         # Get the outcome prices
        outcome_prices = self.get_outcome_prices()

         # Prepare the data to display in a table
        table_data = []
        for i in range(len(self.shares)):
            table_data.append([f"Outcome {i}", self.user_outcome_shares[user][i], outcome_prices[i]])

        headers = ["Outcome", "Shares", "Price"]
        print(f" === User Details ({user}) === ")
        print("User Liquidty Share: ", self.user_liquidity_shares[user])
        print("User Wallet (USD): ", self.user_wallet_usd[user])
        print("User fee claimed (weighted): ", self.fees_claimed[user])
        print(tabulate(table_data, headers=headers, tablefmt="grid"))

    def test_set_outcome_shares(self, liquidity, new_shares):
        self.liquidity = liquidity
        self.shares = new_shares
        self.get_outcome_prices() # refresh the outcome prices based on updated outcome shares

    def test_reset_user_liquidity_shares(self, user):
        self.user_liquidity_shares[user] = 0

    def test_has_significant_change_in_outcome_prices(self, before_prices, threshold=0.0001):
        assert self.get_outcome_prices() == pytest.approx(before_prices, rel=0.0001)

    def test_has_significant_change_in_outcome_shares(self, before_shares, threshold=0.0001):
        assert self.shares == pytest.approx(before_shares, rel=0.0001)

 # Adding Liquidity to a binary outcome market (https://help.polkamarkets.com/how-polkamarkets-works/market-liquidity/adding-liquidity#d528195e8f1a449785f8c830bbc4493f)
def simulate_market_1():
    market = PredMarketNew(liquidity=0, outcomes=2)

    ALICE, BOB, CHARLES = "Alice", "Bob", "Charles"
    market.add_user(ALICE, BOB, CHARLES)

    market.user_wallet_usd[ALICE] = 1100 # Fund Alice's wallet 1100 USD
    market.add_liquidity(100, ALICE)
    market.test_get_market_details()
    market.test_get_user_details(ALICE)

    # Example 1: Adding liquidity to a market with equal outcome prices
    # Alice add liquidity of 1000 USDC
    before_outcome_prices = market.get_outcome_prices()
    market.add_liquidity(1000, ALICE)
    market.test_get_market_details()
    market.test_get_user_details(ALICE)
    market.test_has_significant_change_in_outcome_prices(before_outcome_prices)

    # Verify that the end state is aligned with the scenario
    assert market.liquidity == pytest.approx(1100, rel=0.03)
    assert market.shares[0] == pytest.approx(1100, rel=0.03)
    assert market.shares[1] == pytest.approx(1100, rel=0.03)
    assert market.outcome_prices[0] == pytest.approx(0.5, rel=0.03)
    assert market.outcome_prices[1] == pytest.approx(0.5, rel=0.03)
    assert market.user_liquidity_shares[ALICE] == pytest.approx(1100, rel=0.03)

    return market

# Adding Liquidity to a binary outcome market (https://help.polkamarkets.com/how-polkamarkets-works/market-liquidity/adding-liquidity#d528195e8f1a449785f8c830bbc4493f)
def simulate_market_2():
    market = PredMarketNew(liquidity=0, outcomes=2)

    ALICE, BOB, CHARLES = "Alice", "Bob", "Charles"
    market.add_user(ALICE, BOB, CHARLES)

    # Example 2: Adding liquidity to a market with unequal outcome prices
    market.pool_wallet_usd = 10000 # This is a testing value
    market.test_set_outcome_shares(1100, [861.17, 1405.07])
    market.test_reset_user_liquidity_shares(ALICE) # reset to zero
    market.test_get_market_details()
    market.test_get_user_details(ALICE)

    # Bob add liquidity worth of 1000 USDC
    before_outcome_prices = market.get_outcome_prices()
    market.user_wallet_usd[ALICE] = 1000
    market.add_liquidity(1000, ALICE)
    market.test_get_market_details()
    market.test_get_user_details(ALICE) # Polkamarket stated that the final user's liquidity share is ~882, which is incorrect. It should be ~782 instead because the result should be (1882 - 1100)

    # Add liquidity should not change the outcome prices
    market.test_has_significant_change_in_outcome_prices(before_outcome_prices)

    # Verify that the end state is aligned with the scenario
    assert market.liquidity == pytest.approx(1882.88, rel=0.03)
    assert market.shares[0] == pytest.approx(1474.07, rel=0.03)
    assert market.shares[1] == pytest.approx(2405.07, rel=0.03)
    assert market.outcome_prices[0] == pytest.approx(0.62, rel=0.03)
    assert market.outcome_prices[1] == pytest.approx(0.38, rel=0.03)
    assert market.user_liquidity_shares[ALICE] == pytest.approx(782.88, rel=0.03)  # Polkamarket stated that the final user's liquidity share is ~882, which is incorrect. It should be ~782 instead because the result should be (1882 - 1100)
    assert market.user_outcome_shares[ALICE][0] == pytest.approx(387.10, rel=0.03)

    return market

# Adding Liquidity to a multiple outcome market (https://help.polkamarkets.com/how-polkamarkets-works/market-liquidity/adding-liquidity#bd8ad99092f84fbbb0410ca6faf96304)
def simulate_market_3():
    market = PredMarketNew(liquidity=0, outcomes=4)
    market.test_get_market_details()

    ALICE, BOB, CHARLES = "Alice", "Bob", "Charles"
    market.add_user(ALICE, BOB, CHARLES)

    # Example 3
    market.pool_wallet_usd = 10000 # This is a testing value
    market.test_set_outcome_shares(1000, [461.53, 1294, 1294, 1294])
    market.test_reset_user_liquidity_shares(ALICE) # reset to zero
    market.test_get_market_details()

    # Dylan decides to add 1000 USD
    before_outcome_prices = market.get_outcome_prices()
    market.user_wallet_usd[ALICE] = 1000
    market.add_liquidity(1000, ALICE)
    market.test_get_market_details()
    market.test_get_user_details(ALICE)

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
    assert market.user_liquidity_shares[ALICE] == pytest.approx(769.68, rel=0.03)
    assert market.user_outcome_shares[ALICE][0] == pytest.approx(649.07, rel=0.03)

    return market

# Removing liquidity from a binary outcome market (https://help.polkamarkets.com/how-polkamarkets-works/market-liquidity/removing-liquidity#268041f4d78448c89abbfd41e2aac271)
def simulate_market_4():
    market = simulate_market_2()

    ALICE, BOB, CHARLES = "Alice", "Bob", "Charles" # market.add_user() already called in simulate_market_2() above

    # Nearing expiration date and market change
    market.pool_wallet_usd = 10000 # This is a testing value
    market.test_set_outcome_shares(5600, [3578.97, 8762.30])
    market.test_get_market_details()
    market.test_get_user_details(ALICE)

    # Bob give back all his ~782 liquidity shares
    before_outcome_prices = market.get_outcome_prices()
    market.remove_liquidity(market.user_liquidity_shares[ALICE], ALICE)
    market.test_get_market_details()
    market.test_get_user_details(ALICE)

    # Remove liquidity must not lead to any change to the outcome prices
    market.test_has_significant_change_in_outcome_prices(before_outcome_prices)

        # Verify that the end state is aligned with the scenario
    assert market.liquidity == pytest.approx(4817.12, rel=0.03)
    assert market.shares[0] == pytest.approx(3078.629, rel=0.03)
    assert market.shares[1] == pytest.approx(7537.33, rel=0.03)
    assert market.outcome_prices[0] == pytest.approx(0.71, rel=0.03)
    assert market.outcome_prices[1] == pytest.approx(0.29, rel=0.03)
    assert market.user_liquidity_shares[ALICE] == pytest.approx(0, rel=0.03)
    assert market.user_outcome_shares[ALICE][0] == pytest.approx(387.10, rel=0.03)
    assert market.user_outcome_shares[ALICE][1] == pytest.approx(724.63, rel=0.03)


# Removing liquidity from a multiple outcome market (https://help.polkamarkets.com/how-polkamarkets-works/market-liquidity/removing-liquidity#cd72f255bbd74ca4a0261f0cd6272030)
def simulate_market_5():
    market = PredMarketNew(liquidity=0, outcomes=4)
    market.pool_wallet_usd = 10000 # This is a testing value
    market.test_set_outcome_shares(1769.68, [812.46, 2294, 2294, 2294])

    ALICE, BOB, CHARLES = "Alice", "Bob", "Charles"
    market.add_user(ALICE, BOB, CHARLES)

    market.user_liquidity_shares[CHARLES] = 1000
    market.test_get_market_details()
    market.test_get_user_details(CHARLES)

    # Charlie give back 300 liquidity shares to pool
    before_outcome_prices = market.get_outcome_prices()
    market.remove_liquidity(300, CHARLES)
    market.test_get_market_details()
    market.test_get_user_details(CHARLES)

    # Remove liquidity must not lead to any change to the outcome prices
    market.test_has_significant_change_in_outcome_prices(before_outcome_prices)

# Buy - Binary Outcome Market (https://help.polkamarkets.com/how-polkamarkets-works/trading-and-price-calculation#11a1b917582f4bf991864b5b66d61a0c)
def simulate_market_6():
    market = PredMarketNew(liquidity=0, outcomes=2)

    ALICE, BOB, CHARLES = "Alice", "Bob", "Charles"
    market.add_user(ALICE, BOB, CHARLES)

    market.user_wallet_usd[ALICE] = 1294
    market.add_liquidity(1000, ALICE)
    market.test_get_market_details()
    market.test_get_user_details(ALICE)

    # Bob buy 294 USD worth of Outcome A shares (index 0)
    market.buy(0, 294, ALICE)
    market.test_get_market_details()
    market.test_get_user_details(ALICE)

    # Verify that the end state is aligned with the scenario
    assert market.liquidity == pytest.approx(1000, rel=0.03)
    assert market.shares[0] == pytest.approx(773, rel=0.03)
    assert market.shares[1] == pytest.approx(1294, rel=0.03)
    assert market.outcome_prices[0] == pytest.approx(0.63, rel=0.03)
    assert market.outcome_prices[1] == pytest.approx(0.37, rel=0.03)
    assert market.user_outcome_shares[ALICE][0] == pytest.approx(521, rel=0.03)


# Buy - Multiple Outcome Market (https://help.polkamarkets.com/how-polkamarkets-works/trading-and-price-calculation#1c3acda77f744efd8e2ad7dccb4b2f86)
def simulate_market_7():
    market = PredMarketNew(liquidity=0, outcomes=4)

    ALICE, BOB, CHARLES = "Alice", "Bob", "Charles"
    market.add_user(ALICE, BOB, CHARLES)

    market.user_wallet_usd[ALICE] = 1294
    market.add_liquidity(1000, ALICE)
    market.test_get_market_details()
    market.test_get_user_details(ALICE)

    # Bob buy 294 USD worth of Outcome A shares (index 0)
    market.buy(0, 294, ALICE)
    market.test_get_market_details()
    market.test_get_user_details(ALICE)

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
    assert market.user_outcome_shares[ALICE][0] == pytest.approx(832.47, rel=0.03)

# Sell - Multiple Outcome Market
def simulate_market_8():
    market = PredMarketNew(liquidity=0, outcomes=4)

    ALICE, BOB, CHARLES = "Alice", "Bob", "Charles"
    market.add_user(ALICE, BOB, CHARLES)

    market.user_wallet_usd[ALICE] = 1300
    market.add_liquidity(1000, ALICE)
    market.test_get_market_details()
    market.test_get_user_details(ALICE)

    before_outcome_prices = market.get_outcome_prices()
    before_shares = market.shares.copy()

    # Bob buy 300 USD worth of Outcome A shares (index 0)
    market.buy(0, 300, ALICE)
    market.test_get_market_details()
    market.test_get_user_details(ALICE)
    # Bob's wallet should be 0 USD, while pool's wallet should be 1300 USD (1000 + 300)
    assert market.user_wallet_usd[ALICE] == 0
    assert market.pool_wallet_usd == 1300

    # Bob sell 300 USD worth of Outcome A shares (index 0)
    market.sell(0, 300, ALICE)
    market.test_get_market_details()
    market.test_get_user_details(ALICE)
    # Bob should receive 300 USD
    assert market.user_wallet_usd[ALICE] == 300

    # If Bob buy and sell immediately, the state should revert back to the initial state. There should be no change to outcome share prices
    market.test_has_significant_change_in_outcome_prices(before_outcome_prices)
    market.test_has_significant_change_in_outcome_shares(before_shares)


# Simulate market resolution (Binary Outcome Market) after adding liquidity and buy
def simulate_market_9():
    market = PredMarketNew(liquidity=0, outcomes=2)

    ALICE, BOB, CHARLES = "Alice", "Bob", "Charles"
    market.add_user(ALICE, BOB, CHARLES)

    market.test_get_market_details()
    market.test_get_user_details(ALICE)

    market.user_wallet_usd[ALICE] = 1500
    market.add_liquidity(1000, ALICE)
    market.test_get_market_details()
    market.test_get_user_details(ALICE)

    market.buy(0, 500, ALICE)
    market.test_get_market_details()
    market.test_get_user_details(ALICE)

    # Resolve the market - Winning == Outcome 0
    market.resolve_market(0)

    # User claim all their winning Outcome 0 shares
    no_of_winning_outcome_shares = market.user_outcome_shares[ALICE][0]
    market.resolution(no_of_winning_outcome_shares, ALICE)
    market.test_get_market_details()
    market.test_get_user_details(ALICE)
    # Verify user received the winning outcome shares (1:1 ratio)
    assert market.user_wallet_usd[ALICE] == no_of_winning_outcome_shares

    # User claim all their liquidity shares
    market.claim_liqudity(market.user_liquidity_shares[ALICE], ALICE)
    market.test_get_market_details()
    market.test_get_user_details(ALICE)

    # Users deposited 1500 USD to the pool. Verify that users received back 1500 USD after market resolution and the pool is empty after all claims are completed
    assert market.user_wallet_usd[ALICE] == 1500
    assert market.pool_wallet_usd == 0

# Simulate market resolution (Multiple Outcome Market) after adding liquidity and buy
def simulate_market_10():
    market = PredMarketNew(liquidity=0, outcomes=4)

    ALICE, BOB, CHARLES = "Alice", "Bob", "Charles"
    market.add_user(ALICE, BOB, CHARLES)

    market.test_get_market_details()
    market.test_get_user_details(ALICE)

    market.user_wallet_usd[ALICE] = 1200
    market.add_liquidity(1000, ALICE)
    market.test_get_market_details()
    market.test_get_user_details(ALICE)

    market.buy(0, 200, ALICE)
    market.test_get_market_details()
    market.test_get_user_details(ALICE)

    # Resolve the market - Winning == Outcome 0
    market.resolve_market(0)

    # User claim all their winning Outcome 0 shares
    no_of_winning_outcome_shares = market.user_outcome_shares[ALICE][0]
    market.resolution(no_of_winning_outcome_shares, ALICE)
    market.test_get_market_details()
    market.test_get_user_details(ALICE)
    # Verify user received the winning outcome shares (1:1 ratio)
    assert market.user_wallet_usd[ALICE] == no_of_winning_outcome_shares

    # User claim all their liquidity shares
    market.claim_liqudity(market.user_liquidity_shares[ALICE], ALICE)
    market.test_get_market_details()
    market.test_get_user_details(ALICE)

    # Users deposited 1200 USD to the pool. Verify that users received back 1200 USD after market resolution and the pool is empty after all claims are completed
    assert market.user_wallet_usd[ALICE] == 1200
    assert market.pool_wallet_usd == 0

# Simulate market resolution (Multiple Outcome Market) after adding liquidity and buy. Buyer lose, LP win all
def simulate_market_11():
    market = PredMarketNew(liquidity=0, outcomes=4)

    ALICE, BOB, CHARLES = "Alice", "Bob", "Charles"
    market.add_user(ALICE, BOB, CHARLES)

    market.test_get_market_details()
    market.test_get_user_details(ALICE)

    market.user_wallet_usd[ALICE] = 1200
    market.add_liquidity(1000, ALICE)
    market.test_get_market_details()
    market.test_get_user_details(ALICE)

    market.buy(0, 200, ALICE)
    market.test_get_market_details()
    market.test_get_user_details(ALICE)

    # Resolve the market - Winning == Outcome 3
    market.resolve_market(3)

    # User has nothing to claim as user only owns Outcome 0 shares
    pass

    # User claim all their liquidity shares
    market.claim_liqudity(market.user_liquidity_shares[ALICE], ALICE)
    market.test_get_market_details()
    market.test_get_user_details(ALICE)

    # LP deposited 1200 USD to the pool. Verify that LP gets back all 1200 USD after market resolution and the pool is empty after all claims are completed
    assert market.user_wallet_usd[ALICE] == 1200
    assert market.pool_wallet_usd == 0

# Simulate the "Multiple most likely (or least likely) outcomes were not correctly handled during add/remove liquidity - Instance 1" issue fix
def simulate_market_12():
    market = PredMarketNew(liquidity=0, outcomes=4)

    ALICE, BOB, CHARLES = "Alice", "Bob", "Charles"
    market.add_user(ALICE, BOB, CHARLES)

    market.pool_wallet_usd = 10000 # This is a testing value
    market.test_set_outcome_shares(141.4213562, [100, 100, 200, 200])
    market.test_get_market_details()
    market.test_get_user_details(ALICE)

    market.user_wallet_usd[ALICE] = 0
    market.user_liquidity_shares[ALICE] = 10
    market.remove_liquidity(5, ALICE)
    market.test_get_market_details()
    market.test_get_user_details(ALICE)

    # When removing liquidity, the users will receive shares of all the outcomes except for the most likely (i.e. most expensive) outcome.
    # Verify that users receive Outcome Share C and D, but not A and B
    assert market.user_outcome_shares[ALICE][0] == 0
    assert market.user_outcome_shares[ALICE][1] == 0
    assert market.user_outcome_shares[ALICE][2] > 0
    assert market.user_outcome_shares[ALICE][3] > 0

# Simulate the "Multiple most likely (or least likely) outcomes were not correctly handled during add/remove liquidity - Instance 2" issue fix
def simulate_market_13():
    market = PredMarketNew(liquidity=0, outcomes=4)

    ALICE, BOB, CHARLES = "Alice", "Bob", "Charles"
    market.add_user(ALICE, BOB, CHARLES)

    market.user_wallet_usd[ALICE] = 3500
    market.add_liquidity(1000, ALICE)
    market.test_get_market_details()
    market.test_get_user_details(ALICE)

    market.buy(0, 1000, ALICE)
    market.buy(1, 1000, ALICE)
    market.test_get_market_details() # Outcome shares = [A=1125, B=98, C=3000, D=3000]
    market.test_get_user_details(ALICE)

    # When adding liquidity, the users will receive shares of all the outcomes except for the least likely (i.e. least expensive) outcome.
    # Verify that users receive Outcome Share A and B, but not C and D
    previous_user_outcome_shares = copy.deepcopy(market.user_outcome_shares) # market.user_outcome_shares = {'Alice': [1875.0, 2901.2345679012346, 0, 0] ...}. A deep copy is needed here so that copies it copies the outer dict and also recursively copies all inner lists.
    market.add_liquidity(500, ALICE)
    assert (market.user_outcome_shares[ALICE][0] - previous_user_outcome_shares[ALICE][0]) > 0
    assert (market.user_outcome_shares[ALICE][1] - previous_user_outcome_shares[ALICE][1]) > 0
    assert (market.user_outcome_shares[ALICE][2] - previous_user_outcome_shares[ALICE][2]) == 0
    assert (market.user_outcome_shares[ALICE][3] - previous_user_outcome_shares[ALICE][3]) == 0

# Simulate the "Multiple most likely (or least likely) outcomes were not correctly handled during add/remove liquidity - Instance 2" issue fix
# Also simulate market resolution
def simulate_market_14():
    market = PredMarketNew(liquidity=0, outcomes=4)

    ALICE, BOB, CHARLES = "Alice", "Bob", "Charles"
    market.add_user(ALICE, BOB, CHARLES)

    market.user_wallet_usd[ALICE] = 3500
    market.add_liquidity(1000, ALICE)
    market.test_get_market_details()
    market.test_get_user_details(ALICE)

    market.buy(0, 1000, ALICE)
    market.buy(1, 1000, ALICE)
    market.test_get_market_details() # Outcome shares = [A=1125, B=98, C=3000, D=3000]
    market.test_get_user_details(ALICE)

    # When adding liquidity, the users will receive shares of all the outcomes except for the least likely (i.e. least expensive) outcome.
    # Verify that users receive Outcome Share A and B, but not C and D
    previous_user_outcome_shares = copy.deepcopy(market.user_outcome_shares)
    market.add_liquidity(500, ALICE)
    market.test_get_market_details()
    market.test_get_user_details(ALICE)
    assert (market.user_outcome_shares[ALICE][0] - previous_user_outcome_shares[ALICE][0]) > 0
    assert (market.user_outcome_shares[ALICE][1] - previous_user_outcome_shares[ALICE][1]) > 0
    assert (market.user_outcome_shares[ALICE][2] - previous_user_outcome_shares[ALICE][2]) == 0
    assert (market.user_outcome_shares[ALICE][3] - previous_user_outcome_shares[ALICE][3]) == 0

    market.resolve_market(0) # Resolve Outcome 0 as winner
    market.claim_liqudity(market.user_liquidity_shares[ALICE], ALICE) # Claim all liquidity shares
    market.resolution(market.user_outcome_shares[ALICE][0], ALICE) # Claim all outcome 0 shares
    market.test_get_market_details()
    market.test_get_user_details(ALICE)
    # User should get back all 3500 USD, while pool should be empty (0 USD)
    assert market.user_wallet_usd[ALICE] == 3500
    assert market.pool_wallet_usd == 0

# Simulate:
# 1. Adding liquidity 1000 USD
# 2. Buying 300 USD worth of Outcome A shares (index 0)
# 3. Adding liquidity 500 USD
# 4. Removing all liquidity shares (384.6153846153845)
# 5. Removing all liquidity shares (1000)
# 6. Resolving the market with Outcome 0 as winner
# 8. Claiming all outcome shares
# 9. User should get back all 1800 USD, while pool should be empty (0 USD)
def simulate_market_15():
    market = PredMarketNew(liquidity=0, outcomes=4)

    ALICE, BOB, CHARLES = "Alice", "Bob", "Charles"
    market.add_user(ALICE, BOB, CHARLES)

    market.user_wallet_usd[ALICE] = 1800
    market.add_liquidity(1000, ALICE) # User receive 1000 liquidity shares
    market.test_get_market_details()
    market.test_get_user_details(ALICE)

    market.buy(0, 300, ALICE)
    market.test_get_market_details()
    market.test_get_user_details(ALICE)

    market.add_liquidity(500, ALICE) # User receive 384.6153846153845 liquidity shares
    market.test_get_market_details()
    market.test_get_user_details(ALICE)

    market.remove_liquidity(384.6153846153845, ALICE)
    exit(0)
    market.test_get_market_details()
    market.test_get_user_details(ALICE)
    assert market.liquidity == 1000

    market.remove_liquidity(1000, ALICE)
    market.test_get_market_details()
    market.test_get_user_details(ALICE)
    assert market.liquidity == 0

    print("Market Resolved - Winner is Outcome 0")
    market.resolve_market(0) # Resolve Outcome 0 as winner
    market.resolution(market.user_outcome_shares[ALICE][0], ALICE) # Claim all outcome 0 shares
    market.test_get_market_details()
    market.test_get_user_details(ALICE)
    assert market.user_wallet_usd[ALICE] == 1800 # User should get back all 1800 USD
    assert market.pool_wallet_usd == 0 # Pool should be empty (0 USD)

# Simulate the "Fee Collection" feature during buy/sell
def simulate_market_16():
    market = PredMarketNew(liquidity=0, outcomes=2, fees=0.02)

    ALICE, BOB, CHARLES = "Alice", "Bob", "Charles"
    market.add_user(ALICE, BOB, CHARLES)

    market.user_wallet_usd[ALICE] = 2000
    market.add_liquidity(1000, ALICE) # User receive 1000 liquidity shares
    market.test_get_market_details()
    market.test_get_user_details(ALICE)

    market.buy(0, 500, ALICE)
    market.test_get_market_details()
    market.test_get_user_details(ALICE)
    assert market.fees_collected_weighted == 10 # 2% of 500 USD = 10 USD

    market.sell(0, 100, ALICE)
    market.test_get_market_details()
    market.test_get_user_details(ALICE)
    assert market.fees_collected_weighted == 10 + (100 * 0.02)/0.98 # Earlier collected 10 USD + 2.040816326530612 USD collected from selling

# Simulate the "Fee Collection" feature during buy/sell + Also resolve the market to verify that it closed properly
def simulate_market_17():
    market = PredMarketNew(liquidity=0, outcomes=2, fees=0.02)

    ALICE, BOB, CHARLES = "Alice", "Bob", "Charles"
    market.add_user(ALICE, BOB, CHARLES)

    market.user_wallet_usd[ALICE] = 500
    market.user_wallet_usd[BOB] = 500
    market.add_liquidity(500, ALICE) # Alice receive 1000 liquidity shares
    market.add_liquidity(500, BOB) # Bob receive 1000 liquidity shares
    market.test_get_market_details()
    market.test_get_user_details(ALICE)
    market.test_get_user_details(BOB)

    market.user_wallet_usd[CHARLES] = 500
    market.buy(0, 500, CHARLES)
    market.test_get_market_details()
    market.test_get_user_details(CHARLES)
    assert market.fees_collected_weighted == 10 # 2% of 500 USD = 10 USD

    market.sell(0, 100, CHARLES) # Charles wants to receive 100 USD. The sell functions will calculate the amount of shares to burn/sell to achieve (100 + fee) USD
    market.test_get_market_details()
    market.test_get_user_details(CHARLES)
    assert market.user_wallet_usd[CHARLES] == 100 # Charles should receive 100 USD after selling
    target_fee_colected = 10 + (100 * 0.02)/0.98
    assert market.fees_collected_weighted == target_fee_colected # Earlier collected 10 USD + 2.040816326530612 USD collected from selling

    half_of_target_fee_colected = target_fee_colected / 2
    before_alice_wallet_usd = market.user_wallet_usd[ALICE]
    market.claim_fee(ALICE)
    market.test_get_user_details(ALICE)
    fee_collected_alice = market.user_wallet_usd[ALICE] - before_alice_wallet_usd
    assert fee_collected_alice == half_of_target_fee_colected

    # Alice tries to claim fee again, the amount should be zero
    assert market.claim_fee(ALICE) == 0

    before_bob_wallet_usd = market.user_wallet_usd[BOB]
    market.claim_fee(BOB)
    market.test_get_user_details(BOB)
    fee_collected_bob = market.user_wallet_usd[BOB] - before_bob_wallet_usd
    assert fee_collected_bob == half_of_target_fee_colected

    # Bob tries to claim fee again, the amount should be zero
    assert market.claim_fee(BOB) == 0

    # All fees residing in the pool should be already be claimed by now and should be 0
    assert market.fees_collected_usd == 0

    market.test_get_market_details()
    print("Market Resolved - Winner is Outcome 0")
    market.resolve_market(0) # Resolve Outcome 0 as winner

    market.test_get_user_details(CHARLES)
    before_charles_outcome_shares = market.user_outcome_shares[CHARLES][0]
    before_charles_wallet_usd = market.user_wallet_usd[CHARLES]
    market.resolution(market.user_outcome_shares[CHARLES][0], CHARLES) # Claim all outcome 0 shares
    winning_amount_in_usd = market.user_wallet_usd[CHARLES] - before_charles_wallet_usd
    # After resolution, 1 winning outcome share = 1 USD
    # Verify user received the winning outcome shares (1:1 ratio)
    assert winning_amount_in_usd == before_charles_outcome_shares

    # The remaining winning outcome shares will be distributed pro-rated to the LPs
    remaining_usd_in_pool = market.pool_wallet_usd

    before_alice_wallet_usd = market.user_wallet_usd[ALICE]
    market.claim_liqudity(market.user_liquidity_shares[ALICE], ALICE)
    amount_usd_received_alice = market.user_wallet_usd[ALICE] - before_alice_wallet_usd
    # Alice should receive half of the remaining USD in the pool since she has 50% of the total liquidity shares
    assert amount_usd_received_alice == remaining_usd_in_pool / 2

    market.claim_liqudity(market.user_liquidity_shares[BOB], BOB)

    # Pool should be empty since all liquidity shares are claimed
    assert market.pool_wallet_usd == 0

# Simulate a scenario where malicious user (Charles) cannot steal fee earned by Alice & Bob by performing a large just-in-time liquidity provision
def simulate_market_18():
    market = PredMarketNew(liquidity=0, outcomes=4, fees=0.02)

    ALICE, BOB, CHARLES, DAVID = "Alice", "Bob", "Charles", "David"
    market.add_user(ALICE, BOB, CHARLES, DAVID)

    market.user_wallet_usd[ALICE] = 500
    market.user_wallet_usd[BOB] = 500
    market.add_liquidity(500, ALICE) # Alice receive 1000 liquidity shares
    market.add_liquidity(500, BOB) # Bob receive 1000 liquidity shares
    market.test_get_market_details()

    market.user_wallet_usd[DAVID] = 100
    market.buy(0, 100, DAVID)
    assert market.fees_collected_weighted == 2 # 2% of 100 USD = 2 USD fee collected
    assert market.fees_collected_usd == 2 # 2 USD fee collected

    market.test_get_market_details()
    # Simulate big whale entering the market
    market.user_wallet_usd[CHARLES] = 8000
    market.add_liquidity(8000, CHARLES)
    market.test_get_market_details()

    before_charles_wallet_usd = market.user_wallet_usd[CHARLES]
    market.claim_fee(CHARLES)
    amount_usd_received_charles = market.user_wallet_usd[CHARLES] - before_charles_wallet_usd
    # Due to rounding error, the "amount_usd_received_charles" will be a dust amount of 0.0000000000000017 USD, which will round down to zero in Solidity OR unprofitable to claim due to gas cost
    assert amount_usd_received_charles == pytest.approx(0, abs=1e-12)

    # Once the dust amount is claimed, the fees should be 0
    assert market.claim_fee(CHARLES) == 0

    market.test_get_market_details()

    before_alice_wallet_usd = market.user_wallet_usd[ALICE]
    market.claim_fee(ALICE)
    amount_usd_received_alice = market.user_wallet_usd[ALICE] - before_alice_wallet_usd
    assert amount_usd_received_alice == 1 # Alice should receive 1 USD after claiming the fee since she owns 50% of the total liquidity shares
    assert market.claim_fee(ALICE) == 0 # Cannot claim fee again

    before_bob_wallet_usd = market.user_wallet_usd[BOB]
    market.claim_fee(BOB)
    amount_usd_received_bob = market.user_wallet_usd[BOB] - before_bob_wallet_usd
    assert amount_usd_received_bob == 1 # Bob should receive 1 USD after claiming the fee since he owns 50% of the total liquidity shares
    assert market.claim_fee(BOB) == 0 # Cannot claim fee again

    market.test_get_market_details()
    print("Market Resolved - Winner is Outcome 0")
    market.resolve_market(0) # Resolve Outcome 0 as winner

    market.test_get_user_details(ALICE)
    market.test_get_user_details(BOB)
    market.test_get_user_details(CHARLES)
    market.resolution(market.user_outcome_shares[CHARLES][0], CHARLES)

    market.test_get_user_details(DAVID)
    before_david_outcome_shares = market.user_outcome_shares[DAVID][0]
    before_david_wallet_usd = market.user_wallet_usd[DAVID]
    market.resolution(market.user_outcome_shares[DAVID][0], DAVID) # Claim all outcome 0 shares
    winning_amount_in_usd = market.user_wallet_usd[DAVID] - before_david_wallet_usd
    # After resolution, 1 winning outcome share = 1 USD
    # Verify user received the winning outcome shares (1:1 ratio)
    assert winning_amount_in_usd == before_david_outcome_shares

    market.claim_liqudity(market.user_liquidity_shares[ALICE], ALICE)
    market.claim_liqudity(market.user_liquidity_shares[BOB], BOB)
    market.claim_liqudity(market.user_liquidity_shares[CHARLES], CHARLES)

    market.test_get_market_details()
    assert market.pool_wallet_usd == 0 # Pool should be empty (0 USD) after all liquidity shares are claimed + winning shares are claimed

# Check that the remove liquidity does not affect the fee collection accounting logic
def simulate_market_19():
    market = PredMarketNew(liquidity=0, outcomes=4, fees=0.02)

    ALICE, BOB, CHARLES, DAVID = "Alice", "Bob", "Charles", "David"
    market.add_user(ALICE, BOB, CHARLES, DAVID)

    market.user_wallet_usd[ALICE] = 500
    market.user_wallet_usd[BOB] = 500
    market.add_liquidity(500, ALICE) # Alice receive 1000 liquidity shares
    market.add_liquidity(500, BOB) # Bob receive 1000 liquidity shares
    market.test_get_market_details()

    market.user_wallet_usd[DAVID] = 100
    market.buy(0, 100, DAVID)
    assert market.fees_collected_weighted == 2 # 2% of 100 USD = 2 USD fee collected
    assert market.fees_collected_usd == 2 # 2 USD fee collected

    assert market.pool_wallet_usd == 1000 + 98

    market.test_get_market_details()
    # Simulate big whale entering the market
    market.user_wallet_usd[CHARLES] = 8000
    market.add_liquidity(8000, CHARLES)
    market.test_get_market_details()

    market.test_get_user_details(ALICE)
    market.remove_liquidity(250, ALICE) # This will automatically claim the fee of 1 USD that Alice is entitled to
    market.test_get_user_details(ALICE)
    assert market.fees_claimed[ALICE] == 0.5 # The fee claimed (weighted) should be reduced from 1 to 0.5 as Alice removed 50% of her total liquidity shares

    assert market.claim_fee(ALICE) == 0

    before_bob_wallet_usd = market.user_wallet_usd[BOB]
    market.claim_fee(BOB)
    amount_usd_received_bob = market.user_wallet_usd[BOB] - before_bob_wallet_usd
    assert amount_usd_received_bob == 1 # Bob should receive 1 USD after claiming the fee since he owns 50% of the total liquidity shares when the fee of 2 USD was collected
    assert market.fees_claimed[BOB] == 1
    assert market.claim_fee(BOB) == 0

def simulate_market_20():
    market = PredMarketNew(liquidity=0, outcomes=5)

    ALICE, BOB, CHARLES = "Alice", "Bob", "Charles"
    market.add_user(ALICE, BOB, CHARLES)

    market.user_wallet_usd[ALICE] = 1294
    market.user_wallet_usd[BOB] = 300
    market.add_liquidity(100, ALICE)
    market.test_get_market_details()
    market.test_get_user_details(ALICE)

    # Bob buy 294 USD worth of Outcome A shares (index 0)
    market.buy(0, 294, ALICE)
    market.test_get_market_details()
    market.test_get_user_details(ALICE)

    market.buy(1,300,BOB)
    market.test_get_market_details()
    market.test_get_user_details(BOB)

def simulate_market_21():
    market = PredMarketNew(liquidity=0, outcomes=5)

    ALICE, BOB, CHARLES = "Alice", "Bob", "Charles"
    market.add_user(ALICE, BOB, CHARLES)

    amt = 100_000
    market.user_wallet_usd[ALICE] = amt
    market.add_liquidity(amt, ALICE)

    market.test_get_market_details()
    market.test_get_user_details(ALICE)

def simulate_market_22():
    market = PredMarketNew(liquidity=1, outcomes=4, fees = 0.008)

    ERIK = "Erik"
    market.add_user(ERIK)

    market.user_wallet_usd[ERIK] = 150
    market.add_liquidity(100, ERIK)
    market.test_get_market_details()
    market.test_get_user_details(ERIK)

    # Bob buy 294 USD worth of Outcome A shares (index 0)
    market.buy(2, 50, ERIK)
    market.test_get_market_details()
    market.test_get_user_details(ERIK)

    market.sell(2,market.inverse_sell(2,120.13434,ERIK),ERIK)
    market.test_get_market_details()
    market.test_get_user_details(ERIK)

def simulate_market_0xB4b096ECD5Eb290CEC81004e949E087b3eda6339_1618867():
    market = PredMarketNew(liquidity=101000000, outcomes=4, fees=0*10)
    market.outcome_prices = [250000, 250000, 250000, 250000]
    market.shares = [150600000, 150600000, 30465660, 150600000]
    market.total_shares = [150600000, 150600000, 150600000, 150600000]
    market.user_outcome_shares["Alice"] = [0] * 4
    market.user_outcome_shares["Alice"][2] = 120134340
    market.user_liquidity_shares["Alice"] = 100000000
    market.user_wallet_usd["Alice"] = 1185723629
    market.pool_wallet_usd = 151000000
    market.fees_collected_weighted = 0
    market.fees_claimed["Alice"] = 0

    market.buy(2, 50e6, "Alice")

    market.test_get_market_details()
    market.test_get_user_details("Alice")

    print("sale estimation", market.inverse_sell(2, 120134340, "Alice"))

if __name__ == "__main__":
    simulate_market_0xB4b096ECD5Eb290CEC81004e949E087b3eda6339_1618867()
