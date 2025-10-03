// types/global.d.ts

// ==============================
// Module augmentation
// ==============================
declare global {
  interface IdleDeadline {
    readonly didTimeout: boolean;
    timeRemaining(): DOMHighResTimeStamp;
  }
  interface IdleRequestOptions {
    timeout?: number;
  }
  type IdleRequestCallback = (deadline: IdleDeadline) => void;

  interface Window {
    requestIdleCallback?: (callback: IdleRequestCallback, options?: IdleRequestOptions) => number;
    cancelIdleCallback?: (handle: number) => void;
  }
}
export {};
