import AdPricing from '../Models/AdPricingModel.js';

// GET /ads/pricing
export const getPricing = async (req, res) => {
  try {
    const rows = await AdPricing.findAll();
    const result = {
      app_banner: null,
      website_banner: null,
      club_listing: { rank1: null, rank2: null, rank3: null, rank4: null, rank5: null }
    };
    rows.forEach(r => {
      if (r.ad_type === 'APP_BANNER') result.app_banner = Number(r.price_per_day);
      else if (r.ad_type === 'WEBSITE_BANNER') result.website_banner = Number(r.price_per_day);
      else if (r.ad_type === 'CLUB_LISTING') {
        const key = `rank${r.rank}`;
        if (result.club_listing[key] !== undefined) result.club_listing[key] = Number(r.price_per_day);
      }
    });
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch pricing', error: err.message });
  }
};

// PUT /ads/pricing
export const upsertPricing = async (req, res) => {
  try {
    const { app_banner, website_banner, club_listing } = req.body;
    const ops = [];
    if (app_banner != null) {
      ops.push(AdPricing.upsert({ ad_type: 'APP_BANNER', rank: null, price_per_day: app_banner }));
    }
    if (website_banner != null) {
      ops.push(AdPricing.upsert({ ad_type: 'WEBSITE_BANNER', rank: null, price_per_day: website_banner }));
    }
    if (club_listing) {
      for (let i = 1; i <= 5; i++) {
        const key = `rank${i}`;
        if (club_listing[key] != null) {
          ops.push(AdPricing.upsert({ ad_type: 'CLUB_LISTING', rank: i, price_per_day: club_listing[key] }));
        }
      }
    }
    await Promise.all(ops);
    res.json({ success: true, message: 'Pricing updated' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update pricing', error: err.message });
  }
};





