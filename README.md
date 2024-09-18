## Documentation for the Script

#### Overview

This Node.js script allows users to enter their custom scripts via the terminal, validates them with ESLint, and executes them within a virtual machine (VM) with specified memory and time limits. It also tracks memory usage during the execution and provides detailed error handling and console output logging.

The script operates as a dynamic code execution environment where users can:

-   Input a custom script.
-   Have it linted for potential issues (syntax and style).
-   Execute the script within a sandboxed environment.
-   Observe memory usage during the execution, with checks injected into loops and functions to prevent excessive memory consumption.

#### Key Features:

1.  **Dynamic Code Input**: The script reads multi-line user input from the terminal and processes it.
2.  **ESLint Validation**: Before running the code, it checks the script for errors and warnings using ESLint.
3.  **Memory Usage Monitoring**: It automatically injects memory usage checks into loops and functions.
4.  **Sandboxed Execution with `vm2`**: The script runs in a secure sandbox with limited access to system resources, preventing malicious code execution.
5.  **Detailed Error and Output Logging**: Console logs and errors are captured, providing feedback on script execution.

----------

## File Details

#### Dependencies:

-   **vm2**: A module to run untrusted code with limited access to Node.js and the system.
-   **readline**: Provides an interface for reading input from the terminal.
-   **ESLint**: A linting utility to analyze the script for potential issues.
-   **esprima**: A JavaScript parser to parse and generate an abstract syntax tree (AST).
-   **escodegen**: Used to generate JavaScript code from the modified AST.

----------
### Parameters

-   **TIMEOUT**: 12000 ms (12 seconds)
-   **MEMORY_LIMIT**: 40 MB


### Main Functions and Their Roles

#### 1. `readUserScript()`

This function reads the user's script from the terminal. The input is expected to end with the string `END` on a new line. After reading the script, it performs linting using `lintUserScript()` and then executes the script if it passes linting.

##### Example Usage:

1.  The user is prompted to input a script.
2.  The script ends when the user types `END`.
3.  The script is linted for errors.
4.  If linting passes, the script is executed within a sandboxed environment.



```bash
Enter your script (type "END" on a new line to finish):
``` 

----------

#### 2. `executeUserScript(userScript)`

This function takes the user script as input, injects memory checks, and runs it in a sandboxed virtual machine (VM) using the `vm2` library. It ensures that the execution respects memory and time limits. If there is no `main()` function in the user's script, an error is thrown.

##### Example Usage:

-   After linting, the script is run in a sandbox.
-   The `main()` function is executed with the required parameters.



```js
const args = [parameters.result, parameters.mapping, parameters.graphType];
main.apply(null, args);
``` 

----------

#### 3. `injectMemoryUsageChecks(userScript)`

This function parses the user's script into an abstract syntax tree (AST) and injects memory checks (`checkMemoryUsage()`) at the start of each function and loop to monitor memory usage during execution. It uses `esprima` to parse the script and `escodegen` to regenerate the script with the injected checks.

##### Example:

The following script:


```js
function myFunction() {
  for (let i = 0; i < 10; i++) {
    // Some logic
  }
}
``` 

will be transformed into:


```js
function myFunction() {
  checkMemoryUsage();
  for (let i = 0; i < 10; i++) {
    checkMemoryUsage();
    // Some logic
  }
}
``` 

----------

#### 4. `checkMemoryUsage()`

This function monitors the memory usage of the script during execution. If the memory usage exceeds the predefined limit (`MEMORY_LIMIT`), it throws an error, terminating the execution.

##### Example:

If memory usage exceeds the limit, an error like this will be thrown:


```bash
Error: Memory limit exceeded: 41.2MB used of 40MB allowed
``` 

----------

#### 5. `lintUserScript(script)`

This function uses ESLint to check the user script for syntax and style issues. It logs any errors or warnings found during the linting process. The script will not execute if linting fails.

##### Example Linting Output:


