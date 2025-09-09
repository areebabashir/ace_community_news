// controllers/sellerController.js
import { Seller, Product } from '../Models/index.js';

// Create Seller
const createSeller = async (req, res) => {
  try {
    const { name, verification_status = 'pending' } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Seller name is required'
      });
    }

    const seller = await Seller.create({
      name,
      verification_status,
      total_reviews: 0,
      review_rating: 0.00
    });

    res.status(201).json({
      success: true,
      message: 'Seller created successfully',
      data: seller
    });
  } catch (error) {
    console.error('Error creating seller:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating seller',
      error: error.message
    });
  }
};

// Get Seller by ID
const getSellerById = async (req, res) => {
  try {
    const { id } = req.params;

    const seller = await Seller.findByPk(id, {
      include: [{
        model: Product,
        as: 'products',
        attributes: ['id', 'name', 'price', 'listing_visibility']
      }]
    });

    if (!seller) {
      return res.status(404).json({
        success: false,
        message: 'Seller not found'
      });
    }

    res.json({
      success: true,
      data: seller
    });
  } catch (error) {
    console.error('Error fetching seller:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching seller',
      error: error.message
    });
  }
};

// Get All Sellers
const getAllSellers = async (req, res) => {
  try {
    const { page = 1, limit = 20, verification_status } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const whereClause = {};
    if (verification_status) {
      whereClause.verification_status = verification_status;
    }

    const { count, rows: sellers } = await Seller.findAndCountAll({
      where: whereClause,
      attributes: ['id', 'name', 'total_reviews', 'review_rating', 'verification_status', 'created_at'],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: offset
    });

    res.json({
      success: true,
      data: sellers,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        pages: Math.ceil(count / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching sellers:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching sellers',
      error: error.message
    });
  }
};

export {
  createSeller,
  getSellerById,
  getAllSellers
};