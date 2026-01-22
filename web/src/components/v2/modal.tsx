import {
  Dialog,
  TransitionChild,
  Transition,
  DialogPanel,
} from "@headlessui/react";
import RetroCard from "../cardRetro";
import { combineClass } from "@/utils/combineClass";
interface ModalProps {
  isOpen: boolean;
  setIsOpen: React.Dispatch<boolean>;
  callback?: () => void;
  children: React.ReactNode;
  title: string;
  disabled?: boolean;
  boxContainerClass?: string;
}
export default function Modal({
  isOpen,
  setIsOpen,
  callback,
  children,
  title,
  disabled = false,
  boxContainerClass,
}: ModalProps) {
  function closeModal() {
    if (!disabled) {
      setIsOpen(false);
      callback?.();
    }
  }

  return (
    <Transition appear show={isOpen}>
      <Dialog
        as="div"
        className="relative z-30 focus:outline-none"
        onClose={closeModal}
      >
        <div
          className={
            "fixed inset-0 z-30 w-screen overflow-y-auto bg-2white/80 backdrop-blur"
          }
        >
          <div className="flex min-h-full items-center justify-center">
            <TransitionChild
              enter="ease-out duration-300"
              enterFrom="opacity-0 transform-[scale(95%)]"
              enterTo="opacity-100 transform-[scale(100%)]"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 transform-[scale(100%)]"
              leaveTo="opacity-0 transform-[scale(95%)]"
            >
              <DialogPanel
                className={combineClass(
                  boxContainerClass ?? "max-w-3xl",
                  "w-full rounded-xl bg-2white p-4",
                )}
              >
                {children}
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
