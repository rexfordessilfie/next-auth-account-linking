import { createContext, useCallback, useContext, useState } from "react";
import { FaWindowClose } from "react-icons/fa";

type ToastData = {
  message: string;
  type: "success" | "error" | "info";
};

type ToastProps = {
  notification?: ToastData;
  onClose: () => void;
};

const ToastContext = createContext({
  showToast: (_notification: ToastData) => {},
  hideToast: () => {}
});

export const Toast = ({ notification, onClose }: ToastProps) => {
  return (
    <div
      className={`flex justify-between items-center w-full  px-4 py-2 shadow-md font-medium bg-${
        notification?.type === "success"
          ? "green"
          : notification?.type === "error"
          ? "red"
          : "blue"
      }-500 text-white ${
        notification ? "opacity-100" : "opacity-0"
      } transition-opacity duration-500 fixed top-0 left-0 right-0 z-50`}
    >
      <span>{notification?.message}</span>
      <button className="text-white" onClick={onClose}>
        <FaWindowClose />
      </button>
    </div>
  );
};

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const [notification, setNotification] = useState<ToastData>();

  const onClose = () => setNotification(undefined);

  const showToast = useCallback(
    (notification: ToastData) => setNotification(notification),
    []
  );
  const hideToast = useCallback(() => setNotification(undefined), []);

  return (
    <ToastContext.Provider
      value={{
        showToast,
        hideToast
      }}
    >
      <Toast notification={notification} onClose={onClose} />
      {children}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  return useContext(ToastContext);
};
