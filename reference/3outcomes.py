import math

def price(M1, M2, n, N2, M3, N3, N1):
    # price per share
    return 1/2*(-(M2+M3)/N1+(M1+M3)/N2+(M1+M2)/N3)*math.exp(1/2*n*(1/N3+1/N2))

def cost(M1, n, N2, M2, M3, N3, N1):
    # cost of purchasing n shares
    return ((M1*N2+M2*N2+M1*N3+M3*N3)/(N2+N3)-(M2*N2*N3+M3*N2*N3)/(N1*(N2+N3)))*(math.exp(n/(2*N2)+n/(2*N3))-1)

def place_order(outcome, shares, M1, M2, N1, N2, M3, N3):

    price_before = price(M1, M2, 0, N2, M3, N3, N1)
    price_beforeB = price(M2, M1, 0, N1, M3, N3, N2)

    order_cost = cost(M1, shares, N2, M2, M3, N3, N1)
    new_price = price(M1 + order_cost, M2, 0, N2, M3, N3, N1 + shares)
    new_priceB = price(M2, M1+order_cost, 0, N1+shares, M3, N3, N2)
    new_priceC = price(M3, M1+order_cost, 0, N1+shares, M2, N2, N3)
    M1 += order_cost
    N1 += shares

    return {
        'outcome': outcome,
        'shares': shares,
        'cost': order_cost,
        'price_before': price_before,
        'price_beforeB': price_beforeB,
        'new_priceA': new_price,
        'new_priceB': new_priceB,
        'new_priceC': new_priceC,
        'new_M1': M1,
        'new_M2': M2,
        'new_M3': M3,
        'new_N1': N1,
        'new_N2': N2,
        'new_N3': N3
    }

# Seed Liquidity
initial_M1 = 100.0
initial_M2 = 100.0
initial_M3 = 100.0
initial_N1 = 100.0
initial_N2 = 100.0
initial_N3 = 100.0

# Place an order for outcome A
order_result = place_order('A', 20, initial_M1, initial_M2, initial_N1, initial_N2, initial_M3, initial_N3)

print("Order Result:")
for key, value in order_result.items():
    print(f"{key}: {value}")
