"use client";

import { Toaster } from "sonner";

const AppToaster: React.FC = () => {
  return <Toaster position="bottom-right" richColors closeButton style={{ zIndex: 9999 }} />;
};

export default AppToaster;
