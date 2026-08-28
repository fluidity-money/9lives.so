import math

class ConstantProductMarket:
    def __init__(self, M1=1, M2=1, outofM1=0, outofM2=0, leftovers=0, t_end=3600):
        """
        Initialize the constant product market.
        
        :param M1: initial amount of money wagered on outcome A
        :param M2: initial amount of money wagered on outcome B
        :param outofM1: initial profit/loss for outcome A holders
        :param outofM2: initial profit/loss for outcome B holders
        :param leftovers: initial leftovers amount
        :param t_end: market duration in seconds (default 1 hour)
        """
        self.M1 = M1
        self.M2 = M2
        self.outofM1 = outofM1
        self.outofM2 = outofM2
        self.leftovers = leftovers
        self.t_end = t_end
        
        # Track all purchases with their details
        self.purchases_A = []  # List of dicts: {'shares': x, 'time': t, 'user_id': id}
        self.purchases_B = []  # List of dicts: {'shares': x, 'time': t, 'user_id': id}
        self.current_time = 0  # Current market time in seconds
    
    def price_A(self):
        """Price of outcome A shares (equals probability)"""
        return self.M1 / (self.M1 + self.M2)
    
    def price_B(self):
        """Price of outcome B shares (equals probability)"""
        return self.M2 / (self.M1 + self.M2)
    
    def probability_A(self):
        """Probability of A winning (equals price of A)"""
        return self.price_A()
    
    def probability_B(self):
        """Probability of B winning (equals price of B)"""
        return self.price_B()
    
    def payoff_A(self):
        """Payoff per share if A wins (standard: $1 per share)"""
        return 1.0 
    
    def payoff_B(self):
        """Payoff per share if B wins (standard: $1 per share)"""
        return 1.0
    
    def shares_exact_A(self, cost):
        """
        Exact calculation for shares of A using constant product formula
        """
        return cost + (self.M1 + cost) / (self.M1 + self.M2 + cost) * (self.M2 - self.outofM2)
    
    def shares_exact_B(self, cost):
        """
        Exact calculation for shares of B using constant product formula
        """
        return cost + (self.M2 + cost) / (self.M1 + self.M2 + cost) * (self.M1 - self.outofM1)

    def boost(self, user_shares, t):
        """
        Calculate boosted shares based on when they were purchased.
        Earlier purchases get higher boost.
        
        :param user_shares: number of shares purchased
        :param t: time when shares were purchased (in seconds)
        :return: boosted shares
        """
        b = self.t_end - t
        return user_shares * b
    
    def calculate_leftovers(self, winning_outcome):
        """
        Calculate leftovers based on winning outcome.
        Leftovers = Total pool - shares purchased on winning side
        
        :param winning_outcome: 'A' or 'B'
        :return: leftovers amount
        """
        if winning_outcome == 'A':
            total_winning_shares = sum(p['shares'] for p in self.purchases_A)
            return self.M1 + self.M2 - total_winning_shares
        else:
            total_winning_shares = sum(p['shares'] for p in self.purchases_B)
            return self.M1 + self.M2 - total_winning_shares
    
    def refund(self, boosted_shares, total_boosted_shares):
        """
        Calculate refund for a user from 30% of leftovers.
        Distributed proportionally to all boosted shares.
        
        :param boosted_shares: user's boosted shares
        :param total_boosted_shares: sum of all boosted shares (A + B)
        :return: refund amount
        """
        refund_pool = 0.3 * self.leftovers
        if total_boosted_shares == 0:
            return 0
        return boosted_shares * refund_pool / total_boosted_shares

    def payout(self, winning_boosted_shares, total_winning_boosted_shares):
        """
        Calculate payout for winning shares from 70% of leftovers.
        Distributed proportionally to winning boosted shares only.
        
        :param winning_boosted_shares: user's winning boosted shares
        :param total_winning_boosted_shares: sum of all winning boosted shares
        :return: payout amount
        """
        payout_pool = 0.7 * self.leftovers
        if total_winning_boosted_shares == 0:
            return 0
        return winning_boosted_shares * payout_pool / total_winning_boosted_shares
    
    def set_time(self, t):
        """Set current market time in seconds"""
        if t < 0 or t > self.t_end:
            raise ValueError(f"Time must be between 0 and {self.t_end}")
        self.current_time = t
    
    def get_market_state(self):
        """Get current market state"""
        return {
            'M1': self.M1,
            'M2': self.M2,
            'outofM1': self.outofM1,
            'outofM2': self.outofM2,
            'leftovers': self.leftovers,
            'price_A': self.price_A(),
            'price_B': self.price_B(),
            'probability_A': self.probability_A(),
            'probability_B': self.probability_B(),
            'current_time': self.current_time,
            'time_remaining': self.t_end - self.current_time
        }
    
    def buy(self, outcome, cost_amount, user_id=None):
        """
        Buy shares for a specific outcome.
        
        :param outcome: 'A' or 'B'
        :param cost_amount: amount of money to spend on shares
        :param user_id: optional user identifier
        :return: dictionary with trade details
        """
        if outcome not in ['A', 'B']:
            raise ValueError("Outcome must be 'A' or 'B'")
        
        if cost_amount <= 0:
            raise ValueError("Cost amount must be positive")
        
        # Store state before purchase
        price_before_A = self.price_A()
        price_before_B = self.price_B()
        prob_before_A = self.probability_A()
        M1_before = self.M1
        M2_before = self.M2
        outofM1_before = self.outofM1
        outofM2_before = self.outofM2
        
        if outcome == 'A':
            # Calculate shares purchased for outcome A
            shares_purchased = self.shares_exact_A(cost_amount)
            # Update market state
            self.M1 += cost_amount
            self.outofM2 += shares_purchased - cost_amount
            # Record purchase with timestamp
            self.purchases_A.append({
                'shares': shares_purchased,
                'time': self.current_time,
                'user_id': user_id,
                'cost': cost_amount
            })
        else:  # outcome == 'B'
            # Calculate shares purchased for outcome B
            shares_purchased = self.shares_exact_B(cost_amount)
            # Update market state
            self.M2 += cost_amount
            self.outofM1 += shares_purchased - cost_amount
            # Record purchase with timestamp
            self.purchases_B.append({
                'shares': shares_purchased,
                'time': self.current_time,
                'user_id': user_id,
                'cost': cost_amount
            })
        
        # Calculate new prices and probabilities after purchase
        price_after_A = self.price_A()
        price_after_B = self.price_B()
        prob_after_A = self.probability_A()
        
        # Calculate potential payout and profit
        if outcome == 'A':
            potential_payout = shares_purchased * self.payoff_A()
        else:
            potential_payout = shares_purchased * self.payoff_B()
        
        profit = potential_payout - cost_amount
        
        return {
            'outcome': outcome,
            'cost': cost_amount,
            'shares_purchased': shares_purchased,
            'purchase_time': self.current_time,
            'price_before_A': price_before_A,
            'price_before_B': price_before_B,
            'price_after_A': price_after_A,
            'price_after_B': price_after_B,
            'prob_before_A': prob_before_A,
            'prob_after_A': prob_after_A,
            'M1_before': M1_before,
            'M2_before': M2_before,
            'M1_after': self.M1,
            'M2_after': self.M2,
            'outofM1_before': outofM1_before,
            'outofM2_before': outofM2_before,
            'outofM1_after': self.outofM1,
            'outofM2_after': self.outofM2,
            'potential_payout': potential_payout,
            'profit': profit,
            'user_id': user_id
        }
    
    def resolve_market(self, winning_outcome):
        """
        Resolve the market with the winning outcome and calculate all payouts.
        
        :param winning_outcome: 'A' or 'B'
        :return: dictionary with resolution details for all users
        """
        if winning_outcome not in ['A', 'B']:
            raise ValueError("Winning outcome must be 'A' or 'B'")
        
        # Calculate leftovers
        self.leftovers = self.calculate_leftovers(winning_outcome)
        
        # Calculate boosted shares for all purchases
        boosted_A = []
        boosted_B = []
        
        for purchase in self.purchases_A:
            boosted = self.boost(purchase['shares'], purchase['time'])
            boosted_A.append({
                'user_id': purchase['user_id'],
                'original_shares': purchase['shares'],
                'boosted_shares': boosted,
                'time': purchase['time'],
                'cost': purchase['cost']
            })
        
        for purchase in self.purchases_B:
            boosted = self.boost(purchase['shares'], purchase['time'])
            boosted_B.append({
                'user_id': purchase['user_id'],
                'original_shares': purchase['shares'],
                'boosted_shares': boosted,
                'time': purchase['time'],
                'cost': purchase['cost']
            })
        
        # Calculate totals
        total_boosted_A = sum(p['boosted_shares'] for p in boosted_A)
        total_boosted_B = sum(p['boosted_shares'] for p in boosted_B)
        total_boosted_all = total_boosted_A + total_boosted_B
        
        # Determine winning and losing sides
        if winning_outcome == 'A':
            winning_purchases = boosted_A
            losing_purchases = boosted_B
            total_winning_boosted = total_boosted_A
        else:
            winning_purchases = boosted_B
            losing_purchases = boosted_A
            total_winning_boosted = total_boosted_B
        
        # Calculate payouts for each user
        results = []
        
        # Process winning purchases
        for purchase in winning_purchases:
            base_payout = purchase['original_shares'] * 1.0  # $1 per share
            refund_amount = self.refund(purchase['boosted_shares'], total_boosted_all)
            payout_amount = self.payout(purchase['boosted_shares'], total_winning_boosted)
            total_return = base_payout + refund_amount + payout_amount
            
            results.append({
                'user_id': purchase['user_id'],
                'outcome': winning_outcome,
                'won': True,
                'original_shares': purchase['original_shares'],
                'boosted_shares': purchase['boosted_shares'],
                'cost': purchase['cost'],
                'base_payout': base_payout,
                'refund': refund_amount,
                'bonus_payout': payout_amount,
                'total_return': total_return,
                'profit': total_return - purchase['cost']
            })
        
        # Process losing purchases
        losing_outcome = 'B' if winning_outcome == 'A' else 'A'
        for purchase in losing_purchases:
            refund_amount = self.refund(purchase['boosted_shares'], total_boosted_all)
            total_return = refund_amount
            
            results.append({
                'user_id': purchase['user_id'],
                'outcome': losing_outcome,
                'won': False,
                'original_shares': purchase['original_shares'],
                'boosted_shares': purchase['boosted_shares'],
                'cost': purchase['cost'],
                'base_payout': 0,
                'refund': refund_amount,
                'bonus_payout': 0,
                'total_return': total_return,
                'profit': total_return - purchase['cost']
            })
        
        return {
            'winning_outcome': winning_outcome,
            'leftovers': self.leftovers,
            'total_boosted_A': total_boosted_A,
            'total_boosted_B': total_boosted_B,
            'total_boosted_all': total_boosted_all,
            'refund_pool': 0.3 * self.leftovers,
            'payout_pool': 0.7 * self.leftovers,
            'user_results': results
        }
    
    def print_market_state(self):
        """Print current market state in a readable format"""
        print(f"Market State:")
        print(f"M1: ${self.M1:.4f}, M2: ${self.M2:.4f}")
        print(f"OutofM1: ${self.outofM1:.4f}, OutofM2: ${self.outofM2:.4f}")
        print(f"Leftovers: ${self.leftovers:.4f}")
        print(f"Price of A: {self.price_A():.4f} (= {self.price_A()*100:.1f}%)")
        print(f"Price of B: {self.price_B():.4f} (= {self.price_B()*100:.1f}%)")
        print(f"Current Time: {self.current_time}s / {self.t_end}s")
        print(f"Prices sum to: {self.price_A() + self.price_B():.6f}")
        print()

