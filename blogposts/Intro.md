# Introducing 9Lives: The most capital efficient prediction market

This is the first entry in a three part blog series on 9Lives: The most capital efficient prediction market, built by the Superposition team. In this part we’ll introduce 9Lives, how it differs, and how we set out to build a more advanced prediction market.

### Introduction

From the [Policy Analysis Market](https://www.policyanalysismarket.com/) in 2001 to modern variations like [Polymarket](https://polymarket.com/), prediction markets are built on the premise that monetary values of a futures contract on an outcome can reflect the probability of said outcome occurring. The idea is that rational actors would accurately predict the outcome of an event based on new information entering the market.

The dominant mechanism in current prediction markets is the continuous double auction (CDA) with a market maker, meaning that you have an order book with bids and asks as well as a market maker providing liquidity and taking on risks, the same way a traditional central limit order book works.

### Introducing 9Lives

In crypto, there has been a shift from centralized and traditional markets to decentralized models, such as automated market makers that match orders over continuous functions instead of consisting of discrete orders. With 9Lives, we have built something similar to AMMs for prediction markets, but with the added benefit of deep liquidity from the start, removing the need for market makers taking on unnecessary risks.

In particular, we have combined parimutuel markets (these are often seen in horse or greyhound racing) with a CDA. This ensures infinite liquidity, as there is no need for matching offers when placing bets, no risks for the market institution and a dynamic nature allowing market participants to trade their shares before an event outcome is settled.

### Built with Stylus

Apart from the benefits of deep liquidity, continuous price functions, no risks for the market institution and a dynamic nature, 9Lives is also the world’s first prediction market built with Arbitrum Stylus.

Stylus allows for Rust powered smart contracts that are 10x less costly than Solidity. It’s safer, faster and more gas efficient.

We have set out to build the world’s most advanced and capital efficient prediction market, saving costs for market participants and removing risks for market institutions, while also having the fastest interface for information aggregation. We can’t wait for you to try it out!

In the second part of this blog series, we’ll dive deep into the math behind 9Lives and dynamic parimutuel markets. It’s going to be fun, so be sure not to miss it!
