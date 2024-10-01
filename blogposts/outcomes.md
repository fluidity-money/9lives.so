## Deriving cost and price functions for DPM I with 3 Outcomes

In the case where winnings bets are refunded and losing money is redistributed, the respective payoffs per share are as follows:

$$P_1 = \frac{M_2+M_3}{N_1}$$

$$P_2 = \frac{M_1+M_3}{N_2}$$

$$P_3 = \frac{M_1+M_2}{N_3}$$

We set the sum of prices per share of $A$ and $B$ to be equal to the payoff per share of $C$, i.e.

$$P_1 = p_2+p_3$$ 

$$P_2 = p_1+p_3$$ 

$$P_3 = p_1+p_2$$ 

With this we can solve the differential equation:

$$\frac{\mathrm dm}{\mathrm dn} = \frac{1}{2}\left(-\frac{M_2+M_3}{N_1}+\frac{M_1+M_3+m}{N_2}+\frac{M_1+M_2+m}{N_3}\right)$$.

We get for the cost function

$$m(n) = \left(\frac{M_1 N_2+M_2N_2+M_1N_3+M_3N_3}{N_2+N_3}-\frac{M_2N_2N_3+M_3N_2N_3}{N_1(N_2+N_3)}\right)\left[e^{\frac{n}{2}\left(\frac{1}{N_2}+\frac{1}{N_3}\right)}-1\right],$$

and for the price function

$$p_1(n) = \frac{1}{2}\left(-\frac{M_2+M_3}{N_1}+\frac{M_1+M_3}{N_2}+\frac{M_1+M_2}{N_3}\right)e^{\frac{n}{2}\left(\frac{1}{N_2}+\frac{1}{N_3}\right)} .$$
