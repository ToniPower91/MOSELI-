/* =========================================================
   MOSELI | CLIENT LOGIN
   Supabase Authentication
   ========================================================= */

"use strict";

console.log("MOSELI Client Login JS iniciado");

/* =========================================================
   SUPABASE CONFIG
   ========================================================= */

const SUPABASE_URL =
  "https://esumonohssxxalxsfshc.supabase.co";

const SUPABASE_KEY =
  "sb_publishable_lryWHU1aV0782oIFi4JKKg_Y4qugSlt";

/* =========================================================
   CHECK SUPABASE
   ========================================================= */

if (!window.supabase) {

  console.error(
    "MOSELI: Supabase não foi carregado."
  );

  alert(
    "Erro: não foi possível carregar o Supabase."
  );

  throw new Error(
    "Supabase library unavailable"
  );
}

/* =========================================================
   CREATE SUPABASE CLIENT
   ========================================================= */

const supabaseClient =
  window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
  );

console.log(
  "MOSELI: Supabase conectado."
);

/* =========================================================
   DOM
   ========================================================= */

const form =
  document.getElementById(
    "clientLoginForm"
  );

const emailInput =
  document.getElementById(
    "clientEmail"
  );

const passwordInput =
  document.getElementById(
    "clientPassword"
  );

const loginButton =
  document.getElementById(
    "loginButton"
  );

const forgotButton =
  document.getElementById(
    "forgotPasswordBtn"
  );

const togglePassword =
  document.getElementById(
    "togglePassword"
  );

const messageBox =
  document.getElementById(
    "loginMessage"
  );

const yearElement =
  document.getElementById(
    "loginYear"
  );

const langPT =
  document.getElementById(
    "langPT"
  );

const langEN =
  document.getElementById(
    "langEN"
  );

/* =========================================================
   YEAR
   ========================================================= */

if (yearElement) {

  yearElement.textContent =
    new Date().getFullYear();

}

/* =========================================================
   TRANSLATIONS
   ========================================================= */

const translations = {

  pt: {

    title:
      "Portal do Cliente",

    description:
      "Entre na sua conta para consultar os seus serviços, recolhas, pagamentos e pedidos.",

    email:
      "Email",

    emailPlaceholder:
      "cliente@email.com",

    password:
      "Palavra-passe",

    passwordPlaceholder:
      "Introduza a sua palavra-passe",

    show:
      "Mostrar",

    hide:
      "Ocultar",

    forgot:
      "Esqueci a palavra-passe",

    login:
      "Entrar no Portal",

    loggingIn:
      "A entrar...",

    secure:
      "Portal seguro do cliente",

    back:
      "← Voltar"

  },

  en: {

    title:
      "Client Portal",

    description:
      "Sign in to your account to view your services, collections, payments and requests.",

    email:
      "Email",

    emailPlaceholder:
      "client@email.com",

    password:
      "Password",

    passwordPlaceholder:
      "Enter your password",

    show:
      "Show",

    hide:
      "Hide",

    forgot:
      "Forgot password?",

    login:
      "Sign In",

    loggingIn:
      "Signing in...",

    secure:
      "Secure client portal",

    back:
      "← Back"

  }

};

let currentLanguage = "pt";

/* =========================================================
   LANGUAGE
   ========================================================= */

function setLanguage(language) {

  currentLanguage =
    language === "en"
      ? "en"
      : "pt";

  const t =
    translations[currentLanguage];

  const title =
    document.getElementById(
      "loginTitle"
    );

  const description =
    document.getElementById(
      "loginDescription"
    );

  const emailLabel =
    document.getElementById(
      "emailLabel"
    );

  const passwordLabel =
    document.getElementById(
      "passwordLabel"
    );

  const secureText =
    document.getElementById(
      "secureText"
    );

  const backLink =
    document.getElementById(
      "backLink"
    );

  if (title)
    title.textContent = t.title;

  if (description)
    description.textContent =
      t.description;

  if (emailLabel)
    emailLabel.textContent =
      t.email;

  if (passwordLabel)
    passwordLabel.textContent =
      t.password;

  if (emailInput)
    emailInput.placeholder =
      t.emailPlaceholder;

  if (passwordInput)
    passwordInput.placeholder =
      t.passwordPlaceholder;

  if (forgotButton)
    forgotButton.textContent =
      t.forgot;

  if (loginButton)
    loginButton.textContent =
      t.login;

  if (secureText)
    secureText.textContent =
      t.secure;

  if (backLink)
    backLink.textContent =
      t.back;

  if (togglePassword) {

    togglePassword.textContent =
      passwordInput &&
      passwordInput.type === "text"
        ? t.hide
        : t.show;

  }

  if (langPT)
    langPT.classList.toggle(
      "active",
      currentLanguage === "pt"
    );

  if (langEN)
    langEN.classList.toggle(
      "active",
      currentLanguage === "en"
    );

  document.documentElement.lang =
    currentLanguage;

  localStorage.setItem(
    "moseli_language",
    currentLanguage
  );
}

