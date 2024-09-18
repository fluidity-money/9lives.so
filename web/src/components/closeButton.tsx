import Button from "./themed/button";

export default function CloseButton({
  onClick,
  size = "size-6",
}: {
  onClick: () => void;
  size?: `size-${number}`;
}) {
  return (
    <Button
      intent={"default"}
      cat={"close"}
      size={"nospace"}
      onClick={onClick}
      className={size}
    />
  );
}
