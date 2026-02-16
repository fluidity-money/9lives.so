import { cva, type VariantProps } from "class-variance-authority";
const badge = cva("rounded-xl px-1.5 py-1 text-xs font-medium md:text-sm", {
  variants: {
    intent: {
      yes: "bg-green-700 text-green-100",
      no: "bg-red-700 text-red-100",
      invertedYes: "bg-green-200 text-green-800",
      invertedNo: "bg-red-200 text-red-800",
    },
  },
});
interface BadgeProps extends VariantProps<typeof badge> {
  chance: string;
  className?: string;
}
export default function Badge({ chance, intent, className }: BadgeProps) {
  return <div className={badge({ intent, className })}>{chance}%</div>;
}
