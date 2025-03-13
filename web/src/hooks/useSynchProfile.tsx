import { synchProfile } from "@/providers/graphqlClient";
import { useState } from "react";
import toast from "react-hot-toast";

export default function useSynchProfile() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const synch = async ({
    address,
    email,
  }: {
    address: string;
    email: string;
  }) =>
    toast.promise(
      new Promise(async (resolve, reject) => {
        try {
          setIsLoading(true);
          const res = await synchProfile(address, email);
          if (res) resolve(res);
          setIsSuccess(true);
        } catch (error) {
          reject(error);
        } finally {
          setIsLoading(false);
        }
      }),
      {
        success: "Email submitted successfully",
        loading: "Email updating",
        error: "Something went wrong",
      },
    );
  return { synch, isLoading, isSuccess };
}
