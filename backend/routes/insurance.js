const express = require('express');
const router = express.Router();
const InsuranceOrder = require('../models/InsuranceOrder');

// POST /api/insurance
router.post('/', async (req, res) => {
  try {
    const order = new InsuranceOrder(req.body);
    await order.save();
    res.status(201).json({ success: true, message: 'Insurance order submitted successfully!' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// GET /api/insurance
router.get('/', async (req, res) => {
  try {
    const orders = await InsuranceOrder.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE /api/insurance/:id
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await InsuranceOrder.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Order not found' });
    res.json({ success: true, message: 'Order deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
