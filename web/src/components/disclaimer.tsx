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
          <li key={item.slice(0, 20)}>
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
      <Title text="What is 9lives?" />
      <Parag text="9lives is the most cost-efficient and advanced prediction market platform. With 9lives, traders can easily make predictions, trade their positions, and maximise capital efficiency in web3." />
      <Title text="Disclaimer" />
      <List
        items={[
          "By accessing this web application, you agree that you are not a citizen of a country where gambling is prohibited. You agree that you have read and agree to the Terms and Conditions.",
        ]}
      />
      <Anchor href="#terms-and-conditions" text="Terms and Conditions" />
      <Anchor
        href="https://x.com/Superpositionso/status/1949808095686758533"
        text="9lives Guide for Liquidity Providers"
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
