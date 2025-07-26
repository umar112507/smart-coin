const express = require("express");
const app = express();
const cors = require("cors");

app.use(cors());
app.use(express.json());
const PORT = 3000;

// 🔐 Superadmin maxsus login (registerdan o‘tmaydi)
const SUPERADMIN = {
  username: "everestadmin",
  password: "2222jjjj",
  role: "superadmin"
};

// 📦 Foydalanuvchilar va coinlar tarixi
let users = []; // {username, password, role, teacherId?, approved?}
let coinHistory = []; // {username, amount, reason, date}

// ✅ RO‘YXATDAN O‘TISH
app.post("/register", (req, res) => {
  const { username, password, role, teacherId } = req.body;

  if (users.find(u => u.username === username)) {
    return res.status(400).json({ msg: "Bu username band" });
  }

  if (role === "teacher") {
    const newTeacher = {
      username,
      password,
      role,
      teacherId: generateTeacherId(),
      approved: false
    };
    users.push(newTeacher);
    return res.json({ msg: "Tasdiqni kuting", pending: true });
  }

  if (role === "student") {
    if (teacherId < 1 || teacherId > 20) {
      return res.status(400).json({ msg: "O‘qituvchi ID 1–20 oralig‘ida bo‘lishi kerak" });
    }
    users.push({ username, password, role, teacherId });
    return res.json({ msg: "Ro‘yxatdan o‘tdingiz", success: true });
  }

  res.status(400).json({ msg: "Rollar noto‘g‘ri" });
});

// 🔑 LOGIN
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  // Superadmin logini
  if (username === SUPERADMIN.username && password === SUPERADMIN.password) {
    return res.json({ username, role: "superadmin" });
  }

  const user = users.find(u => u.username === username && u.password === password);

  if (!user) return res.status(404).json({ msg: "Foydalanuvchi topilmadi" });

  if (user.role === "teacher" && !user.approved) {
    return res.status(403).json({ msg: "Tasdiqlanmagan o‘qituvchi" });
  }

  res.json(user);
});

// 👨‍🏫 O‘QITUVCHINI TASDIQLASH (faqat superadmin)
app.post("/approve-teacher", (req, res) => {
  const { username } = req.body;
  const teacher = users.find(u => u.username === username && u.role === "teacher");

  if (!teacher) return res.status(404).json({ msg: "O‘qituvchi topilmadi" });

  teacher.approved = true;
  res.json({ msg: "O‘qituvchi tasdiqlandi" });
});

// 👥 FOYDALANUVCHILAR RO‘YXATI
app.get("/users", (req, res) => {
  res.json(users);
});

// 📚 O‘QITUVCHI BO‘YICHA O‘QUVCHILAR
app.get("/students-by-teacher", (req, res) => {
  const { teacherId } = req.query;
  const students = users.filter(u => u.role === "student" && u.teacherId == teacherId);
  res.json(students);
});

// 💰 COIN BERISH
app.post("/coin", (req, res) => {
  const { username, amount, reason } = req.body;

  const user = users.find(u => u.username === username);
  if (!user) return res.status(404).json({ msg: "Foydalanuvchi topilmadi" });

  // 0 dan pastga tushishga ruxsat yo‘q
  const balance = coinHistory
    .filter(e => e.username === username)
    .reduce((sum, e) => sum + e.amount, 0);

  if (amount < 0 && balance <= 0) {
    return res.status(400).json({ msg: "Balans 0 dan kamaytirib bo‘lmaydi" });
  }

  coinHistory.push({
    username,
    amount,
    reason,
    date: new Date().toISOString()
  });

  res.json({ msg: "Tanga berildi" });
});

// 📊 COIN TARIXI
app.get("/coin-history", (req, res) => {
  const { username } = req.query;
  const history = coinHistory.filter(e => e.username === username);
  res.json(history);
});

// 🔢 O‘QITUVCHIGA 1–20 oralig‘ida ID berish
function generateTeacherId() {
  const existing = users
    .filter(u => u.role === "teacher")
    .map(u => u.teacherId);
  for (let i = 1; i <= 20; i++) {
    if (!existing.includes(i)) return i;
  }
  return Math.floor(Math.random() * 20) + 1;
}

app.listen(PORT, () => {
  console.log(`✅ Smart Coin backend ishlayapti: http://localhost:${PORT}`);
});
