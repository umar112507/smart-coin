// === BACKEND API URL ===
const API = "http://localhost:3000";

// === LOGIN FORM YUBORISH ===
document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const username = document.getElementById("loginUsername").value.trim();
  const password = document.getElementById("loginPassword").value;

  const res = await fetch(`${API}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  const data = await res.json();

  if (!data.success) return alert(data.msg || "Login xatoligi");

  // localStorage ga foydalanuvchini saqlaymiz
  localStorage.setItem("user", JSON.stringify({ username, role: data.role }));

  // Rolga qarab yo‘naltirish
  switch (data.role) {
    case "superadmin":
      window.location.href = "superadmin-dashboard.html";
      break;
    case "teacher":
      window.location.href = "teacher-dashboard.html";
      break;
    case "student":
      window.location.href = "student-dashboard.html";
      break;
    default:
      alert("Noma'lum rol");
  }
});

// === REGISTER FORM YUBORISH ===
document.getElementById("registerForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const username = document.getElementById("regUsername").value.trim();
  const password = document.getElementById("regPassword").value;
  const role = document.getElementById("regRole").value;
  let teacherId = null;

  if (role === "student") {
    teacherId = parseInt(document.getElementById("teacherId").value);
    if (!teacherId) return alert("O‘qituvchi ID tanlang!");
  }

  const res = await fetch(`${API}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password, role, teacherId }),
  });

  const data = await res.json();

  if (!data.success) return alert(data.msg || "Ro‘yxatdan o‘tishda xatolik");

  alert(data.msg);

  // Superadmin tasdiqlashi kerak bo‘lsa — login qilishga o‘tkazamiz
  if (role === "teacher") {
    switchTab("login");
  } else if (role === "student") {
    localStorage.setItem("user", JSON.stringify({ username, role }));
    window.location.href = "student-dashboard.html";
  }
});
