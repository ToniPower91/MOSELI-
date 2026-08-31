“use strict”;

/* =========================================================
MOSELI | CLIENT LOGIN
Supabase Authentication
========================================================= */

console.log(“MOSELI Client Login JS: carregado”);

/* =========================================================
SUPABASE CONFIGURATION
========================================================= */

const SUPABASE_URL =
“https://esumonohssxxalxsfshc.supabase.co”;

const SUPABASE_ANON_KEY =
“sb_publishable_lryWHU1aV0782oIFi4JKKg_Y4qugSlt”;

/* =========================================================
CHECK SUPABASE LIBRARY
========================================================= */

if (!window.supabase) {

alert(
“MOSELI: A biblioteca Supabase não foi carregada.”
);

throw new Error(
“Supabase JavaScript library unavailable”
);
}

/* =========================================================
CREATE SUPABASE CLIENT
========================================================= */

const supabaseClient =
window.supabase.createClient(
SUPABASE_URL,
SUPABASE_ANON_KEY
);

console.log(
“MOSELI: Supabase inicializado”
);

/* =========================================================
DOM ELEMENTS
========================================================= */

const form =
document.getElementById(“clientLoginForm”);

const emailInput =
document.getElementById(“clientEmail”);

const passwordInput =
document.getElementById(“clientPassword”);

const loginButton =
document.getElementById(“loginButton”);

const messageBox =
document.getElementById(“loginMessage”);

const togglePassword =
document.getElementById(“togglePassword”);

const forgotPasswordBtn =
document.getElementById(“forgotPasswordBtn”);

const loginYear =
document.getElementById(“loginYear”);

/* =========================================================
YEAR
========================================================= */

if (loginYear) {

loginYear.textContent =
new Date().getFullYear();

}

/* =========================================================
MESSAGE
========================================================= */

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

messageBox.textContent =
“”;

messageBox.className =
“client-login-message”;

}

/* =========================================================
LOADING
========================================================= */

function setLoading(
loading
) {

if (!loginButton) return;

loginButton.disabled =
loading;

if (loading) {

loginButton.textContent =
  "A entrar...";
loginButton.classList.add(
  "loading"
);

} else {

loginButton.textContent =
  "Entrar no Portal";
loginButton.classList.remove(
  "loading"
);

}

}

/* =========================================================
PASSWORD VISIBILITY
========================================================= */

if (
togglePassword &&
passwordInput
) {

togglePassword.addEventListener(
“click”,
function () {

  if (
    passwordInput.type ===
    "password"
  ) {
    passwordInput.type =
      "text";
    togglePassword.textContent =
      "Ocultar";
    togglePassword.setAttribute(
      "aria-label",
      "Ocultar palavra-passe"
    );
  } else {
    passwordInput.type =
      "password";
    togglePassword.textContent =
      "Mostrar";
    togglePassword.setAttribute(
      "aria-label",
      "Mostrar palavra-passe"
    );
  }
}

);

}

/* =========================================================
GET CLIENT RECORD
========================================================= */

async function getClient(
userId
) {

console.log(
“MOSELI: procurando cliente:”,
userId
);

const {
data,
error
} =
await supabaseClient
.from(“clients”)
.select(
id, auth_user_id, client_code, full_name, business_name, email, phone, address, bairro, city, service_location, status
)
.eq(
“auth_user_id”,
userId
)
.maybeSingle();

if (error) {

console.error(
  "MOSELI clients error:",
  error
);
throw error;

}

console.log(
“MOSELI: cliente encontrado:”,
data
);

return data;

}

/* =========================================================
LOGIN
========================================================= */

if (!form) {

console.error(
“MOSELI: clientLoginForm não encontrado.”
);

} else {

form.addEventListener(
“submit”,
async function (event) {

  event.preventDefault();
  console.log(
    "MOSELI: botão Entrar pressionado"
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
  /* -----------------------------------------------------
     VALIDATION
  ----------------------------------------------------- */
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
    /* ---------------------------------------------------
       SUPABASE AUTH
    --------------------------------------------------- */
    console.log(
      "MOSELI: autenticando..."
    );
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
      "MOSELI Auth:",
      data,
      error
    );
    if (error) {
      console.error(
        "MOSELI Auth Error:",
        error
      );
      showMessage(
        "Não foi possível iniciar sessão: " +
        error.message,
        "error"
      );
      setLoading(false);
      return;
    }
    if (!data || !data.user) {
      showMessage(
        "Autenticação concluída, mas o utilizador não foi encontrado.",
        "error"
      );
      setLoading(false);
      return;
    }
    const user =
      data.user;
    console.log(
      "MOSELI: Auth User:",
      user.id
    );
    /* ---------------------------------------------------
       FIND CLIENT
    --------------------------------------------------- */
    showMessage(
      "Login efetuado. A verificar a conta...",
      "success"
    );
    const client =
      await getClient(
        user.id
      );
    /* ---------------------------------------------------
       CLIENT NOT FOUND
    --------------------------------------------------- */
    if (!client) {
      console.error(
        "MOSELI: cliente não encontrado para Auth ID:",
        user.id
      );
      await supabaseClient.auth.signOut();
      showMessage(
        "A sua conta foi autenticada, mas não está ligada a um cliente MOSELI.",
        "error"
      );
      setLoading(false);
      return;
    }
    /* ---------------------------------------------------
       CLIENT STATUS
    --------------------------------------------------- */
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
    /* ---------------------------------------------------
       SUCCESS
    --------------------------------------------------- */
    console.log(
      "MOSELI: Login concluído:",
      client.client_code
    );
    showMessage(
      "Login efetuado com sucesso. A abrir o Portal...",
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
      "Ocorreu um erro: " +
      (
        error.message ||
        "Não foi possível concluir o login."
      ),
      "error"
    );
    setLoading(false);
  }
}

);

}

/* =========================================================
FORGOT PASSWORD
========================================================= */

if (
forgotPasswordBtn
) {

forgotPasswordBtn.addEventListener(
“click”,
async function () {

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
    const redirectUrl =
      window.location.origin +
      "/MOSELI-/client-login.html";
    console.log(
      "MOSELI: password reset URL:",
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
        "MOSELI Password Reset:",
        error
      );
      showMessage(
        "Não foi possível enviar o email: " +
        error.message,
        "error"
      );
    } else {
      showMessage(
        "Verifique o seu email para redefinir a palavra-passe.",
        "success"
      );
    }
  } catch (error) {
    console.error(
      "MOSELI Password Reset Error:",
      error
    );
    showMessage(
      "Não foi possível solicitar a recuperação da palavra-passe.",
      "error"
    );
  } finally {
    forgotPasswordBtn.disabled =
      false;
    forgotPasswordBtn.textContent =
      "Esqueci a palavra-passe";
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
    "MOSELI Session Error:",
    error
  );
  return;
}
if (
  data &&
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
  "MOSELI Session Check Error:",
  error
);

}

}

/* =========================================================
START
========================================================= */

checkExistingSession();

console.log(
“MOSELI Client Login: pronto”
);
