// Web stub for @react-native/assets-registry
// Replaces the Flow-typed native version for web builds

const assets = [];

function registerAsset(asset) {
  return assets.push(asset);
}

function getAssetByID(assetId) {
  return assets[assetId - 1];
}

module.exports = { registerAsset, getAssetByID };
