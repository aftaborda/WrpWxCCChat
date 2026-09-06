let chatWidget = null;
const users = {
  1000: {
    id: "1000",
    name: "James Smith",
    email: "james.s@mail.local",
    phone: "+351910555444",
    language: "en-GB",
  },
  1001: {
    id: "1001",
    name: "John Taylor",
    email: "john.t@mail.local",
    phone: "+351220777888",
    language: "en-GB",
  },
  1002: {
    id: "1002",
    name: "Mary Williams",
    email: "mary.w@mail.local",
    phone: "+351922888999",
    language: "en-GB",
  },
  1003: {
    id: "1003",
    name: "Sarah Brown",
    email: "sarah.b@mail.local",
    phone: "+351933777666",
    language: "en-GB",
  },
  1004: {
    id: "1004",
    name: "Carmen González",
    email: "carmen.g@mail.local",
    phone: "+351210444555",
    language: "es-ES",
  },
  1005: {
    id: "1005",
    name: "Manuel Sánchez",
    email: "manuel.s@mail.local",
    phone: "+351922666777",
    language: "es-ES",
  },
  1006: {
    id: "1006",
    name: "María Rodríguez",
    email: "maria.r@mail.local",
    phone: "+351933222111",
    language: "es-ES",
  },
  1007: {
    id: "1007",
    name: "Teotónio Pires-Veloso",
    email: "teotonio.pv@mail.local",
    phone: "+351966000111",
    language: "pt-PT",
  },
  1008: {
    id: "1008",
    name: "Joaquim Santos",
    email: "joaquim.santos@mail.local",
    phone: "+351900111222",
    language: "pt-PT",
  },
  1009: {
    id: "1009",
    name: "Genoveva Pascoal",
    email: "genoveva.p@mail.local",
    phone: "+351966111333",
    language: "pt-PT",
  },
  1010: {
    id: "1010",
    name: "Hermenegildo Balsemão",
    email: "hermenegildo.b@mail.local",
    phone: "+351910001122",
    language: "pt-PT",
  },
};

const loginForm = document.getElementById("loginForm");

if (loginForm) {
  loginForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const userId = document.getElementById("userId").value.trim();
    const showWidget = document.getElementById("show-widget");

    const errorMessage = document.getElementById("loginError");

    if (users[userId]) {
      const show = !!showWidget.checked;
      users[userId].show = show;
      sessionStorage.setItem("portalITUser", JSON.stringify(users[userId]));

      console.log(`[Login form submit] Mostrar o widget? ${show}`);
      //sessionStorage.setItem("showWidget", show);

      getShowWidget();

      window.location.href = "dashboard.html";
    } else {
      errorMessage.textContent = "Invalid Employee ID. Please try again.";
    }
  });
}

function loadUser() {
  const storedUser = sessionStorage.getItem("portalITUser");

  if (!storedUser) {
    const isLoginPage =
      window.location.pathname.endsWith("index.html") ||
      window.location.pathname.endsWith("/");

    if (!isLoginPage) {
      window.location.href = "index.html";
    }

    return null;
  }

  const user = JSON.parse(storedUser);

  const countryFlag = document.getElementById("country-flag");
  if (countryFlag) {
    switch (user.language) {
      case "pt-PT":
        countryFlag.src = "https://flagcdn.com/32x24/pt.png";
        break;

      case "es-ES":
        countryFlag.src = "https://flagcdn.com/32x24/es.png";
        break;

      default:
        countryFlag.src = "https://flagcdn.com/32x24/gb.png";
        break;
    }
  }

  return JSON.parse(storedUser);
}

function getShowWidget() {
  const user = loadUser();
  const show = !!user.show;
  console.log(`[Custom Integration] getShowWidget() returns ${show}`);
  return show;
}

function setShowWidget(value) {
  console.log(`[Custom Integration] setShowWidget(${value})`);
  const show = !!value;
  const user = loadUser();
  user.show = show;
  sessionStorage.setItem("portalITUser", JSON.stringify(user));
  //sessionStorage.setItem("showWidget", show);
  if (chatWidget) {
    console.log(`[Custom Integration] Show widget? ${show}`);
    if (show) chatWidget.show();
    else chatWidget.hide();
  }
}

function displayUser() {
  const user = loadUser();

  if (!user) return;

  const userNameElements = document.querySelectorAll("#userName");

  const userIdElements = document.querySelectorAll("#userIdDisplay");

  const userLanguage = document.querySelectorAll("#userLanguage");

  const welcomeName = document.getElementById("welcomeName");

  userNameElements.forEach(function (element) {
    element.textContent = user.name;
  });

  userIdElements.forEach(function (element) {
    element.textContent = "ID: " + user.id;
  });

  userLanguage.forEach(function (element) {
    element.textContent = "Language: " + user.language;
  });

  if (welcomeName) {
    welcomeName.textContent = user.name.split(" ")[0];
  }
}

function logout() {
  sessionStorage.removeItem("portalITUser");
  window.location.href = "index.html";
}

function showWidget() {
  setShowWidget(true);
}

function hideWidget() {
  setShowWidget(false);
}

if (!loginForm) {
  displayUser();
}

(function () {
  let attempts = 0;
  const maxAttempts = 50;
  const CLIENT_ID = process.env.WEBEX_ACCESS_TOKEN;
  console.log("id", CLIENT_ID);

  const checkWidget = setInterval(() => {
    attempts++;

    if (window.imichatwidget && typeof window.imichatwidget.on === "function") {
      clearInterval(checkWidget);
      console.log("[Custom Integration] Webex Widget detetado com sucesso!");
      chatWidget = window.imichatwidget;
      setShowWidget(getShowWidget());
      initializeChatListeners();
    } else if (attempts >= maxAttempts) {
      clearInterval(checkWidget);
      console.warn(
        "[Custom Integration] O widget do Webex demorou demasiado tempo a carregar.",
      );
    }
  }, 100); // Executa a verificação a cada 100 milissegundos

  function updateChatWidget() {
    const user = loadUser();

    if (!user) return;

    const page = window.location.pathname.split("/").pop();

    const isBot = page == "systems.html" ? true : false;

    console.log(
      `[Custom Integration] update widget for user ${user.id} in page ${page} with isBot = ${isBot}`,
    );
    const custom_chat_fields = {
      custom_chat_fields: {
        userId: user.id,
        userName: user.name,
        userEmail: user.email,
        userPhone: user.phone,
        userLanguage: user.language,
        isBot,
      },
    };
    const data = JSON.stringify(custom_chat_fields);
    console.log(data);
    window.imichatwidget.update(data, function (response) {
      console.log(
        `[Custom Integration] User id: ${user.id}, Resposta do widget update: ${JSON.stringify(response)}`,
      );
    });
  }

  function initializeChatListeners() {
    window.imichatwidget.on("imichat-widget:ready", function () {
      console.log("[Custom Integration] O widget está pronto!");
      updateChatWidget();
    });
  }
})();
