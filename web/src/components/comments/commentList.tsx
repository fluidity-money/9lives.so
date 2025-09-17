import useComments from "@/hooks/useComments";
import Placeholder from "../placeholder";
import CommentItem from "./commentItem";
import Button from "../themed/button";

export default function CommentList({ campaignId }: { campaignId: string }) {
  const {
    data: comments,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
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
    <ul className="flex flex-col gap-2.5">
      {data?.map((i) => (
        <CommentItem data={i} key={i.id} campaignId={campaignId} />
      ))}
      <li>
        {hasNextPage ? (
          <Button
            intent={"cta"}
            disabled={isFetchingNextPage}
            title={isFetchingNextPage ? "Loading" : "Show More"}
            onClick={() => fetchNextPage()}
          />
        ) : (
          <span className="font-geneva text-[10px] uppercase leading-3 tracking-wide text-[#808080]">
            End of results
          </span>
        )}
      </li>
    </ul>
  );
}
