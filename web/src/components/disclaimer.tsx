import { TabGroup, TabList, Tab, TabPanel, TabPanels } from "@headlessui/react";
import TabButton from "./tabButton";
import React, { Fragment } from "react";
import Link from "next/link";
function Section({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-col gap-5 py-5">{children}</div>;
}
function Title({ text }: { text: string }) {
  return <h2 className="font-chicago text-base text-9black">{text}</h2>;
}
function Parag({ text }: { text: string }) {
  return <p className="px-4 text-sm">{text}</p>;
}
function List({ items }: { items: string[] }) {
  return (
    <ul className="flex list-inside list-decimal flex-col gap-2 px-4 text-sm">
      {items.map((item) => {
        const [title, description] = item.split(":");
        return (
          <li key={item.slice(0, 10)}>
            <strong>{title}</strong> {description}
          </li>
        );
      })}
    </ul>
  );
}
function Anchor({ text, href }: { text: string; href: string }) {
  return (
    <Link
      href={href}
      target="_blank"
      className="ml-5 font-chicago text-xs font-bold underline"
    >
      {text}
    </Link>
  );
}
function About() {
  return (
    <Section>
      <Title text="What is 9Lives?" />
      <Parag text="9Lives is the most advanced prediction market developed by the Superposition team. Inspired by decentralized finance, 9Lives combines a constant product market maker with parimutuel markets and a continuous double auction, providing deep liquidity and a risk-free environment for market participants." />
      <Parag text="Built using Arbitrum Stylus, 9Lives is the most cost-efficient, and the most advanced platform for trading. With 9Lives, traders can easily place bets, trade their positions, and maximise capital efficiency while benefiting from the safest and most affordable prediction market on Web3." />
      <Title text="Disclaimer" />
      <List
        items={[
          "Use at Your Own Risk: This contract is unaudited. Please be aware of the risks involved.",
          "About the Constant Product Maker Maker (CPMM) Model: The CPMM is a type of Automated Market Maker model popularised in decentralised finance.",
          "About the Dynamic Pari-Mutuel Market (DPM) Model: The Dynamic Pari-Mutuel Market (DPM) model is a novel approach adopted by Superposition for prediction markets. Its pricing dynamics differ from conventional models, offering unique opportunities for trading strategies but also introducing new risks. Wager payoffs are based on both the trade price and the final market payoff per share at close. Unlike some models, the initial price paid for a winning wager is not refunded. This can mean that, under volatile market conditions, even a wager on the correct outcome could lose money. If a trader buys in at a high price that later drops significantly, they may lose funds regardless of the outcome. While we believe such situations to be rare, please proceed with caution. For further details on the DPM model, refer to the original paper below.",
          "Infrastructure Markets: Infrastructure Markets are a new natural language oracle powered by ARB and Staked ARB that determines truth after a deadline through the process of voting and staking. To learn more, read Introduction to Infra Markets in the navigation bar past this screen.",
          "Opinion Polls: Opinion Polls are self resolving markets that are suitable for competitive voting. Markets are settled by the proportion of shares in the different outcomes.",
          "AI Resolver: SARP AI is the first AI-powered resolver for prediction markets using current news feeds. It exists exclusively on testnet currently. To learn more, read Introduction to SARP AI below.",
          "By accessing this web application, you agree that you are not a citizen of a country where gambling is prohibited. You agree that you have read and agree to the Terms and Conditions.",
        ]}
      />
      <Anchor href="#terms-and-conditions" text="Terms and Conditions" />
      <Anchor
        href="https://dl.acm.org/doi/10.1145/988772.988799"
        text="A dynamic pari-mutuel market for hedging, wagering, and information aggregation"
      />
    </Section>
  );
}
function Achievments() {
  return (
    <Section>
      <Title text="What Are Achievements?" />
      <Parag text="9Lives features an  achievement system designed to reward users who engage deeply with the platform. Whether you’re creating new prediction markets, participating in active ones, sharing your insights, or consistently making predictions (right or wrong), every action you take can earn you recognition and rewards." />
      <List
        items={[
          "Points & Badges: Earn points and collectible badges for activities like making your first prediction, creating a new market, or consistently participating in weekly events. Points help you climb the leaderboard and showcase your involvement.",
          'Titles: Gain unique titles as you hit major milestones—become a "Prediction Master," an "Oracle Challenger," or even a "Lucky Cat" as you gain more experience and success on the platform.',
          "Onchain Rewards: Get rewarded beyond recognition! Achievements can also unlock onchain rewards, including exclusive NFTs, platform tokens, and even boosted participation opportunities. 9Lives aims to make your journey engaging and rewarding, regardless of your prediction accuracy.",
        ]}
      />
    </Section>
  );
}
function Superposition() {
  return (
    <Section>
      <Title text="What is Superposition?" />
      <Parag text="Superposition is the blockchain that pays you to use it. " />
      <Anchor text="www.superposition.so" href="https://superposition.so" />
      <Parag text="It is a DeFi native Layer-3 that focuses on novel incentives and order-flow for growth and value capture. Superpositions includes a native AMM and on-chain orderbook with faster execution speeds through Stylus, providing shared and permissionless liquidity for all apps onchain. " />
      <Parag text="When tokens are bridged to Superposition, they turn into Super Assets, assets that pay yield when you both hold and use them." />
      <Parag text="Superposition also natively supports Utility Mining, allowing developers and protocols to progressively decentralise, align incentives with their users, and earn revenue through user adoption and interaction." />
      <Title text="Defi & Beyond" />
      <Parag text="Superposition is re-imagining the way users interact with, engage, and explore the crypto space. By rewarding users for their exploration and incentivising builders and developers to create unique experiences, Superposition keeps users engaged and retains them. Our platform is at the forefront of DeFi innovation, building tools that reward blockspace usage and leverage cutting-edge DeFi technology." />
    </Section>
  );
}
export default function Disclaimer() {
  return (
    <TabGroup>
      <TabList
        className={
          "flex overflow-y-hidden overflow-x-scroll border-b border-b-9black md:overflow-x-hidden"
        }
      >
        <Tab as={Fragment}>
          {(props) => <TabButton title="About & Disclaimer" {...props} />}
        </Tab>
        <Tab as={Fragment}>
          {(props) => <TabButton title="Achievements" {...props} />}
        </Tab>
        <Tab as={Fragment}>
          {(props) => <TabButton title="Superposition" {...props} />}
        </Tab>
      </TabList>
      <TabPanels>
        <TabPanel>
          <About />
        </TabPanel>
        <TabPanel>
          <Achievments />
        </TabPanel>
        <TabPanel>
          <Superposition />
        </TabPanel>
      </TabPanels>
    </TabGroup>
  );
}
