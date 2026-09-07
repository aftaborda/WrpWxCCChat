import express from "express";

import { fetchChatAgentsAvailable } from "../controllers/agents-available.js";

const wxccRouter = express.Router();

/* GET channels availability. */
wxccRouter.get("/channels", async function (req, res, next) {
  const channel = req.query?.type ?? "all";
  const agentsAvailability = await fetchChatAgentsAvailable(channel);
  if (agentsAvailability.type == "NOK") {
    res.status(422).json(agentsAvailability);
  } else {
    res.status(200).json(agentsAvailability);
  }
  return;
});

export { wxccRouter };
