const WEBEXAPIS = process.env.WEBEX_APIS_V1;
const CLIENT_ID = process.env.WEBEX_CLIENT_ID;
const CLIENT_SECRET = process.env.WEBEX_CLIENT_SECRET;
let refreshToken = process.env.WEBEX_REFRESH_TOKEN;

let currentAccessToken = null;
let tokenExpirationTime = 0;

async function refreshAccessToken() {
  const url = `${WEBEXAPIS}/access_token`;

  const params = new URLSearchParams();
  params.append("grant_type", "refresh_token");
  params.append("client_id", CLIENT_ID);
  params.append("client_secret", CLIENT_SECRET);
  params.append("refresh_token", refreshToken);

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        `Authentication error: ${data.message || response.statusText}`,
      );
    }

    currentAccessToken = data.access_token;
    // Atualiza o refresh token caso o Webex retorne um novo
    if (data.refresh_token) {
      refreshToken = data.refresh_token;
    }

    // Define o tempo de expiração (data.expires_in vem em segundos, menos 5 min de margem)
    tokenExpirationTime = Date.now() + (data.expires_in - 300) * 1000;

    console.log("Access token refreshed!");
    return currentAccessToken;
  } catch (error) {
    console.error("Error when refreshing token:", error.message);
    throw error;
  }
}

async function getValidToken() {
  if (!currentAccessToken || Date.now() >= tokenExpirationTime) {
    await refreshAccessToken();
  }
  return currentAccessToken;
}

export { getValidToken };
