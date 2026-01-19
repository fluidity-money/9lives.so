import appConfig from "@/config";
import { InfraMarketState, Outcome } from "@/types";
import toast from "react-hot-toast";
import config from "@/config";
import { generateCommit } from "@/utils/generateCommit";
import { randomValue4Uint8 } from "@/utils/generateId";
import { storeCommitment } from "@/providers/graphqlClient";
import { useAppKitAccount } from "@reown/appkit/react";
import { usePublicClient, useWriteContract } from "wagmi";
import { useAllowanceCheck } from "./useAllowanceCheck";
import useConnectWallet from "./useConnectWallet";
interface InfraMarketProps {
  tradingAddr: `0x${string}`;
  infraState?: InfraMarketState;
  outcomes: Outcome[];
}
export default function useInfraMarket(props: InfraMarketProps) {
  const account = useAppKitAccount();
  const publicClient = usePublicClient();
  const { mutateAsync: writeContract } = useWriteContract();
  const { checkAndAprove } = useAllowanceCheck();
  const { connect } = useConnectWallet();
  const getStatus = async () => {
    try {
      if (!publicClient) return;
      const [status, timeRemained] = await publicClient.readContract({
        ...appConfig.contracts.infra,
        functionName: "status",
        args: [props.tradingAddr],
      });
      return {
        status,
        timeRemained: Number(timeRemained), //time remained returns in seconds
      };
    } catch (error) {
      console.error(error);
    }
  };
  const getProposedOutcome = async () => {
    try {
      const outcome = await publicClient?.readContract({
        ...appConfig.contracts.infra,
        functionName: "callerPreferredOutcome",
        args: [props.tradingAddr],
      });
      return outcome;
    } catch (error) {
      console.error(error);
    }
  };
  const getDisputedOutcome = async () => {
    try {
      const outcome = await publicClient?.readContract({
        ...appConfig.contracts.infra,
        functionName: "whingerPreferredWinner",
        args: [props.tradingAddr],
      });
      return outcome;
    } catch (error) {
      console.error(error);
    }
  };
  const call = (outcomeId: `0x${string}`) =>
    toast.promise<string>(
      new Promise(async (res, rej) => {
        try {
          const receipt = await writeContract({
            ...appConfig.contracts.infra,
            functionName: "call",
            args: [
              props.tradingAddr,
              outcomeId,
              account.address as `0x${string}`,
            ],
          });
          res(receipt);
        } catch (error) {
          rej(error);
        }
      }),
      {
        loading: "Proposing outcome...",
        success: "Outcome proposed successfully!",
        error: "Failed to propose outcome.",
      },
    );
  const whinge = (outcomeId: `0x${string}`) =>
    toast.promise<string>(
      new Promise(async (res, rej) => {
        try {
          const receipt = await writeContract({
            ...appConfig.contracts.infra,
            functionName: "whinge",
            args: [
              props.tradingAddr,
              outcomeId,
              account.address as `0x${string}`,
            ],
          });
          res(receipt);
        } catch (error) {
          rej(error);
        }
      }),
      {
        loading: "Whinging for outcome...",
        success: "Outcome is disputed successfully!",
        error: "Failed to whinge.",
      },
    );
  const predict = (outcomeId: `0x${string}`) =>
    toast.promise<string>(
      new Promise(async (res, rej) => {
        try {
          if (!account.address) return connect();
          const seed = randomValue4Uint8();
          await storeCommitment({
            tradingAddr: props.tradingAddr,
            seed: seed.toString(),
            preferredOutcome: outcomeId,
            sender: account.address,
          });
          const commitHash = generateCommit(props.tradingAddr, outcomeId, seed);

          const receipt = await writeContract({
            ...appConfig.contracts.infra,
            functionName: "predict",
            args: [props.tradingAddr, commitHash],
          });
          res(receipt);
        } catch (error) {
          rej(error);
        }
      }),
      {
        loading: "Predicting outcome...",
        success: "Outcome predicted successfully!",
        error: "Failed to predict outcome.",
      },
    );
  const close = (_: any) =>
    toast.promise<string>(
      new Promise(async (res, rej) => {
        try {
          const receipt = await writeContract({
            ...appConfig.contracts.infra,
            functionName: "close",
            args: [props.tradingAddr, account.address as `0x${string}`],
          });
          res(receipt);
        } catch (error) {
          rej(error);
        }
      }),
      {
        loading: "Revealing outcome...",
        success: "Outcome revealed successfully!",
        error: "Failed to reveal outcome.",
      },
    );
  const declare = (_: any) =>
    toast.promise<string>(
      new Promise(async (res, rej) => {
        try {
          const outcomeIds = props.outcomes.map((o) => o.identifier);
          const receipt = await writeContract({
            ...appConfig.contracts.infra,
            functionName: "declare",
            args: [
              props.tradingAddr,
              outcomeIds,
              account.address as `0x${string}`,
            ],
          });
          res(receipt);
        } catch (error) {
          rej(error);
        }
      }),
      {
        loading: "Declaring winner...",
        success: "Declared successfully!",
        error: "Failed to declare.",
      },
    );
  const actionMap: Record<
    InfraMarketState,
    ((outcomeId: `0x${string}`) => Promise<string>) | null
  > = {
    [InfraMarketState.Callable]: call,
    [InfraMarketState.Closable]: close,
    [InfraMarketState.Whinging]: whinge,
    [InfraMarketState.Predicting]: predict,
    [InfraMarketState.Revealing]: null,
    [InfraMarketState.Declarable]: declare,
    [InfraMarketState.Sweeping]: null,
    [InfraMarketState.Closed]: null,
    [InfraMarketState.Loading]: null,
  } as const;
  const currentAction = async (outcomeId: `0x${string}`) => {
    const amount =
      config.infraMarket.fees[props.infraState ?? InfraMarketState.Loading];
    await checkAndAprove({
      contractAddress: config.contracts.fusdc.address,
      spenderAddress: config.contracts.infra.address,
      address: account.address as `0x${string}`,
      amount,
    });
    const action = actionMap[props.infraState ?? InfraMarketState.Loading];
    if (action) {
      return action(outcomeId);
    }
    throw new Error("No valid action available for the current state.");
  };
  return {
    getStatus,
    getProposedOutcome,
    getDisputedOutcome,
    action: currentAction,
  };
}
