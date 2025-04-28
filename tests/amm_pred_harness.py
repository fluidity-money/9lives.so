#!/usr/bin/env python3

import sys, json

import amm_pred

if __name__ == "__main__":
    # Expecting a json input in stdin like {"liquidity": 123, "outcomes": 3, "shares": [100, 2001, 18281], "outcome prices": [10029, 2818, 281821]}
    j = json.load(sys.stdin)
    p = amm_pred.PredMarketNew(liquidity=j["liquidity"], outcomes=j["outcomes"])
    print(p)
