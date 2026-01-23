"use client";
import { toast, ToastBar, Toaster } from "react-hot-toast";
import CloseButton from "./closeButton";

const CustomToaster = () => (
  <Toaster position="bottom-right">
    {(t) => (
      <ToastBar
        toast={t}
        style={{
          backgroundColor: "transparent",
          padding: 0,
          boxShadow: "none",
        }}
      >
        {({ icon, message }) => (
          <div className="rounded-2xl border border-neutral-400 bg-2white p-2 shadow-[2px_2px_8px_0px_rgba(178,178,178,0.50)]">
            <div className="flex flex-row gap-1 p-1">
              <span className="text-sm font-bold leading-[13px] text-neutral-400">
                Alert
              </span>
              {t.type !== "loading" && (
                <CloseButton close={() => toast.dismiss(t.id)} />
              )}
            </div>
            <div className="flex gap-1 p-2">
              {icon}
              {message}
            </div>
          </div>
        )}
      </ToastBar>
    )}
  </Toaster>
);

export default CustomToaster;
