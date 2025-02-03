import {
  prepareContractCall,
  sendTransaction,
  simulateTransaction,
} from "thirdweb";
import appConfig from "@/config";
import { Account } from "thirdweb/wallets";
import { InfraMarketState } from "@/types";
import toast from "react-hot-toast";
import config from "@/config";
interface InfraMarketProps {
  tradingAddr: `0x${string}`;
  infraState?: InfraMarketState;
}
export default function useInfraMarket(props: InfraMarketProps) {
  const statusTx = prepareContractCall({
    contract: appConfig.contracts.infra,
    method: "status",
    params: [props.tradingAddr],
  });
  const getStatus = async () => {
    try {
      const [status, timeRemained] = (await simulateTransaction({
        transaction: statusTx,
      })) as [InfraMarketState, bigint];
      return {
        status,
        timeRemained: Number(timeRemained), //time remained returns in seconds
      };
    } catch (error) {
      console.error(error);
    }
  };
  const call = (outcomeId: `0x${string}`, account: Account) =>
    toast.promise<string>(
      new Promise(async (res, rej) => {
        try {
          const proposeTx = prepareContractCall({
            contract: appConfig.contracts.infra,
            method: "call",
            params: [props.tradingAddr, outcomeId, account.address],
          });
          const receipt = await sendTransaction({
            transaction: proposeTx,
            account,
          });
          res(receipt.transactionHash);
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
  const whinge = (outcomeId: `0x${string}`, account: Account) =>
    toast.promise<string>(
      new Promise(async (res, rej) => {
        try {
          const whingeTx = prepareContractCall({
            contract: appConfig.contracts.infra,
            method: "whinge",
            params: [props.tradingAddr, outcomeId, account.address],
          });
          const receipt = await sendTransaction({
            transaction: whingeTx,
            account,
          });
          res(receipt.transactionHash);
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
  const predict = (outcomeId: `0x${string}`, account: Account) =>
    toast.promise<string>(
      new Promise(async (res, rej) => {
        try {
          const predictTx = prepareContractCall({
            contract: appConfig.contracts.infra,
            method: "predict",
            params: [props.tradingAddr, outcomeId],
          });
          const receipt = await sendTransaction({
            transaction: predictTx,
            account,
          });
          res(receipt.transactionHash);
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
  const close = (outcomeId: `0x${string}`, account: Account) =>
    toast.promise<string>(
      new Promise(async (res, rej) => {
        try {
          const revealTx = prepareContractCall({
            contract: appConfig.contracts.infra,
            method: "close",
            params: [props.tradingAddr, outcomeId],
          });
          const receipt = await sendTransaction({
            transaction: revealTx,
            account,
          });
          res(receipt.transactionHash);
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

  const actionMap: Record<
    InfraMarketState,
    ((outcomeId: `0x${string}`, account: Account) => Promise<string>) | null
  > = {
    [InfraMarketState.Callable]: call,
    [InfraMarketState.Closable]: close,
    [InfraMarketState.Whinging]: whinge,
    [InfraMarketState.Predicting]: predict,
    [InfraMarketState.Revealing]: null,
    [InfraMarketState.Declarable]: null,
    [InfraMarketState.Sweeping]: null,
    [InfraMarketState.Closed]: null,
    [InfraMarketState.Loading]: null,
  } as const;
  const currentAction = async (outcomeId: `0x${string}`, account: Account) => {
    const amount =
      config.infraMarket.fees[props.infraState ?? InfraMarketState.Loading];
    if (amount > BigInt(0)) {
      const allowanceTx = prepareContractCall({
        contract: config.contracts.fusdc,
        method: "allowance",
        params: [account.address, config.contracts.buyHelper.address],
      });
      const allowance = (await simulateTransaction({
        transaction: allowanceTx,
        account,
      })) as bigint;
      if (amount > allowance) {
        const approveTx = prepareContractCall({
          contract: config.contracts.fusdc,
          method: "approve",
          params: [config.contracts.buyHelper.address, amount],
        });
        await sendTransaction({
          transaction: approveTx,
          account,
        });
      }
    }
    const action = actionMap[props.infraState ?? InfraMarketState.Loading];
    if (action) {
      return action(outcomeId, account);
    }
    throw new Error("No valid action available for the current state.");
  };
  return { getStatus, action: currentAction };
}
