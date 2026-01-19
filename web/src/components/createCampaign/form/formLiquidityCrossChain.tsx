import { Field } from "@headlessui/react";
import Label from "@/components/themed/label";
import { combineClass } from "@/utils/combineClass";
import ErrorInfo from "@/components/themed/errorInfo";
import { UseFormRegister } from "react-hook-form";
import Input from "@/components/themed/input";
import Button from "@/components/themed/button";
import AssetSelector from "@/components/assetSelector";
import ChainSelector from "@/components/chainSelector";
import useTokensWithBalances from "@/hooks/useTokensWithBalances";
import { useCallback } from "react";
import { Chain, Token } from "@/types";
import { formatUnits, zeroAddress } from "viem";
export default function CreateCampaignFormLiquidityCrossChain({
  register,
  errors,
  renderLabel = true,
  address,
  setValue,
  fromToken,
  fromDecimals,
  seedLiquidity,
  clearErrors,
  fromChain,
  isInMiniApp,
  tokens,
  isTokensSuccess,
}: {
  register: UseFormRegister<{ seedLiquidity: number } & any>;
  errors: any;
  renderLabel?: boolean;
  address?: string;
  seedLiquidity: number;
  fromChain: number;
  fromToken: string;
  setValue: (...args: any[]) => void;
  clearErrors: () => void;
  isInMiniApp: boolean;
  tokens?: Token[];
  fromDecimals?: number;
  isTokensSuccess: boolean;
}) {
  const { data: tokensWithBalances } = useTokensWithBalances(fromChain, tokens);
  const selectedTokenBalance = tokensWithBalances?.find(
    (t) =>
      t.address.toLowerCase() === fromToken.toLowerCase() ||
      (fromToken === zeroAddress &&
        t.address === "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee"),
  )?.balance;
  const usdValue = tokens
    ? seedLiquidity *
      +(tokens.find((t) => t.address === fromToken) ?? { priceUSD: 0 }).priceUSD
    : seedLiquidity;
  const setToMaxShare2 = async () => {
    if (!selectedTokenBalance || !fromDecimals) return;
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
            {selectedTokenBalance && fromDecimals
              ? formatUnits(selectedTokenBalance, fromDecimals)
              : 0}
          </span>
          <Button
            disabled={!address || !selectedTokenBalance}
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
          max={Number.MAX_SAFE_INTEGER}
          min={0}
          step={"any"}
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
