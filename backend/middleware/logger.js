const logger = (req, res, next) => {
  const startTime = Date.now();
  res.on("finish", () => {
    // prettier-ignore
    console.log(`${req.method} ${req.originalUrl} ${res.statusCode} ${Date.now() - startTime} ms`);
  });
  next();
};

export default logger;
