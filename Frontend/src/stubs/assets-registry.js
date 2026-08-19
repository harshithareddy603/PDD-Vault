// Web stub for @react-native/assets-registry
// Replaces the Flow-typed native version for web builds

const assets = [];

export function registerAsset(asset) {
  return assets.push(asset);
}

export function getAssetByID(assetId) {
  return assets[assetId - 1];
}

export default { registerAsset, getAssetByID };
