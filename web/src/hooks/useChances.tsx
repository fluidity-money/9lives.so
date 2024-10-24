import config from "@/config";
import tradingAbi from "@/config/abi/trading";
import { Outcome } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { getContract, prepareContractCall, simulateTransaction } from "thirdweb";

export default function useChances({ tradingAddr, outcomeId, outcomes }: { tradingAddr: string, outcomeId: `0x${string}`, outcomes: Outcome[] }) {
    const tradingContract = getContract({
        abi: tradingAbi,
        address: tradingAddr,
        client: config.thirdweb.client,
        chain: config.chains.superpositionTestnet,
    });
    const detailsTx = useMemo(() => prepareContractCall({
        contract: tradingContract,
        method: "details",
        params: [outcomeId],
    }), [outcomeId, tradingContract])

    return useQuery({
        queryKey: ["chances", tradingAddr, detailsTx],
        queryFn: async () => {
            const investedIdx = 1
            const globalInvestedIdx = 2
            const outcomeRes = await simulateTransaction({
                transaction: detailsTx,
            })
            console.log("           dsfdsf dsf dsf dsfdsfds",outcomeRes)

            const invested = Number(outcomeRes[investedIdx])
            const globalInvested = Number(outcomeRes[globalInvestedIdx])

            const res = outcomes.map((outcome) => ({
                id: outcome.identifier,
                chance: outcome.identifier === outcomeId ? invested / globalInvested : (globalInvested - invested) / globalInvested
            }))
            console.log("res", res)
            return res
        },
    })
}
