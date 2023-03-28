// Check if all brackets are properly closed
export default function validateBrackets(code) {
  // Initialize a stack to keep track of opening brackets
  const stack = [];

  // Loop through each character in the code
  for (let i = 0; i < code.length; i++) {
    const char = code.charAt(i);

    // If the character is an opening bracket, push it onto the stack
    if (char === '(' || char === '[' || char === '{') {
      stack.push(char);
    }

    // If the character is a closing bracket, pop the top of the stack and check if it matches
    else if (char === ')' || char === ']' || char === '}') {
      const top = stack.pop();
      if ((char === ')' && top !== '(') ||
          (char === ']' && top !== '[') ||
          (char === '}' && top !== '{')) {
        // There is an unmatched closing bracket
        return false;
      }
    }
  }
  // If the stack is not empty, there are unmatched opening brackets
  return stack.length === 0;
}