“use strict”;

/*

MOSELI | CLIENT LOGIN
Supabase Authentication

*/

/* ========================================================
SUPABASE CONFIGURATION
======================================================== */

const SUPABASE_URL =
“https://esumonohssxxalxsfshc.supabase.co”;

const SUPABASE_PUBLISHABLE_KEY =
“sb_publishable_lryWHU1aV0782oIFi4JKKg_Y4qugSlt”;

/* ========================================================
STARTUP
======================================================== */

console.log(“MOSELI LOGIN: JavaScript iniciado”);

/* ========================================================
CHECK SUPABASE LIBRARY
======================================================== */

if (!window.supabase) {

console.error(
“MOSELI LOGIN: Supabase JS não foi carregado.”
);

alert(
“Erro: o sistema de autenticação não foi carregado. “ +
“Verifique a ligação à internet e tente novamente.”
);

throw new Error(
“Supabase JavaScript library not loaded”
);
}

/* ========================================================
CREATE SUPABASE CLIENT
======================================================== */

const supabaseClient =
window.supabase.createClient(
SUPABASE_URL,
SUPABASE_PUBLISHABLE_KEY,
{
auth: {
persistSession: true,
autoRefreshToken: true,
detectSessionInUrl: true
}
}
);

console.log(
“MOSELI LOGIN: Supabase inicializado”
);

/* ========================================================
DOM ELEMENTS
======================================================== */

const form =
document.getElementById(
“clientLoginForm”
);

const emailInput =
document.getElementById(
“clientEmail”
);

const passwordInput =
document.getElementById(
“clientPassword”
);

const loginButton =
document.getElementById(
“loginButton”
);

const messageBox =
document.getElementById(
“loginMessage”
);

const togglePassword =
document.getElementById(
“togglePassword”
);

const forgotPasswordBtn =
document.getElementById(
“forgotPasswordBtn”
);

const year =
document.getElementById(
“loginYear”
);

/* ========================================================
CHECK DOM
======================================================== */

console.log(
“MOSELI LOGIN: DOM:”,
{
form: !!form,
email: !!emailInput,
password: !!passwordInput,
loginButton: !!loginButton,
message: !!messageBox,
togglePassword: !!togglePassword,
forgotPassword: !!forgotPasswordBtn
}
);

/* ========================================================
YEAR
======================================================== */

if (year) {

year.textContent =
new Date().getFullYear();

}

/* ========================================================
MESSAGE
======================================================== */

function showMessage(
message,
type = “error”
) {

if (!messageBox) {

alert(message);
return;

}

messageBox.textContent =
message;

messageBox.className =
“client-login-message show “ +
type;

}

function clearMessage() {

if (!messageBox) return;

messageBox.textContent = “”;

messageBox.className =
“client-login-message”;

}

/* ========================================================
LOADING
======================================================== */

function setLoading(
loading
) {

if (!loginButton) return;

loginButton.disabled =
loading;

loginButton.textContent =
loading
? “A entrar…”
: “Entrar no Portal”;

}

/* ========================================================
PASSWORD VISIBILITY
======================================================== */

if (
togglePassword &&
passwordInput
) {

togglePassword.addEventListener(
“click”,
function () {

  const isPassword =
    passwordInput.type ===
    "password";
  passwordInput.type =
    isPassword
      ? "text"
      : "password";
  togglePassword.textContent =
    isPassword
      ? "Ocultar"
      : "Mostrar";
}

);

}

/* ========================================================
FIND CLIENT
======================================================== */

async function getClient(
userId
) {

console.log(
“MOSELI LOGIN: procurando cliente:”,
userId
);

const {
data,
error
} =
await supabaseClient
.from(“clients”)
.select(id, auth_user_id, client_code, full_name, business_name, email, phone, address, bairro, city, service_location, status)
.eq(
“auth_user_id”,
userId
)
.maybeSingle();

if (error) {

console.error(
  "MOSELI LOGIN: erro clients:",
  error
);
throw error;

}

return data;

}

/* ========================================================
LOGIN
======================================================== */

