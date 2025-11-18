const express = require('express');
const router = express.Router();
const articleController = require('../controllers/articleController');
const { authenticateToken, authorize } = require('../middleware/auth');

// Public routes
router.get('/', articleController.getAllArticles);
router.get('/slug/:slug', articleController.getArticleBySlug);
router.get('/:id', articleController.getArticleById);

// Admin only routes
router.use(authenticateToken);
router.use(authorize('admin'));

router.post('/', articleController.validateArticle(), articleController.createArticle);
router.put('/:id', articleController.validateArticle(), articleController.updateArticle);
router.patch('/:id/publish', articleController.publishArticle);
router.delete('/:id', articleController.deleteArticle);

module.exports = router;
