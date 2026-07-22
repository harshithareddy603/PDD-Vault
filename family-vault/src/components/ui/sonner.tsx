import { Alert } from "react-native";

const toast = (message: string, options?: any) => {
  Alert.alert(options?.description || "Notification", message);
};

const Toaster = () => null;

export { Toaster, toast };
