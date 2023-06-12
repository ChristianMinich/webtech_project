const mariadb = require("mariadb");

/**
 * The MariaDB class establishes a connection to a MariaDB database and manages a connection pool.
 * It provides a convenient way to retrieve a database connection from the pool for executing queries
 * and managing database operations.
 */
class MariaDB {
  constructor() {
    this.pool = mariadb.createPool({
      host: "127.0.0.1",
      user: "sep23",
      password: "lingenliefert",
      database: "QUIZDUELL",
      connectionLimit: 10,
    });
  }

  /**
   * This function attempts to retrieve a database connection from the connection pool.
   *
   * @returns {Promise<PoolConnection>} - A Promise resolving to a database connection.
   */
  async getConnection() {
    try {
      const connection = await this.pool.getConnection();
      return connection;
    } catch (err) {
      console.error("Failed to get database connection:", err);
      throw err;
    }
  }
}

module.exports = new MariaDB();
