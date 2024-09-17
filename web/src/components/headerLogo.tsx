import Image from "next/image";
import LogoPaw from "#/images/logo-paw.svg";
import LogoText from "#/images/logo-text.svg";
export default function HeaderLogo() {
  return (
    <div className="flex items-center gap-1.5">
      <Image src={LogoPaw} alt="9lives.com" height={24} />
      <Image src={LogoText} alt="9lives.com" height={10} />
    </div>
  );
}