```bash
ESLint Error: 'x' is assigned a value but never used (no-unused-vars)
  Line 5, Column 12
``` 

----------

#### 6. `runScriptWithMemoryLimit(vm, script, maxMemoryMB, timeout)`

This function runs the provided user script in the VM with specified memory and time limits. It ensures the script is executed asynchronously and yields control to the event loop using `setImmediate()`.

##### Example:

If the script runs longer than the specified timeout, an error like this will be thrown:


```bash
Error: Script execution timed out after 12000ms
``` 

----------

#### 7. `printConsoleLogs()`

This function prints the console logs collected during script execution. It captures logs, errors, and warnings, providing feedback on the script's output.

----------

#### Sample Script

Here’s an example of how a user can input and run a script using the program:

```js
Enter your script (type "END" on a new line to finish):

function main(result, mapping, graphType) {
  let sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += i;
  }
  return sum;
}
```
```bash
END
``` 

Output:

```bash
Result from user script:
45
``` 

----------

## Additional Notes:

1.  **Timeout Handling**: The script execution will terminate if it exceeds the 12-second (`TIMEOUT`) limit.
2.  **Memory Usage**: The memory usage is limited to 40MB (`MEMORY_LIMIT`), and the program will throw an error if the script uses more than the allowed memory.
3.  **Linting**: ESLint helps ensure that the user's script is free from common mistakes or bad practices before execution.

----------
## Instructions for Using the Script

This script allows you to input and execute your custom JavaScript code within a safe, memory-limited, and time-limited sandbox. Follow the instructions below to use it effectively.

### How to Use:

1.  **Run the Script**:
    
    -   Start the script using Node.js in your terminal.
    
    
    ```bash
    node app.js
    ``` 
    
2.  **Input Your Script**:
    
    -   Once the script starts, you'll be prompted to enter your JavaScript code.
    - Enter your code line by line.
    -   When you're finished, type `END` on a new line to signify the end of your input.
    -   Example:
        
       
        ```bash
        Enter your script (type "END" on a new line to finish):
        function main() {
          let sum = 0;
          for (let i = 0; i < 10; i++) {
            sum += i;
          }
          return sum;
        }
        END
        ``` 
        
3.  **Script Linting**:
    
    -   After entering your code, the script will automatically run **ESLint** to check for any potential syntax errors or warnings.
    -   If there are issues, you'll see the linting error messages, and you'll be prompted to correct your script before it can be executed.
4.  **Script Execution**:
    
    -   If your script passes linting, it will be executed within a sandboxed environment with a memory limit of 40MB and a timeout of 12 seconds.
    -   The `main()` function in your script will be called automatically, and its output will be displayed.
5.  **View Output**:
    
    -   After execution, the output from your script (if any) will be displayed.
    -   You will also see memory usage statistics and logs generated by the script.
6.  **Handling Errors**:
    
    -   If your script takes too long to execute or exceeds the memory limit, an error message will be displayed.
    -   Example errors:
        -   **Memory limit exceeded**: If your script uses more than 40MB of memory, execution will stop, and an error will be thrown.
        -   **Timeout**: If your script runs for more than 12 seconds, execution will stop, and you'll see a timeout error.

### Example of Use:

**Input:**


```bash 
Enter your script (type "END" on a new line to finish):
function main() {
  let sum = 0;
  for (let i = 0; i < 5; i++) {
    sum += i;
  }
  return sum;
}
END
``` 

**Output:**


```bash
Script execution completed.
Result from user script: 10
``` 

### Troubleshooting:

-   **ESLint Errors**: If your code has linting errors (e.g., unused variables, syntax issues), fix the errors as shown in the console before resubmitting your code.
-   **Memory Limit Exceeded**: Optimize your code if you see a memory limit error. Avoid creating large arrays or deep recursion that may consume excessive memory.
-   **Timeout Errors**: Ensure that your script finishes execution within 12 seconds by optimizing loops or using asynchronous functions when needed.


