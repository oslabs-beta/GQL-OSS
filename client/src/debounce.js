export function debounce(duration, fn) {
  let timeout;
  return function (...args) {
    if (timeout) {
      window.clearTimeout(timeout);
    }
    timeout = window.setTimeout(() => {
      timeout = null;
      fn(args);
    }, duration);
  };
}
