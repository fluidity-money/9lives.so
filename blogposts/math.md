# 9Lives: Deep Dive into Dynamic Pari-Mutuel Markets

This is the second entry in a three part blog series on 9Lives: The most capital efficient prediction market, built by the Superposition team. In this part, we’ll do a deep dive into dynamic pari-mutuel markets and the math behind them. Click here to read the first part.

### Introduction

In the last entry to this series, we have introduced prediction markets, their history and current applications. The 9Lives prediction market differs from these by combining pari-mutuel betting with continuous double auction (CDA) markets. We call this the dynamic pari-mutuel market (DPM).

The main benefits of a DPM are infinite liquidity, no risks for the market institution while still being dynamic and continuous, allowing participants to sell their shares in the market before an event outcome is settled. We have taken this approach from the paper “A dynamic pari-mutuel market for hedging, wagering, and information aggregation” by David M. Pennock ([https://doi.org/10.1145/988772.988799](https://doi.org/10.1145/988772.988799)).

### Dynamic Pari-Mutuel Market and 9Lives

There are various ways to build a DPM, with the two main ones being introduced in the original paper linked above. We have decided to build a DPM where all money is redistributed, i.e. all money from all wagers is collected and redistributed to winning wagers when an event outcome is settled. This greatly simplifies the architecture of the aftermarket for shares in the prediction market, as all shares have equal value at all times. It also allows us to use Longtail as the aftermarket for trading.

However, this design also carries some risk for market participants, as betting on the correct outcome may lose money. This is due to the fact that all money is redistributed and the initial wagers are not refunded, though we project this scenario to be unlikely. This risk will be communicated to traders in advance and will also be avoided in future iterations of the product.

To start off, we introduce some variables. Let’s say we have a prediction market with two different outcomes $A$ and $B$. The price per share for the outcomes are $p_1$ and $p_2$ respectively. They have a payoff of $P_1$ and $P_2$. We define the total amount of money wagered on the outcomes as $M_1$, $M_2$ with $T=M_1+M_2$ and the total number of shares purchased as $N_1$ and $N_2$.

In the case that all money is redistributed, the respective payoffs per share are as follows:

$$ P_1 = \frac{M_1+M_2}{N_1} = \frac{T}{N_1} .$$

All equations for $B$ are symmetric. In this case, if $A$ occurs, shareholders of $A$ lose their initial wager but receive $P_1$ per share owned, while shareholders of $B$ lose all of their money wagered. 

To derive the price function, we require that the ratio of prices is equal to the ratio of money wagered, i.e. 

$$\frac{p_1}{p_2} = \frac{M_1}{M_2} .$$

The price of $A$ is proportional to the amount of money wagered on $A$, and similarly for $B$. The more money is wagered on one side, the cheaper becomes the share on the other side proportionally. 

We can derive the number of shares $n$ that can be purchased for $m$ dollars:

$$ n(m) = \frac{m(N_1-N_2)}{T}+\frac{N_2(T+m)}{M_2} \ln{\left[\frac{T(M_1+m)}{M_1(T+m)}\right]} .$$

From this, we can compute the price function:

$$ p_1(m) = \frac{\mathrm d m}{\mathrm d n} = \frac{(M_1+m)M_2T}{\text{denom}} ,$$

where 

$$ \text{denom} = (M_1+m)M_2N_1+(M_2-m)M_2N_2 \\ +T(M_1+m)N_2\ln{\left[\frac{T(M_1+m)}{M_1(T+m)}\right]} .$$

With these equations, we can build our DPM prediction market by computing the shares a trader could buy for $m$ dollars and by computing the price per share for outcome $A$ or $B$. They can be generalized for multiple outcomes as well. If a trader wants to sell his shares before the settlement of the outcome, they can do so in the aftermarket where their order is matched against another buyer. If an outcome is certain and settlement occurs, the payoff per share is equal to all the money that has been wagered being redistributed, as mentioned earlier.

We hope you have enjoyed the second entry in our three part series on 9Lives, the most capital efficient prediction market. In the next and final part, we’ll explore 9Lives from its technical side and dive into the contracts built with Stylus!
