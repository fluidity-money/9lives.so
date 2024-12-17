import Input from "@/components/themed/input";
import Label from "@/components/themed/label";
import { Field } from "@headlessui/react";
import { FieldError, UseFormRegister, UseFormSetValue } from "react-hook-form";
import { fieldClass, inputStyle, onFileChange } from "../createCampaignForm";
import { Dispatch, useRef } from "react";
import { combineClass } from "@/utils/combineClass";
import Image from "next/image";
import UploadIcon from "#/icons/upload.svg";
import ErrorInfo from "@/components/themed/errorInfo";

export default function CreateCampaignFormPicture({
  register,
  error,
  setValue,
  pictureBlob,
  setPictureBlob,
}: {
  register: UseFormRegister<{ picture: string } & any>;
  error?: FieldError;
  setValue: UseFormSetValue<{ picture: string } & any>;
  pictureBlob?: string;
  setPictureBlob: Dispatch<string | undefined>;
}) {
  const pictureInputRef = useRef<HTMLInputElement | null>(null);
  function handlePickPicture() {
    pictureInputRef.current?.click();
  }
  const handlePicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFileChange(e, setPictureBlob);
    const file = e.target.files?.[0];
    if (file) {
      setValue("picture", file);
    }
  };
  return (
    <Field className={fieldClass}>
      <Label text="Campaign Picture" required />
      <Input
        type="file"
        accept="image/gif, image/jpeg, image/jpg, image/png"
        {...register("picture", {
          onChange: handlePicChange,
        })}
        ref={(el) => {
          register("picture").ref(el);
          pictureInputRef.current = el;
        }}
        hidden
      />
      <div
        onClick={handlePickPicture}
        className={combineClass(
          inputStyle,
          "flex h-[120px] cursor-pointer flex-col items-center justify-center gap-1.5",
          error && "border-2 border-red-500",
        )}
      >
        {pictureBlob ? (
          <Image
            src={pictureBlob}
            alt=""
            height={120}
            width={120}
            className="h-[120px] w-auto object-contain"
          />
        ) : (
          <>
            <div className="flex items-center gap-1.5">
              <Image src={UploadIcon} width={20} className="h-auto" alt="" />
              <span className="font-chicago text-xs">Upload Here</span>
            </div>
            <p className="font-geneva text-[10px] uppercase">
              Formats: GIF, PNG, JPG, JPEG.
            </p>
          </>
        )}
      </div>
      {error && <ErrorInfo text={error.message} />}
    </Field>
  );
}
