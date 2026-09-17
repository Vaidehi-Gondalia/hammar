type LoadingListener = (loading: boolean) => void;

const listeners = new Set<LoadingListener>();

let requestCount = 0;

function notify() {
  const loading = requestCount > 0;

  listeners.forEach((listener) => {
    listener(loading);
  });
}

export function subscribeLoading(listener: LoadingListener) {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}

export function startLoading() {
  requestCount += 1;
  notify();
}

export function stopLoading() {
  requestCount = Math.max(0, requestCount - 1);
  notify();
}
