// controllers/adController.js
import { Ad, AdAsset } from '../Models/index.js';
import { Op } from 'sequelize';

// Create a new ad with assets (supports multipart/form-data)
const createAd = async (req, res) => {
  try {
    // Fields arrive as strings in form-data; coerce types as needed
    const club_id = req.body.club_id ? parseInt(req.body.club_id) : undefined;
    const ad_name = req.body.ad_name;
    const ad_type = req.body.ad_type; // APP_BANNER | WEBSITE_BANNER | CLUB_LISTING
    const branchname = req.body.branchname || null;
    const client_id = req.body.client_id ? parseInt(req.body.client_id) : undefined;
    const start_date = req.body.start_date; // YYYY-MM-DD
    const duration_days = req.body.duration_days ? parseInt(req.body.duration_days) : undefined;
    const price_per_day = req.body.price_per_day ? parseFloat(req.body.price_per_day) : undefined;
    const payment_method = req.body.payment_method; // CARD | CASH
    const payment_status = req.body.payment_status || 'PENDING';
    const status = req.body.status || 'DRAFT';
    const listing_position = req.body.listing_position !== undefined && req.body.listing_position !== ''
      ? parseInt(req.body.listing_position)
      : null;

    // Helper function to parse array fields
    const parseArrayField = (value) => {
      if (!value) return [];
      try {
        // Accept JSON like "[300, 600]"
        if (typeof value === 'string' && value.trim().startsWith('[')) {
          return JSON.parse(value);
        }
      } catch (_) {}
      // Fallback: comma-separated string "300,600"
      if (typeof value === 'string') {
        return value.split(',').map(v => v.trim()).filter(Boolean);
      }
      return Array.isArray(value) ? value : [];
    };

    // Basic validation
    if ((!club_id && !client_id) || !ad_name || !ad_type || !start_date || !duration_days || !price_per_day || !payment_method) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // Conflict checks:
    // CLUB_LISTING -> same listing_position; BANNERS -> same ad_type global exclusivity
    if (ad_type === 'CLUB_LISTING' && listing_position) {
      try {
        const startDateObj = new Date(start_date);
        const endDateObj = new Date(startDateObj);
        endDateObj.setDate(startDateObj.getDate() + duration_days);
        const proposedEnd = endDateObj.toISOString().split('T')[0];

        const conflict = await Ad.findOne({
          where: {
            status: { [Op.or]: ['APPROVED', 'ACTIVE'] },
            ad_type: 'CLUB_LISTING',
            listing_position: listing_position,
            start_date: { [Op.lte]: proposedEnd },
            end_date: { [Op.gte]: start_date }
          },
          attributes: ['id', 'start_date', 'end_date', 'listing_position']
        });

        if (conflict) {
          return res.status(409).json({
            success: false,
            message: 'Time slot already occupied for this listing position',
            conflict: {
              listing_position: conflict.listing_position,
              start_date: conflict.start_date,
              end_date: conflict.end_date
            }
          });
        }
      } catch (e) {
        // fall through if date parsing fails; creation will error later
      }
    }
    if (ad_type === 'APP_BANNER' || ad_type === 'WEBSITE_BANNER') {
      try {
        const startDateObj = new Date(start_date);
        const endDateObj = new Date(startDateObj);
        endDateObj.setDate(startDateObj.getDate() + duration_days);
        const proposedEnd = endDateObj.toISOString().split('T')[0];

        const conflict = await Ad.findOne({
          where: {
            status: { [Op.or]: ['APPROVED', 'ACTIVE'] },
            ad_type: ad_type,
            start_date: { [Op.lte]: proposedEnd },
            end_date: { [Op.gte]: start_date }
          },
          attributes: ['id', 'start_date', 'end_date']
        });

        if (conflict) {
          return res.status(409).json({
            success: false,
            message: `Time slot already occupied for ${ad_type} ads`,
            conflict: {
              start_date: conflict.start_date,
              end_date: conflict.end_date
            }
          });
        }
      } catch (e) {}
    }

    // Website banner image dimension validation
    if (ad_type === 'WEBSITE_BANNER') {
      const images = req.files?.images || [];
      const imagesWidths = parseArrayField(req.body.images_widths).map(v => parseInt(v));
      const imagesHeights = parseArrayField(req.body.images_heights).map(v => parseInt(v));

      if (images.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Website banner ads require at least one image'
        });
      }

      // Validate each image dimension
      for (let i = 0; i < images.length; i++) {
        const width = imagesWidths[i];
        const height = imagesHeights[i];

        if (!width || !height) {
          return res.status(400).json({
            success: false,
            message: `Image ${i + 1}: Width and height dimensions are required for website banner ads`
          });
        }

        if (width !== 1920 || height !== 1080) {
          return res.status(400).json({
            success: false,
            message: `Image ${i + 1}: Website banner images must be exactly 1920px by 1080px. Current dimensions: ${width}x${height}px`
          });
        }
      }
    }

    // Create the ad
    const ad = await Ad.create({
      club_id,
      ad_name,
      ad_type,
      branchname,
      client_id,
      start_date,
      duration_days,
      price_per_day,
      payment_method,
      payment_status,
      status,
      listing_position
    });

    // Build assets from uploaded files (images[], video)
    const normalizePath = (p) => (p || '').replace(/\\/g, '/');

    const images = req.files?.images || [];
    const videoFiles = req.files?.video || [];
    const imagesWidths = parseArrayField(req.body.images_widths).map(v => parseInt(v));
    const imagesHeights = parseArrayField(req.body.images_heights).map(v => parseInt(v));
    const videoWidth = req.body.video_width ? parseInt(req.body.video_width) : 0;
    const videoHeight = req.body.video_height ? parseInt(req.body.video_height) : 0;

    const assetRecords = [];

    // Images → multiple
    images.forEach((file, index) => {
      const width = Number.isFinite(imagesWidths[index]) ? imagesWidths[index] : 0;
      const height = Number.isFinite(imagesHeights[index]) ? imagesHeights[index] : 0;
      assetRecords.push({
        ad_id: ad.id,
        file_url: normalizePath(file.path),
        width,
        height
      });
    });

    // Video → single (optional)
    if (videoFiles[0]) {
      assetRecords.push({
          ad_id: ad.id,
        file_url: normalizePath(videoFiles[0].path),
        width: Number.isFinite(videoWidth) ? videoWidth : 0,
        height: Number.isFinite(videoHeight) ? videoHeight : 0
      });
    }

    if (assetRecords.length > 0) {
      await Promise.all(assetRecords.map(r => AdAsset.create(r)));
    }

    // Fetch the complete ad with assets
    const completeAd = await Ad.findByPk(ad.id, {
      include: [{
        model: AdAsset,
        as: 'assets',
        attributes: ['id', 'file_url', 'width', 'height', 'created_at']
      }]
    });

    res.status(201).json({
      success: true,
      message: 'Ad created successfully',
      data: completeAd
    });
  } catch (error) {
    console.error('Error creating ad:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating ad',
      error: error.message
    });
  }
};

