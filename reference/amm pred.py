import math

class PredMarket:
    def __init__(self, liquidity, outcomes):
        self.liquidity = liquidity
        self.outcomes = outcomes
        self.shares = [liquidity] * outcomes

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
        
        # Adjust the specified outcome's share to keep balance
        product /= self.shares[outcome]
        self.shares[outcome] = (self.liquidity ** self.outcomes) / product
        
        return self.shares

# Example usage
market = PredMarket(liquidity=1000, outcomes=4)

# Initial prices
print("Initial Shares:", market.shares)
print("Initial Outcome Prices:", market.get_outcome_prices())

# Execute a buy order
market.buy(outcome=0, amount=294)
print("Shares after first buy:", market.shares)
print("Outcome Prices after first buy:", market.get_outcome_prices())

# Execute another buy order
market.buy(outcome=0, amount=-294)
print("Shares after second buy:", market.shares)
print("Outcome Prices after second buy:", market.get_outcome_prices())
