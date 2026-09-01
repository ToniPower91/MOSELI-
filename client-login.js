"use strict";

document.addEventListener("DOMContentLoaded", async function () {

    const message = document.getElementById("loginMessage");
    const form = document.getElementById("clientLoginForm");
    const emailInput = document.getElementById("clientEmail");
    const passwordInput = document.getElementById("clientPassword");
    const loginButton = document.getElementById("loginButton");

    function showMessage(text, type = "success") {
        if (!message) {
            alert(text);
            return;
        }

        message.textContent = text;
        message.className =
            "client-login-message show " + type;
    }

    console.log("MOSELI: login JS loaded");

    /* -----------------------------------------
       CHECK SUPABASE LIBRARY
    ----------------------------------------- */

    if (!window.supabase) {
        showMessage(
            "ERRO: Biblioteca Supabase não foi carregada.",
            "error"
        );
        return;
    }

    showMessage(
        "Supabase carregado. Pronto para testar.",
        "success"
    );

    /* -----------------------------------------
       CREATE SUPABASE CLIENT
    ----------------------------------------- */

    const SUPABASE_URL =
        "https://esumonohssxxalxsfshc.supabase.co";

    const SUPABASE_KEY =
        "sb_publishable_lryWHU1aV0782oIFi4JKKg_Y4qugSlt";

    const supabaseClient =
        window.supabase.createClient(
            SUPABASE_URL,
            SUPABASE_KEY
        );

    console.log("MOSELI: Supabase client created");


    /* -----------------------------------------
       LOGIN
    ----------------------------------------- */

    if (!form) {
        showMessage(
            "ERRO: formulário de login não encontrado.",
            "error"
        );
        return;
    }

    form.addEventListener("submit", async function (event) {

        event.preventDefault();

        console.log("MOSELI: Entrar pressionado");

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

        loginButton.disabled = true;
        loginButton.textContent = "A autenticar...";

        showMessage(
            "A autenticar com o Supabase...",
            "success"
        );

        try {

            const result =
                await supabaseClient.auth.signInWithPassword({
                    email: email,
                    password: password
                });

            console.log(
                "MOSELI AUTH RESULT:",
                result
            );

            if (result.error) {

                showMessage(
                    "AUTH ERROR: " +
                    result.error.message,
                    "error"
                );

                loginButton.disabled = false;
                loginButton.textContent =
                    "Entrar no Portal";

                return;
            }

            if (!result.data || !result.data.user) {

                showMessage(
                    "O Supabase não devolveu o utilizador.",
                    "error"
                );

                loginButton.disabled = false;
                loginButton.textContent =
                    "Entrar no Portal";

                return;
            }

            const user =
                result.data.user;

            console.log(
                "MOSELI AUTH SUCCESS:",
                user.id
            );

            showMessage(
                "AUTENTICAÇÃO OK! User ID: " +
                user.id,
                "success"
            );

            loginButton.disabled = false;
            loginButton.textContent =
                "Autenticação OK";

        } catch (error) {

            console.error(
                "MOSELI AUTH EXCEPTION:",
                error
            );

            showMessage(
                "ERRO: " +
                (
                    error.message ||
                    String(error)
                ),
                "error"
            );

            loginButton.disabled = false;
            loginButton.textContent =
                "Entrar no Portal";
        }
    });


    /* -----------------------------------------
       PASSWORD TOGGLE
    ----------------------------------------- */

    const toggle =
        document.getElementById("togglePassword");

    if (toggle && passwordInput) {

        toggle.addEventListener(
            "click",
            function (event) {

                event.preventDefault();

                if (
                    passwordInput.type ===
                    "password"
                ) {

                    passwordInput.type =
                        "text";

                    toggle.textContent =
                        "Ocultar";

                } else {

                    passwordInput.type =
                        "password";

                    toggle.textContent =
                        "Mostrar";
                }
            }
        );
    }

});
