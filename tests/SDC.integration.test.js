const request = require("supertest");
const { Sequelize } = require("sequelize");
const app = require("../server/index.js");
const db = require("../database/index.js");

describe("server and database", () => {
  let sequelize;
  beforeAll(() => {
    sequelize = new Sequelize("audible_price", "root", null, {
      dialect: "mysql",
      logging: false,
    });
    sequelize.sync({ force: true });
  });
  afterAll(() => {
    sequelize.close();
  });

  // CREATE
  it("POST /api/price/postNewBook", async () => {
    const res = await request("http://localhost:3000").post(
      "/api/price/postNewBook"
    );
    expect(res.statusCode).toEqual(200);
    const text = JSON.parse(res.text);
    expect(text).toHaveProperty("book_id");
    expect(text).toHaveProperty("book_title");
    expect(text).toHaveProperty("price");
  });

  // READ
  it("GET /api/price/:bookId", async () => {
    const res = await request("http://localhost:3000").get("/api/price/12");
    expect(res.statusCode).toEqual(200);
    const text = JSON.parse(res.text);
    expect(text).toHaveProperty("book_id");
    expect(text).toHaveProperty("book_title");
    expect(text).toHaveProperty("price");
  });

  // UPDATE
  it("PUT /api/price:/bookId", async () => {
    const getRes = await request("http://localhost:3000").get("/api/price/12");
    expect(getRes.statusCode).toEqual(200);
    const originalText = JSON.parse(getRes.text);

    const putRes = await request("http://localhost:3000").put("/api/price/12");
    expect(putRes.statusCode).toEqual(200);

    const getRes2 = await request("http://localhost:3000").get("/api/price/12");
    expect(getRes2.statusCode).toEqual(200);
    const updatedText = JSON.parse(getRes2.text);

    expect(updatedText).not.toEqual(originalText);
  });

  // DELETE
  it("DELETE /api/price:/bookId", async () => {
    const getRes = await request("http://localhost:3000").get("/api/price/12");
    expect(getRes.statusCode).toEqual(200);

    const deleted = await request("http://localhost:3000").delete(
      "/api/price/12"
    );
    expect(deleted.statusCode).toEqual(200);

    const getRes2 = await request("http://localhost:3000").get("/api/price/12");
    expect(getRes2.statusCode).toEqual(404);
  });
});
