const { body, validationResult } = require('express-validator');
const articleService = require('../services/articleService');

class ArticleController {
  validateArticle() {
    return [
      body('title').trim().isLength({ min: 5 }).withMessage('Title must be at least 5 characters'),
      body('contentBody').optional().trim()
    ];
  }

  async createArticle(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const result = await articleService.createArticle(req.user.id, req.body);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  async getAllArticles(req, res, next) {
    try {
      const { page, limit, status } = req.query;
      const result = await articleService.getAllArticles({
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 20,
        status
      });
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async getArticleById(req, res, next) {
    try {
      const result = await articleService.getArticleById(req.params.id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async getArticleBySlug(req, res, next) {
    try {
      const result = await articleService.getArticleBySlug(req.params.slug);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async updateArticle(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const result = await articleService.updateArticle(req.params.id, req.body);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async publishArticle(req, res, next) {
    try {
      const result = await articleService.publishArticle(req.params.id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async deleteArticle(req, res, next) {
    try {
      const result = await articleService.deleteArticle(req.params.id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ArticleController();
