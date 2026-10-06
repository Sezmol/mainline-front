const channel = new BroadcastChannel("session");

export const switchSession = (path: string) => {
  channel.postMessage("switched");
  window.location.assign(path);
};

export const onSessionSwitch = (listener: () => void) => {
  channel.addEventListener("message", listener);
  return () => channel.removeEventListener("message", listener);
};
