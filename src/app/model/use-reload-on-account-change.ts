import { useEffect, useRef } from "react";

export const useReloadOnAccountChange = (userId: string | undefined) => {
  const known = useRef(userId);

  useEffect(() => {
    if (known.current && known.current !== userId) {
      window.location.reload();
      return;
    }

    known.current = userId;
  }, [userId]);
};
