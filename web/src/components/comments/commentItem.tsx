import useTimePassed from "@/hooks/useTimePassed";
import { Comment } from "../../types";
export default function CommentItem({ data }: { data: Comment }) {
  const timePassed = useTimePassed(
    data.createdAt * 1000 + new Date().getTimezoneOffset() * 1000 * 60,
  );
  return (
    <li>
      <div className="flex items-center gap-2.5">
        <span>
          {data.walletAddress.slice(0, 4)}...{data.walletAddress.slice(-4)}
        </span>
        <span>{timePassed}</span>
      </div>
      <p>{data.content}</p>
    </li>
  );
}
