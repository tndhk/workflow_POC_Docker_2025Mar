const { COUNTRY_HOLIDAYS } = require('../data/holidaysData');

// 全ての国の休日データを取得
exports.getAllHolidays = (req, res) => {
  res.json(COUNTRY_HOLIDAYS);
};

// 特定の国の休日データを取得
exports.getCountryHolidays = (req, res) => {
  const country = COUNTRY_HOLIDAYS[req.params.country];
  
  if (!country) {
    return res.status(404).json({ error: 'Country not found' });
  }
  
  res.json(country);
};