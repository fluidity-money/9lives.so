import {
  prepareContractCall,
  sendTransaction,
  simulateTransaction,
} from "thirdweb";
import appConfig from "@/config";
import { Account } from "thirdweb/wallets";
import { InfraMarketState, InfraMarketStateTitles } from "@/types";
import toast from "react-hot-toast";
import { calcTimeLeft } from "@/utils/calcTimeDiff";
interface InfraMarketProps {
  tradingAddr: `0x${string}`;
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
      //time remained returns in micro seconds
      return {
        status: InfraMarketStateTitles[status],
        timeRemained: Number(timeRemained / BigInt(1000)),
      };
    } catch (error) {
      console.error(error);
    }
  };
  const propose = (outcomeId: `0x${string}`, account: Account) =>
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
  const reveal = (outcomeId: `0x${string}`, account: Account) =>
    toast.promise<string>(
      new Promise(async (res, rej) => {
        try {
          const revealTx = prepareContractCall({
            contract: appConfig.contracts.infra,
            method: "reveal",
            params: [
              props.tradingAddr,
              account.address,
              outcomeId,
              BigInt(Math.random()),
            ],
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

  return { getStatus, propose, whinge, predict, reveal };
}