// Get all ads with optional filtering (use query params)
const getAds = async (req, res) => {
  try {
    const {
      club_id,
      ad_type,
      branchname,
      status,
      page = 1,
      limit = 10,
      start_date_from,
      start_date_to
    } = req.query;

    const whereClause = {};
    const parsedPage = parseInt(page);
    const parsedLimit = parseInt(limit);
    const offset = (parsedPage - 1) * parsedLimit;

    // Build where clause based on body parameters
    if (club_id) whereClause.club_id = club_id;
    if (ad_type) whereClause.ad_type = ad_type;
    if (branchname) whereClause.branchname = branchname;
    if (status) whereClause.status = status;

    // Date range filtering
    if (start_date_from || start_date_to) {
      whereClause.start_date = {};
      if (start_date_from) whereClause.start_date[Op.gte] = start_date_from;
      if (start_date_to) whereClause.start_date[Op.lte] = start_date_to;
    }

    const { count, rows: ads } = await Ad.findAndCountAll({
      where: whereClause,
      include: [{
        model: AdAsset,
        as: 'assets',
        attributes: ['id', 'file_url', 'width', 'height', 'created_at']
      }],
      order: [['created_at', 'DESC']],
      limit: parsedLimit,
      offset
    });

    res.json({
      success: true,
      data: ads,
      pagination: {
        page: parsedPage,
        limit: parsedLimit,
        total: count,
        pages: Math.ceil(count / parsedLimit)
      }
    });
  } catch (error) {
    console.error('Error fetching ads:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching ads',
      error: error.message
    });
  }
};

// Get a single ad by ID
const getAdById = async (req, res) => {
  try {
    const { id } = req.params;

    const ad = await Ad.findByPk(id, {
      include: [{
        model: AdAsset,
        as: 'assets',
        attributes: ['id', 'file_url', 'width', 'height', 'created_at']
      }]
    });

    if (!ad) {
      return res.status(404).json({
        success: false,
        message: 'Ad not found'
      });
    }

    res.json({
      success: true,
      data: ad
    });
  } catch (error) {
    console.error('Error fetching ad:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching ad',
      error: error.message
    });
  }
};

