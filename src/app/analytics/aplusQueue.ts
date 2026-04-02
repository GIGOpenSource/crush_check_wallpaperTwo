declare global {
  interface Window {
    aplus_queue?: Array<{ action: string; arguments: unknown[] }>;
  }
}

export function pushAplusQueue(item: { action: string; arguments: unknown[] }): void {
  window.aplus_queue = window.aplus_queue || [];
  window.aplus_queue.push(item);
}
