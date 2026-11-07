const { MongoClient } = require("mongodb");

const uri = 'mongodb+srv://avellajoy2_db_user:8730968ka26na12@cluster26.qwlaarg.mongodb.net/';

const client = new MongoClient(uri);

async function connectDB() {
    await client.connect();

    console.log("MongoDB Atlas connected successfully!");

    const db = client.db("pennyDB");

    return db;
}

module.exports = connectDB;
