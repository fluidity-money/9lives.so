import { useForm } from "react-hook-form";
import Button from "./themed/button";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import { FormEvent, useCallback, useState } from "react";
import { useActiveAccount } from "thirdweb/react";
import useConnectWallet from "@/hooks/useConnectWallet";
import { Account } from "thirdweb/wallets";
import useLiquidity from "@/hooks/useLiquidity";
import useLiquidityWithPaymaster from "@/hooks/useLiquidityWithPaymaster";
import { CampaignDetail } from "@/types";
import useFeatureFlag from "@/hooks/useFeatureFlag";
import config from "@/config";
import { formatUnits, ZeroAddress } from "ethers";
import { useUserStore } from "@/stores/userStore";
import useTokens from "@/hooks/useTokens";
import useTokensWithBalances from "@/hooks/useTokensWithBalances";
import AssetSelector from "./assetSelector";
import { combineClass } from "@/utils/combineClass";
import Image from "next/image";
import Input from "./themed/input";
import ErrorInfo from "./themed/errorInfo";
import ChainSelector from "./chainSelector";
import { Chain, prepareContractCall, simulateTransaction } from "thirdweb";
import USDCImg from "#/images/usdc.svg";

export default function AddLiquidityDialog({
  close,
  data,
}: {
  close?: () => void;
  data: CampaignDetail;
}) {
  const account = useActiveAccount();
  const { connect } = useConnectWallet();
  const [isFunding, setIsFunding] = useState(false);
  const enabledPaymaster = useFeatureFlag("enable paymaster add liquidity");
  const enabledRelay = useFeatureFlag("enable relay add liquidity");
  const isInMiniApp = useUserStore((s) => s.isInMiniApp);
  const formSchema = z.object({
    amount: z.preprocess((val) => Number(val), z.number().gt(0)),
    toChain: z.number().min(0),
    toToken: z.string(),
    fromChain: z
      .number({ message: "You need to select a chain to pay from" })
      .min(0),
    fromToken: z.string({ message: "You need to select a token to pay with" }),
  });
  type FormData = z.infer<typeof formSchema>;
  const {
    register,
    formState: { errors },
    handleSubmit,
    watch,
    setValue,
    clearErrors,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: 0,
      toChain: config.chains.superposition.id,
      toToken: ZeroAddress,
      fromChain: isInMiniApp
        ? config.chains.arbitrum.id
        : config.chains.superposition.id,
      fromToken: ZeroAddress,
    },
  });
  const supply = watch("amount");
  const fromChain = watch("fromChain");
  const fromToken = watch("fromToken");
  const { data: tokens, isSuccess: isTokensSuccess } = useTokens(fromChain);
  const { data: tokensWithBalances } = useTokensWithBalances(fromChain);
  const pointMultiplier = 1 / 1500000;
  const selectedTokenBalance = tokensWithBalances?.find(
    (t) =>
      t.token_address.toLowerCase() === fromToken.toLowerCase() ||
      (fromToken === ZeroAddress &&
        t.token_address === "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee"),
  )?.balance;
  const usdValue = tokens
    ? supply *
      +(tokens.find((t) => t.address === fromToken) ?? { priceUSD: 0 }).priceUSD
    : supply;
  const fromDecimals = tokens?.find((t) => t.address === fromToken)?.decimals;
  const { add, addWithRelay } = useLiquidity({
    campaignId: data.identifier,
    tradingAddr: data.poolAddress,
  });
  const { add: addWithPaymaster } = useLiquidityWithPaymaster({
    data,
  });
  const onSubmit = async (input: FormData, account: Account) => {
    try {
      setIsFunding(true);
      if (enabledRelay && input.fromChain !== config.chains.superposition.id) {
        await addWithRelay(account!, { ...input }, fromDecimals);
      } else {
        let action = enabledPaymaster ? addWithPaymaster : add;
        await action(account, input.amount.toString());
      }
      close?.();
    } finally {
      setIsFunding(false);
    }
  };
  const handleSubmitWithAccount = (e: FormEvent) => {
    if (!account) {
      e.preventDefault();
      connect();
      return;
    }
    handleSubmit((data) => onSubmit(data, account))(e);
  };
  const setToMaxShare = async () => {
    const balance = (await simulateTransaction({
      transaction: prepareContractCall({
        contract: config.contracts.fusdc,
        method: "balanceOf",
        params: [account!.address],
      }),
    })) as bigint;
    const maxfUSDC = +formatUnits(balance, config.contracts.decimals.fusdc);
    setValue("amount", maxfUSDC);
    if (maxfUSDC > 0) clearErrors();
  };
  const setToMaxShare2 = async () => {
    if (!selectedTokenBalance) return;
    const maxBalance = +formatUnits(selectedTokenBalance, fromDecimals);
    setValue("amount", maxBalance);
    if (maxBalance > 0) clearErrors();
  };
  const handleNetworkChange = async (chain: Chain) => {
    // lifi auto switch handle this for now
    // await switchChain(chain);
    setValue("fromChain", chain.id);
  };
  const handleTokenChange = useCallback(
    (addr: string) => setValue("fromToken", addr),
    [setValue],
  );
  return (
    <div className="flex flex-col gap-4">
      {/* <p className="text-center font-chicago text-base">
        Supply Liquidity to The Campaign
      </p>
      <p className="text-center font-chicago text-xl">{data.name}</p>
      <p className="text-center text-xs">
        Higher liquidty means better trading stability and lower slippage. You
        can add liquidity to your campaign and earn provider rewards at any
        time.
      </p> */}
      <div className="flex flex-col gap-2.5">
        {enabledRelay ? (
          <div className={"flex items-center justify-between"}>
            <div className="flex items-center gap-1">
              <span className="text-xs font-normal text-9black/50">
                {selectedTokenBalance
                  ? formatUnits(selectedTokenBalance, fromDecimals)
                  : 0}
              </span>
              <Button
                disabled={!account || !selectedTokenBalance}
                onClick={setToMaxShare2}
                intent={"default"}
                size={"small"}
                title="Max"
              />
            </div>
            <span className="text-xs font-normal text-9black/50">
              ${usdValue.toFixed(2)}
            </span>
          </div>
        ) : (
          <div className={"flex items-center justify-between"}>
            <span className="font-chicago text-xs font-normal text-9black">
              Asset to spend
            </span>
            <Button
              disabled={!account}
              onClick={setToMaxShare}
              intent={"default"}
              size={"small"}
              title="Max"
            />
          </div>
        )}
        <div className="flex gap-2.5">
          {enabledRelay ? (
            <AssetSelector
              tokens={tokens}
              tokensWithBalances={tokensWithBalances}
              isSuccess={isTokensSuccess}
              fromToken={fromToken}
              fromChain={fromChain}
              setValue={handleTokenChange}
            />
          ) : (
            <div
              className={combineClass(
                "relative flex items-center gap-1 rounded-[3px] border border-9black py-2 pl-2.5 pr-8 shadow-9btnSecondaryIdle",
                "focus:outline-none data-[focus]:outline-2 data-[focus]:-outline-offset-2 data-[focus]:outline-white/25",
              )}
            >
              <Image src={USDCImg} alt="fusdc" width={20} />
              <span className="font-chicago">{"USDC"}</span>
            </div>
          )}
          <Input
            {...register("amount")}
            type="number"
            min={0}
            max={Number.MAX_SAFE_INTEGER}
            value={supply}
            placeholder="0"
            step="any"
            className={combineClass(
              "w-full flex-1 text-center",
              errors.amount && "border-2 border-red-500",
            )}
          />
        </div>
        {errors.amount && <ErrorInfo text={errors.amount.message} />}
        {enabledRelay ? (
          <ChainSelector
            handleNetworkChange={handleNetworkChange}
            selectedChainId={fromChain}
            isInMiniApp={isInMiniApp}
          />
        ) : null}
        {errors.fromChain && <ErrorInfo text={errors.fromChain.message} />}
        {errors.fromToken && <ErrorInfo text={errors.fromToken.message} />}
      </div>
      <span className="mx-auto bg-9green px-2 py-1 font-chicago text-xs uppercase">
        EARN {(usdValue * pointMultiplier * 3600 * 24).toFixed(2)} 9lives POINTS
        per day you staked
      </span>
      <Button
        intent={"yes"}
        title={isFunding ? "Loading..." : "Add Liquidity"}
        size={"xlarge"}
        disabled={isFunding}
        onClick={handleSubmitWithAccount}
      />
      <p className="text-center text-xs">
        Make sure you fully understand how to provide liquidity in order to
        prevent any losses.{" "}
        <a
          href="https://docs.superposition.so/native-dapps/9lives/guide-providing-liquidity-to-your-market"
          target="_blank"
          className="underline"
        >
          Check guide here
        </a>
        .
      </p>
    </div>
  );
}
