const API = "http://localhost:3000";
const user = JSON.parse(localStorage.getItem("user"));

if (!user || user.role !== "superadmin") {
  alert("Login qiling!");
  window.location.href = "index.html";
}

async function loadDashboard() {
  const res = await fetch(`${API}/users`);
  const users = await res.json();

  const teachers = users.filter(u => u.role === "teacher");
  const students = users.filter(u => u.role === "student");
  const pending = teachers.filter(t => !t.approved);

  document.getElementById("teacherCount").textContent = teachers.length;
  document.getElementById("studentCount").textContent = students.length;

  const container = document.getElementById("pendingTeachers");
  container.innerHTML = "";

  if (pending.length === 0) {
    container.innerHTML = "<p>Hamma o‘qituvchilar tasdiqlangan</p>";
    return;
  }

  pending.forEach(t => {
    const div = document.createElement("div");
    div.className = "user-card";
    div.innerHTML = `
      <strong>${t.username}</strong><br/>
      ID: ${t.teacherId} <br/>
      <button onclick="approveTeacher('${t.username}')">Tasdiqlash</button>
    `;
    container.appendChild(div);
  });
}

async function approveTeacher(username) {
  const res = await fetch(`${API}/approve-teacher`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username })
  });

  const data = await res.json();
  alert(data.msg || "Tasdiqlandi");
  loadDashboard();
}

async function giveCoin() {
  const username = document.getElementById("coinUser").value;
  const amount = parseInt(document.getElementById("coinAmount").value);
  const reason = document.getElementById("coinReason").value;

  if (!username || isNaN(amount)) {
    return alert("To‘liq to‘ldiring");
  }

  const res = await fetch(`${API}/coin`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, amount, reason })
  });

  const data = await res.json();
  alert(data.msg || "Coin berildi");
}

function logout() {
  localStorage.removeItem("user");
  window.location.href = "index.html";
}

loadDashboard();
