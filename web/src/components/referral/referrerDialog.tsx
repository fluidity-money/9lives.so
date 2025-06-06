"use client";

import useReferrerCode from "@/hooks/useReferrerCode";
import LoadingIndicator from "../loadingIndicator";
import { Fragment, useEffect, useState } from "react";
import { genReferrer } from "@/providers/graphqlClient";
import { generateReferralCode } from "@/utils/generateReferralCode";
import { useActiveAccount } from "thirdweb/react";
import Button from "../themed/button";
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/react";
import TabButton from "../tabButton";
import Input from "../themed/input";
import toast from "react-hot-toast";

export default function ReferrerDialog() {
  const account = useActiveAccount();
  const {
    data: code,
    isSuccess,
    error,
    isLoading,
    refetch,
  } = useReferrerCode(account?.address);
  const [genError, setGenError] = useState<string>();
  const post1 = `https://twitter.com/intent/tweet?text=Got%20a%20hot%20take%20on%20the%20future%3F%0AOn%209Lives%2C%20you%20can%20create%20your%20own%20market%2C%20trade%20on%20predictions%2C%20and%20earn.%0A%0AIt%E2%80%99s%20open%2C%20permissionless%2C%20and%20built%20on%20Superposition.%0A%0AJoin%20me%20here%3A%20https://9lives.so/?referral=${code}`;
  const post2 = `https://twitter.com/intent/tweet?text=Think%20you%E2%80%99ve%20got%209Lives%3F%0A%0AExplore%20prediction%20markets%2C%20trade%20on%20outcomes%2C%20and%20earn%20fees%20and%20points%20on%20markets%20you%20create!%0A%0AJoin%20me%20here%3A%20https://9lives.so/?referral=${code}`;
  function handleCopy() {
    navigator.clipboard.writeText(`https://9lives.so/?referral=${code}`);
    toast.success("Referral link copied");
  }

  useEffect(() => {
    async function generateCode() {
      try {
        if (!account?.address)
          throw new Error("Connect your wallet to generate a referral code");
        const code = generateReferralCode();
        await genReferrer({ address: account.address, code });
        await refetch();
      } catch (error) {
        setGenError(error instanceof Error ? error.message : "Unknown error");
      }
    }
    if (isSuccess && !code) {
      generateCode();
    }
  }, [code, isSuccess, account?.address, refetch]);

  if (isLoading || (isSuccess && !code))
    return (
      <div className="flex h-20 items-center justify-center">
        <LoadingIndicator />
      </div>
    );

  if (code)
    return (
      <div className="mx-auto flex w-[70%] flex-col items-center justify-center gap-5 pb-8">
        <div className="flex flex-col items-center justify-center gap-2">
          <p className="font-geneva uppercase">You have 0 active referrals</p>
          <p className="text-xs text-9black/60">
            Refer users using your link to earn more rewards!
          </p>
        </div>
        {/* <p className="border px-4 py-2 font-chicago">{`https://9lives.so/?referral=${code}`}</p> */}
        <Input
          disabled
          value={`https://9lives.so/?referral=${code}`}
          type="text"
          className="w-full text-center"
        />
        <Button
          size={"xlarge"}
          onClick={handleCopy}
          intent={"cta"}
          title="COPY LINK"
          className="w-full"
        />
        <p className="font-chicago text-xs font-normal">
          Share To:{" "}
          <a
            href={Math.random() > 0.5 ? post1 : post2}
            rel="noreferrer"
            target="_blank"
            className="font-geneva uppercase underline"
          >
            TWITTER
          </a>
        </p>
        <TabGroup className={"w-full"}>
          <TabList className={"flex items-center justify-center"}>
            <Tab as={Fragment}>
              {(props) => <TabButton title="How It Works" {...props} />}
            </Tab>
            <Tab as={Fragment} disabled>
              {(props) => <TabButton title="Fees Generated" {...props} />}
            </Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
              <div className="w-full rounded-tl-none border border-9black bg-9gray p-3 shadow-9orderSummary md:p-5">
                <div className="flex flex-col items-center justify-center gap-4 font-chicago">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-1 text-xs">
                      <div className="flex size-4 items-center justify-center gap-2 rounded-full border border-9black">
                        1
                      </div>
                      <span>Copy your link.</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs">
                      <div className="flex size-4 items-center justify-center rounded-full border border-9black">
                        2
                      </div>
                      <span>Share with your friends.</span>
                    </div>
                  </div>
                  <p className="bg-9green px-4 py-2 text-sm">
                    You get %1 of fees generated by referred user
                  </p>
                </div>
              </div>
            </TabPanel>
          </TabPanels>
        </TabGroup>
      </div>
    );

  return (
    <div className="flex h-20 items-center justify-center">
      <p className="font-chicago">Ups something went wrong</p>
      <p className="text-xs">{error?.message ?? genError ?? "Unknown error"}</p>
    </div>
  );
}
