const pool = require('../db');
const { convertKeysToCamel, normalizeToSnake } = require('../utils/fieldConverter');

class ArticleRepository {
  // Helper method to map database fields to API response
  mapArticleFields(article) {
    if (!article) return null;
    // Convert all fields to camelCase
    const camelArticle = convertKeysToCamel(article);
    // Map contentBody to content for convenience
    if (camelArticle.contentBody !== undefined) {
      camelArticle.content = camelArticle.contentBody;
    }
    return camelArticle;
  }

  async createArticle(articleData) {
    // Normalize input to snake_case (accepts both camelCase and snake_case)
    const normalized = normalizeToSnake(articleData);
    const { author_admin_id, title, slug, content_body, external_url, featured_image_url } = normalized;
    
    const query = `
      INSERT INTO articles (author_admin_id, title, slug, content_body, external_url, featured_image_url)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    
    const result = await pool.query(query, [author_admin_id, title, slug, content_body, external_url, featured_image_url]);
    return this.mapArticleFields(result.rows[0]);
  }

  async getAllArticles(limit, offset, status = null) {
    let query = `
      SELECT 
        a.*,
        u.email as author_email
      FROM articles a
      JOIN users u ON a.author_admin_id = u.id
    `;
    
    const params = [];
    
    if (status) {
      query += ` WHERE a.status = $1`;
      params.push(status);
      query += ` ORDER BY a.published_at DESC, a.created_at DESC LIMIT $2 OFFSET $3`;
      params.push(limit, offset);
    } else {
      query += ` ORDER BY a.published_at DESC, a.created_at DESC LIMIT $1 OFFSET $2`;
      params.push(limit, offset);
    }
    
    const result = await pool.query(query, params);
    return result.rows.map(article => this.mapArticleFields(article));
  }

  async getArticleById(id) {
    const query = `
      SELECT 
        a.*,
        u.email as author_email
      FROM articles a
      JOIN users u ON a.author_admin_id = u.id
      WHERE a.id = $1
    `;
    
    const result = await pool.query(query, [id]);
    return this.mapArticleFields(result.rows[0]);
  }

  async getArticleBySlug(slug) {
    const query = `
      SELECT 
        a.*,
        u.email as author_email
      FROM articles a
      JOIN users u ON a.author_admin_id = u.id
      WHERE a.slug = $1 AND a.status = 'published'
    `;
    
    const result = await pool.query(query, [slug]);
    return this.mapArticleFields(result.rows[0]);
  }

  async updateArticle(id, updates) {
    // Normalize input to snake_case (accepts both camelCase and snake_case)
    const normalized = normalizeToSnake(updates);
    
    const fields = [];
    const values = [];
    let paramCount = 1;

    Object.keys(normalized).forEach(key => {
      fields.push(`${key} = $${paramCount++}`);
      values.push(normalized[key]);
    });

    fields.push('updated_at = NOW()');
    values.push(id);

    const query = `
      UPDATE articles
      SET ${fields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await pool.query(query, values);
    return this.mapArticleFields(result.rows[0]);
  }

  async publishArticle(id) {
    const query = `
      UPDATE articles
      SET status = 'published', published_at = NOW(), updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `;
    
    const result = await pool.query(query, [id]);
    return this.mapArticleFields(result.rows[0]);
  }

  async deleteArticle(id) {
    const query = 'DELETE FROM articles WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rowCount > 0;
  }

  async countArticles(status = null) {
    let query = 'SELECT COUNT(*) FROM articles';
    const params = [];
    
    if (status) {
      query += ' WHERE status = $1';
      params.push(status);
    }
    
    const result = await pool.query(query, params);
    return parseInt(result.rows[0].count);
  }
}

module.exports = new ArticleRepository();