/* =========================================================
   LANGUAGE BUTTONS
   ========================================================= */

if (langPT) {

  langPT.addEventListener(
    "click",
    function () {

      setLanguage("pt");

    }
  );

}

if (langEN) {

  langEN.addEventListener(
    "click",
    function () {

      setLanguage("en");

    }
  );

}

/* =========================================================
   MESSAGES
   ========================================================= */

function showMessage(
  message,
  type = "error"
) {

  if (!messageBox) {

    alert(message);
    return;

  }

  messageBox.textContent =
    message;

  messageBox.className =
    "message show " + type;

}

function clearMessage() {

  if (!messageBox)
    return;

  messageBox.textContent = "";

  messageBox.className =
    "message";

}

/* =========================================================
   LOADING
   ========================================================= */

function setLoading(
  loading
) {

  if (!loginButton)
    return;

  loginButton.disabled =
    loading;

  loginButton.textContent =
    loading
      ? translations[currentLanguage].loggingIn
      : translations[currentLanguage].login;

}

/* =========================================================
   PASSWORD TOGGLE
   ========================================================= */

if (
  togglePassword &&
  passwordInput
) {

  togglePassword.addEventListener(
    "click",
    function () {

      if (
        passwordInput.type ===
        "password"
      ) {

        passwordInput.type =
          "text";

        togglePassword.textContent =
          translations[currentLanguage].hide;

      } else {

        passwordInput.type =
          "password";

        togglePassword.textContent =
          translations[currentLanguage].show;

      }

    }
  );

}

/* =========================================================
   GET CLIENT
   ========================================================= */

async function getClient(
  userId
) {

  console.log(
    "MOSELI: procurando cliente:",
    userId
  );

  const result =
    await supabaseClient
      .from("clients")
      .select(`
        id,
        auth_user_id,
        client_code,
        full_name,
        business_name,
        email,
        phone,
        address,
        bairro,
        city,
        service_location,
        status
      `)
      .eq(
        "auth_user_id",
        userId
      )
      .maybeSingle();

  console.log(
    "MOSELI: resultado:",
    result
  );

  if (result.error) {

    throw result.error;

  }

  return result.data;

}

/* =========================================================
   LOGIN
   ========================================================= */

