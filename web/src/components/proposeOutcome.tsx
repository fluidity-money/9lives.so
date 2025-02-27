import { InfraMarketState, Outcome } from "@/types";
import { Field, Select } from "@headlessui/react";
import Image from "next/image";
import DownIcon from "#/icons/down-caret.svg";
import { combineClass } from "@/utils/combineClass";
import Button from "./themed/button";
import { useCountdownDiff } from "@/hooks/useCountdown";
import { useActiveAccount } from "thirdweb/react";
import useConnectWallet from "@/hooks/useConnectWallet";
import { useEffect, useState } from "react";
import Link from "next/link";
import LinkIcon from "#/icons/link.svg";
import useInfraMarket from "@/hooks/useInfraMarket";
import config from "@/config";
import CheckIcon from "#/icons/check-green.svg";
import { useQuery } from "@tanstack/react-query";

export default function ProposeOutcome({
  title,
  ending,
  outcomes,
  tradingAddr,
  closeModal,
}: {
  tradingAddr: `0x${string}`;
  title: string;
  ending: number;
  outcomes: Outcome[];
  closeModal: () => void;
}) {
  const [infraState, setInfraState] = useState<InfraMarketState>();
  const [infraTimeLeft, setInfraTimeLeft] = useState<number>();
  const timeLeft = useCountdownDiff(infraTimeLeft);
  const [inAction, setInAction] = useState(false);
  const [isProposed, setIsProposed] = useState(false);
  const [txHash, setTxHash] = useState<string>("");
  const [selectedOutcome, setSelectedOutcome] = useState<`0x${string}`>(
    outcomes[0].identifier,
  );
  const { action, getStatus } = useInfraMarket({ tradingAddr, infraState });
  const account = useActiveAccount();
  const { connect } = useConnectWallet();
  const zeroByte8 = "0x0000000000000000";
  async function handleAction() {
    if (!account) return connect();
    if (!action) return;
    try {
      setInAction(true);
      const txHash = await action(selectedOutcome, account);
      setTxHash(txHash);
      setIsProposed(true);
    } finally {
      setInAction(false);
    }
  }
  const { data: infraStatus } = useQuery({
    queryKey: ["infraStatus", tradingAddr],
    queryFn: async () => {
      return await getStatus();
    },
  });
  useEffect(() => {
    if (infraStatus) {
      setInfraState(infraStatus?.status);
      setInfraTimeLeft(infraStatus?.timeRemained);
    }
  }, [infraStatus]);
  if (isProposed)
    return (
      <div className="flex flex-col items-center justify-center gap-4">
        <h4 className="text-center font-chicago text-xl">{title}</h4>
        <div className="flex items-center gap-2">
          <Image src={CheckIcon} alt="" width={50} />
          <p className="font-chicago text-xl">
            &ldquo;
            {outcomes.find((o) => o.identifier === selectedOutcome)?.name}
            &ldquo; Outcome Submitted!
          </p>
        </div>
        <div className="flex items-center gap-1 bg-9green px-1 py-0.5">
          <Image src={LinkIcon} alt="" width={14} />
          <Link
            href={`${config.chains.currentChain.blockExplorers![0].url}/tx/${txHash}`}
            className="font-geneva text-xs uppercase text-9black underline"
          >
            Tx Hash:{txHash!.slice(0, 6)}...{txHash!.slice(-6)}
          </Link>
        </div>
        <p className="text-center text-xs font-bold text-9black">
          Your proposed outcome will be utilised in 9lives&apos; oracle.
        </p>
        <p className="text-center text-xs text-9black">
          By participating in this outcome proposal, you agree to lock up your
          $2 USDC until this oracle is fully concluded.
        </p>
        <Button
          intent={"default"}
          title={"ARB Staking Hub"}
          className={"w-full"}
        />
      </div>
    );

  return (
    <div className="flex flex-col gap-4">
      <h4 className="text-center font-chicago text-xl">{title}</h4>
      <div className="flex items-center justify-between">
        <span
          className={
            "bg-9yellow px-1 py-0.5 font-geneva text-xs uppercase text-9black"
          }
        >
          End Date:{" "}
          {new Date(
            ending.toString().length === 10 ? ending * 1000 : ending,
          ).toDateString()}
        </span>
        <span
          className={
            "bg-9yellow px-1 py-0.5 font-geneva text-xs uppercase text-9black"
          }
        >
          Time left to dispute: {timeLeft}
        </span>
      </div>
      <div className="flex flex-col items-center justify-center gap-4">
        <span className="font-geneva text-xs uppercase text-9black">
          Status:
        </span>
        <h5
          className={combineClass(
            config.infraMarket.colors[infraState ?? InfraMarketState.Loading],
            "px-5 py-1 text-center font-chicago text-xl uppercase text-9black",
          )}
        >
          {config.infraMarket.titles[infraState ?? InfraMarketState.Loading]}
        </h5>
        {Boolean(action) ? (
          <div className="w-full text-9black">
            <Field>
              <div className="relative">
                <Select
                  defaultValue={outcomes[0].identifier}
                  onChange={(e) =>
                    setSelectedOutcome(e.target.value as `0x${string}`)
                  }
                  className={combineClass(
                    "mt-3 block w-full appearance-none border border-9black bg-9gray px-4 py-2 font-geneva text-sm text-9black shadow-9input",
                    "focus:outline-none data-[focus]:outline-2 data-[focus]:-outline-offset-2 data-[focus]:outline-white/25",
                  )}
                >
                  {outcomes.map((outcome) => (
                    <option key={outcome.identifier} value={outcome.identifier}>
                      {outcome.name}
                    </option>
                  ))}
                  {infraState === InfraMarketState.Predicting && (
                    <option value={zeroByte8}>Unsure</option>
                  )}
                </Select>
                <Image
                  alt=""
                  width={16}
                  src={DownIcon}
                  className="group pointer-events-none absolute right-2.5 top-2.5 size-4"
                  aria-hidden="true"
                />
              </div>
            </Field>
          </div>
        ) : null}
        {infraState && infraState > InfraMarketState.Predicting ? (
          <p className="text-center text-xs font-bold text-9black">
            Go back to detail page of the campaign and claim your rewards.
          </p>
        ) : (
          <div className="flex flex-col gap-1">
            <p className="text-center text-xs font-bold text-9black">
              Your proposed outcome will be utilised in 9lives&apos; oracle.
            </p>
            <p className="text-center text-xs text-9black/50">
              By participating in this outcome proposal, you agree to lock-up
              your staked $ARB tokens until 1 week after the market&apos;s end
              date.
            </p>
          </div>
        )}
        {infraState === InfraMarketState.Predicting ? (
          <p className="inline-block bg-9yellow px-5 py-1 text-xs font-bold">
            Participating in more outcome proposals result in higher potential
            yield per staked $ARB!
          </p>
        ) : null}
      </div>
      {infraState === InfraMarketState.Predicting ? (
        <Button intent={"default"} title={"ARB Staking Hub"} />
      ) : null}
      {Boolean(action) ? (
        <Button
          intent={"yes"}
          size={"large"}
          title={inAction ? "Submitting" : "SUBMIT"}
          onClick={handleAction}
          disabled={inAction}
        />
      ) : null}
    </div>
  );
}
