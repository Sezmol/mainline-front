import { useEffect } from "react";

import { onSessionSwitch } from "@shared/lib/session-switch";

export const useReloadOnSessionSwitch = () => {
  useEffect(() => onSessionSwitch(() => window.location.reload()), []);
};
