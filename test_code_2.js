function main(result, mapping, graphType) {
  let sum = 0;
  
  // Simple for loop
  for (let i = 0; i < 10; i++) {
    sum += i;
  }
  
  // While loop
  let j = 0;
  while (j < 5) {
    sum += j * 2;
    j++;
  }
  
  // Do-while loop
  let k = 0;
  do {
    sum += k * 3;
    k++;
  } while (k < 3);
  
  // Nested loops
  for (let x = 0; x < 3; x++) {
    for (let y = 0; y < 3; y++) {
      sum += x * y;
    }
  }
  
  // Function with a loop
  function innerLoop(n) {
    let product = 1;
    for (let i = 1; i <= n; i++) {
      product *= i;
    }
    return product;
  }
  
  sum += innerLoop(4);
  
  // Arrow function with implicit return
  const double = x => x * 2;
  
  sum += double(5);
  
  // Immediately Invoked Function Expression (IIFE)
  sum += (function() {
    let val = 0;
    for (let i = 0; i < 3; i++) {
      val += i;
    }
    return val;
  })();
  
  // Object method
  const obj = {
    calculateValue() {
      let result = 0;
      for (let i = 0; i < 5; i++) {
        result += i * 3;
      }
      return result;
    }
  };
  
  sum += obj.calculateValue();
  
  // try-catch block with a loop
  try {
    for (let i = 0; i < 3; i++) {
      if (i === 2) {throw new Error('Test error');}
      sum += i;
    }
  } catch (error) {
    console.error(error.message);
  }
  
  // Switch statement with a loop
  const switchValue = 2;
  switch (switchValue) {
    case 1:
      sum += 10;
      break;
    case 2:
      for (let i = 0; i < 3; i++) {
        sum += i * 5;
      }
      break;
    default:
      sum += 1;
  }
  
  return sum;
}

// Additional function declaration
function helperFunction(a, b) {
  let result = 0;
  for (let i = a; i < b; i++) {
    if (i % 2 === 0) {
      result += i;
    }
  }
  return result;
}

// Class with methods containing loops
class Calculator {
  constructor(initialValue) {
    this.value = initialValue;
  }
  
  addSequence(n) {
    for (let i = 1; i <= n; i++) {
      this.value += i;
    }
  }
  
  multiplyBy(n) {
    let temp = this.value;
    this.value = 0;
    for (let i = 0; i < n; i++) {
      this.value += temp;
    }
  }
}

