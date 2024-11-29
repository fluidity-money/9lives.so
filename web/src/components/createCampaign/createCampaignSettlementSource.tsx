export default function SettlementSourceWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2 border border-black p-5 shadow-9selectedOutcome">
      {children}
    </div>
  );
}
