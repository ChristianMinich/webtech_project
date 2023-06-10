const mariadb = require("mariadb");

/**
 * Design Pattern Singleton enusures that there can only be one Instance of the @class {MariaDBSingleton} Class
 * to make sure that there can only be a single Instance at one Time connected to the Database   // Rania bitte Kommentar ändern
 *
 * @returns {MariaDB}
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
