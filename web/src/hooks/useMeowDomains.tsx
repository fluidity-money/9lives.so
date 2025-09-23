import useProfile from "./useProfile";
export default function useMeowDomains(address?: string) {
  const { data: profile } = useProfile(address);
  return profile?.settings?.meowName
    ? `${profile.settings.meowName}.meow`
    : address;
}
