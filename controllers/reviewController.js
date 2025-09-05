const Review = require('../models/Review');

// ===============================
// Create a new review (guest allowed)
// POST /api/reviews
// Public
// ===============================
exports.createReview = async (req, res) => {
  try {
    const { name, content, location, rating, orderId } = req.body;

    if (!content || content.trim() === '') {
      return res.status(400).json({ error: 'Review content is required.' });
    }

    const review = new Review({
      userId: null, // guest review
      name: name?.trim() || 'Anonymous',
      location: location?.trim() || '',
      content: content.trim(),
      rating: Math.min(Math.max(parseInt(rating) || 5, 1), 5), // ensure rating between 1-5
      orderId: orderId || null, // optional link to order
    });

    await review.save();
    res.status(201).json({ success: true, review });
  } catch (err) {
    console.error('❌ Error creating review:', err.message);
    res.status(500).json({ error: 'Server error. Please try again later.' });
  }
};

// ===============================
// Get reviews with pagination
// GET /api/reviews?page=1&limit=10
// Public
// ===============================
exports.getReviews = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.isApproved) filter.isApproved = req.query.isApproved === 'true';
    if (req.query.rating) filter.rating = parseInt(req.query.rating);

    const [reviews, total] = await Promise.all([
      Review.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Review.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      reviews,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    });
  } catch (err) {
    console.error('❌ Error fetching reviews:', err.message);
    res.status(500).json({ error: 'Failed to load reviews.' });
  }
};

// ===============================
// Get single review (admin only)
// GET /api/reviews/:id
// Private/Admin
// ===============================
exports.getReviewById = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id).populate('userId', 'name email');
    if (!review) return res.status(404).json({ error: 'Review not found' });

    if (!req.admin) return res.status(403).json({ error: 'Unauthorized' });

    res.status(200).json({ success: true, review });
  } catch (err) {
    console.error('❌ Error fetching review:', err.message);
    res.status(500).json({ error: 'Failed to fetch review.' });
  }
};

// ===============================
// Update a review (admin only)
// PUT /api/reviews/:id
// Private/Admin
// ===============================
exports.updateReview = async (req, res) => {
  try {
    const { content, location, rating, isApproved, isFeatured } = req.body;
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ error: 'Review not found' });

    if (!req.admin) return res.status(403).json({ error: 'Unauthorized' });

    review.content = content?.trim() || review.content;
    review.location = location ?? review.location;
    review.rating = rating ? Math.min(Math.max(parseInt(rating), 1), 5) : review.rating;
    review.isApproved = isApproved ?? review.isApproved;
    review.isFeatured = isFeatured ?? review.isFeatured;
    review.updatedAt = Date.now();

    await review.save();
    res.status(200).json({ success: true, review });
  } catch (err) {
    console.error('❌ Error updating review:', err.message);
    res.status(500).json({ error: 'Failed to update review.' });
  }
};

// ===============================
// Delete a review (admin only)
// DELETE /api/reviews/:id
// Private/Admin
// ===============================
exports.deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ error: 'Review not found' });

    if (!req.admin) return res.status(403).json({ error: 'Unauthorized' });

    await review.deleteOne();
    res.status(200).json({ success: true, message: 'Review deleted' });
  } catch (err) {
    console.error('❌ Error deleting review:', err.message);
    res.status(500).json({ error: 'Failed to delete review.' });
  }
};
