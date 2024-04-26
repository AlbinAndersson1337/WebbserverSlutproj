const express = require("express");
const mysql = require("mysql2");
const dotenv = require("dotenv");
const path = require("path");
const bcrypt = require("bcrypt");
const session = require("express-session");

const app = express();
dotenv.config({ path: "./.env" });

app.set("view engine", "hbs");
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use(express.static(path.join(__dirname, "public")));

app.use(
  session({
    secret: "123",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: !true },
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

  console.log(req.body); 
  const { list_name } = req.body;
  const userId = req.session.user.id;

  if (!list_name) {
    return res.status(400).json({ message: "List Name is required" });
  }

  if (!req.session.isLoggedIn || !req.session.user) {
    return res.status(403).json({ message: "Not authorized" });
  }

  try {
    const [result] = await db
      .promise()
      .query("INSERT INTO lists (list_name, user_id) VALUES (?, ?)", [
        list_name,
        userId,
      ]);

    const [newList] = await db
      .promise()
      .query("SELECT * FROM lists WHERE id = ?", [result.insertId]);

    res.status(201).json(newList[0]);
  } catch (error) {
    console.error("Error creating list", error);
    res.status(500).send({ message: "Internal server error" });
  }
});

// Starta servern
const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`Servern körs på http://localhost:${port}`));
