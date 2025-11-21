/**
 * Utility functions to convert between camelCase and snake_case
 */

/**
 * Convert snake_case to camelCase
 * @param {string} str - Snake case string
 * @returns {string} Camel case string
 */
function snakeToCamel(str) {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

/**
 * Convert camelCase to snake_case
 * @param {string} str - Camel case string
 * @returns {string} Snake case string
 */
function camelToSnake(str) {
  return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
}

/**
 * Convert object keys from snake_case to camelCase
 * @param {Object} obj - Object with snake_case keys
 * @returns {Object} Object with camelCase keys
 */
function convertKeysToCamel(obj) {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj !== 'object') return obj;
  if (obj instanceof Date) return obj;
  if (Array.isArray(obj)) return obj.map(convertKeysToCamel);

  const converted = {};
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const camelKey = snakeToCamel(key);
      const value = obj[key];
      // Only convert plain objects, not Date, null, or other special objects
      if (value !== null && typeof value === 'object' && !(value instanceof Date) && !Array.isArray(value)) {
        converted[camelKey] = convertKeysToCamel(value);
      } else if (Array.isArray(value)) {
        converted[camelKey] = value.map(convertKeysToCamel);
      } else {
        converted[camelKey] = value;
      }
    }
  }
  return converted;
}

/**
 * Convert object keys from camelCase to snake_case
 * @param {Object} obj - Object with camelCase keys
 * @returns {Object} Object with snake_case keys
 */
function convertKeysToSnake(obj) {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj !== 'object') return obj;
  if (obj instanceof Date) return obj;
  if (Array.isArray(obj)) return obj.map(convertKeysToSnake);

  const converted = {};
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const snakeKey = camelToSnake(key);
      const value = obj[key];
      // Only convert plain objects, not Date, null, or other special objects
      if (value !== null && typeof value === 'object' && !(value instanceof Date) && !Array.isArray(value)) {
        converted[snakeKey] = convertKeysToSnake(value);
      } else if (Array.isArray(value)) {
        converted[snakeKey] = value.map(convertKeysToSnake);
      } else {
        converted[snakeKey] = value;
      }
    }
  }
  return converted;
}

/**
 * Accept both camelCase and snake_case input, convert to snake_case for DB
 * This allows API to accept both formats
 * @param {Object} obj - Object with mixed case keys
 * @returns {Object} Object with snake_case keys
 */
function normalizeToSnake(obj) {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj !== 'object') return obj;
  if (obj instanceof Date) return obj;
  if (Array.isArray(obj)) return obj.map(normalizeToSnake);

  const normalized = {};
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      // Convert camelCase to snake_case
      const snakeKey = camelToSnake(key);
      const value = obj[key];
      // Only convert plain objects, not Date, null, or other special objects
      if (value !== null && typeof value === 'object' && !(value instanceof Date) && !Array.isArray(value)) {
        normalized[snakeKey] = normalizeToSnake(value);
      } else if (Array.isArray(value)) {
        normalized[snakeKey] = value.map(normalizeToSnake);
      } else {
        normalized[snakeKey] = value;
      }
    }
  }
  return normalized;
}

module.exports = {
  snakeToCamel,
  camelToSnake,
  convertKeysToCamel,
  convertKeysToSnake,
  normalizeToSnake
};
