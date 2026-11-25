import HttpError from "../lib/HttpError.js";

const error = (err, req, res, next) => {
  if (err instanceof HttpError) {
    return res.status(err.status).json({ error: err.message });
  }

  // TODO 2: otherwise keep what happens today: log it and respond 500
  console.log(err);
  return res.status(500).json({ error: "Internal server error" });
};
export default error;
