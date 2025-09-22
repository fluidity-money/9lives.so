import useComments from "@/hooks/useComments";
import Placeholder from "../placeholder";
import CommentItem from "./commentItem";
import Button from "../themed/button";
import { Outcome } from "@/types";
import { useState } from "react";

export default function CommentList({
  campaignId,
  outcomes,
  creator,
}: {
  campaignId: string;
  outcomes: Outcome[];
  creator: string;
}) {
  const [onlyHolders, setOnlyHolders] = useState(false);
  const {
    data: comments,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useComments({ campaignId, onlyHolders });
  const data = comments?.pages.flatMap((c) => c);
  if (isLoading) return <Placeholder title="Loading..." />;
  if (isError)
    return <Placeholder title="Whoops, error!" subtitle={error.message} />;
  if (data?.length === 0)
    return (
      <Placeholder title="No Comments Yet." subtitle="Start adding yours." />
    );
  return (
    <>
      <Button
        title={onlyHolders ? "Show All" : "Only Holders"}
        className={"mb-4 ml-auto block"}
        onClick={() => setOnlyHolders(!onlyHolders)}
        size={"small"}
      />
      <ul className="flex flex-col gap-2.5">
        {data?.map((i) => (
          <CommentItem
            outcomes={outcomes}
            data={i}
            key={i.id}
            campaignId={campaignId}
            creator={creator}
          />
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
    </>
  );
}
