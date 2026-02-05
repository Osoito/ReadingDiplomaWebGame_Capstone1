import js from '@eslint/js'
import stylisticJs from '@stylistic/eslint-plugin-js'
import globals from 'globals'

// Modify here the rules that determine the style the code should follow
// Useful for keeping the code style unified and consistent
// Feel free to edit any of these rules, just note that the changes will apply to everyone

// run 'npm run lint' to see errors
// -- I recommend installing ESLint extension in VSCode to see errors directly in editor
// Breaking these rules will cause ESLint ERRORS or WARNINGS!

export default [
  js.configs.recommended,
  {
    files: ["**/*.js"], // Applies to all .js files
    languageOptions: {
      sourceType: "module",
      globals: {
        ...globals.node
      },
      ecmaVersion: "latest",
    },
    plugins: {
      '@stylistic/js': stylisticJs
    },
    rules: {
      '@stylistic/js/indent': [
        'error',
        4
        /*
            // An indent with 4 spaces
          // An indent with 2 spaces
        */

      ],
      /*'@stylistic/js/linebreak-style': [
        'error',
        'unix'
        // This can be changed in VSCode at the bottom right "LF" / "CRLF" (LF = unix, CRLF = windows)
        // The default value when creating new files can also be changed in VSCode settings
      ],*/
      '@stylistic/js/quotes': [
        'error',
        'single', 'backtick'
      ],
      '@stylistic/js/semi': [
        'error',
        'never'
        // No semicolons ; at the end of lines, can also be changed
      ],
      'eqeqeq': 'error', // Require the use of === and !==
      'no-trailing-spaces': 'error',
      'object-curly-spacing': [ // spaces required { text }
        'error', 'always'
      ],
      'arrow-spacing': [ // like this: (a) => {}  Not like this: (a)=>{}
        'error', { 'before': true, 'after': true },
      ],
      'no-console': 'off', // Allows the use of console.log()
    },
  },
  {
    ignores: ["dist/**", "build/**", "knex**", "scripts/**"], // Ignores build files and knex files
  },
];