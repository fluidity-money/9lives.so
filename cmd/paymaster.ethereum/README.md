
# Paymaster

Paymaster maintains a live connection to the database, which it at present, polls. It
checks for requests to purchase and sell shares, in the calldata form. It aggregates and
submits these operations to the NineLivesPaymaster contract. It also simulates the
submitted calldata beforehand, and if the gas of the transaction is less than the fee
that was given as the maximum fee using a quote from the Camelot SwapRouter, it
skips the transaction.
