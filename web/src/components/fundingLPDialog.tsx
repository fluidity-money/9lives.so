import { useForm } from "react-hook-form";
import CreateCampaignFormLiquidity from "./createCampaign/form/formLiquidity";
import Button from "./themed/button";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import { FormEvent, useState } from "react";
import { useActiveAccount } from "thirdweb/react";
import useConnectWallet from "@/hooks/useConnectWallet";
import { Account } from "thirdweb/wallets";
import useAddLiquidity from "@/hooks/useAddLiquidity";

export default function FundingLP({
  name,
  close,
  campaignId,
  tradingAddr,
}: {
  name: string;
  close: () => void;
  campaignId: `0x${string}`;
  tradingAddr: `0x${string}`;
}) {
  const account = useActiveAccount();
  const { connect } = useConnectWallet();
  const [isFunding, setIsFunding] = useState(false);
  const formSchema = z.object({
    seedLiquidity: z.preprocess((val) => Number(val), z.number().min(1)),
  });
  type FormData = z.infer<typeof formSchema>;
  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      seedLiquidity: 1,
    },
  });
  const { addLiquidity } = useAddLiquidity({
    campaignId,
    tradingAddr,
  });
  const onSubmit = async (input: FormData, account: Account) => {
    try {
      setIsFunding(true);
      await addLiquidity(account!, input.seedLiquidity.toString());
      close();
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
  return (
    <div className="flex flex-col gap-4">
      <p className="text-center font-chicago text-base">
        Supply Liquidity to The Campaign
      </p>
      <p className="text-center font-chicago text-xl">{name}</p>
      <p className="text-center text-xs">
        Higher liquidty means better trading stability and lower slippage. You
        can add liquidity to your campaign and earn provider rewards at any
        time.
      </p>
      <CreateCampaignFormLiquidity
        renderLabel={false}
        register={register}
        error={errors.seedLiquidity}
      />
      <Button
        intent={"yes"}
        title={isFunding ? "Loading..." : "Add Liquidity"}
        size={"xlarge"}
        disabled={isFunding}
        onClick={handleSubmitWithAccount}
      />
    </div>
  );
}
