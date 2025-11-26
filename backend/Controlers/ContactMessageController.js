const ContactMessage = require('../Model/ContactMessageModel');

// Create a new contact message
exports.createMessage = async (req, res) => {
  try {
    const { user_name, user_email, user_phone, ['c-category']: category, message } = req.body;

    // Normalize body keys from frontend names to model fields
    const doc = await ContactMessage.create({
      name: user_name,
      email: user_email,
      phone: user_phone || undefined,
      category,
      message,
    });
    return res.status(201).json({ success: true, data: doc });
  } catch (err) {
    if (err.name === 'ValidationError') {
      const details = Object.fromEntries(
        Object.entries(err.errors).map(([k, v]) => [k, v.message])
      );
      return res.status(400).json({ success: false, error: 'Validation failed', details });
    }
    console.error('Error creating contact message:', err);
    return res.status(500).json({ success: false, error: 'Server error' });
  }
};

// Get messages (admin only ideally)
exports.getMessages = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, category } = req.query;
    const query = {};
    if (status) query.status = status;
    if (category) query.category = category;
    const skip = (Number(page) - 1) * Number(limit);

    const [items, total] = await Promise.all([
      ContactMessage.find(query).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      ContactMessage.countDocuments(query),
    ]);

    return res.json({ success: true, data: items, page: Number(page), total });
  } catch (err) {
    console.error('Error fetching contact messages:', err);
    return res.status(500).json({ success: false, error: 'Server error' });
  }
};

// Update status of a message
exports.updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const allowed = ['new', 'read', 'archived'];
    if (!allowed.includes(status)) {
      return res.status(400).json({ success: false, error: 'Invalid status' });
    }
    const updated = await ContactMessage.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );
    if (!updated) return res.status(404).json({ success: false, error: 'Not found' });
    return res.json({ success: true, data: updated });
  } catch (err) {
    console.error('Error updating contact message:', err);
    return res.status(500).json({ success: false, error: 'Server error' });
  }
};
