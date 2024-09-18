// Import necessary modules
const { VM, VMScript } = require('vm2'); // Secure sandboxing of code execution
const readline = require('readline'); // For reading input from the terminal
const { ESLint } = require("eslint"); // ESLint for linting the user's script.
const util = require('util'); // Utilities module
const esprima = require('esprima'); // JavaScript parser to generate an AST (Abstract Syntax Tree)
const escodegen = require('escodegen'); // Generate code back from AST

const TIMEOUT = 12000; // Time limit for script execution (12 seconds)
const MEMORY_LIMIT = 40; // Memory limit for script execution (40 MB)

// Parameters that will be passed to the user's script as arguments
const mapping = {
  // Example mapping object
    "0": {
      "aggNum": "0",
      "axisType": "main_axis",
      "axisIndex": 0,
      "child": {
        "2": {
          "aggNum": "2",
          "axisType": "value_axis",
          "axisIndex": 0
        },
        "3": {
          "aggNum": "3",
          "axisType": "value_axis",
          "axisIndex": 1
        }
      }
    }
};

const esResult = {
  "took": 733,
  "timed_out": false,
  "_shards": {
    "total": 165,
    "successful": 165,
    "skipped": 0,
    "failed": 0
  },
  "hits": {
    "total": {
      "value": 10000,
      "relation": "gte"
    },
    "max_score": null,
    "hits": []
  },
  "aggregations": {
    "0": {
      "doc_count_error_upper_bound": 0,
      "sum_other_doc_count": 39642,
      "buckets": [
        {
          "2": {
            "value": 23.756694185019754
          },
          "3": {
            "value": 0
          },
          "key": "915223116800",
          "doc_count": 3453584
        },
        {
          "2": {
            "value": 24.210314931594326
          },
          "3": {
            "value": 4
          },
          "key": "915224948850",
          "doc_count": 3097077
        },
        {
          "2": {
            "value": 26.86186745152724
          },
          "3": {
            "value": 0
          },
          "key": "915227114550",
          "doc_count": 1817239
        },
        {
          "2": {
            "value": 28.22618997142203
          },
          "3": {
            "value": 0
          },
          "key": "915222737370",
          "doc_count": 369288
        },
        {
          "2": {
            "value": 28.309916358372206
          },
          "3": {
            "value": 0
          },
          "key": "__missing__",
          "doc_count": 50945
        }
      ]
    }
  }
};

const parameters = {
  // Parameters passed to user's script
  result: esResult,
  mapping: mapping,
  graphType: 'bar_vertical_percentage',
};

// Function to read multiline input from the terminal
function readUserScript() {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        prompt: '',
    });

    let script = ''; // Stores the user script

    console.log('Enter your script (type "END" on a new line to finish or type "EXIT" to terminate the process):');

    // Event listener for each new line of input
    rl.on('line', (line) => {
      if (line.trim() === 'END') {
          rl.close(); // Close input if user types 'END'
      }
      else if (line.trim() === 'EXIT') {
        process.exit(1); // Exit the process if user types 'EXIT'
      } 
      else {
          script += line + '\n'; // Add the input to the script
      }
    }).on('close', async () => {
        const lintPassed = await lintUserScript(script); // Lint the script
        if (lintPassed) {
            consoleHandler.clear(); // Clear previous logs
            await executeUserScript(script); // Execute the user's script
            readUserScript(); // Prompt for another script input
        } else {
            console.error('Linting failed. Please fix the issues and try again.');
            readUserScript(); // Restart the input process
        }
    });
}

// Function to execute the user's script
async function executeUserScript(userScript) {
  const vm = new VM({ 
      timeout: TIMEOUT, // Set timeout limit for execution
      sandbox: {
          console:  consoleHandler, // Redirect console logs to custom handler
          Math: Math,
          JSON: JSON,
          Date: Date,
          RegExp: RegExp,
          Error: Error,
          TypeError: TypeError,
          RangeError: RangeError,
          SyntaxError: SyntaxError,
          util: { // Limited utilities provided in the sandbox
              types: {
                  ...util.types,
                  isRegExp: (obj) => obj instanceof RegExp || Object.prototype.toString.call(obj) === '[object RegExp]'
              },
              format: util.format
          },
          Object: Object,
          checkMemoryUsage: checkMemoryUsage // Custom memory usage function
      },
      eval: false,
      wasm: false, // Disable WebAssembly for security
      allowAsync: true, // Allow asynchronous execution
      fixAsync: true,
  });

  try {
      const modifiedScript = injectMemoryUsageChecks(userScript); // Inject memory usage checks into script
      console.log("output", modifiedScript);
      const script = new VMScript(modifiedScript, 'Preprocess_User_Script'); // Create a virtual machine script
      await runScriptWithMemoryLimit(vm, script); // Run the script with memory limits

      const mainFunction = vm.sandbox.main; // Retrieve the main function from the sandbox

      if (typeof mainFunction !== 'function') {
          console.log('The script must contain a "main" function.'); // Error if no main function
      }

      const args = [parameters.result, parameters.mapping, parameters.graphType]; // Example arguments passed to main

      // Execute the 'main' function with arguments
      const result = await runScriptWithMemoryLimit(vm, `main.apply(null, ${JSON.stringify(args)});`);

      console.log('Result from User Script:\n', JSON.stringify(result, null, 2)); // Display the result
      printConsoleLogs(); // Print logs collected during execution

  } catch (err) {
      console.error('Error executing user script:');
      const errorStack = err.stack;
      const match = errorStack.match(/([\s\S]*?)(\n\s*at\s.*|$)/); // Extract error message before the stack trace
      if (match) {
          console.error(match[1]); // Print the error message
      } else {
          console.error(err.message); // Print the general error message
      }
  }
}

