const express = require('express');
const router  = express.Router();
const User    = require('../models/User');
const Ride    = require('../models/Ride');
const Rating  = require('../models/Rating');
const { protect, driverOnly } = require('../middleware/auth');

// ── GET /api/drivers/online ────────────────────────────────────
router.get('/online', protect, async (req, res) => {
  try {
    const drivers = await User.find({ role: 'driver', isOnline: true })
      .select('-password')
      .sort({ rating: -1 });
    res.json(drivers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── PATCH /api/drivers/status — go online/offline ─────────────
router.patch('/status', protect, driverOnly, async (req, res) => {
  const { isOnline } = req.body;
  try {
    req.user.isOnline = isOnline;
    await req.user.save();

    req.io.emit('driver:status', {
      driverId: req.user._id,
      isOnline,
      name: req.user.name,
      vehicle: req.user.vehicle,
      location: req.user.location,
      rating: req.user.rating,
    });
    res.json({ isOnline });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── PATCH /api/drivers/location — update GPS ──────────────────
router.patch('/location', protect, driverOnly, async (req, res) => {
  const { lat, lng } = req.body;
  if (!lat || !lng)
    return res.status(400).json({ message: 'lat and lng required' });
  try {
    await User.findByIdAndUpdate(req.user._id, { location: { lat, lng } });
    req.io.emit('driver:location', {
      driverId: req.user._id, lat, lng, name: req.user.name,
    });
    res.json({ location: { lat, lng } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── GET /api/drivers/:id/dashboard ────────────────────────────
router.get('/:id/dashboard', protect, driverOnly, async (req, res) => {
  try {
    const driverId = req.params.id;
    const today = new Date(); today.setHours(0,0,0,0);

    const [total, active, completed, cancelled, todayRides, ratings, recent, earnings] =
      await Promise.all([
        Ride.countDocuments({ driver: driverId }),
        Ride.countDocuments({ driver: driverId, status: { $in: ['accepted','inprogress'] } }),
        Ride.countDocuments({ driver: driverId, status: 'completed' }),
        Ride.countDocuments({ driver: driverId, status: 'cancelled' }),
        Ride.countDocuments({ driver: driverId, status: 'completed', completedAt: { $gte: today } }),
        Rating.find({ driver: driverId }).sort({ createdAt: -1 }).limit(10),
        Ride.find({ driver: driverId })
          .populate('passenger', 'name')
          .sort({ createdAt: -1 }).limit(10),
        Ride.aggregate([
          { $match: { driver: require('mongoose').Types.ObjectId(driverId), status: 'completed' } },
          { $group: { _id: null, total: { $sum: '$fare' } } },
        ]),
      ]);

    const avgRating = ratings.length
      ? (ratings.reduce((s,r) => s + r.stars, 0) / ratings.length).toFixed(1)
      : '5.0';

    res.json({
      total, active, completed, cancelled, todayRides,
      avgRating,
      totalEarnings: earnings[0]?.total || 0,
      recentRides: recent,
      recentRatings: ratings,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;