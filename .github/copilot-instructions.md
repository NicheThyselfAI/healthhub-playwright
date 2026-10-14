# Contents of the file `healthhub-playwright/.github/copilot-instructions.md`

To run and test the Playwright MCP server, follow these steps:

1. Ensure that you have all necessary dependencies installed. Run:
   npm install

2. Start the Playwright MCP server by executing:
   npm run start

3. To check the server's status, open a new terminal and run:
   curl http://localhost:3000/health

4. You should receive a response indicating the server is running. If you see a status code of 200, the server is functioning correctly.

5. To run Playwright tests, execute:
   npx playwright test

Make sure to monitor the terminal for any errors during the server startup or test execution.