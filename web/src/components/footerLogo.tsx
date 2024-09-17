import Image from "next/image";
import LogoPaw from "#/images/logo-paw.svg";
import LogoText from "#/images/logo-text.svg";
export default function FooterLogo() {
  return (
    <div className="flex flex-col items-center justify-center gap-1.5">
      <Image src={LogoPaw} alt="9lives.com" height={36} />
      <Image src={LogoText} alt="9lives.com" height={10} />
    </div>
  );
}
