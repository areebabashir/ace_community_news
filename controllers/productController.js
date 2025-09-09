
// controllers/productController.js
import { Product, Category, Seller, ProductImage } from '../Models/index.js';
import { Op } from 'sequelize';

// Create Product
const createProduct = async (req, res) => {
  try {
    const {
      name,
      price,
      category_id,
      description,
      seller_id,
      inventory,
      condition,
      listing_visibility,
      payment_method,
      delivery_methods
    } = req.body;

    // Basic validation
    if (!name || !price || !category_id || !seller_id) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: name, price, category_id, seller_id'
      });
    }

    // Create product
    const product = await Product.create({
      name,
      price: parseFloat(price),
      category_id: parseInt(category_id),
      description,
      seller_id: parseInt(seller_id),
      inventory: inventory ? parseInt(inventory) : 0,
      condition: condition || 'new',
      listing_visibility: listing_visibility || 'draft',
      payment_method: payment_method || 'both',
      delivery_methods: delivery_methods || 'both'
    });

    // Handle image upload
    if (req.files?.images) {
      const imageRecords = req.files.images.map(file => ({
        product_id: product.id,
        image_url: file.path.replace(/\\/g, '/')
      }));
      await ProductImage.bulkCreate(imageRecords);
    }

    // Fetch complete product with images
    const completeProduct = await Product.findByPk(product.id, {
      include: [
        { model: Category, as: 'category' },
        { model: Seller, as: 'seller' },
        { model: ProductImage, as: 'images' }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: completeProduct
    });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating product',
      error: error.message
    });
  }
};

// Edit Product
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Remove fields that shouldn't be updated directly
    delete updates.id;
    delete updates.created_at;
    delete updates.updated_at;

    // Convert numeric fields
    if (updates.price) updates.price = parseFloat(updates.price);
    if (updates.inventory) updates.inventory = parseInt(updates.inventory);
    if (updates.category_id) updates.category_id = parseInt(updates.category_id);
    if (updates.seller_id) updates.seller_id = parseInt(updates.seller_id);

    const [affectedRows] = await Product.update(updates, {
      where: { id }
    });

    if (affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Handle new images if uploaded
    if (req.files?.images) {
      const imageRecords = req.files.images.map(file => ({
        product_id: id,
        image_url: file.path.replace(/\\/g, '/')
      }));
      await ProductImage.bulkCreate(imageRecords);
    }

    const updatedProduct = await Product.findByPk(id, {
      include: [
        { model: Category, as: 'category' },
        { model: Seller, as: 'seller' },
        { model: ProductImage, as: 'images' }
      ]
    });

    res.json({
      success: true,
      message: 'Product updated successfully',
      data: updatedProduct
    });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating product',
      error: error.message
    });
  }
};

