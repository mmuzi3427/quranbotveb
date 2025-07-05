let counterInput, steps, incrementor, decrementor, resetter;

const COUNTER_VAR = "tasbih_counter";
const STEP_VAR = "tasbih_step";

// Faqat raqam kiritish
function setInputFilter(textbox, inputFilter) {
  ["input", "keydown", "keyup", "mousedown", "mouseup", "select", "contextmenu", "drop"].forEach(function(event) {
    textbox.addEventListener(event, function() {
      if (inputFilter(this.value)) {
        this.oldValue = this.value;
        this.oldSelectionStart = this.selectionStart;
        this.oldSelectionEnd = this.selectionEnd;
      } else if (this.hasOwnProperty("oldValue")) {
        this.value = this.oldValue;
        this.setSelectionRange(this.oldSelectionStart, this.oldSelectionEnd);
      } else {
        this.value = "";
      }
    });
  });
}

// Cookie saqlash
function setCookie(name, value) {
  const date = new Date();
  date.setFullYear(date.getFullYear() + 3);
  document.cookie = `${name}=${value}; expires=${date.toUTCString()}; path=/; SameSite=Strict`;
}

// Cookie o‘qish
function getCookie(name) {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? match[2] : null;
}

// Yangilash
function updateDisplay(value) {
  counterInput.value = value;
  setCookie(COUNTER_VAR, value);
}

// Qo‘shish
function incrementCounter() {
  let current = parseInt(counterInput.value) || 0;
  let step = parseInt(steps.value);
  updateDisplay(current + step);
}

// Ayirish
function decrementCounter() {
  let current = parseInt(counterInput.value) || 0;
  let step = parseInt(steps.value);
  updateDisplay(Math.max(current - step, 0));
}

// Reset
function resetCounter() {
  if (confirm("Message by @Quroneshitingbot\nHisobni 0 ga qaytarish\nIshonchingiz komilmi? ")) {
    updateDisplay(0);
  }
}

// DOM tayyor bo‘lsa
document.addEventListener("DOMContentLoaded", () => {
  counterInput = document.getElementById("counterInput");
  steps = document.getElementById("steps");
  incrementor = document.getElementById("incrementor");
  decrementor = document.getElementById("decrementor");
  resetter = document.getElementById("resetter");

  setInputFilter(counterInput, value => /^\d*$/.test(value));

  // Saqlangan qiymatlarni yuklash
  const savedCounter = parseInt(getCookie(COUNTER_VAR)) || 0;
  const savedStep = parseInt(getCookie(STEP_VAR)) || 1;

  counterInput.value = savedCounter;
  steps.value = savedStep;

  incrementor.onclick = incrementCounter;
  decrementor.onclick = decrementCounter;
  resetter.onclick = resetCounter;

  counterInput.onchange = () => updateDisplay(parseInt(counterInput.value) || 0);
  steps.onchange = () => setCookie(STEP_VAR, steps.value);
});
