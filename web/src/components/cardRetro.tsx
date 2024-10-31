import { combineClass } from "@/utils/combineClass";
import RetroTitle, { RetroTitleProps } from "./retroTitle";
import ShadowCard from "./cardShadow";
interface RetroCardProps extends RetroTitleProps {
  children: React.ReactNode;
  padding?: `p-${number}`;
}
export default function RetroCard(props: RetroCardProps) {
  return (
    <ShadowCard>
      <RetroTitle
        title={props.title}
        onClose={props.onClose}
        position={props.position}
        showClose={props.showClose}
      />
      <div className={combineClass(props.padding ?? "p-5")}>
        {props.children}
      </div>
    </ShadowCard>
  );
}