const getAllProducts = async (req, res) => {
  try {
    const {
      min_price,
      max_price,
      condition,
      category_id,
      page = 1,
      limit = 20
    } = req.query;

    const whereClause = { };
    const offset = (parseInt(page) - 1) * parseInt(limit);

    // Price range filter
    if (min_price || max_price) {
      whereClause.price = {};
      if (min_price) whereClause.price[Op.gte] = parseFloat(min_price);
      if (max_price) whereClause.price[Op.lte] = parseFloat(max_price);
    }

    // Condition filter
    if (condition) whereClause.condition = condition;

    // Category filter
    if (category_id) whereClause.category_id = parseInt(category_id);

    const { count, rows: products } = await Product.findAndCountAll({
      where: whereClause,
      include: [
        { model: Category, as: 'category', attributes: ['id', 'name'] },
        { model: Seller, as: 'seller', attributes: ['id', 'name', 'review_rating'] },
        { model: ProductImage, as: 'images', limit: 1 } // Get first image only for listing
      ],
      attributes: ['id', 'name', 'price', 'description', 'condition', 'inventory', 'listing_visibility', 'image'],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: offset
    });

    res.json({
      success: true,
      data: products,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        pages: Math.ceil(count / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching products',
      error: error.message
    });
  }
};

// View All Published Products with Filters
const getPublishedProducts = async (req, res) => {
  try {
    const {
      min_price,
      max_price,
      condition,
      category_id,
      page = 1,
      limit = 20
    } = req.query;

    const whereClause = { listing_visibility: 'active' };
    const offset = (parseInt(page) - 1) * parseInt(limit);

    // Price range filter
    if (min_price || max_price) {
      whereClause.price = {};
      if (min_price) whereClause.price[Op.gte] = parseFloat(min_price);
      if (max_price) whereClause.price[Op.lte] = parseFloat(max_price);
    }

    // Condition filter
    if (condition) whereClause.condition = condition;

    // Category filter
    if (category_id) whereClause.category_id = parseInt(category_id);

    const { count, rows: products } = await Product.findAndCountAll({
      where: whereClause,
      include: [
        { model: Category, as: 'category', attributes: ['id', 'name'] },
        { model: Seller, as: 'seller', attributes: ['id', 'name', 'review_rating'] },
        { model: ProductImage, as: 'images', limit: 1 } // Get first image only for listing
      ],
      attributes: ['id', 'name', 'price', 'description', 'condition', 'inventory', 'listing_visibility', 'image'],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: offset
    });

    res.json({
      success: true,
      data: products,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        pages: Math.ceil(count / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching products',
      error: error.message
    });
  }
};

// View Products by Seller
const getProductsBySeller = async (req, res) => {
  try {
    const { seller_id } = req.params;
    const {
      min_price,
      max_price,
      condition,
      category_id,
      page = 1,
      limit = 20
    } = req.query;

    const whereClause = { seller_id: parseInt(seller_id) };
    const offset = (parseInt(page) - 1) * parseInt(limit);

    // Price range filter
    if (min_price || max_price) {
      whereClause.price = {};
      if (min_price) whereClause.price[Op.gte] = parseFloat(min_price);
      if (max_price) whereClause.price[Op.lte] = parseFloat(max_price);
    }

    // Condition filter
    if (condition) whereClause.condition = condition;

    // Category filter
    if (category_id) whereClause.category_id = parseInt(category_id);

    const { count, rows: products } = await Product.findAndCountAll({
      where: whereClause,
      include: [
        { model: Category, as: 'category', attributes: ['id', 'name'] },
        { model: ProductImage, as: 'images', limit: 1 }
      ],
      attributes: ['id', 'name', 'price', 'description', 'condition', 'inventory', 'listing_visibility', 'image'],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: offset
    });

    res.json({
      success: true,
      data: products,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        pages: Math.ceil(count / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching seller products:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching seller products',
      error: error.message
    });
  }
};

// View Single Product
const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findByPk(id, {
      include: [
        { model: Category, as: 'category' },
        { model: Seller, as: 'seller' },
        { model: ProductImage, as: 'images' }
      ]
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching product',
      error: error.message
    });
  }
};

// Delete Product
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await Product.destroy({
      where: { id }
    });

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting product',
      error: error.message
    });
  }
};
const getProductsByCategory = async (req, res) => {
  try {
    const { category_id } = req.params;
    const {
      min_price,
      max_price,
      condition,
      page = 1,
      limit = 20
    } = req.query;

    const whereClause = { 
      category_id: parseInt(category_id),
      listing_visibility: 'active'
    };
    const offset = (parseInt(page) - 1) * parseInt(limit);

    // Price range filter
    if (min_price || max_price) {
      whereClause.price = {};
      if (min_price) whereClause.price[Op.gte] = parseFloat(min_price);
      if (max_price) whereClause.price[Op.lte] = parseFloat(max_price);
    }

    // Condition filter
    if (condition) whereClause.condition = condition;

    const { count, rows: products } = await Product.findAndCountAll({
      where: whereClause,
      include: [
        { model: Category, as: 'category', attributes: ['id', 'name'] },
        { model: Seller, as: 'seller', attributes: ['id', 'name', 'review_rating'] },
        { model: ProductImage, as: 'images', limit: 1 }
      ],
      attributes: ['id', 'name', 'price', 'description', 'condition', 'inventory', 'listing_visibility', 'image'],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: offset
    });

    res.json({
      success: true,
      data: products,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        pages: Math.ceil(count / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching products by category:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching products by category',
      error: error.message
    });
  }
};


export {
  createProduct,
  updateProduct,
  getAllProducts,
  getPublishedProducts,
  getProductsBySeller,
  getProductById,
  deleteProduct,
  getProductsByCategory
};