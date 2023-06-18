const mysql = require("mysql");
const dotenv = require("dotenv");
const { v4: uuidv4 } = require("uuid");

const instance = null;
dotenv.config();

const connection = mysql.createConnection({
  host: process.env.HOST,
  user: process.env.USER,
  password: process.env.PASSWORD,
  database: process.env.DATABASE,
});

connection.connect((err) => {
  if (err) {
    console.log(err.message);
  }
  //console.log("database" + connection.state);
});

class DbService {
  static getDbServiceInstance() {
    return instance ? instance : new DbService();
  }

  async getBrands() {
    try {
      const response = await new Promise((resolve, reject) => {
        const query = "select * from brands;";
        connection.query(query, (err, results) => {
          if (err) reject(new Error(err.message));
          resolve(results);
        });
      });
      return response;
    } catch (error) {
      console.log(error);
    }
  }

  async getProduct(id) {
    try {
      const response = await new Promise((resolve, reject) => {
        const query = `SELECT p.*, b.name as b_name, g.* 
        FROM products p 
        JOIN brands b ON p.brand_id = b.id 
        JOIN gallery g ON p.gallery_id = g.id
        WHERE p.id = (?);`;
        connection.query(query, [id], (err, results) => {
          if (err) reject(new Error(err.message));
          resolve(results);
        });
      });
      return response;
    } catch (error) {
      console.log(error);
    }
  }

  async search(searchFor) {
    try {
      if (!searchFor || searchFor === " ") return ["NO DATA!"];
      const [results1, results2] = await Promise.all([
        new Promise((resolve, reject) => {
          const query1 = `SELECT p.id as p_id, p.name, p.displacement, b.name as b_name, g.main_img
                          FROM products p 
                          JOIN brands b ON p.brand_id = b.id 
                          JOIN gallery g ON p.gallery_id = g.id 
                          WHERE p.name LIKE '%${searchFor}%' OR b.name LIKE '%${searchFor}%' OR p.displacement LIKE '%${searchFor}%';`;
          connection.query(query1, (err, results) => {
            if (err) reject(new Error(err.message));
            resolve(results);
          });
        }),
        new Promise((resolve, reject) => {
          const query2 = `SELECT id as b_id, name, logo FROM brands WHERE name LIKE '%${searchFor}%';`;
          connection.query(query2, (err, results) => {
            if (err) reject(new Error(err.message));
            resolve(results);
          });
        }),
      ]);
      return [...results1, ...results2];
    } catch (error) {
      console.log(error);
    }
  }
  async getMotos(whatToGet, b_name, excludedId) {
    try {
      const response = await new Promise((resolve, reject) => {
        let queryComplet;
        if (whatToGet === "beasts") {
          queryComplet = "ORDER BY p.displacement DESC LIMIT 5;";
        } else if (whatToGet === "NewArrivals") {
          queryComplet = "ORDER BY p.id DESC LIMIT 10;";
        } else if (whatToGet === "fromTheSameBrand") {
          queryComplet = `where b.name="${b_name}" and p.id<>${excludedId} ;`;
        } else if (whatToGet === "productsOfThisBrand") {
          queryComplet = `where b.name="${b_name}";`;
        }
        let query = `
        SELECT p.id, p.name, p.description, p.displacement, b.name as b_name, g.main_img
        FROM products p 
        JOIN brands b ON p.brand_id = b.id 
        JOIN gallery g ON p.gallery_id = g.id ${queryComplet}`;
        connection.query(query, (err, results) => {
          if (err) reject(new Error(err.message));
          resolve(results);
        });
      });
      return response;
    } catch (error) {
      console.log(error);
    }
  }

  async insertProduct(product) {
    try {
      const added_date = new Date();
      const uniqueId = uuidv4();
      const insertId = await new Promise((resolve, reject) => {
        const query2 =
          "INSERT INTO gallery (id, main_img, img_1, img_2, img_3, img_4, img_5) VALUES (?, ?, ?, ?, ?, ?, ?);";
        connection.query(
          query2,
          [
            uniqueId,
            product.MainImg,
            product.Img1,
            product.Img2,
            product.Img3,
            product.Img4,
            product.Img5,
          ],
          (err, result) => {
            if (err) reject(new Error(err.message));
            resolve(result);
          }
        );
        const query1 =
          "INSERT INTO products (name, brand_id, displacement, description, engine, dimensions_and_weight, video, gallery_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?);";
        connection.query(
          query1,
          [
            product.Name,
            product.Brand,
            product.Displacement,
            product.Description,
            product.Engine,
            product.DimensionsAndWeight,
            product.Video,
            uniqueId,
          ],
          (err, result) => {
            if (err) reject(new Error(err.message));
            resolve(result);
          }
        );
      });
      return insertId;
    } catch (err) {
      console.log(err);
    }
  }

  async deleteRow(id) {
    id = parseInt(id, 10);
    const response = await new Promise((resolve, reject) => {
      const query = "DELETE FROM names WHERE id= (?);";
      connection.query(query, [id], (err, result) => {
        if (err) reject(new Error(err.message));
        resolve(true);
      });
    });
    return response;
  }

  async updateRow(nameValue, id) {
    id = parseInt(id, 10);
    const response = await new Promise((resolve, reject) => {
      const query = "UPDATE names SET name = (?) WHERE id = (?);";
      connection.query(query, [nameValue, id], (err, result) => {
        if (err) reject(new Error(err.message));
        resolve(true);
      });
    });
    return response;
  }
}

module.exports = DbService;
