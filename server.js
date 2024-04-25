const express = require("express");
const mysql = require("mysql2");
const dotenv = require("dotenv");
const path = require("path");
const bcrypt = require("bcrypt");
const session = require("express-session");
const cors = require("cors");

const app = express();
dotenv.config({ path: "./.env" });

app.set("view engine", "hbs");
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use(express.static(path.join(__dirname, "public")));

app.use(cors());

app.get("/api/lists", cors(), (req, res) => {
  res.json({ message: "This route supports CORS" });
});

app.use(
  session({
    secret: "123",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, maxAge: 1000 * 60 * 60 * 24, httpOnly: true },
  })
);

app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn;
  res.locals.user = req.session.user;
  next();
});

// Skapa databasanslutning
const db = mysql.createConnection({
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE,
});

db.connect((error) => {
  if (error) {
    console.error("Fel vid anslutning till databasen: ", error);
  } else {
    console.log("Ansluten till MySQL");
  }
});

// Grundläggande routes
app.get("/", (req, res) => res.render("index"));
app.get("/register", (req, res) => res.render("register"));
app.get("/login", (req, res) => res.render("login"));
app.get("/todo", (req, res) => res.render("todo"));
app.get("/", (req, res) => {
  if (req.session.isLoggedIn) {
    res.render("todo", {
      user: req.session.user,
      isAuthenticated: req.session.isLoggedIn,
    });
  } else {
    res.render("index");
  }
});

// Hantera registrering
app.post("/auth/register", (req, res) => {
  const { name, email, password, password_confirm } = req.body;
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

  if (!password.match(passwordRegex)) {
    return res.render("register", {
      message: "Lösenordet måste uppfylla kraven.",
    });
  }

  if (password !== password_confirm) {
    return res.render("register", {
      message: "Lösenorden matchar inte.",
    });
  }

  db.query(
    "SELECT email FROM users WHERE email = ?",
    [email],
    async (error, result) => {
      if (error) {
        console.log(error);
      } else if (result.length > 0) {
        return res.render("register", {
          message: "E-postadressen används redan.",
        });
      } else {
        let hashedPassword = await bcrypt.hash(password, 8);
        db.query(
          "INSERT INTO users SET ?",
          { name: name, email: email, password: hashedPassword },
          (error, result) => {
            if (error) {
              console.log(error);
            } else {
              return res.render("register", {
                message: "Användare registrerad.",
              });
            }
          }
        );
      }
    }
  );
});

// Hantera inloggning
app.post("/auth/login", (req, res) => {
  const { name, password } = req.body;

  db.query(
    "SELECT * FROM users WHERE name = ?",
    [name],
    async (error, result) => {
      if (error) {
        console.log(error);
      } else if (
        result.length == 0 ||
        !(await bcrypt.compare(password, result[0].password))
      ) {
        res.render("login", {
          message: "Användarnamnet eller lösenordet är felaktigt.",
        });
      } else {
        // Användare är inloggad
        req.session.isLoggedIn = true;
        req.session.user = result[0];
        res.redirect("/todo");
        console.log(req.session);
      }
    }
  );
});

app.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.log(err);
    } else {
      res.redirect("/");
    }
  });
});

app.post("/api/lists", async (req, res) => {
  const { list_name } = req.body;
  const userId = req.session.user && req.session.user.user_id;
  console.log("Request body:", req.body);
  console.log("Session data:", req.session);
  if (!list_name) {
    return res.status(400).json({ message: "Listans namn är obligatoriskt." });
  }

  try {
    // Antag att du har en funktion som lägger till en lista i databasen
    const result = await addList(list_name, userId);
    res.status(201).json(result);
  } catch (error) {
    console.error("Error creating list:", error);
    res.status(500).json({ message: "Internt serverfel." });
  }
});

function addList(listName, userId) {
  // Här skulle du interagera med din databas för att lägga till listan
  return new Promise((resolve, reject) => {
    db.query(
      "INSERT INTO lists (list_name, user_id) VALUES (?, ?)",
      [listName, userId],
      (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve({ id: result.insertId, name: listName });
        }
      }
    );
  });
}

// Starta servern
const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`Servern körs på http://localhost:${port}`));
