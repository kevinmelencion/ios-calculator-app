const expressionDisplay = document.getElementById('expression');
const resultDisplay = document.getElementById('result');

let firstValue = null;
let operator = null;
let waitingForSecondValue = false;
let displayValue = '0';

function updateDisplay() {
  resultDisplay.textContent = displayValue;
}

function clearCalculator() {
  firstValue = null;
  operator = null;
  waitingForSecondValue = false;
  displayValue = '0';
  expressionDisplay.textContent = '0';
  updateDisplay();
}

function appendNumber(number) {
  if (waitingForSecondValue) {
    displayValue = number;
    waitingForSecondValue = false;
  } else {
    displayValue = displayValue === '0' ? number : displayValue + number;
  }

  updateDisplay();
}

function appendDecimal() {
  if (waitingForSecondValue) {
    displayValue = '0.';
    waitingForSecondValue = false;
  } else if (!displayValue.includes('.')) {
    displayValue += '.';
  }

  updateDisplay();
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
}

function toggleSign() {
  displayValue = String(Number(displayValue) * -1);
  updateDisplay();
}

function applyPercent() {
  displayValue = String(Number(displayValue) / 100);
  updateDisplay();
}

document.querySelectorAll('.btn').forEach((button) => {
  button.addEventListener('click', () => {
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
      clearCalculator();
      return;
    }

    if (type === 'sign') {
      toggleSign();
      return;
    }

    if (type === 'percent') {
      applyPercent();
      return;
    }

    if (type === 'operator') {
      if (value === '=') {
        handleEquals();
      } else {
        setOperator(value);
      }
    }
  });
});

updateDisplay();
