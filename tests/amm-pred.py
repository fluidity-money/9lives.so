#!/usr/bin/env python3

import math

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

if __name__ == "__main__":
    # Example usage
    market = PredMarket(liquidity=1000, outcomes=4)

    # Initial prices
    print("Initial Shares:", market.shares)
    print("Initial Outcome Prices:", market.get_outcome_prices())
    print("Initial Liquidity:", market.total_liquidity)

    # Execute a buy order
    market.buy(outcome=0, amount=300)
    print("Shares after first buy:", market.shares)
    print("Outcome Prices after first buy:", market.get_outcome_prices())
    print("Liquidity after first buy:", market.total_liquidity)
    ivanshares = market.mintusershares(outcome=0)
    print("Shares purchased by the user:", ivanshares)
    print(market.total_shares)
    print(market.user_positions)

    # Add liquidity
    market.add_liquidity(1000)
    print("Shares after adding liquidity:", market.shares)
    print("Outcome Prices after adding liquidity:", market.get_outcome_prices())
    print("Liquidity:", market.total_liquidity)
    print("Shares purchased by the user:", market.mintusershares(outcome=0))
    print("Liquidity shares minted:", market.mintliquidityshares())
    print(market.total_shares)

    # Remove liquidity
    market.remove_liquidity(500)
    print("Shares after removing liquidity:", market.shares)
    print("Outcome Prices after removing liquidity:", market.get_outcome_prices())
    print("Liquidity:", market.total_liquidity)
    print(market.total_shares)
    print(market.liquidity)

    # Resolve the market
    print(market.resolution(market.total_liquidity, market.total_shares, winning_outcome = 0))
