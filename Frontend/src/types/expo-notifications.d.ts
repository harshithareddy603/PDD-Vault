declare module 'expo-notifications' {
  export enum AndroidImportance {
    MAX = 5,
    HIGH = 4,
    DEFAULT = 3,
  }
  export enum AndroidNotificationPriority {
    HIGH = 'high',
    DEFAULT = 'default',
  }
  export function getPermissionsAsync(): Promise<{ status: string }>;
  export function requestPermissionsAsync(): Promise<{ status: string }>;
  export function setNotificationChannelAsync(
    channelId: string,
    channel: any
  ): Promise<any>;
  export function setNotificationHandler(handler: any): void;
  export function scheduleNotificationAsync(request: any): Promise<string>;
}