## How to Pass Arguments to the `main` Function

When writing a script, you may want to pass arguments to your `main()` function. In this system, the `args` variable is used to pass arguments from your custom script to the `main()` function.

Here’s how to properly set and pass arguments to `main()` when running your script.

### Steps for Passing Arguments to `main()`:

1.  **Define the `main()` function in your script**:
    
    -   The `main()` function should accept parameters (arguments) as you would normally do in any JavaScript function.
    -   Example:
        ```javascript
        function main(arg1, arg2, arg3) {
          console.log("Argument 1:", arg1);
          console.log("Argument 2:", arg2);
          console.log("Argument 3:", arg3);
        }
        ``` 
        
2.  **Set the `args` variable**:
    
    -   The `args` array will be automatically passed to your `main()` function by the system.
    -   You don't need to manually call `main()`; the script execution system will handle that for you.
    -   Set `args` by creating an array of values that will be passed to the `main()` function.
3.  **Examples of Arguments You Can Pass**:
    
    -   You can pass numbers, strings, arrays, objects, or any other valid JavaScript values.
    
    Example 1: Passing basic values (number, string, boolean)
    
    ```javascript 
    const args = [42, "hello world", true]; // args array to be passed to main
    
    function main(number, message, flag) {
      console.log("Number:", number);        // Output: Number: 42
      console.log("Message:", message);      // Output: Message: hello world
      console.log("Flag:", flag);            // Output: Flag: true
    }
    ``` 
    
    Example 2: Passing arrays and objects
    
    ```javascript 
    const args = [[1, 2, 3], { name: "Alice", age: 30 }, "Graph data"]; // args array to be passed to main
    
    function main(array, person, description) {
      console.log("Array:", array);          // Output: Array: [1, 2, 3]
      console.log("Person:", person);        // Output: Person: { name: "Alice", age: 30 }
      console.log("Description:", description); // Output: Description: Graph data
    }
    ``` 
    
    Example 3: Passing nested objects and arrays
    
    ```javascript 
    const args = [
      { key1: "value1", key2: [10, 20, 30] }, 
      ["Item1", "Item2", "Item3"], 
      3.14
    ]; // args array to be passed to main
    
    function main(obj, items, number) {
      console.log("Object:", obj);           // Output: Object: { key1: "value1", key2: [10, 20, 30] }
      console.log("Items:", items);          // Output: Items: ["Item1", "Item2", "Item3"]
      console.log("Number:", number);        // Output: Number: 3.14
    }
    ``` 
    

### Key Points:

-   **No need to call `main()` manually**: The `main()` function will automatically be called with the `args` array as its arguments.
-   **Set `args` at the start**: Ensure the `args` variable is properly defined in your script before the `main()` function is called.
-   **Multiple argument types**: You can pass a wide variety of argument types (numbers, strings, arrays, objects, etc.) to your `main()` function.

### Full Example:


```javascript 
// Defining the arguments to be passed to main()
const args = [42, "Welcome to the system", { data: [1, 2, 3], valid: true }];

// Defining the main function that will use the arguments
function main(number, greeting, options) {
  console.log("Number passed:", number);   // Output: 42
  console.log("Greeting passed:", greeting);   // Output: Welcome to the system
  console.log("Options passed:", options);   // Output: { data: [1, 2, 3], valid: true }
}
``` 

### Example Output:


```bash
Number passed: 42
Greeting passed: Welcome to the system
Options passed: { data: [1, 2, 3], valid: true }
``` 

With this setup, you can pass any type of arguments to your `main()` function dynamically by setting the `args` variable in your script. The system will automatically invoke `main()` with these arguments during execution.


## Conclusion

This file is a dynamic and secure environment for running user-provided JavaScript code with sandboxing, memory checks, and detailed linting. It is ideal for use cases where you need to test untrusted code while keeping the system secure from memory and performance issues.

----------


