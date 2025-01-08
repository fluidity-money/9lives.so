import { InfraMarketState, InfraMarketStateTitles, Outcome } from "@/types";
import { Description, Field, Label, Select } from "@headlessui/react";
import Image from "next/image";
import DownIcon from "#/icons/down-caret.svg";
import { combineClass } from "@/utils/combineClass";
import Button from "./themed/button";
import useCountdown from "@/hooks/useCountdown";
import { useActiveAccount } from "thirdweb/react";
import useConnectWallet from "@/hooks/useConnectWallet";
import { useEffect, useState } from "react";
import LogoHero from "#/images/logo-hero.svg";
import Link from "next/link";
import LinkIcon from "#/icons/link.svg";
import useInfraMarket from "@/hooks/useInfraMarket";
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
  const timeLeft = useCountdown(ending);
  const [isProposing, setIsProposing] = useState(false);
  const [isProposed, setIsProposed] = useState(false);
  const [txHash, setTxHash] = useState<string>("");
  const [infraStatus, setInfraStatus] =
    useState<(typeof InfraMarketStateTitles)[InfraMarketState]>();
  const [selectedOutcome, setSelectedOutcome] = useState<`0x${string}`>(
    outcomes[0].identifier,
  );
  const { propose, getStatus } = useInfraMarket({ tradingAddr });
  const account = useActiveAccount();
  const { connect } = useConnectWallet();
  async function handleProposal() {
    if (!account) return connect();
    try {
      setIsProposing(true);
      const txHash = await propose(selectedOutcome, account);
      setTxHash(txHash);
      setIsProposed(true);
    } finally {
      setIsProposing(false);
    }
  }
  useEffect(() => {
    (async () => {
      const status = await getStatus();
      setInfraStatus(status);
    })();
  }, []);
  if (isProposed)
    return (
      <div className="flex flex-col items-center justify-center gap-4">
        <h4 className="text-center font-chicago text-xl">{title}</h4>
        <Image src={LogoHero} alt="" width={80} />
        <p className="text-center font-bold text-9black">
          Your proposed outcome has been submitted to the 9lives oracle.
        </p>
        <div className="flex items-center gap-1 bg-9green px-1 py-0.5">
          <Image src={LinkIcon} alt="" width={14} />
          <Link
            href={`https://testnet-explorer.superposition.so/tx/${txHash}`}
            className="font-geneva text-xs uppercase text-9black underline"
          >
            Tx Hash:{txHash!.slice(0, 6)}...{txHash!.slice(-6)}
          </Link>
        </div>
        <p className="text-xs text-9black/50">
          Participating in more outcome proposals result in higher potential
          yield per staked $ARB
        </p>
        <Button intent={"cta"} title="Return to market" onClick={closeModal} />
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
          End Date: {new Date(ending).toDateString()}
        </span>
        <span
          className={
            "bg-9yellow px-1 py-0.5 font-geneva text-xs uppercase text-9black"
          }
        >
          Time left to dispute: {timeLeft}
        </span>
      </div>
      <h5 className="text-center font-geneva text-sm uppercase text-9black">
        Status: {infraStatus}
      </h5>
      <div className="w-full text-9black">
        <Field>
          <Label className="font-bold text-9black">
            Your proposed outcome will be utilized in 9lives&apos; oracle.
          </Label>
          <Description className="text-sm/6 text-9black/50">
            By participating in this outcome proposal you agree to lock-up your
            staked $ARB tokens until 1 week after the market&apos;s end date.
          </Description>
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
      <p className="text-sm/6 text-9black/50">
        Participating in more outcome proposals result in higher potential yield
        per staked $ARB
      </p>
      <Button
        intent={"yes"}
        size={"large"}
        title={isProposing ? "Submitting" : "SUBMIT"}
        onClick={handleProposal}
        disabled={isProposing}
      />
    </div>
  );
}
