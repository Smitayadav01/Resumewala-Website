declare global {
  interface Window {
    fbq: (...args: any[]) => void;
  }
}

const PIXEL_ID = "1430211398866324";

// Fire PageView — call on every route change
export const trackPageView = () => {
  if (typeof window.fbq !== "undefined") {
    window.fbq("track", "PageView");
  }
};

// Fire ViewContent — call on important pages
export const trackViewContent = (contentName: string) => {
  if (typeof window.fbq !== "undefined") {
    window.fbq("track", "ViewContent", {
      content_name: contentName,
    });
  }
};

// Fire CompleteRegistration — call after successful registration
export const trackCompleteRegistration = () => {
  if (typeof window.fbq !== "undefined") {
    window.fbq("track", "CompleteRegistration");
  }
};

// Fire Lead — optional, call when employer registers
export const trackLead = () => {
  if (typeof window.fbq !== "undefined") {
    window.fbq("track", "Lead");
  }
};