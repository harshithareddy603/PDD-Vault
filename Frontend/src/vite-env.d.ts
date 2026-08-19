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

