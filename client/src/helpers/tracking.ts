export enum EventTracking {
  USER_LOGIN = "USER_LOGIN",
  USER_LOGOUT = "USER_LOGOUT",
}

export const trackingEvent = (
  eventName: EventTracking,
  data?: Record<string, any>
) => {
  if (typeof window !== "undefined" && window.Tracker) {
    window.Tracker.track(eventName, data);
  }
};

export const updateProfile = (data: Record<string, any>) => {
  if (typeof window !== "undefined" && window.Tracker) {
    window.Tracker.updateProfile(data);
  }
};

export const setMetadata = (data: Record<string, any>) => {
  if (typeof window !== "undefined" && window.Tracker) {
    window.Tracker.setMetadata(data);
  }
};
