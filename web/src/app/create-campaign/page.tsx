"use client";
import RetroCard from "@/components/cardRetro";
import Button from "@/components/themed/button";
import ErrorInfo from "@/components/themed/errorInfo";
import Input from "@/components/themed/input";
import Label from "@/components/themed/label";
import { Field } from "@headlessui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import z from "zod";
export default function CreateCampaign() {
  const formSchema = z.object({
    name: z.string().min(3),
    description: z.string().min(5),
    picture: z.string(),
    endDate: z.date(),
  });
  type FormData = z.infer<typeof formSchema>;
  const {
    register,
    handleSubmit,
    setValue,
    clearErrors,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {},
  });

  const fieldClass = "flex flex-col gap-2.5";
  const onSubmit = (data: any) => console.log(data);

  return (
    <div className="flex flex-1 flex-col gap-7">
      <div className="flex flex-col items-center justify-center gap-4">
        <h2 className="font-chicago text-2xl">Create Campaign</h2>
        <p className="text-center text-xs">
          This is where you can create your own campaign for other people to
          participate in! {"\n"}
          Lorem ipsum dolor sit amet vadum omet. Lorem ipsum dolor sit amet
          vadum omet.
        </p>
      </div>
      <div className="flex gap-7">
        <form
          className="flex flex-[2] flex-col gap-7"
          onSubmit={handleSubmit(onSubmit)}
        >
          <Field className={fieldClass}>
            <Label text="Campaign Name" required />
            <Input {...register("name")} />
            {errors.name && <ErrorInfo text={errors.name.message} />}
          </Field>
          <Field className={fieldClass}>
            <Label text="Campaign Description" required />
            <Input type="textarea" {...register("description")} />
            {errors.description && (
              <ErrorInfo text={errors.description.message} />
            )}
          </Field>
          <Field className={fieldClass}>
            <Label text="Campaign Picture" required />
            <Input type="file" {...register("picture")} />
            {errors.picture && <ErrorInfo text={errors.picture.message} />}
          </Field>
          <Field className={fieldClass}>
            <Label text="End Date" required />
            <Input type="date" {...register("endDate")} />
            {errors.endDate && <ErrorInfo text={errors.endDate.message} />}
          </Field>
          <Button
            intent={"cta"}
            title="CONFIRM"
            size={"xlarge"}
            type="submit"
          />
        </form>
        <div className="flex flex-1 flex-col gap-7">
          <RetroCard
            title="YOUR CAMPAIGN SUMMARY"
            position="middle"
            showClose={false}
          >
            <div></div>
          </RetroCard>
          <RetroCard title="TIPS & INSTRUCTIONS" position="middle">
            <span></span>
            <p></p>
          </RetroCard>
        </div>
      </div>
    </div>
  );
}
