import { getValidToken } from "./wxcc-token.js";

const WEBEX_API_SERVER = process.env.WEBEX_API_SERVER;
const CHANNELS = ["chat", "email", "voice", "all"];
const METRIC_NAMES = {
  agents: "Agents Availability",
  channels: "Channels Availability",
};

async function fetchChatAgentsAvailable(channel = "all") {
  if (!CHANNELS.includes(channel)) {
    console.error(`${channel} is not a supported channel.`);
    return getJsonReturn({}, channel);
  }
  try {
    const token = await getValidToken();

    const now = Date.now();
    const today = now - 24 * 60 * 60 * 1000;

    const searchUrl = `${WEBEX_API_SERVER}/search`;
    const graphQLQuery = {
      query: `
    query getChatAgents($from: Long!, $to: Long!) {
        agentSession(
            from: $from, 
            to: $to, 
            filter: { 
                and: [
                    { channelInfo: {currentState: {equals: available} } }
                    { isActive: { equals: true } }
                ]
            }
            aggregations: [
            {
                field: "agentId"
                type: cardinality
                name: "${METRIC_NAMES.agents}"
            },
            {
                field: "agentId"
                type: count
                name: "${METRIC_NAMES.channels}"
            }
            ]
        ) {
        agentSessions {
            channelInfo {
                channelType
            }
            aggregation {
                name
                value
            }
        }
        pageInfo {
          endCursor
          hasNextPage
        }
      }
    }
  `,
      variables: {
        from: today,
        to: now,
      },
    };

    const searchResponse = await fetch(searchUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(graphQLQuery),
    });

    const searchResult = await searchResponse.json();

    if (!searchResponse.ok) {
      throw new Error(
        `Error in Search API: ${JSON.stringify(searchResult.errors || searchResult)}`,
      );
    }

    return getJsonReturn(searchResult, channel);
  } catch (error) {
    console.error("Error executing the WxCC flow:", error.message);
    return getJsonReturn({}, channel);
  }
}

function getJsonReturn(apiResult, channel = "all") {
  const sessions = apiResult.data?.agentSession?.agentSessions || [];

  const result = {
    type: "OK",
    agents: 0,
    telephony: 0,
    email: 0,
    chat: 0,
    social: 0,
  };

  let maxAgents = 0;

  sessions.forEach((item) => {
    const originalChannel = item.channelInfo?.[0]?.channelType;
    const aggregations = item.aggregation || [];

    const channelsCount =
      aggregations.find((a) => a.name === "Channels Availability")?.value || 0;
    const agentsCount =
      aggregations.find((a) => a.name === "Agents Availability")?.value || 0;

    if (agentsCount > maxAgents) {
      maxAgents = agentsCount;
    }

    if (originalChannel === "chat") {
      result.chat = channelsCount;
    } else if (originalChannel === "email") {
      result.email = channelsCount;
    } else if (originalChannel === "social") {
      result.social = channelsCount;
    } else if (originalChannel === "telephony") {
      result.telephony = channelsCount;
    }
  });

  result.agents = maxAgents;

  switch (channel) {
    case "voice":
      delete result.chat;
      delete result.email;
      delete result.social;
      break;
    case "email":
      delete result.telephony;
      delete result.chat;
      delete result.social;
      break;
    case "chat":
      delete result.telephony;
      delete result.email;
      delete result.social;
      break;
    case "social":
      delete result.telephony;
      delete result.email;
      delete result.chat;
      break;

    default:
      break;
  }

  return result;
}

export { fetchChatAgentsAvailable };
