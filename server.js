const http = require("http");
const fs = require("fs");
const path = require("path");
const { ObjectId } = require("mongodb");
const connectDB = require("./db/mongoConnect");

let db;
// Read form data
function readFormData(req) {
    return new Promise((resolve) => {
        let body = "";

        req.on("data", chunk => {
            body += chunk.toString();
        });

        req.on("end", () => {
            resolve(new URLSearchParams(body));
        });
    });
}

const server = http.createServer(async (req, res) => {
    // Allow the browser to send and receive JSON
    res.setHeader("Content-Type", "application/json");
// REGISTER USER
if (req.method === "POST" && req.url === "/register") {

    const form = await readFormData(req);

    const name = form.get("name")?.trim();
    const email = form.get("email")?.trim().toLowerCase();
    const password = form.get("password");

    if (!name || !email || !password || password.length < 4) {
        res.writeHead(400, {
            "Content-Type": "text/html"
        });

        return res.end("<h2>Invalid registration data</h2>");
    }

    const users = db.collection("users");

    const existing = await users.findOne({ email });

    if (existing) {
        res.writeHead(400, {
            "Content-Type": "text/html"
        });

        return res.end("<h2>Email already registered</h2>");
    }

    await users.insertOne({
        name: name,
        email: email,
        password: password
    });

    res.writeHead(302, {
        Location: "/login.html"
    });

    return res.end();
}
// LOGIN USER
if (req.method === "POST" && req.url === "/login") {

    const form = await readFormData(req);

    const email = form.get("email")?.trim().toLowerCase();
    const password = form.get("password");

    if (!email || !password) {
        res.writeHead(400, {
            "Content-Type": "text/html"
        });

        return res.end("<h2>Please enter email and password</h2>");
    }

    const users = db.collection("users");

    const user = await users.findOne({
        email: email,
        password: password
    });

    if (!user) {
        res.writeHead(401, {
            "Content-Type": "text/html"
        });

        return res.end("<h2>Invalid email or password</h2>");
    }

    res.writeHead(302, {
        Location: "/index.html"
    });

    return res.end();
}
    // ADD EXPENSE
    if (req.url === "/expenses" && req.method === "POST") {
        let body = "";

        req.on("data", chunk => {
            body += chunk.toString();
        });

        req.on("end", async () => {
            try {
                const expense = JSON.parse(body);

                if (
                    typeof expense.name !== "string" ||
                    !expense.name.trim() ||
                    typeof expense.amount !== "number" ||
                    !Number.isFinite(expense.amount) ||
                    expense.amount <= 0 ||
                    typeof expense.category !== "string" ||
                    !expense.category ||
                    typeof expense.date !== "string" ||
                    !/^\d{4}-\d{2}-\d{2}$/.test(expense.date)
                ) {
                    res.writeHead(400);
                    res.end(JSON.stringify({ message: "Invalid expense details" }));
                    return;
                }

                await db.collection("expenses").insertOne({
                    name: expense.name.trim(),
                    amount: expense.amount,
                    category: expense.category,
                    date: expense.date
                });

                res.writeHead(201);
                res.end(JSON.stringify({ message: "Expense added successfully" }));

            } catch (error) {
                res.writeHead(400);
                res.end(JSON.stringify({ message: "Could not add expense" }));
            }
        });

        return;
    }

    // VIEW EXPENSES
    if (req.url === "/expenses" && req.method === "GET") {
        try {
            const expenses = await db.collection("expenses")
                .find()
                .sort({ date: -1 })
                .toArray();

            res.writeHead(200);
            res.end(JSON.stringify(expenses));
        } catch (error) {
            res.writeHead(500);
            res.end(JSON.stringify({ message: "Could not load expenses" }));
        }

        return;
    }

    // DELETE EXPENSE
    if (req.url.startsWith("/expenses/") && req.method === "DELETE") {
        try {
            const id = req.url.split("/")[2];

            if (!ObjectId.isValid(id)) {
                res.writeHead(400);
                res.end(JSON.stringify({ message: "Invalid expense ID" }));
                return;
            }

            await db.collection("expenses").deleteOne({
                _id: new ObjectId(id)
            });

            res.writeHead(200);
            res.end(JSON.stringify({ message: "Expense deleted successfully" }));

        } catch (error) {
            res.writeHead(500);
            res.end(JSON.stringify({ message: "Could not delete expense" }));
        }

        return;
    }

    // SERVE WEBSITE FILES
const files = {
    "/": "register.html",
    "/index.html": "index.html",
    "/style.css": "style.css",
    "/script.js": "script.js",
    "/register.html": "register.html",
    "/register.js": "register.js",
    "/login.html": "login.html"
};
    const requestedFile = files[req.url];

    if (requestedFile) {
        const filePath = path.join(__dirname, "public", requestedFile);

        fs.readFile(filePath, (error, content) => {
            if (error) {
                res.writeHead(500, { "Content-Type": "text/plain" });
                res.end("Unable to load website");
                return;
            }

            const contentTypes = {
                ".html": "text/html",
                ".css": "text/css",
                ".js": "text/javascript"
            };

            res.writeHead(200, {
                "Content-Type": contentTypes[path.extname(filePath)]
            });

            res.end(content);
        });

        return;
    }

    res.writeHead(404);
    res.end(JSON.stringify({ message: "Page not found" }));
});

// CONNECT TO DATABASE AND START SERVER
async function startServer() {
    try {
        db = await connectDB();

        server.listen(3000, () => {
            console.log("Penny is running at http://localhost:3000");
        });

    } catch (error) {
        console.log("Server error:", error.message);
    }
}

startServer();