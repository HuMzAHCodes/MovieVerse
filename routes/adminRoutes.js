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

/**
 * @swagger
 * /admin:
 *   get:
 *     summary: Admin dashboard
 *     description: Renders the admin dashboard with platform statistics including total users, total watchlists, and recent registrations. Accessible by admin role only.
 *     tags: [Admin]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Renders the admin dashboard page with stats
 *       302:
 *         description: Redirects to /login if not authenticated
 *       403:
 *         description: Access denied — admin role required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/admin', protectRoute, isAdmin, getAdminDashboard);

/**
 * @swagger
 * /admin/users:
 *   get:
 *     summary: List all registered users
 *     description: Renders the user management page showing all registered users with their details. Accessible by admin role only.
 *     tags: [Admin]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Renders the user management page with all users listed
 *       302:
 *         description: Redirects to /login if not authenticated
 *       403:
 *         description: Access denied — admin role required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/admin/users', protectRoute, isAdmin, getUsersList);

// =====================
// Admin API Endpoints
// =====================

/**
 * @swagger
 * /api/admin/users/{id}:
 *   delete:
 *     summary: Delete a user account
 *     description: Permanently deletes a user account and their associated watchlist from the database. Admin cannot delete their own account. Accessible by admin role only.
 *     tags: [Admin]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId of the user to delete
 *         example: 64abc123def456789012345
 *     responses:
 *       200:
 *         description: User deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       400:
 *         description: Admin cannot delete their own account
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       302:
 *         description: Redirects to /login if not authenticated
 *       403:
 *         description: Access denied — admin role required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.delete('/api/admin/users/:id', protectRoute, isAdmin, deleteUser);

module.exports = router;