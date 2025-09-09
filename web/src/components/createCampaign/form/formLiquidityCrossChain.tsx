import { Field } from "@headlessui/react";
import Label from "@/components/themed/label";
import { combineClass } from "@/utils/combineClass";
import { fieldClass } from "../createCampaignForm";
import ErrorInfo from "@/components/themed/errorInfo";
import { FieldError, UseFormRegister } from "react-hook-form";
import Input from "@/components/themed/input";
import USDCImg from "#/images/usdc.svg";
import Image from "next/image";
import { formatUnits, ZeroAddress } from "ethers";
import Button from "@/components/themed/button";
import { Account } from "thirdweb/wallets";
import AssetSelector from "@/components/assetSelector";
import ChainSelector from "@/components/chainSelector";
import useTokens from "@/hooks/useTokens";
import useTokensWithBalances from "@/hooks/useTokensWithBalances";
import { Chain } from "thirdweb";
import { useCallback } from "react";
export default function CreateCampaignFormLiquidityCrossChain({
  register,
  errors,
  renderLabel = true,
  account,
  setValue,
  fromToken,
  // usdValue,
  seedLiquidity,
  clearErrors,
  fromChain,
  isInMiniApp,
}: {
  register: UseFormRegister<{ seedLiquidity: number } & any>;
  errors: any;
  renderLabel?: boolean;
  // selectedTokenBalance: string;
  account?: Account;
  seedLiquidity: number;
  fromChain: number;
  fromToken: string;
  setValue: (...args: any[]) => void;
  clearErrors: () => void;
  isInMiniApp: boolean;
  // usdValue: number
}) {
  const { data: tokens, isSuccess: isTokensSuccess } = useTokens(fromChain);
  const fromDecimals = tokens?.find((t) => t.address === fromToken)?.decimals;
  const { data: tokensWithBalances } = useTokensWithBalances(fromChain);
  const selectedTokenBalance = tokensWithBalances?.find(
    (t) =>
      t.token_address.toLowerCase() === fromToken.toLowerCase() ||
      (fromToken === ZeroAddress &&
        t.token_address === "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee"),
  )?.balance;
  const usdValue = tokens
    ? seedLiquidity *
      +(tokens.find((t) => t.address === fromToken) ?? { priceUSD: 0 }).priceUSD
    : seedLiquidity;
  const setToMaxShare2 = async () => {
    if (!selectedTokenBalance) return;
    const maxBalance = +formatUnits(selectedTokenBalance, fromDecimals);
    setValue("seedLiquidity", maxBalance);
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
    <Field className="flex flex-col gap-2.5">
      {renderLabel && <Label text="Seed Liquidity" required />}
      <div className={combineClass("flex items-center justify-between")}>
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

      <div className="flex gap-2.5">
        <AssetSelector
          tokens={tokens}
          tokensWithBalances={tokensWithBalances}
          isSuccess={isTokensSuccess}
          fromToken={fromToken}
          fromChain={fromChain}
          setValue={handleTokenChange}
        />
        <Input
          {...register("seedLiquidity")}
          type="number"
          min={1}
          className={combineClass(
            errors?.seedLiquidity && "border-2 border-red-500",
            "flex-1",
          )}
        />
        {errors?.seedLiquidity && (
          <ErrorInfo text={errors.seedLiquidity.message} />
        )}
      </div>
      <ChainSelector
        handleNetworkChange={handleNetworkChange}
        selectedChainId={fromChain}
        isInMiniApp={isInMiniApp}
      />
      {errors?.fromChain && <ErrorInfo text={errors.fromChain.message} />}
      {errors?.fromToken && <ErrorInfo text={errors.fromToken.message} />}
    </Field>
  );
}
