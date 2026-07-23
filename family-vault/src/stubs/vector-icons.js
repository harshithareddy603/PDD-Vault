/**
 * Web stub for react-native-vector-icons / @expo/vector-icons.
 *
 * On web: renders icons via the MDI font (materialdesignicons.min.css loaded in index.html).
 * MaterialCommunityIcons names map 1-to-1 with MDI CSS class names (e.g. "home-outline" → "mdi-home-outline").
 * Feather names are mapped to their MDI equivalents below.
 * On native: this stub is never used — @expo/vector-icons is used directly.
 */
import React from 'react';
import { Text, Platform } from 'react-native';

// Feather → MDI name mapping
const FEATHER_TO_MDI: Record<string, string> = {
  'search': 'magnify',
  'bell': 'bell-outline',
  'bell-off': 'bell-off-outline',
  'log-out': 'logout',
  'alert-circle': 'alert-circle-outline',
  'image': 'image-outline',
  'arrow-left': 'arrow-left',
  'arrow-right': 'arrow-right',
  'arrow-up': 'arrow-up',
  'arrow-down': 'arrow-down',
  'zoom-in': 'magnify-plus-outline',
  'zoom-out': 'magnify-minus-outline',
  'eye': 'eye-outline',
  'eye-off': 'eye-off-outline',
  'chevron-right': 'chevron-right',
  'chevron-left': 'chevron-left',
  'chevron-up': 'chevron-up',
  'chevron-down': 'chevron-down',
  'file-text': 'file-document-outline',
  'upload': 'upload-outline',
  'trash-2': 'delete-outline',
  'edit': 'pencil-outline',
  'x': 'close',
  'check': 'check',
  'plus': 'plus',
  'minus': 'minus',
  'settings': 'cog-outline',
  'user': 'account-outline',
  'users': 'account-group-outline',
  'home': 'home-outline',
  'folder': 'folder-outline',
  'download': 'download-outline',
  'share': 'share-outline',
  'copy': 'content-copy',
  'lock': 'lock-outline',
  'unlock': 'lock-open-outline',
  'info': 'information-outline',
  'star': 'star-outline',
  'heart': 'heart-outline',
  'filter': 'filter-outline',
  'refresh-cw': 'refresh',
  'calendar': 'calendar-outline',
  'clock': 'clock-outline',
};

function makeIconComponent(nameMapper?: (name: string) => string) {
  const Icon = ({
    name,
    size = 24,
    color = '#000',
    style,
    ...rest
  }: {
    name: string;
    size?: number;
    color?: string;
    style?: any;
    [key: string]: any;
  }) => {
    if (Platform.OS !== 'web') {
      // On native this stub isn't used, but just in case:
      return React.createElement(Text, { style: [{ fontSize: size, color }, style] }, '');
    }

    const mdiName = nameMapper ? nameMapper(name) : name;

    return React.createElement('span', {
      className: `mdi mdi-${mdiName}`,
      style: {
        fontSize: size,
        color,
        lineHeight: `${size}px`,
        width: size,
        height: size,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        ...(typeof style === 'object' && !Array.isArray(style) ? style : {}),
      },
      ...rest,
    });
  };

  Icon.Button = Icon;
  Icon.TabBarItem = Icon;
  Icon.getImageSource = () => Promise.resolve(null);
  Icon.getRawGlyphMap = () => ({});
  Icon.getFontFamily = () => '';
  Icon.loadFont = () => Promise.resolve();
  Icon.hasIcon = () => false;
  return Icon;
}

// MaterialCommunityIcons: names match MDI directly
export const MaterialCommunityIcons = makeIconComponent();
// Feather: map to MDI equivalents
export const Feather = makeIconComponent((name) => FEATHER_TO_MDI[name] ?? name);

// Other icon sets (less used — mapped to MDI best-effort)
export const AntDesign = makeIconComponent();
export const Entypo = makeIconComponent();
export const EvilIcons = makeIconComponent();
export const FontAwesome = makeIconComponent();
export const FontAwesome5 = makeIconComponent();
export const FontAwesome6 = makeIconComponent();
export const Fontisto = makeIconComponent();
export const Foundation = makeIconComponent();
export const Ionicons = makeIconComponent();
export const MaterialIcons = makeIconComponent();
export const Octicons = makeIconComponent();
export const SimpleLineIcons = makeIconComponent();
export const Zocial = makeIconComponent();

export default makeIconComponent();
