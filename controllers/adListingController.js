import { Op } from 'sequelize';
import Ad from '../Models/AdModel.js';

// GET /ads/listing-availability?start_date=YYYY-MM-DD&duration_days=10
// Returns booked status for club listing ranks 1-5 within the proposed window
export const getListingAvailability = async (req, res) => {
  try {
    const { start_date, duration_days } = req.query;
    if (!start_date || !duration_days) {
      return res.status(400).json({ success: false, message: 'start_date and duration_days are required' });
    }
    const sd = new Date(start_date);
    const ed = new Date(sd);
    ed.setDate(sd.getDate() + parseInt(duration_days));
    const end_date = ed.toISOString().split('T')[0];

    // Find APPROVED/ACTIVE conflicts for each listing_position 1..5
    const conflicts = await Ad.findAll({
      where: {
        status: { [Op.or]: ['APPROVED', 'ACTIVE'] },
        ad_type: 'CLUB_LISTING',
        listing_position: { [Op.in]: [1,2,3,4,5] },
        start_date: { [Op.lte]: end_date },
        end_date: { [Op.gte]: start_date }
      },
      attributes: ['listing_position', 'start_date', 'end_date']
    });

    const result = { rank1: null, rank2: null, rank3: null, rank4: null, rank5: null };
    conflicts.forEach(c => {
      const key = `rank${c.listing_position}`;
      // Mark as booked; include the blocking window
      result[key] = { start_date: c.start_date, end_date: c.end_date };
    });
    return res.json({ success: true, data: result });
  } catch (err) {
    console.error('getListingAvailability error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch listing availability', error: err.message });
  }
};










