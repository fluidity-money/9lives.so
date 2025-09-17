import useComments from "@/hooks/useComments";
import Placeholder from "../tablePlaceholder";
import CommentItem from "./commentItem";

export default function CommentList({ campaignId }: { campaignId: string }) {
  const {
    data: comments,
    isLoading,
    isError,
    error,
  } = useComments({ campaignId });
  const data = comments?.pages.flatMap((c) => c);
  if (isLoading) return <Placeholder title="Loading..." />;
  if (isError)
    return <Placeholder title="Whoops, error!" subtitle={error.message} />;
  if (data?.length === 0)
    return (
      <Placeholder title="No Comments Yet." subtitle="Start adding yours." />
    );
  return (
    <ul className="mt-4 flex flex-col gap-2.5">
      {data?.map((i) => (
        <CommentItem data={i} key={i.id} />
      ))}
    </ul>
  );
}