// Function to lint the user's script using ESLint
async function lintUserScript(script) {
  const eslint = new ESLint(); // Create an ESLint instance
  const results = await eslint.lintText(script); // Lint the script text

  let hasErrors = false;
  for (const result of results) {
    for (const message of result.messages) {
      if (message.severity === 2) { // Error messages
        console.error(`ESLint Error: ${message.message} (${message.ruleId})`);
        console.error(`  Line ${message.line}, Column ${message.column}`);
        hasErrors = true;
      } else { // Warnings
        console.warn(`ESLint Warning: ${message.message} (${message.ruleId})`);
        console.warn(`  Line ${message.line}, Column ${message.column}`);
      }
    }
  }
  
  return !hasErrors; // Return true if no errors
}

// Custom console handler to log and store console output
const consoleHandler = {
  logs: [],
  log: function(...args) {
      this.logs.push(args.map(arg => String(arg)).join(' ')); // Store log output
  },
  error: function(...args) {
      this.logs.push('ERROR: ' + args.map(arg => String(arg)).join(' ')); // Store error messages
  },
  warn: function(...args) {
      this.logs.push('WARNING: ' + args.map(arg => String(arg)).join(' ')); // Store warnings
  },
  clear: function() {
      this.logs = []; // Clear the log
  }
};

// Function to run the script within the VM and monitor memory usage
function runScriptWithMemoryLimit(vm, script) {
  return new Promise((resolve, reject) => {
    function executeScript() {
      try {
        const result = vm.run(script); // Execute the script
        resolve(result); // Resolve the result
      } catch (error) {
        reject(error); // Reject on error
      }
    }
    setImmediate(executeScript); // Start after event loop cycle
  });
}

// Function to check memory usage and throw an error if the limit is exceeded
function checkMemoryUsage() {
  const maxMemoryMB = MEMORY_LIMIT;
  const memoryUsage = process.memoryUsage();
  const usedMemoryMB = memoryUsage.heapUsed / 1024 / 1024; // Convert to MB
  // console.log('Memory usage: ',usedMemoryMB.toFixed(2),' MB of ',maxMemoryMB,' MB limit');
  
  if (usedMemoryMB > maxMemoryMB) {
    printConsoleLogs();
    const er_st = 'Memory limit exceeded: '+ usedMemoryMB.toFixed(2) + 'MB used of ' + maxMemoryMB + 'MB allowed';
    throw new Error(er_st);
  }
}

// Inject memory checks into the user's script
function injectMemoryUsageChecks(userScript) {
  const ast = esprima.parse(userScript, { ecmaVersion: 2024 }); // Parse the user's script into an AST

  // Walk through the AST and inject memory checks
  function walkNode(node) {
    if (node.type === 'FunctionDeclaration') {
      node.body.body.unshift({
        type: 'ExpressionStatement',
        expression: {
          type: 'CallExpression',
          callee: {
            type: 'Identifier',
            name: 'checkMemoryUsage'
          },
          arguments: []
        }
      });
    } else if (node.type === 'WhileStatement' || node.type === 'ForStatement' || node.type === 'DoWhileStatement') {
      if (node.body.type !== 'BlockStatement') {
        node.body = {
          type: 'BlockStatement',
          body: [node.body]
        };
      }
      node.body.body.unshift({
        type: 'ExpressionStatement',
        expression: {
          type: 'CallExpression',
          callee: {
            type: 'Identifier',
            name: 'checkMemoryUsage'
          },
          arguments: []
        }
      });
    }
    // Recursively walk through child nodes
    for (const key in node) {
      if (node[key] && typeof node[key] === 'object') {
        walkNode(node[key]); // Continue walking the tree
      }
    }
  }

  walkNode(ast); // Start walking the AST

  return escodegen.generate(ast); // Convert AST back to JavaScript
}

// Print all the collected console logs
function printConsoleLogs() {
  console.log("\nConsole Outputs of Script:");
  consoleHandler.logs.forEach(log => console.log(log)); // Print each log entry
}

// Start reading user input from the terminal
readUserScript();
