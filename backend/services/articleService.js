const articleRepository = require('../repositories/articleRepository');

class ArticleService {
  generateSlug(title) {
    return title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }

  async createArticle(authorAdminId, articleData) {
    const slug = this.generateSlug(articleData.title);
    
    const article = await articleRepository.createArticle({
      authorAdminId,
      title: articleData.title,
      slug,
      contentBody: articleData.content || null,
      externalUrl: articleData.external_url || null,
      featuredImageUrl: null
    });

    return {
      success: true,
      message: 'Article created successfully',
      data: article
    };
  }

  async getAllArticles(options = {}) {
    const { page = 1, limit = 20, status } = options;
    const offset = (page - 1) * limit;

    const [articles, total] = await Promise.all([
      articleRepository.getAllArticles(limit, offset, status),
      articleRepository.countArticles(status)
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      success: true,
      data: {
        articles,
        pagination: {
          total,
          page,
          limit,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      }
    };
  }

  async getArticleById(id) {
    const article = await articleRepository.getArticleById(id);
    if (!article) throw new Error('Article not found');

    return {
      success: true,
      data: article
    };
  }

  async getArticleBySlug(slug) {
    const article = await articleRepository.getArticleBySlug(slug);
    if (!article) throw new Error('Article not found');

    return {
      success: true,
      data: article
    };
  }

  async updateArticle(id, updates) {
    const article = await articleRepository.getArticleById(id);
    if (!article) throw new Error('Article not found');

    const cleanUpdates = {};
    
    if (updates.title) {
      cleanUpdates.title = updates.title;
      cleanUpdates.slug = this.generateSlug(updates.title);
    }
    
    if (updates.content !== undefined) {
      cleanUpdates.content_body = updates.content;
    }
    
    if (updates.external_url !== undefined) {
      cleanUpdates.external_url = updates.external_url;
    }
    
    if (updates.status) {
      cleanUpdates.status = updates.status;
    }

    const updated = await articleRepository.updateArticle(id, cleanUpdates);

    return {
      success: true,
      message: 'Article updated successfully',
      data: updated
    };
  }

  async publishArticle(id) {
    const article = await articleRepository.publishArticle(id);
    if (!article) throw new Error('Article not found');

    return {
      success: true,
      message: 'Article published successfully',
      data: article
    };
  }

  async deleteArticle(id) {
    const deleted = await articleRepository.deleteArticle(id);
    if (!deleted) throw new Error('Article not found');

    return {
      success: true,
      message: 'Article deleted successfully'
    };
  }
}

module.exports = new ArticleService();
