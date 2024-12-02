import {
  Control,
  FieldErrors,
  useFieldArray,
  UseFormRegister,
  UseFormSetValue,
} from "react-hook-form";
import { fieldClass, onFileChange } from "../createCampaignForm";
import Input from "@/components/themed/input";
import Label from "@/components/themed/label";
import { combineClass } from "@/utils/combineClass";
import ErrorInfo from "@/components/themed/errorInfo";
import Image from "next/image";
import {
  Field,
  Tab,
  TabGroup,
  TabList,
  TabPanel,
  TabPanels,
} from "@headlessui/react";
import TabRadioButton from "@/components/tabRadioButton";
import { OutcomeType } from "@/types";
import {
  createRef,
  Dispatch,
  Fragment,
  MutableRefObject,
  SetStateAction,
  useRef,
} from "react";
import Button from "@/components/themed/button";
import { inputStyle } from "../createCampaignForm";
import UploadIcon from "#/icons/upload.svg";
type CreateCampaignFormOutcomesFields = {
  outcomes: {
    name: string;
    picture: File;
    description: string;
  }[];
};
export default function CreateCampaignFormOutcomes({
  register,
  errors,
  control,
  outcomeType,
  setOutcomeType,
  outcomeImageBlobs,
  setOutcomeImageBlobs,
  setValue,
}: {
  control: Control<CreateCampaignFormOutcomesFields & any>;
  register: UseFormRegister<{ name: string } & any>;
  errors: FieldErrors<CreateCampaignFormOutcomesFields>;
  outcomeType: OutcomeType;
  setOutcomeType: Dispatch<OutcomeType>;
  outcomeImageBlobs: (string | undefined)[];
  setOutcomeImageBlobs: Dispatch<SetStateAction<(string | undefined)[]>>;
  setValue: UseFormSetValue<CreateCampaignFormOutcomesFields & any>;
}) {
  const customOutcomePicturesRef = useRef<
    Array<MutableRefObject<HTMLInputElement | null>>
  >(Array.from({ length: 2 }, () => createRef<HTMLInputElement>()));

  const {
    fields: outcomes,
    append,
    remove,
  } = useFieldArray({
    control,
    name: "outcomes",
    rules: {
      required: outcomeType === "custom",
      minLength: 2,
    },
  });
  const handleOutcomePicChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    idx: number,
  ) => {
    onFileChange(e, (val?: string) =>
      setOutcomeImageBlobs((prev) => {
        const arr = [...prev];
        arr[idx] = val;
        return arr;
      }),
    );
    const file = e.target.files?.[0];
    if (file) {
      setValue(`outcomes.${idx}.picture`, file);
    }
  };

  return (
    <Field className={fieldClass}>
      <Label text="Campaign Type & Outcomes" required />
      <TabGroup
        defaultIndex={0}
        onChange={(idx) => setOutcomeType(idx === 0 ? "default" : "custom")}
      >
        <TabList className="flex gap-2.5">
          <Tab as={Fragment}>
            {(props) => <TabRadioButton title="Yes / No" {...props} />}
          </Tab>
          <Tab as={Fragment}>
            {(props) => <TabRadioButton title="Custom Outcomes" {...props} />}
          </Tab>
        </TabList>
        <TabPanels className={"mt-4"}>
          <TabPanel>
            <div className="flex flex-1 gap-2.5">
              <Button
                intent={"yes"}
                size={"xlarge"}
                title="Yes"
                className="flex-1"
              />
              <Button
                intent={"no"}
                size={"xlarge"}
                title="No"
                className="flex-1"
              />
            </div>
          </TabPanel>
          <TabPanel className={"flex flex-col gap-4"}>
            {outcomes.map((field, idx) => (
              <Field className={"flex flex-col gap-2.5"} key={field.id}>
                <Label text={`Outcome ${idx + 1}`} required={idx < 2} />
                <div className="flex gap-2.5">
                  <input
                    type="file"
                    hidden
                    {...register(`outcomes.${idx}.picture`, {
                      onChange: (e) => handleOutcomePicChange(e, idx),
                    })}
                    ref={(el) => {
                      register(`outcomes.${idx}.picture`).ref(el);
                      if (customOutcomePicturesRef.current[idx])
                        customOutcomePicturesRef.current[idx].current = el;
                    }}
                  />
                  <div
                    onClick={() => {
                      customOutcomePicturesRef.current[idx].current?.click();
                    }}
                    className={combineClass(
                      inputStyle,
                      "flex size-10 cursor-pointer flex-col items-center justify-center",
                      errors.outcomes?.[idx]?.picture &&
                        "border-2 border-red-500",
                    )}
                  >
                    {outcomeImageBlobs[idx] ? (
                      <Image
                        src={outcomeImageBlobs[idx]}
                        width={40}
                        height={40}
                        alt=""
                        className="size-10 bg-white object-contain"
                      />
                    ) : (
                      <>
                        <Image
                          src={UploadIcon}
                          alt=""
                          width={20}
                          className="h-auto"
                        />
                        <p className="font-geneva text-[8px]">PIC</p>
                      </>
                    )}
                  </div>
                  <Input
                    className={combineClass(
                      "flex-1",
                      errors.outcomes?.[idx]?.name && "border-2 border-red-500",
                    )}
                    placeholder="Outcome name"
                    {...register(`outcomes.${idx}.name`)}
                  />
                  <Input
                    className={combineClass(
                      "flex-1",
                      errors.outcomes?.[idx]?.description &&
                        "border-2 border-red-500",
                    )}
                    placeholder="Outcome description"
                    {...register(`outcomes.${idx}.description`)}
                  />
                  {idx > 1 && (
                    <Button
                      title="Del"
                      onClick={() => {
                        remove(idx);
                        customOutcomePicturesRef.current =
                          customOutcomePicturesRef.current.filter(
                            (_, i) => i !== idx,
                          );
                        setOutcomeImageBlobs((prev) => {
                          const arr = [...prev];
                          arr.splice(idx, 1);
                          return arr;
                        });
                      }}
                      size={"small"}
                      intent={"no"}
                    />
                  )}
                </div>
                <div className="flex flex-col gap-0.5">
                  {errors.outcomes?.[idx]?.picture ? (
                    <ErrorInfo text={errors.outcomes?.[idx]?.picture.message} />
                  ) : null}
                  {errors.outcomes?.[idx]?.name ? (
                    <ErrorInfo text={errors.outcomes?.[idx]?.name.message} />
                  ) : null}
                  {errors.outcomes?.[idx]?.description ? (
                    <ErrorInfo
                      text={errors.outcomes?.[idx]?.description.message}
                    />
                  ) : null}
                </div>
              </Field>
            ))}
            <Button
              onClick={() => {
                customOutcomePicturesRef.current.push(
                  createRef<HTMLInputElement>(),
                );
                append({
                  name: "",
                  description: "",
                  picture: new File([], ""),
                });
              }}
              intent={"default"}
              size={"large"}
              title="Add More Outcomes +"
            />
          </TabPanel>
        </TabPanels>
      </TabGroup>
    </Field>
  );
}
