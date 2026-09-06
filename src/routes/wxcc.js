import express from "express";
const wxccRouter = express.Router();

/* GET users listing. */
wxccRouter.get("/", function (req, res, next) {
  res.send("respond with a resource");
});

export { wxccRouter };
