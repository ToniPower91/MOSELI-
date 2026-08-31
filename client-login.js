“use strict”;

console.log(“MOSELI: Supabase authentication test starting”);

/* =========================================================
SUPABASE CONFIG
========================================================= */

const SUPABASE_URL =
“https://esumonohssxxalxsfshc.supabase.co”;

const SUPABASE_KEY =
“sb_publishable_lryWHU1aV0782oIFi4JKKg_Y4qugSlt”;

/* =========================================================
SUPABASE CLIENT
========================================================= */

if (!window.supabase) {

alert("ERRO: Biblioteca Supabase não carregada.");
throw new Error(
    "Supabase library unavailable"
);

}

const supabaseClient =
window.supabase.createClient(
SUPABASE_URL,
SUPABASE_KEY
);

/* =========================================================
DOM
========================================================= */

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

const forgotButton =
document.getElementById(
“forgotPasswordBtn”
);

const toggleButton =
document.getElementById(
“togglePassword”
);

/* =========================================================
MESSAGE
========================================================= */

function showMessage(
text,
type = “success”
) {

if (!messageBox) {
    alert(text);
    return;
}
messageBox.textContent =
    text;
messageBox.className =
    "client-login-message show " +
    type;

}

/* =========================================================
PASSWORD TOGGLE
========================================================= */

if (
toggleButton &&
passwordInput
) {

toggleButton.addEventListener(
    "click",
    function (event) {
        event.preventDefault();
        if (
            passwordInput.type ===
            "password"
        ) {
            passwordInput.type =
                "text";
            toggleButton.textContent =
                "Ocultar";
        } else {
            passwordInput.type =
                "password";
            toggleButton.textContent =
                "Mostrar";
        }
    }
);

}

/* =========================================================
FORGOT PASSWORD — TEST ONLY
========================================================= */

if (forgotButton) {

forgotButton.addEventListener(
    "click",
    function (event) {
        event.preventDefault();
        showMessage(
            "A recuperação será configurada depois.",
            "success"
        );
    }
);

}

/* =========================================================
LOGIN
========================================================= */

if (!form) {

alert(
    "ERRO: clientLoginForm não encontrado."
);

} else {

form.addEventListener(
    "submit",
    async function (event) {
        event.preventDefault();
        console.log(
            "MOSELI: login button clicked"
        );
        const email =
            emailInput.value.trim();
        const password =
            passwordInput.value;
        if (!email) {
            showMessage(
                "Introduza o seu email.",
                "error"
            );
            return;
        }
        if (!password) {
            showMessage(
                "Introduza a sua palavra-passe.",
                "error"
            );
            return;
        }
        loginButton.disabled =
            true;
        loginButton.textContent =
            "A autenticar...";
        showMessage(
            "A contactar o Supabase...",
            "success"
        );
        try {
            console.log(
                "MOSELI: calling signInWithPassword"
            );
            const result =
                await supabaseClient.auth
                    .signInWithPassword({
                        email: email,
                        password: password
                    });
            console.log(
                "MOSELI AUTH RESULT:",
                result
            );
            const data =
                result.data;
            const error =
                result.error;
            /* =========================================
               AUTH ERROR
            ========================================= */
            if (error) {
                console.error(
                    "MOSELI AUTH ERROR:",
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
            /* =========================================
               USER CHECK
            ========================================= */
            if (
                !data ||
                !data.user
            ) {
                showMessage(
                    "O Supabase não devolveu um utilizador.",
                    "error"
                );
                loginButton.disabled =
                    false;
                loginButton.textContent =
                    "Entrar no Portal";
                return;
            }
            /* =========================================
               AUTH SUCCESS
            ========================================= */
            console.log(
                "MOSELI AUTH SUCCESS",
                data.user
            );
            showMessage(
                "✓ AUTENTICAÇÃO SUPABASE OK\n\n" +
                "User ID: " +
                data.user.id,
                "success"
            );
            loginButton.disabled =
                false;
            loginButton.textContent =
                "Autenticação OK";
        } catch (error) {
            console.error(
                "MOSELI AUTH EXCEPTION:",
                error
            );
            showMessage(
                "ERRO DE LIGAÇÃO: " +
                (
                    error.message ||
                    String(error)
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

console.log(
“MOSELI: Supabase authentication test ready”
);
