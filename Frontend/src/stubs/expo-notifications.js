export const AndroidImportance = { MAX: 5, HIGH: 4, DEFAULT: 3 };
export const AndroidNotificationPriority = { HIGH: 'high', DEFAULT: 'default' };

export async function getPermissionsAsync() {
  return { status: 'granted' };
}

export async function requestPermissionsAsync() {
  return { status: 'granted' };
}

export async function setNotificationChannelAsync() {
  return {};
}

export function setNotificationHandler() {}

export async function scheduleNotificationAsync() {
  return '';
}

export default {
  AndroidImportance,
  AndroidNotificationPriority,
  getPermissionsAsync,
  requestPermissionsAsync,
  setNotificationChannelAsync,
  setNotificationHandler,
  scheduleNotificationAsync,
};
