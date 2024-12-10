import RetroCard from "../cardRetro";
export default function DetailInfo({ data }: { data: string }) {
  return (
    <>
      <RetroCard title="Rules & Resources" showClose={false}>
        <h5 className="mb-5 font-chicago text-sm">Overview</h5>
        <p className="text-s">{data}</p>
        <br />
        <h5 className="mb-5 font-chicago text-sm">Settlement</h5>
        <p className="text-s">
          Settlement of this trade is completed with a 9lives Infrastructure
          Market. This market concludes at ..
        </p>
      </RetroCard>
      <RetroCard title="Creator" showClose={false}>
        <h5 className="mb-5 font-chicago text-sm">Creator</h5>
        <p className="text-s">This was created by X.</p>
      </RetroCard>
    </>
  );
}
