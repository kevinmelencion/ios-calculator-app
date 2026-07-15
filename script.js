const expressionDisplay = document.getElementById('expression');
const resultDisplay = document.getElementById('result');
const clearButton = document.querySelector('[data-type="clear"]');

let firstValue = null;
let operator = null;
let waitingForSecondValue = false;
let displayValue = '0';
let audioContext = null;

function updateDisplay() {
  resultDisplay.textContent = displayValue;
}

function shouldUseAllClear() {
  return displayValue === '0' && firstValue === null && operator === null && !waitingForSecondValue;
}

function updateClearButton() {
  if (clearButton) {
    clearButton.textContent = shouldUseAllClear() ? 'AC' : 'C';
  }
}

function playButtonSound() {
  if (typeof window === 'undefined') {
    return;
  }

  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }

  if (audioContext.state === 'suspended') {
    audioContext.resume();
  }

  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.type = 'sine';
  oscillator.frequency.setValueAtTime(660, audioContext.currentTime);
  oscillator.frequency.exponentialRampToValueAtTime(520, audioContext.currentTime + 0.05);

  gainNode.gain.setValueAtTime(0.0001, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.03, audioContext.currentTime + 0.01);
  gainNode.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.08);

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  oscillator.start();
  oscillator.stop(audioContext.currentTime + 0.09);
}

function clearCalculator(clearAll = true) {
  if (clearAll) {
    firstValue = null;
    operator = null;
    waitingForSecondValue = false;
    displayValue = '0';
    expressionDisplay.textContent = '0';
  } else {
    displayValue = '0';
    waitingForSecondValue = false;
    expressionDisplay.textContent = '0';
    firstValue = null;
    operator = null;
  }

  updateDisplay();
  updateClearButton();
}

function appendNumber(number) {
  if (waitingForSecondValue) {
    displayValue = number;
    waitingForSecondValue = false;
  } else {
    displayValue = displayValue === '0' ? number : displayValue + number;
  }

  updateDisplay();
  updateClearButton();
}

function appendDecimal() {
  if (waitingForSecondValue) {
    displayValue = '0.';
    waitingForSecondValue = false;
  } else if (!displayValue.includes('.')) {
    displayValue += '.';
  }

  updateDisplay();
  updateClearButton();
}

function setOperator(nextOperator) {
  const inputValue = Number(displayValue);

  if (operator && waitingForSecondValue) {
    operator = nextOperator;
    expressionDisplay.textContent = `${firstValue} ${operator}`;
    return;
  }

  if (firstValue === null) {
    firstValue = inputValue;
  } else if (operator) {
    const result = calculate(firstValue, inputValue, operator);
    displayValue = String(result);
    firstValue = result;
  }

  waitingForSecondValue = true;
  operator = nextOperator;
  expressionDisplay.textContent = `${firstValue} ${operator}`;
  updateDisplay();
  updateClearButton();
}

function calculate(first, second, currentOperator) {
  switch (currentOperator) {
    case '+':
      return first + second;
    case '-':
      return first - second;
    case '*':
      return first * second;
    case '/':
      return second === 0 ? 'Error' : first / second;
    default:
      return second;
  }
}

function handleEquals() {
  if (operator === null) {
    return;
  }

  const secondValue = Number(displayValue);
  const result = calculate(firstValue, secondValue, operator);

  displayValue = String(result);
  expressionDisplay.textContent = `${firstValue} ${operator} ${secondValue} =`;
  firstValue = result;
  operator = null;
  waitingForSecondValue = false;
  updateDisplay();
  updateClearButton();
}

function toggleSign() {
  displayValue = String(Number(displayValue) * -1);
  updateDisplay();
  updateClearButton();
}

function handleBackspace() {
  if (waitingForSecondValue) {
    displayValue = '0';
    waitingForSecondValue = false;
  } else if (displayValue.length <= 1 || (displayValue.length === 2 && displayValue.startsWith('-'))) {
    displayValue = '0';
  } else {
    displayValue = displayValue.slice(0, -1);
  }

  updateDisplay();
  updateClearButton();
}

function handleButton(button) {
  playButtonSound();

  const { type, value } = button.dataset;

  if (type === 'number') {
    appendNumber(value);
    return;
  }

  if (type === 'decimal') {
    appendDecimal();
    return;
  }

  if (type === 'clear') {
    clearCalculator(shouldUseAllClear());
    return;
  }

  if (type === 'sign') {
    toggleSign();
    return;
  }

  if (type === 'backspace') {
    handleBackspace();
    return;
  }

  if (type === 'operator') {
    if (value === '=') {
      handleEquals();
    } else {
      setOperator(value);
    }
  }
}

function handleKeyboardInput(event) {
  const { key } = event;

  if (/^[0-9]$/.test(key)) {
    appendNumber(key);
    event.preventDefault();
    return;
  }

  if (key === '.') {
    appendDecimal();
    event.preventDefault();
    return;
  }

  if (['+', '-', '*', '/'].includes(key)) {
    setOperator(key);
    event.preventDefault();
    return;
  }

  if (key === '=' || key === 'Enter') {
    handleEquals();
    event.preventDefault();
    return;
  }

  if (key === 'Backspace') {
    handleBackspace();
    event.preventDefault();
    return;
  }

  if (key === 'Escape' || key === 'c' || key === 'C') {
    clearCalculator(shouldUseAllClear());
    event.preventDefault();
  }
}

document.querySelectorAll('.btn').forEach((button) => {
  button.addEventListener('click', () => handleButton(button));
});

document.addEventListener('keydown', handleKeyboardInput);

updateDisplay();
updateClearButton();
