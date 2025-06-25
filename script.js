const rows = ["Bear Left", "Left", "Thru", "Right", "Bear Right", "U-turn"];
let currentRow = 0;
const table = document.getElementById("counter-table").getElementsByTagName("tbody")[0];

// Highlight current row
function highlightRow() {
  [...table.rows].forEach((tr, i) => {
    tr.style.backgroundColor = i === currentRow ? "#333" : "transparent";
  });
}
highlightRow();

// Increment counter
function increment(rowIndex, colIndex) {
  const cell = table.rows[rowIndex].cells[colIndex + 1];
  const oldValue = parseInt(cell.textContent);
  const newValue = oldValue + 1;

  cell.textContent = newValue;

  // 🔔 Add highlight class
  cell.classList.add("counter-animate");

  // 🕒 Remove after short delay (e.g., 400ms)
  setTimeout(() => {
    cell.classList.remove("counter-animate");
  }, 400);
}

// Keyboard fallback
document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowUp" || e.key.toLowerCase() === "w") {
    currentRow = (currentRow - 1 + 6) % 6;
  }
  if (e.key === "ArrowDown" || e.key.toLowerCase() === "s") {
    currentRow = (currentRow + 1) % 6;
  }

  const keysToColumn = {
    "1": 0, "2": 1, "3": 2, "4": 3,
    "5": 4, "6": 5, "7": 6, "8": 7,
        };

  if (keysToColumn.hasOwnProperty(e.key)) {
    increment(currentRow, keysToColumn[e.key]);
  }

  highlightRow();
});

// Reset and Save
document.getElementById("reset").addEventListener("click", () => {
  [...table.rows].forEach(row => {
    [...row.cells].forEach((cell, i) => {
      if (i > 0) cell.textContent = "0";
    });
  });
});

document.getElementById("save").addEventListener("click", () => {
  const data = [...table.rows].map(row => ({
    direction: row.cells[0].textContent,
    car: row.cells[1].textContent,
    lgv: row.cells[2].textContent,
    ogv1: row.cells[3].textContent,
    ogv2: row.cells[4].textContent,
    bus: row.cells[5].textContent,
    mc: row.cells[6].textContent,
    pc: row.cells[7].textContent,
    peds: row.cells[8].textContent
  }));

  localStorage.setItem("alienTrafficCounts", JSON.stringify(data));
  alert("Saved to localStorage!");
});

// 🎮 Gamepad logic
let lastButtons = [];

function pollGamepad() {
  const gamepads = navigator.getGamepads();
  const gp = gamepads[0];
  if (!gp) return;

  const buttons = gp.buttons.map(btn => btn.pressed);
  const axes = gp.axes;

  // Set currentRow using shoulder buttons (direction movement)
  const bearLeft = buttons[6];
  const bearRight = buttons[7];
  const left = buttons[4];
  const right = buttons[5];

  if (bearLeft && bearRight) currentRow = 5;     // U-turn
  else if (bearLeft) currentRow = 0;             // Bear Left
  else if (left) currentRow = 1;                 // Left
  else if (right) currentRow = 3;                // Right
  else if (bearRight) currentRow = 4;            // Bear Right
  else currentRow = 2;                           // Default → Thru

    // 🚀 CLASSIFICATION — FACE BUTTONS
  const faceButtonMap = {
    0: 4, // Triangle → Bus
    1: 5, // Circle   → MC
    2: 6, // Cross    → PC
    3: 7  // Square   → Peds
  };

  for (let [btnStr, col] of Object.entries(faceButtonMap)) {
    const btn = parseInt(btnStr);
    if (buttons[btn] && !lastButtons[btn]) {
      increment(currentRow, col);
    }
    lastButtons[btn] = buttons[btn]; // Update state
  }

  // 🧭 CLASSIFICATION — D-Pad via AXES
  const deadzone = 0.5;

  if (axes[1] < -deadzone && !lastButtons['car']) {
    increment(currentRow, 0); // Car
    lastButtons['car'] = true;
  } else if (axes[1] > -deadzone) {
    lastButtons['car'] = false;
  }

  if (axes[0] > deadzone && !lastButtons['lgv']) {
    increment(currentRow, 1); // LGV
    lastButtons['lgv'] = true;
  } else if (axes[0] < deadzone) {
    lastButtons['lgv'] = false;
  }

  if (axes[0] < -deadzone && !lastButtons['ogv1']) {
    increment(currentRow, 3); // OGV1
    lastButtons['ogv1'] = true;
  } else if (axes[0] > -deadzone) {
    lastButtons['ogv1'] = false;
  }

  if (axes[1] > deadzone && !lastButtons['ogv2']) {
    increment(currentRow, 2); // OGV2
    lastButtons['ogv2'] = true;
  } else if (axes[1] < deadzone) {
    lastButtons['ogv2'] = false;
  }

  highlightRow();
 }
 function gamepadLoop() {
  pollGamepad();
  requestAnimationFrame(gamepadLoop);
 }

 window.addEventListener("gamepadconnected", () => {
  console.log("🎮 Gamepad connected!");
  requestAnimationFrame(gamepadLoop);
  
});

// 🧾 Display Employee Info
const employeeName = localStorage.getItem("currentEmployee") || "N/A";
const employeeId = localStorage.getItem("currentID") || "N/A";
const role = localStorage.getItem("currentRole") || "N/A";

document.getElementById("employeeLabel").textContent = `Name: ${employeeName}`;
document.getElementById("employeeIdLabel").textContent = ` | ID: ${employeeId}`;
document.getElementById("roleLabel").textContent = ` | Role: ${role}`;


