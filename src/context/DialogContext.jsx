import { createContext, useCallback, useContext, useMemo } from "react";
import Swal from "sweetalert2";

const DialogContext = createContext(null);

const resolveIcon = (message = "", options = {}) => {
  if (options.icon) return options.icon;

  if (/ไม่สำเร็จ|ข้อผิดพลาด|ผิดพลาด/i.test(message)) {
    return "error";
  }

  if (/สำเร็จ|เรียบร้อยแล้ว|อัปเดต/i.test(message)) {
    return "success";
  }

  if (/กรุณา|ยืนยัน|มี.+อยู่แล้ว/i.test(message)) {
    return "warning";
  }

  return "info";
};

export function DialogProvider({ children }) {
  const showAlert = useCallback((message, options = {}) => {
    const icon = resolveIcon(message, options);
    const isSuccess = icon === "success";

    return Swal.fire({
      position: options.position || "center",
      icon,
      title:
        options.title ||
        (isSuccess ? "บันทึกข้อมูลสำเร็จ" : "แจ้งเตือน"),
      text: message,
      showConfirmButton: options.showConfirmButton ?? !isSuccess,
      confirmButtonText: options.confirmText || "ตกลง",
      timer: options.timer ?? (isSuccess ? 1500 : undefined),
    });
  }, []);

  const showConfirm = useCallback((message, options = {}) => {
    return Swal.fire({
      title: options.title || "ยืนยันรายการ",
      text: message,
      icon: options.icon || "warning",
      showCancelButton: true,
      confirmButtonText: options.confirmText || "ตกลง",
      cancelButtonText: options.cancelText || "ยกเลิก",
      reverseButtons: true,
    })
      .then((result) => result.isConfirmed);
  }, []);

  const value = useMemo(
    () => ({
      showAlert,
      showConfirm,
    }),
    [showAlert, showConfirm]
  );

  return (
    <DialogContext.Provider value={value}>
      {children}
    </DialogContext.Provider>
  );
}

export function useDialog() {
  const context = useContext(DialogContext);
  if (!context) {
    throw new Error("useDialog must be used within DialogProvider");
  }
  return context;
}
