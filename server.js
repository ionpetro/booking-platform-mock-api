const jsonServer = require("json-server");
const path = require("path");

const server = jsonServer.create();

const router = jsonServer.router(path.join(__dirname, "db.json"));
const middlewares = jsonServer.defaults();
const PORT = process.env.PORT || 8000;

// Set default middlewares (logger, static, cors and no-cache)
server.use(middlewares);
server.use(jsonServer.bodyParser);

server.use((req, res, next) => {
  // mock response for login
  const { username } = req.body;
  if (!(req.method === "POST" && req.url === "/api/login")) {
    next();
    return;
  }
  res.jsonp({
    username,
    role: "user",
    firstName: username,
    lastName: username,
    accessToken: "My secure JWT token",
    refreshToken: "My secure JWT refresh token",
  });
});

router.render = (req, res) => {
  console.log(req.method, req.url);
  if (req.method === "GET" && req.url.startsWith("/units?_page")) {
    res.jsonp({
      totalPages: 3,
      itemsCount: 48,
      units: res.locals.data,
    });
  } else if (req.method === "GET" && req.url.startsWith("/units")) {
    res.jsonp(res.locals.data);
  } else if (req.method === "POST" && req.url.startsWith("/book")) {
    res.jsonp({
      bookId: 2,
      bookDate: "1/1/2020",
      crater: "Arcadia",
      craterDescription:
        "Arcadia is one of the most magnificent crates in Mars. It is full of green parks that aim to sustain your work - life balance.The apartment is located near the central park and only few plots away from the fitness room.",
    });
  }
};

// Rewrite router paths
server.use(
  jsonServer.rewriter({
    "/api/*": "/$1",
    "/api/login": "/users",
    "/units?page=:page&size=:size": "/units?_page=:page&_limit=:size", // create redirect for mock server pagination
  })
);
// Use default router
server.use(router);
server.listen(PORT, () => {
  console.log(`Server is running on PORT ${PORT}`);
});
