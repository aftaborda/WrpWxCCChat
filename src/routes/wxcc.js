import express from "express";
const wxccRouter = express.Router();

const WEBEXAPIS = process.env.WEBEX_APIS_V1;
const WEBEX_API_SERVER = process.env.WEBEX_API_SERVER;

/* GET users listing. */
wxccRouter.get("/", function (req, res, next) {
  res.send(`WEBEXAPIS: ${WEBEXAPIS}, WEBEX_API_SERVER: ${WEBEX_API_SERVER}`);
});

export { wxccRouter };
