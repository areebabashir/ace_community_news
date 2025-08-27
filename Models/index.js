// models/index.js or wherever you set up associations
import Ad from './AdModel.js';
import AdAsset from './AdAssetModel.js';

// Ad has many AdAssets
Ad.hasMany(AdAsset, {
  foreignKey: 'ad_id',
  as: 'assets',
  onDelete: 'CASCADE'
});

// AdAsset belongs to Ad
AdAsset.belongsTo(Ad, {
  foreignKey: 'ad_id',
  as: 'ad'
});

export { Ad, AdAsset };