if (form) {

form.addEventListener(
“submit”,
async function (event) {

  event.preventDefault();
  event.stopPropagation();
  console.log(
    "MOSELI LOGIN: submit recebido"
  );
  clearMessage();
  const email =
    emailInput
      ? emailInput.value.trim()
      : "";
  const password =
    passwordInput
      ? passwordInput.value
      : "";
  /* --------------------------------------------------
     VALIDATION
  -------------------------------------------------- */
  if (!email) {
    showMessage(
      "Introduza o seu email.",
      "error"
    );
    if (emailInput) {
      emailInput.focus();
    }
    return;
  }
  if (!password) {
    showMessage(
      "Introduza a sua palavra-passe.",
      "error"
    );
    if (passwordInput) {
      passwordInput.focus();
    }
    return;
  }
  setLoading(true);
  try {
    console.log(
      "MOSELI LOGIN: enviando credenciais para Supabase..."
    );
    /* -----------------------------------------------
       SUPABASE AUTH
    ----------------------------------------------- */
    const {
      data,
      error
    } =
      await supabaseClient.auth
        .signInWithPassword({
          email: email,
          password: password
        });
    console.log(
      "MOSELI LOGIN: resposta:",
      {
        user: data?.user?.id,
        error: error
      }
    );
    /* -----------------------------------------------
       AUTH ERROR
    ----------------------------------------------- */
    if (error) {
      console.error(
        "MOSELI LOGIN AUTH ERROR:",
        error
      );
      let message =
        error.message ||
        "Não foi possível iniciar sessão.";
      if (
        error.message
          ?.toLowerCase()
          .includes("invalid login")
      ) {
        message =
          "Email ou palavra-passe incorretos.";
      }
      showMessage(
        message,
        "error"
      );
      setLoading(false);
      return;
    }
    /* -----------------------------------------------
       USER CHECK
    ----------------------------------------------- */
    if (!data?.user) {
      showMessage(
        "O Supabase não devolveu um utilizador.",
        "error"
      );
      setLoading(false);
      return;
    }
    console.log(
      "MOSELI LOGIN: utilizador autenticado:",
      data.user.id
    );
    /* -----------------------------------------------
       FIND CLIENT
    ----------------------------------------------- */
    showMessage(
      "Login efetuado. A verificar a conta...",
      "success"
    );
    const client =
      await getClient(
        data.user.id
      );
    /* -----------------------------------------------
       CLIENT NOT FOUND
    ----------------------------------------------- */
    if (!client) {
      console.error(
        "MOSELI LOGIN: cliente não encontrado."
      );
      await supabaseClient.auth.signOut();
      showMessage(
        "A conta foi autenticada, mas não está ligada a um cliente MOSELI.",
        "error"
      );
      setLoading(false);
      return;
    }
    console.log(
      "MOSELI LOGIN: cliente encontrado:",
      client
    );
    /* -----------------------------------------------
       CLIENT STATUS
    ----------------------------------------------- */
    if (
      client.status &&
      client.status.toLowerCase() !==
        "active"
    ) {
      await supabaseClient.auth.signOut();
      showMessage(
        "A sua conta de cliente não está ativa.",
        "error"
      );
      setLoading(false);
      return;
    }
    /* -----------------------------------------------
       SUCCESS
    ----------------------------------------------- */
    showMessage(
      "Login efetuado com sucesso. A abrir o Portal...",
      "success"
    );
    console.log(
      "MOSELI LOGIN: sessão criada."
    );
    /*
    IMPORTANT:
    Give Supabase a moment to persist
    the session before redirecting.
    */
    setTimeout(
      function () {
        window.location.replace(
          "./client-portal.html"
        );
      },
      500
    );
  }
  catch (error) {
    console.error(
      "MOSELI LOGIN: erro inesperado:",
      error
    );
    showMessage(
      error?.message ||
      "Ocorreu um erro inesperado durante o login.",
      "error"
    );
    setLoading(false);
  }
}

);

}

/* ========================================================
FORGOT PASSWORD
======================================================== */

if (forgotPasswordBtn) {

forgotPasswordBtn.addEventListener(
“click”,
async function (event) {

  event.preventDefault();
  console.log(
    "MOSELI LOGIN: forgot password clicado"
  );
  clearMessage();
  const email =
    emailInput
      ? emailInput.value.trim()
      : "";
  if (!email) {
    showMessage(
      "Introduza o seu email primeiro.",
      "error"
    );
    if (emailInput) {
      emailInput.focus();
    }
    return;
  }
  forgotPasswordBtn.disabled =
    true;
  forgotPasswordBtn.textContent =
    "A enviar...";
  try {
    /*
    GitHub Pages / normal hosting:
    Return to the current login page.
    */
    const redirectUrl =
      window.location.origin +
      window.location.pathname;
    console.log(
      "MOSELI LOGIN: reset URL:",
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
        "MOSELI LOGIN: reset error:",
        error
      );
      showMessage(
        error.message ||
        "Não foi possível enviar o email de recuperação.",
        "error"
      );
      return;
    }
    showMessage(
      "Foi enviado um email para redefinir a sua palavra-passe. Verifique também a pasta de spam.",
      "success"
    );
  }
  catch (error) {
    console.error(
      "MOSELI LOGIN: reset exception:",
      error
    );
    showMessage(
      "Não foi possível solicitar a recuperação da palavra-passe.",
      "error"
    );
  }
  finally {
    forgotPasswordBtn.disabled =
      false;
    forgotPasswordBtn.textContent =
      "Esqueci a palavra-passe";
  }
}

);

}

/* ========================================================
EXISTING SESSION
======================================================== */

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
    "MOSELI LOGIN: session error:",
    error
  );
  return;
}
if (
  data?.session?.user
) {
  console.log(
    "MOSELI LOGIN: sessão existente:",
    data.session.user.id
  );
}

}

catch (error) {

console.error(
  "MOSELI LOGIN: session exception:",
  error
);

}

}

/* ========================================================
AUTH STATE LISTENER
======================================================== */

supabaseClient.auth.onAuthStateChange(
function (
event,
session
) {

console.log(
  "MOSELI LOGIN: Auth event:",
  event,
  session?.user?.id || null
);

}
);

/* ========================================================
START
======================================================== */

checkExistingSession();

console.log(
“MOSELI LOGIN: pronto”
);
