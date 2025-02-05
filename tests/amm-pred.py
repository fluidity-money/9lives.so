#!/usr/bin/env python3

import math

class PredMarket:
    def __init__(self, liquidity, outcomes):
        self.liquidity = liquidity
        self.outcomes = outcomes
        self.shares = [liquidity] * outcomes
        self.total_liquidity = [liquidity/outcomes] * outcomes
        self.total_shares = [liquidity] * outcomes
        self.user_shares = 0
        self.shares_before = 0

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

        self.shares_before = self.shares[outcome]

        # Adjust the specified outcome's share to keep balance
        product /= self.shares[outcome]
        self.shares[outcome] = (self.liquidity ** self.outcomes) / product
        print(f"shares after buying: {self.shares[outcome]}")

        self.total_liquidity[outcome] += amount

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

if __name__ == "__main__":
    # Example usage
    market = PredMarket(liquidity=3, outcomes=3)

    # Initial prices
    print("Initial Shares:", market.shares)
    print("Initial Outcome Prices:", market.get_outcome_prices())
    print("Initial Liquidity:", market.total_liquidity)
    print("Initial Payoff per share:", market.payoff(market.total_liquidity,market.total_shares))

    # Execute a buy order
    market.buy(outcome=2, amount=10)
    print("Shares after first buy:", market.shares)
    print("Outcome Prices after first buy:", market.get_outcome_prices())
    print("Liquidity after first buy:", market.total_liquidity)
    print("Payoff per share after first buy:", market.payoff(market.total_liquidity,market.total_shares))
    print("Shares purchased by the user:", market.mintusershares(outcome=2, amount=10))

    # Execute another buy order
    market.buy(outcome=0, amount=20)
    print("Shares after second buy:", market.shares)
    print("Outcome Prices after second buy:", market.get_outcome_prices())
    print("Liquidity after second buy:", market.total_liquidity)
    print("Payoff per share after second buy:", market.payoff(market.total_liquidity,market.total_shares))
    print("Shares purchased by the user:", market.mintusershares(outcome=0, amount=20))

    # Resolve the market
    print(market.resolution(market.total_liquidity, market.total_shares, market.payoff(market.total_liquidity,market.total_shares), winning_outcome = 1))
