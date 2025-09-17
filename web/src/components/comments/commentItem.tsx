import useTimePassed from "@/hooks/useTimePassed";
import { Comment } from "../../types";
export default function CommentItem({ data }: { data: Comment }) {
  const timePassed = useTimePassed(
    data.createdAt * 1000 + new Date().getTimezoneOffset() * 1000 * 60,
  );
  return (
    <li className="flex gap-2.5">
      <div className="size-9 border border-9black bg-9gray" />
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2.5">
          <span className="font-chicago text-xs font-bold text-9black">
            {data.walletAddress.slice(0, 4)}...{data.walletAddress.slice(-4)}
          </span>
          <span className="text-xs font-bold text-9black/50">{timePassed}</span>
        </div>
        <p className="text-xs">{data.content}</p>
      </div>
    </li>
  );
}
