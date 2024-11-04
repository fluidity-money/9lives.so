export default function ErrorInfo({ text }: { text?: string }) {
  return <span className="mt-1 text-xs text-red-500">{text}</span>;
}
