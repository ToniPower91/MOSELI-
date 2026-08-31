“use strict”;

console.log(“MOSELI AUTH TEST: JavaScript carregado”);

const SUPABASE_URL =
“https://esumonohssxxalxsfshc.supabase.co”;

const SUPABASE_KEY =
“sb_publishable_lryWHU1aV0782oIFi4JKKg_Y4qugSlt”;

/* =========================================================
SUPABASE
========================================================= */

if (!window.supabase) {

alert(“ERRO: Supabase JS não foi carregado.”);

throw new Error(
“Supabase JS não carregado”
);
}

const supabaseClient =
window.supabase.createClient(
SUPABASE_URL,
SUPABASE_KEY
);

console.log(
“MOSELI AUTH TEST: Supabase inicializado”
);

/* =========================================================
DOM
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

/* =========================================================
MESSAGE
========================================================= */

function showMessage(
message,
type
) {

if (!messageBox) {

alert(message);
return;

}

messageBox.textContent =
message;

messageBox.className =
“client-login-message show “ +
(type || “error”);

}

/* =========================================================
LOGIN TEST
========================================================= */

if (!form) {

alert(
“ERRO: clientLoginForm não encontrado.”
);

} else {

form.addEventListener(
“submit”,
async function (event) {

  event.preventDefault();
  console.log(
    "MOSELI AUTH TEST: botão Entrar clicado"
  );
  const email =
    emailInput.value.trim();
  const password =
    passwordInput.value;
  if (!email) {
    showMessage(
      "Introduza o email.",
      "error"
    );
    return;
  }
  if (!password) {
    showMessage(
      "Introduza a palavra-passe.",
      "error"
    );
    return;
  }
  loginButton.disabled =
    true;
  loginButton.textContent =
    "A testar...";
  showMessage(
    "1/4 A contactar o Supabase...",
    "success"
  );
  try {
    /* =================================================
       AUTHENTICATION
    ================================================= */
    console.log(
      "MOSELI AUTH TEST: signInWithPassword"
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
      "MOSELI AUTH TEST RESULT:",
      data,
      error
    );
    if (error) {
      console.error(
        "AUTH ERROR:",
        error
      );
      showMessage(
        "AUTH ERROR: " +
        error.message,
        "error"
      );
      loginButton.disabled =
        false;
      loginButton.textContent =
        "Entrar no Portal";
      return;
    }
    if (!data.user) {
      showMessage(
        "2/4 Supabase não devolveu um utilizador.",
        "error"
      );
      loginButton.disabled =
        false;
      return;
    }
    const user =
      data.user;
    console.log(
      "AUTH USER:",
      user
    );
    showMessage(
      "2/4 AUTENTICAÇÃO OK — User ID: " +
      user.id,
      "success"
    );
    /* =================================================
       CLIENT LOOKUP
    ================================================= */
    console.log(
      "MOSELI AUTH TEST: procurando cliente..."
    );
    const {
      data: client,
      error: clientError
    } =
      await supabaseClient
        .from("clients")
        .select(
          `
          id,
          auth_user_id,
          client_code,
          full_name,
          email,
          status
          `
        )
        .eq(
          "auth_user_id",
          user.id
        )
        .maybeSingle();
    console.log(
      "CLIENT RESULT:",
      client,
      clientError
    );
    if (clientError) {
      showMessage(
        "3/4 ERRO AO CONSULTAR CLIENTS: " +
        clientError.message,
        "error"
      );
      loginButton.disabled =
        false;
      loginButton.textContent =
        "Entrar no Portal";
      return;
    }
    if (!client) {
      showMessage(
        "3/4 AUTH OK, MAS CLIENTE NÃO ENCONTRADO. " +
        "Auth ID: " +
        user.id,
        "error"
      );
      loginButton.disabled =
        false;
      loginButton.textContent =
        "Entrar no Portal";
      return;
    }
    /* =================================================
       CLIENT FOUND
    ================================================= */
    console.log(
      "CLIENT FOUND:",
      client
    );
    showMessage(
      "3/4 CLIENTE ENCONTRADO: " +
      client.client_code +
      " — " +
      client.full_name,
      "success"
    );
    /* =================================================
       STATUS
    ================================================= */
    if (
      client.status &&
      client.status.toLowerCase() !==
        "active"
    ) {
      showMessage(
        "4/4 CLIENTE ENCONTRADO, MAS STATUS = " +
        client.status,
        "error"
      );
      loginButton.disabled =
        false;
      loginButton.textContent =
        "Entrar no Portal";
      return;
    }
    /* =================================================
       SUCCESS — NO REDIRECT
    ================================================= */
    showMessage(
      "4/4 SUCESSO! Login + cliente verificados. " +
      "Não será feito redirect neste teste.",
      "success"
    );
    loginButton.disabled =
      false;
    loginButton.textContent =
      "Login OK";
    console.log(
      "===================================="
    );
    console.log(
      "MOSELI AUTH TEST: TUDO OK"
    );
    console.log(
      "AUTH USER:",
      user.id
    );
    console.log(
      "CLIENT:",
      client
    );
    console.log(
      "===================================="
    );
  } catch (error) {
    console.error(
      "MOSELI AUTH TEST EXCEPTION:",
      error
    );
    showMessage(
      "ERRO INESPERADO: " +
      (
        error.message ||
        error
      ),
      "error"
    );
    loginButton.disabled =
      false;
    loginButton.textContent =
      "Entrar no Portal";
  }
}

);

}

/* =========================================================
PASSWORD TOGGLE
========================================================= */

const togglePassword =
document.getElementById(
“togglePassword”
);

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
  } else {
    passwordInput.type =
      "password";
    togglePassword.textContent =
      "Mostrar";
  }
}

);

}

console.log(
“MOSELI AUTH TEST: pronto”
);
