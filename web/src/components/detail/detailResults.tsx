import { Detail, Outcome } from '@/types'
import ShadowCard from '../cardShadow';
import TrumpImg from "#/images/trump.webp";
import KamalaImg from "#/images/kamala.webp";
import CrownImg from "#/images/crown.svg";
import Image from 'next/image';
import Button from '../themed/button';
import { formatUnits } from 'ethers';
import config from '@/config';
import usePositions from '@/hooks/usePositions';
import useSharePrices from '@/hooks/useSharePrices';
import { useActiveAccount } from 'thirdweb/react';
import SparkleImg from '#/images/sparkle.svg'
interface DetailResultsProps {
    results?: Detail
    initialData: Outcome[]
    tradingAddr: `0x${string}`
}
export default function DetailResults({ results, tradingAddr, initialData }: DetailResultsProps) {
    const account = useActiveAccount();
    const outcomeIds = initialData.map((o) => o.identifier)
    const { isLoading, isError, error, data } = usePositions({
        tradingAddr,
        outcomes: initialData,
        account,
    });
    const { data: sharePrices } = useSharePrices({
        tradingAddr,
        outcomeIds,
    });
    if (!results) return
    const winner = initialData.find((item) => item.identifier === results.winner)!
    const winnerPrice = sharePrices?.find(p => p.id === winner.identifier)!.price
    const accountShares = data?.reduce((acc, item) => {
        if (item.id === winner.identifier) {
            acc += Number(formatUnits(item.balance, config.contracts.decimals.shares))
        }
        return acc
    }, 0)
    const rewardBreakdown = [
        {
            title: "Your Shares",
            value: `${accountShares}`
        },
        {
            title: "Total Investment",
            value: `$${formatUnits(results?.totalInvestment ?? 0, config.contracts.decimals.fusdc)}`,
        },
        {
            title: "Total Shares",
            value: formatUnits(results?.totalShares ?? 0, config.contracts.decimals.shares),
        },
        {
            title: "Avg. Price/Share",
            value: `$${winnerPrice}`,
        },
    ];
    return <ShadowCard className="sticky top-0 z-10 flex flex-col gap-4 p-4">
        <div className="flex items-center gap-4">
            <div className='relative'>
                <Image alt='' width={20} className='h-auto -top-2 absolute mx-auto inset-x-0' src={CrownImg} />
                <div className="size-10 overflow-hidden rounded-full">
                    <Image
                        width={40}
                        height={40}
                        alt={winner.name}
                        src={
                            winner.identifier === "0x1b8fb68f7c2e19b8" ? TrumpImg : KamalaImg
                        }
                        className="size-full object-cover"
                    />
                </div>
            </div>

            <div className='flex flex-col gap-2'>
                <h3 className="font-chicago text-base font-normal text-9black">
                    {winner.name}
                </h3>
                <div className='font-geneva text-[10px] flex gap-1 items-center'>
                    <span className='uppercase'>Chance</span>
                    <span className='py-0.5 px-1 bg-9green'>83%</span></div>
            </div>
        </div>
        <div className='flex justify-between items-center'>
            <span className="font-chicago uppercase">Claimable Rewards</span>
            <div className='flex gap-1 item-center'><span className='font-chicago text-2xl'>$?</span><Image src={SparkleImg} alt='' width={23} className='h-auto' /></div>
        </div>
        <div className="flex flex-col gap-4 bg-9gray p-5 text-xs shadow-9orderSummary">
            <span className="font-chicago uppercase">Reward Breakdown</span>
            <ul className="flex flex-col gap-1 text-gray-500">
                {rewardBreakdown.map((item) => (
                    <li className="flex items-center justify-between" key={item.title}>
                        <strong>{item.title}</strong>
                        <span>{item.value}</span>
                    </li>
                ))}
            </ul>
        </div>
        <Button title='Claim Your Rewards' className='uppercase' intent='yes' size='xlarge' />
    </ShadowCard>
}