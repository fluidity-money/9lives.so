import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import z from "zod";
import Button from "./themed/button";
import ErrorInfo from "./themed/errorInfo";
import { Field } from "@headlessui/react";
import Input from "./themed/input";
import { combineClass } from "@/utils/combineClass";
import { FormEvent, useRef, useState } from "react";
import { Account } from "thirdweb/wallets";
import { useActiveAccount } from "thirdweb/react";
import useConnectWallet from "@/hooks/useConnectWallet";
import formatFusdc from "@/utils/formatFusdc";
import chains from "@/config/chains";
import ChainSelector from "./chainSelector";
import { useUserStore } from "@/stores/userStore";
import { Chain } from "thirdweb";
import useBalance from "@/hooks/useBalance";

export default function WithdrawDialog() {
  const account = useActiveAccount();
  const sliderRef = useRef<HTMLInputElement>(null);
  const { connect } = useConnectWallet();
  const [isLoading, setIsLoading] = useState(false);
  const isInMiniApp = useUserStore((s) => s.isInMiniApp);
  const { data } = useBalance(account);
  const maxBalance = Number(formatFusdc(data, 6));
  const formSchema = z.object({
    amount: z.preprocess(
      (val) => Number(val),
      z.number().gt(0, "You can't witdraw zero amount").max(maxBalance),
    ),
    toChain: z.number().min(0),
  });
  type FormData = z.infer<typeof formSchema>;
  const {
    register,
    setValue,
    formState: { errors },
    handleSubmit,
    watch,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: 0,
      toChain: chains.arbitrum.id,
    },
  });
  const selectedChainId = watch("toChain");
  // const { remove } = useLiquidity({
  //     campaignId,
  //     tradingAddr,
  // });
  const onSubmit = async (input: FormData, account: Account) => {
    try {
      setIsLoading(true);
      // await remove(account!, input.amount.toString());
      close();
    } finally {
      setIsLoading(false);
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
  const handleNetworkChange = async (chain: Chain) => {
    setValue("toChain", chain.id);
  };
  return (
    <div className="flex flex-col gap-4">
      <p className="text-center font-chicago text-base">
        Withdraw USDC to Other Chains
      </p>
      <p className="text-center text-xs">
        You can bridge your usdc from Superposition to listed networks.
      </p>
      <p className="text-center font-chicago text-xl">{`${maxBalance} USDC`}</p>
      <div className="flex items-center justify-between">
        <span className="font-geneva text-xs text-9black">0%</span>
        <span className="font-geneva text-xs text-9black">100%</span>
      </div>
      <Input
        type="range"
        ref={sliderRef}
        onChange={(e) => {
          setValue("amount", (+e.target.value / 100) * +maxBalance);
        }}
        defaultValue={0}
        min={0}
        max={100}
        step={0.1}
        className={"w-full"}
      />
      <Field className="flex flex-col gap-2.5">
        <div className="flex gap-2.5">
          <Input
            {...register("amount", {
              onChange: () => {
                const slider = sliderRef.current;
                if (slider) {
                  slider.value = "0";
                }
              },
            })}
            type="number"
            min={0}
            className={combineClass(
              errors.amount && "border-2 border-red-500",
              "flex-1",
            )}
          />
        </div>
        {errors.amount && <ErrorInfo text={errors.amount.message} />}
      </Field>
      <ChainSelector
        isInMiniApp={isInMiniApp}
        handleNetworkChange={handleNetworkChange}
        selectedChainId={selectedChainId}
      />
      <Button
        intent={"no"}
        title={isLoading ? "Loading..." : "Withdraw"}
        size={"xlarge"}
        disabled={isLoading}
        onClick={handleSubmitWithAccount}
      />
    </div>
  );
}
