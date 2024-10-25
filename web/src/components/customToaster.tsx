"use client";
import { toast, ToastBar, Toaster } from "react-hot-toast";
import TitleBorders from "./titleBorders";
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
          <div className="rounded-[3px] border border-9black bg-9layer shadow-9card">
            <div className="flex flex-row gap-1 rounded-t-[3px] bg-[#CCC] px-2 py-1">
              <span className="font-chicago text-xs leading-[13px]">Alert</span>
              <TitleBorders />
              {t.type !== "loading" && (
                <CloseButton
                  size="size-4"
                  onClick={() => toast.dismiss(t.id)}
                />
              )}
            </div>
            <div className="flex gap-1 p-2 font-chicago">
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
