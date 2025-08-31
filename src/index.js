const http = require("http");
const path = require("path");
const getUsers = require("./modules/users");

const server = http.createServer((request, response) => {
  const url = new URL(request.url, "http://127.0.0.1");
  let otherParams = [];

  for (const [key, value] of url.searchParams.entries()) {
    if (key !== "hello") {
      otherParams.push({ key, value });
    }
  }

  if (url.searchParams.has("users")) {
    response.statusCode = 200;
    response.statusMessage = "OK";
    response.setHeader("Content-Type", "application/json");
    response.write(getUsers());
    response.end();
    return;
  }

  if (url.searchParams.has("hello")) {
    const name = url.searchParams.get("hello");

    if (!name) {
      response.statusCode = 400;
      response.setHeader("Content-Type", "text/plain");
      response.end("Enter a name");
      return;
    }

    response.statusCode = 200;
    response.setHeader("Content-Type", "text/plain");
    response.end(`Hello, ${name}!`);
    return;
  }

  if (otherParams.length > 0) {
    response.statusCode = 500;
    response.statusMessage = "Internal Server Error";
    response.setHeader("Content-Type", "text/plain");
    response.write("");
    response.end();
    return;
  }

  response.statusCode = 200;
  response.statusMessage = "OK";
  response.setHeader("Content-Type", "text/plain");
  response.write("Hello, World!");
  response.end();
});

server.listen(3003, () => {
  console.log("Сервер запущен по адресу http://127.0.0.1:3003");
});
