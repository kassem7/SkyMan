document.addEventListener("DOMContentLoaded", function () {
  fetchUsers();

  document.getElementById("statusFilter").addEventListener("change", filterUsers);
  document.getElementById("refreshBtn").addEventListener("click", fetchUsers);
});

function fetchUsers() {
  fetch("get_users.php")
    .then(res => res.json())
    .then(data => {
      const tbody = document.querySelector("#usersTable tbody");
      tbody.innerHTML = "";
      let totalUsed = 0;
      let countAll = 0, countActive = 0, countExpired = 0, countUnused = 0, countDisabled = 0;

      data.forEach(user => {
        const row = document.createElement("tr");
        row.setAttribute("data-status", user.status);
        row.setAttribute("data-used", user.used_gb);

        let statusIcon = "✅";
        if (user.status.includes("منتهي")) statusIcon = "🟡";
        else if (user.status.includes("معطل")) statusIcon = "❌";
        else if (user.status.includes("غير مستخدم")) statusIcon = "🔵";

        row.innerHTML = `
          <td>
            <select onchange="handleAction(this, '${user.name}')">
              <option value="">⚙️ الحالة</option>
              <option value="disable">تعطيل</option>
              <option value="enable">تفعيل</option>
              <option value="delete">حذف</option>
            </select>
            <button onclick="showRenewModal('${user.name}')">🔄 تجديد</button>
          </td>
          <td>${statusIcon} ${user.status}</td>
          <td>${user.remain_gb}</td>
          <td>${user.used_gb}</td>
          <td>${user.limit_gb}</td>
          <td>${user.name}</td>
        `;

        tbody.appendChild(row);

        totalUsed += parseFloat(user.used_gb) || 0;
        countAll++;
        if (user.status.includes("مفعل")) countActive++;
        else if (user.status.includes("منتهي")) countExpired++;
        else if (user.status.includes("غير مستخدم")) countUnused++;
        else if (user.status.includes("معطل")) countDisabled++;
      });

      document.getElementById("totalUsed").textContent = totalUsed.toFixed(2);
      document.getElementById("countAll").textContent = countAll;
      document.getElementById("countActive").textContent = countActive;
      document.getElementById("countExpired").textContent = countExpired;
      document.getElementById("countUnused").textContent = countUnused;
      document.getElementById("countDisabled").textContent = countDisabled;

      filterUsers();
    });
}

function filterUsers() {
  const selected = document.getElementById("statusFilter").value;
  const rows = document.querySelectorAll("#usersTable tbody tr");
  rows.forEach(row => {
    const status = row.getAttribute("data-status");
    row.style.display = (selected === "الكل" || status.includes(selected)) ? "" : "none";
  });
}


function handleAction(select, username) {
  const action = select.value;
  if (!action) return;

  if (action === "delete" && !confirm("هل تريد حذف الكرت؟")) {
    select.value = "";
    return;
  }

  fetch(`${action}_user.php`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `username=${username}`
  })
    .then(res => res.json())
    .then(res => {
      if (res.success) {
        setTimeout(() => {
          updateSingleUser(username);
        }, 1500); // تأخير بسيط حتى تتم العملية
      } else {
        alert("فشل تنفيذ العملية");
      }
    });

  select.value = "";
}

function showRenewModal(username) {
  closeRenewModal(); // اغلق أي نافذة سابقة أولاً

  const modal = document.createElement("div");
  modal.className = "renew-modal";

  modal.innerHTML = `
    <div class="modal-content">
      <p style="font-weight:bold; font-size:16px; margin-bottom:10px;">
        🆔 تجديد الكرت: <span style="color:#007bff">${username}</span>
      </p>
      <label><input type="radio" name="renewOption" value="renew" checked> 🔄 تجديد</label><br>
      <label><input type="radio" name="renewOption" value="1"> 1 جيجا</label><br>
      <label><input type="radio" name="renewOption" value="2"> 2 جيجا</label><br>
      <label><input type="radio" name="renewOption" value="9"> 9 جيجا</label><br><br>
      <button onclick="confirmRenew('${username}')">تم</button>
      <button onclick="closeRenewModal()">إلغاء</button>
    </div>
  `;

  document.body.appendChild(modal);
}

function closeRenewModal() {
  const modal = document.querySelector(".renew-modal");
  if (modal) modal.remove();
}

function confirmRenew(username) {
  alert("📣 تم الضغط على زر تجديد للكرت: " + username);

  const selected = document.querySelector("input[name='renewOption']:checked").value;

  fetch("renew_user.php", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `username=${encodeURIComponent(username)}&option=${encodeURIComponent(selected)}`
  })
    .then(res => res.json())
    .then(res => {
      alert("📥 استجابة السيرفر: " + JSON.stringify(res));

      if (res.success) {
        closeRenewModal();
        setTimeout(() => {
          updateSingleUser(username);
        }, 1500);

        let message = "";
        if (selected === "renew") {
          message = `✅ تم تجديد الكرت ${username} (تصفير الاستهلاك فقط)`;
        } else {
          message = `✅ تم تجديد الكرت ${username} + إضافة ${selected} جيجا`;
        }

        alert(message);
      } else {
        alert("❌ فشل التجديد: " + (res.error || "سبب غير معروف"));
      }
    })
    .catch(err => {
      alert("❌ حدث خطأ في الاتصال: " + err);
    });
}
function updateSingleUser(username) {
  fetch("get_users.php")
    .then(res => res.json())
    .then(data => {
      const user = data.find(u => u.name === username);
      if (!user) return;

      const rows = document.querySelectorAll("#usersTable tbody tr");
      rows.forEach(row => {
        if (row.cells[5].textContent === username) {
          row.setAttribute("data-status", user.status);
          row.setAttribute("data-used", user.used_gb);

          let statusIcon = "✅";
          if (user.status.includes("معطل")) statusIcon = "❌";
          else if (user.status.includes("غير مستخدم")) statusIcon = "🔵";
          else if (user.status.includes("منتهي")) statusIcon = "🟡";

          row.cells[1].innerHTML = `${statusIcon} ${user.status}`;
          row.cells[2].textContent = user.remain_gb;
          row.cells[3].textContent = user.used_gb;
          row.cells[4].textContent = user.limit_gb;
        }
      });
    });
}

document.getElementById("searchInput").addEventListener("input", function () {
  const searchValue = this.value.toLowerCase();
  const rows = document.querySelectorAll("#usersTable tbody tr");

  rows.forEach(row => {
    const username = row.querySelector("td:last-child").textContent.toLowerCase();
    row.style.display = username.includes(searchValue) ? "" : "none";
  });
});