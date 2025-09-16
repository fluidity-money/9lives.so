import useTimePassed from "@/hooks/useTimePassed";
import { Comment } from "../../types";
export default function CommentItem({ data }: { data: Comment }) {
  const timePassed = useTimePassed(data.createdAt);
  return (
    <li>
      <div>
        <span>{data.walletAddress}</span>
        <span>{timePassed}</span>
      </div>
      <p>{data.content}</p>
    </li>
  );
}
