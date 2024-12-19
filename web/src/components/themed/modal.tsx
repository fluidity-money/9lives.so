import {
  Dialog,
  TransitionChild,
  Transition,
  DialogPanel,
} from "@headlessui/react";
import RetroCard from "../cardRetro";
interface ModalProps {
  isOpen: boolean;
  setIsOpen: React.Dispatch<boolean>;
  callback?: () => void;
  children: React.ReactNode;
  title: string;
  disabled?: boolean;
}
export default function Modal({
  isOpen,
  setIsOpen,
  callback,
  children,
  title,
  disabled = false,
}: ModalProps) {
  function closeModal() {
    !disabled && setIsOpen(false);
    !disabled && callback && callback();
  }

  return (
    <Transition appear show={isOpen}>
      <Dialog
        as="div"
        className="relative z-30 focus:outline-none"
        onClose={closeModal}
      >
        <div className="fixed inset-0 z-30 w-screen overflow-y-auto bg-9blueLight/70 backdrop-blur">
          <div className="flex min-h-full items-center justify-center">
            <TransitionChild
              enter="ease-out duration-300"
              enterFrom="opacity-0 transform-[scale(95%)]"
              enterTo="opacity-100 transform-[scale(100%)]"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 transform-[scale(100%)]"
              leaveTo="opacity-0 transform-[scale(95%)]"
            >
              <DialogPanel className="w-full max-w-3xl">
                <RetroCard title={title} onClose={closeModal} position="middle">
                  {children}
                </RetroCard>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
