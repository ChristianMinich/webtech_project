//TODO: DB Implementation

const mariadb = require('mariadb');

/**
 * Design Pattern Singleton enusures that there can only be one Instance of the @class {MariaDBSingleton} Class
 * to make sure that there can only be a single Instance at one Time connected to the Database
 * 
 * @returns {MariaDBSingleton}
 */
class MariaDBSingleton {
  constructor() {
    this.pool = mariadb.createPool({
      host: '127.0.0.1',
      user: 'root',
      password: 'admin',
      database: 'sep',
      connectionLimit: 10
    });
  }

  async getConnection() {
    try {
      const connection = await this.pool.getConnection();
      return connection;
    } catch (err) {
      console.error('Failed to get database connection:', err);
      throw err;
    }
  }
}

// Create and export a single instance of the MariaDBSingleton class
module.exports = new MariaDBSingleton();
