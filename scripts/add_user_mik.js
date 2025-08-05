function showForm(type) {
  const singleTab = document.getElementById("singleTab");
  const multiTab = document.getElementById("multiTab");
  const singleForm = document.getElementById("singleForm");
  const multiForm = document.getElementById("multiForm");

  if (type === "single") {
    singleTab.classList.add("active");
    multiTab.classList.remove("active");
    singleForm.classList.remove("hidden");
    multiForm.classList.add("hidden");
  } else {
    singleTab.classList.remove("active");
    multiTab.classList.add("active");
    singleForm.classList.add("hidden");
    multiForm.classList.remove("hidden");
  }
}

function addSingleCard() {
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();
  const validity = document.getElementById("validity").value;
  const limit = document.getElementById("limit").value;
  const profile = document.getElementById("profile").value;
  const note = document.getElementById("note").value;
  const price = document.getElementById("price").value;
  const seller = document.getElementById("seller").value;
  const bindOnFirst = document.getElementById("bindOnFirst").checked;

  if (!username) {
    alert("⚠️ الرجاء إدخال اسم المستخدم");
    return;
  }

  const formData = new URLSearchParams();
  formData.append("username", username);
  formData.append("password", password);
  formData.append("validity", validity);
  formData.append("limit", limit);
  formData.append("profile", profile);
  formData.append("note", note);
  formData.append("price", price);
  formData.append("seller", seller);
  formData.append("bind", bindOnFirst ? "yes" : "no");

  fetch("PHP/add_user_mik.php", {
    method: "POST",
    body: formData
  })
    .then(res => res.text())
    .then(result => {
      alert("✅ " + result);
      addRowToTable(username, validity, price, note);
      clearSingleForm();
    })
    .catch(err => {
      alert("❌ فشل في إرسال البيانات إلى السيرفر");
      console.error(err);
    });
}

function clearSingleForm() {
  document.getElementById("username").value = "";
  document.getElementById("password").value = "";
  document.getElementById("validity").value = "30";
  document.getElementById("limit").value = "";
  document.getElementById("profile").value = "default";
  document.getElementById("note").value = "";
  document.getElementById("price").value = "";
  document.getElementById("seller").value = "";
  document.getElementById("bindOnFirst").checked = false;
}

function addRowToTable(username, validity, price, note) {
  const tbody = document.getElementById("cardsTableBody");
  const tr = document.createElement("tr");
  const now = new Date();
  const timestamp = now.toLocaleString('ar-EG');
  tr.innerHTML = `
    <td>${username}</td>
    <td>${validity} يوم</td>
    <td>${price}</td>
    <td>${note}</td>
    <td>${timestamp}</td>
  `;
  tbody.prepend(tr);
}

function filterTable() {
  const searchValue = document.getElementById("searchInput").value.toLowerCase();
  const rows = document.querySelectorAll("#cardsTableBody tr");

  rows.forEach(row => {
    const username = row.children[0].textContent.toLowerCase();
    row.style.display = username.includes(searchValue) ? "" : "none";
  });
}