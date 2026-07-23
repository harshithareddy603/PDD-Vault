/**
 * Web stub for react-native-vector-icons.
 * On web, react-native-paper falls back to Material Design icons via CSS.
 * This stub prevents the CJS require() crash in the browser bundle.
 */
import React from 'react';
import { Text } from 'react-native';

const createIconSet = () => {
  const Icon = ({ name, size = 24, color = '#000', style, ...rest }) =>
    React.createElement(Text, { style: [{ fontSize: size, color }, style], ...rest }, '');
  Icon.Button = Icon;
  Icon.TabBarItem = Icon;
  Icon.TabBarItemIOS = Icon;
  Icon.ToolbarAndroid = Icon;
  Icon.getImageSource = () => Promise.resolve(null);
  Icon.getRawGlyphMap = () => ({});
  Icon.getFontFamily = () => '';
  Icon.loadFont = () => Promise.resolve();
  Icon.hasIcon = () => false;
  return Icon;
};

export const AntDesign = createIconSet();
export const Entypo = createIconSet();
export const EvilIcons = createIconSet();
export const Feather = createIconSet();
export const FontAwesome = createIconSet();
export const FontAwesome5 = createIconSet();
export const FontAwesome6 = createIconSet();
export const Fontisto = createIconSet();
export const Foundation = createIconSet();
export const Ionicons = createIconSet();
export const MaterialCommunityIcons = createIconSet();
export const MaterialIcons = createIconSet();
export const Octicons = createIconSet();
export const SimpleLineIcons = createIconSet();
export const Zocial = createIconSet();

export default createIconSet();
