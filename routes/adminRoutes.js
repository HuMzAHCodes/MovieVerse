const express          = require('express');
const {
  getAdminDashboard,
  getUsersList,
  deleteUser,
}                      = require('../controllers/adminController');
const { protectRoute } = require('../middleware/authMiddleware');
const { isAdmin }      = require('../middleware/roleMiddleware');

const router = express.Router();

// =====================
// Admin Views
// =====================
router.get('/admin', protectRoute, isAdmin, getAdminDashboard);
router.get('/admin/users', protectRoute, isAdmin, getUsersList);

// =====================
// Admin API Endpoints
// =====================
router.delete('/api/admin/users/:id', protectRoute, isAdmin, deleteUser);

module.exports = router;
