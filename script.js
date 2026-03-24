// Airport codes map
const AIRPORT_NAMES = {
  LHR: "Heathrow", LGW: "Gatwick", STN: "Stansted", LTN: "Luton", MAN: "Manchester",
  BHX: "Birmingham", EDI: "Edinburgh", GLA: "Glasgow", BRS: "Bristol", NCL: "Newcastle",
  EMA: "East Midlands", LBA: "Leeds Bradford", LPL: "Liverpool", ABZ: "Aberdeen",
  BFS: "Belfast", CWL: "Cardiff", SOU: "Southampton", DSA: "Doncaster Sheffield"
};

// Data storage
let outDate = "";
let outTime = "06:00";
let inDate = "";
let inTime = "12:00";
let selectedAirport = "";
let currentStep = 1;

// Date helper
function datePlus(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}

function formatDateForDisplay(dateStr) {
  const d = new Date(dateStr + "T00:00:00");
  const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

function calculateDays(start, end) {
  const d1 = new Date(start);
  const d2 = new Date(end);
  const diff = Math.abs(d2 - d1);
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

// Initialize
function init() {
  // Get airport from URL
  const params = new URLSearchParams(window.location.search);
  const locationParam = params.get("Location") || params.get("location");

  if (locationParam && AIRPORT_NAMES[locationParam.toUpperCase()]) {
    selectedAirport = locationParam.toUpperCase();
    document.title = `${AIRPORT_NAMES[selectedAirport]} Airport Parking - Holiday Extras`;
  } else {
    // Show airport selector
    document.getElementById("airportSelector").style.display = "block";
    populateAirportSelector();
    document.title = "Airport Parking - Holiday Extras";
  }

  // Generate slot symbols
  generateDateReels();

  // Event listeners
  document.getElementById("spinBtn").addEventListener("click", spinReels);
  document.getElementById("continueFromTimes").addEventListener("click", goToSummary);
  document.getElementById("launchSearch").addEventListener("click", launchSearch);

  // Flipper buttons
  document.querySelectorAll(".flipper").forEach(btn => {
    btn.addEventListener("click", handleFlipper);
  });
}

function populateAirportSelector() {
  const select = document.getElementById("departAirport");
  Object.entries(AIRPORT_NAMES).forEach(([code, name]) => {
    const option = document.createElement("option");
    option.value = code;
    option.textContent = `${name} (${code})`;
    select.appendChild(option);
  });

  select.addEventListener("change", (e) => {
    selectedAirport = e.target.value;
    document.title = `${AIRPORT_NAMES[selectedAirport]} Airport Parking - Holiday Extras`;
  });

  // Set default
  selectedAirport = "LGW";
  select.value = "LGW";
}

// Slot Machine Logic
function generateDateReels() {
  const outDateSymbols = document.getElementById("outDateSymbols");
  const inDateSymbols = document.getElementById("inDateSymbols");

  // Generate 30 dates for outDate (tomorrow onwards)
  outDateSymbols.innerHTML = "";
  for (let i = 1; i <= 30; i++) {
    const date = datePlus(i);
    const div = document.createElement("div");
    div.className = "reel-symbol";
    div.textContent = formatDateForDisplay(date);
    div.dataset.value = date;
    outDateSymbols.appendChild(div);
  }

  // Generate 30 dates for inDate (start from +9 days)
  inDateSymbols.innerHTML = "";
  for (let i = 9; i <= 38; i++) {
    const date = datePlus(i);
    const div = document.createElement("div");
    div.className = "reel-symbol";
    div.textContent = formatDateForDisplay(date);
    div.dataset.value = date;
    inDateSymbols.appendChild(div);
  }
}

function spinReels() {
  const outDateSymbols = document.getElementById("outDateSymbols");
  const inDateSymbols = document.getElementById("inDateSymbols");

  // Random spin positions
  const outIndex = Math.floor(Math.random() * 15) + 1; // Days 2-16
  const inIndex = Math.floor(Math.random() * 15) + 8;  // Days 9-23 (relative to today)

  // Calculate transform
  const outTransform = -(outIndex * 100);
  const inTransform = -(inIndex * 100);

  // Apply spin animation
  outDateSymbols.style.transform = `translateY(${outTransform}px)`;
  inDateSymbols.style.transform = `translateY(${inTransform}px)`;

  // Play sound effect (visual feedback)
  const spinBtn = document.getElementById("spinBtn");
  spinBtn.textContent = "SPINNING...";
  spinBtn.disabled = true;

  // After spin completes
  setTimeout(() => {
    const outSymbols = outDateSymbols.querySelectorAll(".reel-symbol");
    const inSymbols = inDateSymbols.querySelectorAll(".reel-symbol");

    outDate = outSymbols[outIndex].dataset.value;
    inDate = inSymbols[inIndex].dataset.value;

    // Activate coin 1
    document.getElementById("coin1").classList.add("active");

    // Move to step 2
    setTimeout(() => {
      currentStep = 2;
      document.getElementById("step1").style.display = "none";
      document.getElementById("step2").style.display = "block";
    }, 500);
  }, 1000);
}

// Flipper Time Selector
function handleFlipper(e) {
  const target = e.currentTarget.dataset.target;
  const direction = parseInt(e.currentTarget.dataset.direction);

  if (target === "outTime") {
    let hour = parseInt(outTime.split(":")[0]);
    hour = (hour + direction + 24) % 24;
    outTime = `${hour.toString().padStart(2, "0")}:00`;
    document.getElementById("outTimeDisplay").textContent = outTime;
  } else if (target === "inTime") {
    let hour = parseInt(inTime.split(":")[0]);
    hour = (hour + direction + 24) % 24;
    inTime = `${hour.toString().padStart(2, "0")}:00`;
    document.getElementById("inTimeDisplay").textContent = inTime;
  }

  // Visual feedback
  e.currentTarget.style.transform = "scale(1.2)";
  setTimeout(() => {
    e.currentTarget.style.transform = "";
  }, 150);
}

function goToSummary() {
  // Activate coin 2
  document.getElementById("coin2").classList.add("active");

  // Populate summary
  const airportName = selectedAirport ? AIRPORT_NAMES[selectedAirport] : "Selected Airport";
  document.getElementById("summaryAirport").textContent = airportName;
  document.getElementById("summaryOut").textContent = `${formatDateForDisplay(outDate)} at ${outTime}`;
  document.getElementById("summaryIn").textContent = `${formatDateForDisplay(inDate)} at ${inTime}`;
  document.getElementById("summaryDays").textContent = `${calculateDays(outDate, inDate)} DAYS`;

  // Move to step 3
  currentStep = 3;
  document.getElementById("step2").style.display = "none";
  document.getElementById("step3").style.display = "block";

  // Activate coin 3
  setTimeout(() => {
    document.getElementById("coin3").classList.add("active");
  }, 300);
}

function launchSearch() {
  const btn = document.getElementById("launchSearch");
  btn.textContent = "🚀 LAUNCHING... 🚀";
  btn.disabled = true;

  // Countdown animation
  let count = 3;
  const countdownInterval = setInterval(() => {
    btn.textContent = `🚀 ${count}... 🚀`;
    count--;

    if (count < 0) {
      clearInterval(countdownInterval);
      redirect();
    }
  }, 800);
}

function redirect() {
  // Get params from URL
  const params = new URLSearchParams(window.location.search);
  const agent = params.get("agent") || "WY992";
  const adcode = params.get("adcode") || "";
  const promotionCode = params.get("promotionCode") || "";
  const flight = params.get("flight") || "default";

  // Determine domain - HX stays on www
  const host = window.location.host;
  const isLocal = host.startsWith("127") || host.includes("github.io");
  const basedomain = isLocal ? "www.holidayextras.com" : host;

  // Format times for URL (HH%3A00)
  const outTimeEncoded = outTime.replace(":", "%3A");
  const inTimeEncoded = inTime.replace(":", "%3A");

  // Assemble search URL
  const depart = selectedAirport || "LGW";
  const searchUrl = `https://${basedomain}/static/?selectProduct=cp&#/categories?agent=${agent}&ppts=&customer_ref=&lang=en&adults=2&depart=${depart}&terminal=&arrive=&flight=${flight}&in=${inDate}&out=${outDate}&park_from=${outTimeEncoded}&park_to=${inTimeEncoded}&filter_meetandgreet=&filter_parkandride=&children=0&infants=0&redirectReferal=carpark&from_categories=true&adcode=${adcode}&promotionCode=${promotionCode}`;

  window.location.href = searchUrl;
}

// Initialize on load
document.addEventListener("DOMContentLoaded", init);
