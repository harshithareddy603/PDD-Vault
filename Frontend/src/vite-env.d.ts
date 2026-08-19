/// <reference types="vite/client" />

declare module '@expo/vector-icons' {
  import { ComponentType } from 'react';
  export const MaterialCommunityIcons: ComponentType<any>;
  export const Feather: ComponentType<any>;
  export const AntDesign: ComponentType<any>;
  export const Ionicons: ComponentType<any>;
  export const FontAwesome: ComponentType<any>;
  export const MaterialIcons: ComponentType<any>;
  export const Entypo: ComponentType<any>;
  export const EvilIcons: ComponentType<any>;
  export const Octicons: ComponentType<any>;
  export const SimpleLineIcons: ComponentType<any>;
  export const Zocial: ComponentType<any>;
  export const Foundation: ComponentType<any>;
  const DefaultIcon: ComponentType<any>;
  export default DefaultIcon;
}

declare module '@expo/vector-icons/*' {
  import { ComponentType } from 'react';
  const IconComponent: ComponentType<any>;
  export default IconComponent;
}

declare module '@react-navigation/native' {
  export function useNavigation<T = any>(): T;
  export function useRoute<T = any>(): T;
  export function useIsFocused(): boolean;
  export const NavigationContainer: any;
}

declare module 'react-native' {
  export const View: any;
  export const Text: any;
  export const Image: any;
  export const TextInput: any;
  export const TouchableOpacity: any;
  export const ScrollView: any;
  export const StyleSheet: any;
  export const Platform: any;
  export const Alert: any;
  export const ActivityIndicator: any;
  export const KeyboardAvoidingView: any;
  export const Modal: any;
  export function useWindowDimensions(): { width: number; height: number; scale: number; fontScale: number };
  const exports: any;
  export default exports;
}


