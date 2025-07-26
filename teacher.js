const API = "http://localhost:3000";
const user = JSON.parse(localStorage.getItem("user"));

if (!user || user.role !== "teacher") {
  alert("Avval login qiling");
  window.location.href = "index.html";
}

async function loadStudents() {
  const res = await fetch(`${API}/students-by-teacher?teacherId=${user.teacherId}`);
  const students = await res.json();

  const list = document.getElementById("studentsList");
  list.innerHTML = "";

  students.forEach(stu => {
    const div = document.createElement("div");
    div.className = "student";
    div.innerHTML = `
      <h3>${stu.username}</h3>
      <label><input type="checkbox" onchange="toggleSelect('${stu.username}', this)"> Darsga keldi</label>
      <div class="coinSelect" id="coin-${stu.username}" style="display:none">
        <select id="reward-${stu.username}">
          <option value="" disabled selected>Tanlang</option>
          <option value="1">+1: Vazifa to‘liq</option>
          <option value="1b">+1: Vaqtida keldi</option>
          <option value="3">+3: 3 marta qatnashgan</option>
          <option value="1c">+1: Faol ishtirok</option>
          <option value="-1a">-1: Vazifa bajarmadi</option>
          <option value="-1b">-1: Passiv ishtirok</option>
          <option value="-1c">-1: Odobsiz xulq</option>
        </select>
        <button onclick="giveCoin('${stu.username}')">Yuborish</button>
      </div>
    `;
    list.appendChild(div);
  });
}

function toggleSelect(username, checkbox) {
  const menu = document.getElementById("coin-" + username);
  menu.style.display = checkbox.checked ? "block" : "none";
}

async function giveCoin(username) {
  const select = document.getElementById(`reward-${username}`);
  const value = select.value;
  if (!value) return alert("Tanlovni bajaring!");

  let amount = 0;
  let reason = "";

  switch (value) {
    case "1": amount = 1; reason = "Vazifa to‘liq"; break;
    case "1b": amount = 1; reason = "Vaqtida keldi"; break;
    case "3": amount = 3; reason = "Haftada 3 marta qatnashdi"; break;
    case "1c": amount = 1; reason = "Darsda faol"; break;
    case "-1a": amount = -1; reason = "Vazifa yo‘q"; break;
    case "-1b": amount = -1; reason = "Passiv xulq"; break;
    case "-1c": amount = -1; reason = "Odobsizlik"; break;
  }

  // Balansni tekshirish
  const res = await fetch(`${API}/coin-history?username=${username}`);
  const history = await res.json();
  const currentBalance = history.reduce((sum, item) => sum + item.amount, 0);

  if (currentBalance <= 0 && amount < 0) {
    return alert("Balans 0 dan past bo‘lishi mumkin emas");
  }

  const send = await fetch(`${API}/coin`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, amount, reason })
  });

  const data = await send.json();
  alert(data.msg || "Coin belgilandi");

  loadStudents();
}

function logout() {
  localStorage.removeItem("user");
  window.location.href = "index.html";
}

loadStudents();
<script src="teacher.js"></script>

