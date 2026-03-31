/**
 * Type Definitions for FreelanceFlow
 * Note: Using JSDoc comments for documentation since we're using plain JS
 */

/**
 * @typedef {Object} User
 * @property {string} id
 * @property {string} email
 * @property {string} name
 * @property {'client' | 'freelancer' | 'admin'} role
 * @property {string} [avatar]
 * @property {string} createdAt
 * @property {string} updatedAt
 */

/**
 * @typedef {Object} Project
 * @property {string} id
 * @property {string} title
 * @property {string} description
 * @property {string} clientId
 * @property {string} [freelancerId]
 * @property {'open' | 'in-progress' | 'completed' | 'cancelled'} status
 * @property {number} budget
 * @property {string} deadline
 * @property {string} createdAt
 * @property {string} updatedAt
 */

/**
 * @typedef {Object} Task
 * @property {string} id
 * @property {string} projectId
 * @property {string} title
 * @property {string} description
 * @property {'todo' | 'in-progress' | 'done'} status
 * @property {'low' | 'medium' | 'high'} priority
 * @property {string} dueDate
 * @property {string} createdAt
 * @property {string} updatedAt
 */

/**
 * @typedef {Object} AuthResponse
 * @property {string} token
 * @property {User} user
 */

/**
 * @typedef {Object} ApiError
 * @property {string} message
 * @property {string} [code]
 * @property {Record<string, any>} [details]
 */

export const types = {};
