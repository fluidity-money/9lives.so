"use client";

import RetroCard from "@/components/cardRetro";
import React, { useState } from "react";

export default function CreateCampaignTutorial() {
  const [showTooltip, setShowTooltip] = useState(true);

  return (
    showTooltip && (
      <RetroCard
        title="TIPS & INSTRUCTIONS"
        position="middle"
        className="flex flex-col gap-5 bg-9blueLight"
        onClose={() => setShowTooltip(false)}
      >
        <span className="font-chicago text-xs">Market Name:</span>
        <p className="pl-2.5 text-xs">
          Enter the name of the event or scenario you want to create a market
          for.{" "}
        </p>
        <span className="font-chicago text-xs">Market Description:</span>
        <p className="pl-2.5 text-xs">
          A good description is one that answers the following:
        </p>
        <ul className="list-inside list-disc pl-4">
          <li>
            <span className="text-xs">
              What is the current state of this prediction market?
            </span>
          </li>
          <li>
            <span className="text-xs">
              What are some of the reasons why this prediction market could
              resolve to a supplied outcome?
            </span>
          </li>
          <li>
            <span className="text-xs">Why is this the ending date?</span>
          </li>
          <li>
            <span className="text-xs">
              What news sources should be depended on to resolve this outcome?
            </span>
          </li>
        </ul>
        <span className="font-chicago text-xs">Types of Campaigns:</span>
        <p className="pl-2.5 text-xs">There are 2 types of campaigns:</p>
        <ul className="list-inside list-disc pl-4">
          <li>
            <span className="text-xs">
              <strong>Binary (Yes/No):</strong> This allows you to create 2
              options with positive/negative connotation.
            </span>
          </li>
          <li>
            <span className="text-xs">
              <strong>Custom Outcomes:</strong> This option lets you create 2 or
              more options in one campaign.
            </span>
          </li>
        </ul>
        <span className="font-chicago text-xs">Outcome Name:</span>
        <p className="pl-2.5 text-xs">
          Provide the name of the possible outcomes.
        </p>
        <span className="font-chicago text-xs">Oracle Description :</span>
        <p className="pl-2.5 text-xs">
          A good description is one that answers the following:
        </p>
        <ul className="list-inside list-disc pl-4">
          <li>
            <span className="text-xs">
              Under what circumstances should this resolve?
            </span>
          </li>
          <li>
            <span className="text-xs">
              Which websites (ideally 3) should determine the outcome of this
              prediction market?
            </span>
          </li>
        </ul>
      </RetroCard>
    )
  );
}