if (form) {

  form.addEventListener(
    "submit",
    async function (event) {

      event.preventDefault();

      console.log(
        "MOSELI: login iniciado."
      );

      clearMessage();

      const email =
        emailInput.value.trim();

      const password =
        passwordInput.value;

      if (!email) {

        showMessage(
          currentLanguage === "pt"
            ? "Introduza o seu email."
            : "Please enter your email."
        );

        emailInput.focus();

        return;

      }

      if (!password) {

        showMessage(
          currentLanguage === "pt"
            ? "Introduza a sua palavra-passe."
            : "Please enter your password."
        );

        passwordInput.focus();

        return;

      }

      setLoading(true);

      try {

        console.log(
          "MOSELI: autenticando..."
        );

        const {
          data,
          error
        } =
          await supabaseClient.auth
            .signInWithPassword({

              email:
                email,

              password:
                password

            });

        if (error) {

          console.error(
            "MOSELI AUTH ERROR:",
            error
          );

          showMessage(
            error.message,
            "error"
          );

          setLoading(false);

          return;

        }

        if (!data.user) {

          showMessage(
            "Utilizador não encontrado.",
            "error"
          );

          setLoading(false);

          return;

        }

        console.log(
          "MOSELI: Auth OK:",
          data.user.id
        );

        showMessage(
          currentLanguage === "pt"
            ? "Login efetuado. A verificar a conta..."
            : "Login successful. Checking account...",
          "success"
        );

        const client =
          await getClient(
            data.user.id
          );

        if (!client) {

          console.error(
            "MOSELI: cliente não encontrado."
          );

          await supabaseClient.auth.signOut();

          showMessage(
            currentLanguage === "pt"
              ? "A conta foi autenticada, mas não está ligada a um cliente MOSELI."
              : "The account is authenticated, but is not linked to a MOSELI client.",
            "error"
          );

          setLoading(false);

          return;

        }

        if (
          client.status &&
          client.status.toLowerCase() !==
            "active"
        ) {

          await supabaseClient.auth.signOut();

          showMessage(
            currentLanguage === "pt"
              ? "A sua conta de cliente não está ativa."
              : "Your client account is not active.",
            "error"
          );

          setLoading(false);

          return;

        }

        console.log(
          "MOSELI: cliente confirmado:",
          client
        );

        showMessage(
          currentLanguage === "pt"
            ? "Login efetuado com sucesso. A abrir o Portal..."
            : "Login successful. Opening Portal...",
          "success"
        );

        setTimeout(
          function () {

            window.location.href =
              "./client-portal.html";

          },
          800
        );

      } catch (error) {

        console.error(
          "MOSELI LOGIN ERROR:",
          error
        );

        showMessage(
          error.message ||
          "Não foi possível concluir o login.",
          "error"
        );

        setLoading(false);

      }

    }
  );

} else {

  console.error(
    "MOSELI: formulário não encontrado."
  );

}

/* =========================================================
   FORGOT PASSWORD
   ========================================================= */

if (forgotButton) {

  forgotButton.addEventListener(
    "click",
    async function () {

      clearMessage();

      const email =
        emailInput.value.trim();

      if (!email) {

        showMessage(
          currentLanguage === "pt"
            ? "Introduza o seu email primeiro."
            : "Please enter your email first.",
          "error"
        );

        emailInput.focus();

        return;

      }

      forgotButton.disabled =
        true;

      const originalText =
        forgotButton.textContent;

      forgotButton.textContent =
        currentLanguage === "pt"
          ? "A enviar..."
          : "Sending...";

      try {

        /*
         * IMPORTANT:
         * This URL must be registered in
         * Supabase Authentication → URL Configuration.
         */

        const redirectUrl =
          window.location.origin +
          window.location.pathname;

        console.log(
          "MOSELI password reset URL:",
          redirectUrl
        );

        const {
          error
        } =
          await supabaseClient.auth
            .resetPasswordForEmail(
              email,
              {
                redirectTo:
                  redirectUrl
              }
            );

        if (error) {

          console.error(
            "MOSELI RESET ERROR:",
            error
          );

          showMessage(
            error.message,
            "error"
          );

        } else {

          showMessage(
            currentLanguage === "pt"
              ? "Enviámos um email para redefinir a sua palavra-passe. Verifique a sua caixa de entrada."
              : "We sent you an email to reset your password. Please check your inbox.",
            "success"
          );

        }

      } catch (error) {

        console.error(
          "MOSELI RESET ERROR:",
          error
        );

        showMessage(
          error.message ||
          "Erro ao solicitar recuperação da palavra-passe.",
          "error"
        );

      } finally {

        forgotButton.disabled =
          false;

        forgotButton.textContent =
          originalText;

      }

    }
  );

}

/* =========================================================
   EXISTING SESSION
   ========================================================= */

async function checkExistingSession() {

  try {

    const {
      data,
      error
    } =
      await supabaseClient.auth
        .getSession();

    if (error) {

      console.error(
        "MOSELI SESSION ERROR:",
        error
      );

      return;

    }

    if (
      data.session &&
      data.session.user
    ) {

      console.log(
        "MOSELI: sessão existente:",
        data.session.user.id
      );

    }

  } catch (error) {

    console.error(
      "MOSELI SESSION CHECK ERROR:",
      error
    );

  }

}

/* =========================================================
   INITIALIZE
   ========================================================= */

const savedLanguage =
  localStorage.getItem(
    "moseli_language"
  );

setLanguage(
  savedLanguage === "en"
    ? "en"
    : "pt"
);

checkExistingSession();

console.log(
  "MOSELI Client Login: pronto."
);
