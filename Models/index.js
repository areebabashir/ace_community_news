// models/index.js or wherever you set up associations
import Ad from './AdModel.js';
import AdAsset from './AdAssetModel.js';
import Category from './Category.js';
import Seller from './Seller.js';
import Product from './Product.js';
import Review from './Review.js';
import ProductImage from './ProductImage.js';
import Order from './Order.js';
import OrderItem from './OrderItem.js';

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
// Category - Product (One to Many)
Category.hasMany(Product, { foreignKey: 'category_id', as: 'products' });
Product.belongsTo(Category, { foreignKey: 'category_id', as: 'category' });

// Seller - Product (One to Many)
Seller.hasMany(Product, { foreignKey: 'seller_id', as: 'products' });
Product.belongsTo(Seller, { foreignKey: 'seller_id', as: 'seller' });

// Product - Review (One to Many)
Product.hasMany(Review, { foreignKey: 'product_id', as: 'reviews' });
Review.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });

// Product - ProductImage (One to Many)
Product.hasMany(ProductImage, { foreignKey: 'product_id', as: 'images' });
ProductImage.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });

Order.hasMany(OrderItem, { foreignKey: 'order_id', as: 'items' });
OrderItem.belongsTo(Order, { foreignKey: 'order_id', as: 'order' });

// OrderItem - Product (Many to One)
OrderItem.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });
Product.hasMany(OrderItem, { foreignKey: 'product_id', as: 'order_items' });
export { Ad, AdAsset, Category, Seller, Product, Review, ProductImage, Order, OrderItem };