// Get ads by club ID
const getAdsByClub = async (req, res) => {
  try {
    const { club_id } = req.params;
    const {
      page = 1,
      limit = 10,
      status,
      ad_type
    } = req.query;

    const offset = (page - 1) * limit;
    const whereClause = { club_id };

    if (status) whereClause.status = status;
    if (ad_type) whereClause.ad_type = ad_type;

    const { count, rows: ads } = await Ad.findAndCountAll({
      where: whereClause,
      include: [{
        model: AdAsset,
        as: 'assets',
        attributes: ['id', 'file_url', 'width', 'height', 'created_at']
      }],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: offset
    });

    res.json({
      success: true,
      data: ads,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching club ads:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching club ads',
      error: error.message
    });
  }
};



// Update ad fields
const updateAd = async (req, res) => {
  try {
    const { id } = req.params;
    const ad = await Ad.findByPk(id);
    if (!ad) {
      return res.status(404).json({ success: false, message: 'Ad not found' });
    }

    const updates = {};
    const coerceInt = (v) => (v === undefined || v === null || v === '' ? undefined : parseInt(v));
    const coerceFloat = (v) => (v === undefined || v === null || v === '' ? undefined : parseFloat(v));

    if (req.body.ad_name !== undefined) updates.ad_name = req.body.ad_name;
    if (req.body.ad_type !== undefined) updates.ad_type = req.body.ad_type;
    if (req.body.start_date !== undefined) updates.start_date = req.body.start_date;
    if (req.body.duration_days !== undefined) updates.duration_days = coerceInt(req.body.duration_days);
    if (req.body.price_per_day !== undefined) updates.price_per_day = coerceFloat(req.body.price_per_day);
    if (req.body.payment_method !== undefined) updates.payment_method = req.body.payment_method;
    if (req.body.payment_status !== undefined) updates.payment_status = req.body.payment_status;
    if (req.body.listing_position !== undefined) updates.listing_position = coerceInt(req.body.listing_position);
    if (req.body.branchname !== undefined) updates.branchname = req.body.branchname;
    if (req.body.client_id !== undefined) updates.client_id = coerceInt(req.body.client_id);

    await ad.update(updates);

    const updated = await Ad.findByPk(id, {
      include: [{
        model: AdAsset,
        as: 'assets',
        attributes: ['id', 'file_url', 'width', 'height', 'created_at']
      }]
    });

    return res.json({ success: true, message: 'Ad updated successfully', data: updated });
  } catch (error) {
    console.error('Error updating ad:', error);
    return res.status(500).json({ success: false, message: 'Error updating ad', error: error.message });
  }
};

// Transition: DRAFT -> PENDING_APPROVAL
const submitAdForApproval = async (req, res) => {
  try {
    const { id } = req.params;
    const ad = await Ad.findByPk(id);
    if (!ad) return res.status(404).json({ success: false, message: 'Ad not found' });
    if (ad.status !== 'DRAFT') {
      return res.status(400).json({ success: false, message: 'Only DRAFT ads can be submitted for approval' });
    }
    await ad.update({ status: 'PENDING_APPROVAL' });
    return res.json({ success: true, message: 'Ad submitted for approval', data: ad });
  } catch (error) {
    console.error('Error submitting ad for approval:', error);
    return res.status(500).json({ success: false, message: 'Error submitting for approval', error: error.message });
  }
};