# Example usage
if __name__ == "__main__":
    # Create market instance (1 hour duration)
    market = ConstantProductMarket(M1=1, M2=1, outofM1=0, outofM2=0, t_end=3600)
    
    print("Initial Market State:")
    market.print_market_state()
    
    # User 1 buys early (at 5 minutes)
    market.set_time(300)  # 5 minutes
    print("User 1 buying $5 of outcome A at t=300s (5 min):")
    order1 = market.buy('A', 5, user_id='user1')
    print(f"  Shares purchased: {order1['shares_purchased']:.4f}")
    print()
    
    # User 2 buys later (at 30 minutes)
    market.set_time(1800)  # 30 minutes
    print("User 2 buying $10 of outcome B at t=1800s (30 min):")
    order2 = market.buy('B', 10, user_id='user2')
    print(f"  Shares purchased: {order2['shares_purchased']:.4f}")
    print()
    
    # User 3 buys late (at 50 minutes)
    market.set_time(3000)  # 50 minutes
    print("User 3 buying $3 of outcome A at t=3000s (50 min):")
    order3 = market.buy('A', 3, user_id='user3')
    print(f"  Shares purchased: {order3['shares_purchased']:.4f}")
    print()
    
    print("Final Market State (before resolution):")
    market.print_market_state()
    
    # Resolve market - A wins
    print("=" * 60)
    print("RESOLVING MARKET - Outcome A wins!")
    print("=" * 60)
    resolution = market.resolve_market('A')
    
    print(f"\nResolution Summary:")
    print(f"Winning Outcome: {resolution['winning_outcome']}")
    print(f"Leftovers: ${resolution['leftovers']:.4f}")
    print(f"Refund Pool (30%): ${resolution['refund_pool']:.4f}")
    print(f"Payout Pool (70%): ${resolution['payout_pool']:.4f}")
    print(f"Total Boosted A: {resolution['total_boosted_A']:.2f}")
    print(f"Total Boosted B: {resolution['total_boosted_B']:.2f}")
    print()
    
    print("Individual User Results:")
    print("-" * 60)
    for result in resolution['user_results']:
        print(f"User: {result['user_id']} | Outcome: {result['outcome']} | Won: {result['won']}")
        print(f"  Cost: ${result['cost']:.4f}")
        print(f"  Original Shares: {result['original_shares']:.4f}")
        print(f"  Boosted Shares: {result['boosted_shares']:.2f}")
        print(f"  Base Payout: ${result['base_payout']:.4f}")
        print(f"  Refund: ${result['refund']:.4f}")
        print(f"  Bonus Payout: ${result['bonus_payout']:.4f}")
        print(f"  Total Return: ${result['total_return']:.4f}")
        print(f"  Profit: ${result['profit']:.4f}")
        print("-" * 60)
