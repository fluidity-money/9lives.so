#!/usr/bin/env python3

import math

def price(M1,M2,N1,N2,m):
    # price per share
    T = M1+M2
    denom = (M1+m)*M2*N1+(M2-m)*M2*N2+T*(M1+m)*N2*math.log(T*(M1+m)/(M1*(T+m)))
    p = (M1+m)*M2*T/denom
    return p

def shares(M1,M2,N1,N2,m):
    # purchasable shares for m cost
    T = M1+M2
    n = m*(N1-N2)/T+N2*(T+m)/M2*math.log(T*(M1+m)/(M1*(T+m)))
    return n

def place_order(outcome, cost, M1, M2, N1, N2):
    """
    Place an order in the DPM market.

    :param outcome: 'A' or 'B'
    :param cost: amount of money to spend on shares
    :param M1: total amount of money wagered on outcome A
    :param M2: total amount of money wagered on outcome B
    :param N1: total number of shares purchased for outcome A
    :param N2: total number of shares purchased for outcome B
    :return: dictionary with order details
    """
    if outcome not in ['A', 'B']:
        raise ValueError("Outcome must be 'A' or 'B'")

    # Calculate price and shares before purchase
    price_before_A = price(M1, M2, N1, N2, 0)
    price_before_B = price(M2, M1, N2, N1, 0)

    if outcome == 'A':
        shares_purchased = shares(M1, M2, N1, N2, cost)
        M1 += cost
        N1 += shares_purchased
    else:  # outcome == 'B'
        shares_purchased = shares(M2, M1, N2, N1, cost)
        M2 += cost
        N2 += shares_purchased

    # Calculate price after purchase
    print(M1, M2, N1, N2, 0)
    price_after_A = price(M1, M2, N1, N2, 0)
    price_after_B = price(M2, M1, N2, N1, 0)

    return {
        'outcome': outcome,
        'cost': cost,
        'shares_purchased': shares_purchased,
        'price_before_A': price_before_A,
        'price_before_B': price_before_B,
        'price_after_A': price_after_A,
        'price_after_B': price_after_B,
        'new_M1': M1,
        'new_M2': M2,
        'new_N1': N1,
        'new_N2': N2
    }

if __name__ == "__main__":
	# Seed liquidity
	initial_M1 = 100.0
	initial_M2 = 100.0
	initial_N1 = 100.0
	initial_N2 = 100.0

	print("shares: ", shares(524, 387, 173, 411, 182))

	# Place an order for outcome A with a cost of 50
	order_result = place_order('A', 50, initial_M1, initial_M2, initial_N1, initial_N2)

	print("Order Result:")
	for key, value in order_result.items():
	    print(f"{key}: {value}")