// Transition: PENDING_APPROVAL -> APPROVED
const approveAd = async (req, res) => {
  try {
    const { id } = req.params;
    const ad = await Ad.findByPk(id);
    if (!ad) return res.status(404).json({ success: false, message: 'Ad not found' });
    if (ad.status !== 'PENDING_APPROVAL') {
      return res.status(400).json({ success: false, message: 'Only PENDING_APPROVAL ads can be approved' });
    }
    // For club listing, verify no conflict with existing APPROVED/ACTIVE ads on same position
    if (ad.ad_type === 'CLUB_LISTING' && ad.listing_position) {
      const proposedStart = ad.start_date;
      // end_date should be present (computed by hooks on create); if not, compute
      let proposedEnd = ad.end_date;
      if (!proposedEnd && ad.start_date && ad.duration_days) {
        const startDateObj = new Date(ad.start_date);
        const endDateObj = new Date(startDateObj);
        endDateObj.setDate(startDateObj.getDate() + ad.duration_days);
        proposedEnd = endDateObj.toISOString().split('T')[0];
      }

      const conflict = await Ad.findOne({
        where: {
          status: { [Op.or]: ['APPROVED', 'ACTIVE'] },
          ad_type: 'CLUB_LISTING',
          listing_position: ad.listing_position,
          start_date: { [Op.lte]: proposedEnd },
          end_date: { [Op.gte]: proposedStart }
        },
        attributes: ['id', 'start_date', 'end_date', 'listing_position']
      });
    // For banners, verify exclusivity among same type for APPROVED/ACTIVE
    if (ad.ad_type === 'APP_BANNER' || ad.ad_type === 'WEBSITE_BANNER') {
      const proposedStart = ad.start_date;
      let proposedEnd = ad.end_date;
      if (!proposedEnd && ad.start_date && ad.duration_days) {
        const startDateObj = new Date(ad.start_date);
        const endDateObj = new Date(startDateObj);
        endDateObj.setDate(startDateObj.getDate() + ad.duration_days);
        proposedEnd = endDateObj.toISOString().split('T')[0];
      }
      const conflict = await Ad.findOne({
        where: {
          status: { [Op.or]: ['APPROVED', 'ACTIVE'] },
          ad_type: ad.ad_type,
          start_date: { [Op.lte]: proposedEnd },
          end_date: { [Op.gte]: proposedStart }
        },
        attributes: ['id', 'start_date', 'end_date']
      });
      if (conflict) {
        return res.status(409).json({
          success: false,
          message: `Time slot already occupied for ${ad.ad_type} ads`,
          conflict: {
            start_date: conflict.start_date,
            end_date: conflict.end_date
          }
        });
      }
    }

      if (conflict) {
        return res.status(409).json({
          success: false,
          message: 'Time slot already occupied for this listing position',
          conflict: {
            listing_position: conflict.listing_position,
            start_date: conflict.start_date,
            end_date: conflict.end_date
          }
        });
      }
    }
    await ad.update({ status: 'APPROVED' });
    return res.json({ success: true, message: 'Ad approved', data: ad });
  } catch (error) {
    console.error('Error approving ad:', error);
    return res.status(500).json({ success: false, message: 'Error approving ad', error: error.message });
  }
};

// Transition: PENDING_APPROVAL -> REJECTED
const rejectAd = async (req, res) => {
  try {
    const { id } = req.params;
    const ad = await Ad.findByPk(id);
    if (!ad) return res.status(404).json({ success: false, message: 'Ad not found' });
    if (ad.status !== 'PENDING_APPROVAL') {
      return res.status(400).json({ success: false, message: 'Only PENDING_APPROVAL ads can be rejected' });
    }
    await ad.update({ status: 'REJECTED' });
    return res.json({ success: true, message: 'Ad rejected', data: ad });
  } catch (error) {
    console.error('Error rejecting ad:', error);
    return res.status(500).json({ success: false, message: 'Error rejecting ad', error: error.message });
  }
};

// Transition: APPROVED -> ACTIVE (optionally adjust start_date to today if in future)
const activateAd = async (req, res) => {
  try {
    const { id } = req.params;
    const ad = await Ad.findByPk(id);
    if (!ad) return res.status(404).json({ success: false, message: 'Ad not found' });
    if (ad.status !== 'APPROVED') {
      return res.status(400).json({ success: false, message: 'Only APPROVED ads can be activated' });
    }

    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    let updates = { status: 'ACTIVE' };
    // If start_date is in the future, set start_date to today
    if (ad.start_date && new Date(ad.start_date) > today) {
      updates.start_date = todayStr;
    }

    await ad.update(updates);
    return res.json({ success: true, message: 'Ad activated', data: ad });
  } catch (error) {
    console.error('Error activating ad:', error);
    return res.status(500).json({ success: false, message: 'Error activating ad', error: error.message });
  }
};

// Get active website banner ads for today's date
const getActiveWebsiteBanners = async (req, res) => {
  try {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0]; // YYYY-MM-DD format

    const activeBanners = await Ad.findAll({
      where: {
        ad_type: 'WEBSITE_BANNER',
        status: 'ACTIVE',
        start_date: { [Op.lte]: todayStr },
        end_date: { [Op.gte]: todayStr }
      },
      include: [{
        model: AdAsset,
        as: 'assets',
        attributes: ['id', 'file_url', 'width', 'height', 'created_at']
      }],
      order: [['created_at', 'DESC']]
    });

    res.json({
      success: true,
      message: 'Active website banner ads retrieved successfully',
      data: activeBanners,
      date: todayStr
    });
  } catch (error) {
    console.error('Error fetching active website banners:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching active website banners',
      error: error.message
    });
  }
};

export { createAd, getAds, getAdById, getAdsByClub, updateAd, submitAdForApproval, approveAd, rejectAd, activateAd, getActiveWebsiteBanners };