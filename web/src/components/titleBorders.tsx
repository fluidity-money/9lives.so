export default function TitleBorders() {
  const borderList = new Array(6).fill(1);

  return (
    <div className="relative flex h-[13px] flex-1 flex-col justify-between gap-px bg-[#DDD] py-px">
      <div className="absolute inset-y-0 left-0 z-[1] w-px bg-[#EEE]" />
      <div className="absolute inset-y-0 right-0 z-[1] w-px bg-[#EEE]" />
      {borderList.map((_, index) => (
        <div key={index} className="relative z-[2] h-1 w-full bg-[#999]" />
      ))}
    </div>
  );
}
