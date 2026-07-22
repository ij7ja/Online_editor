import "dotenv/config";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const port = Number(process.env.API_PORT || 3001);
const mongoURI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/online_code_editor";

// 1. Connect to MongoDB
mongoose.connect(mongoURI).then(() => {
  console.log(`Connected to MongoDB at ${mongoURI}`);
}).catch(err => {
  console.error("MongoDB connection error:", err);
});

// 2. Define Mongoose Schemas and Models
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password_hash: { type: String, required: true },
  salt: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const sessionSchema = new mongoose.Schema({
  token: { type: String, required: true, unique: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  expiresAt: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model("User", userSchema);
const Session = mongoose.model("Session", sessionSchema);

function normalizeUsername(username) {
  return String(username || "").trim().toLowerCase();
}

function hashPassword(password, salt = randomBytes(16).toString("hex")) {
  const passwordHash = scryptSync(password, salt, 64).toString("hex");
  return { passwordHash, salt };
}

function isPasswordValid(password, user) {
  const { passwordHash } = hashPassword(password, user.salt);
  const storedHash = Buffer.from(user.password_hash, "hex");
  const enteredHash = Buffer.from(passwordHash, "hex");

  return (
    storedHash.length === enteredHash.length &&
    timingSafeEqual(storedHash, enteredHash)
  );
}

async function createSession(userId) {
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  await Session.create({
    token,
    userId,
    expiresAt
  });

  return token;
}

function getBearerToken(request) {
  const header = request.headers.authorization || "";
  return header.startsWith("Bearer ") ? header.slice(7) : "";
}

function validateCredentials(username, password) {
  if (username.length < 3) {
    return "Username must be at least 3 characters.";
  }

  if (String(password || "").length < 6) {
    return "Password must be at least 6 characters.";
  }

  return "";
}

const app = express();

app.use(cors());
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (req, res) => {
  res.status(200).json({ message: "API is running." });
});

app.post("/api/register", async (req, res) => {
  try {
    const { username: rawUsername, password } = req.body;
    const username = normalizeUsername(rawUsername);
    const pass = String(password || "");
    const validationError = validateCredentials(username, pass);

    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(409).json({ message: "Username already exists." });
    }

    const { passwordHash, salt } = hashPassword(pass);
    const newUser = await User.create({
      username,
      password_hash: passwordHash,
      salt
    });

    const token = await createSession(newUser._id);

    res.status(201).json({
      message: "Account created.",
      user: { id: newUser._id, username: newUser.username },
    });
  } catch (error) {
    res.status(500).json({ message: error.message || "Something went wrong." });
  }
});

app.post("/api/login", async (req, res) => {
  try {
    const { username: rawUsername, password } = req.body;
    const username = normalizeUsername(rawUsername);
    const pass = String(password || "");

    const user = await User.findOne({ username });

    if (!user || !isPasswordValid(pass, user)) {
      return res.status(401).json({ message: "Invalid username or password." });
    }

    const token = await createSession(user._id);

    res.status(200).json({
      message: "Login successful.",
      token,
      user: { id: user._id, username: user.username },
    });
  } catch (error) {
    res.status(500).json({ message: error.message || "Something went wrong." });
  }
});

app.get("/api/me", async (req, res) => {
  try {
    const token = getBearerToken(req);

    if (!token) {
      return res.status(401).json({ message: "Not logged in." });
    }

    const session = await Session.findOne({
      token,
      expiresAt: { $gt: new Date() }
    }).populate('userId', 'username');

    if (!session || !session.userId) {
      return res.status(401).json({ message: "Not logged in." });
    }

    res.status(200).json({
      user: {
        id: session.userId._id,
        username: session.userId.username
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message || "Something went wrong." });
  }
});

app.post("/api/logout", async (req, res) => {
  try {
    const token = getBearerToken(req);

    if (token) {
      await Session.deleteOne({ token });
    }

    res.status(200).json({ message: "Logged out." });
  } catch (error) {
    res.status(500).json({ message: error.message || "Something went wrong." });
  }
});

// 404 handler for unknown routes
app.use((req, res) => {
  res.status(404).json({ message: "Route not found." });
});

app.listen(port, "0.0.0.0", () => {
  console.log(`Login API (Express + MongoDB) running at http://0.0.0.0:${port}`);
});
