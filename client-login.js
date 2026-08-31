"use strict";

alert("MOSELI JS ESTÁ A FUNCIONAR");

document.addEventListener("DOMContentLoaded", function () {

    const form = document.getElementById("clientLoginForm");
    const loginButton = document.getElementById("loginButton");
    const forgotButton = document.getElementById("forgotPasswordBtn");
    const toggleButton = document.getElementById("togglePassword");
    const password = document.getElementById("clientPassword");
    const message = document.getElementById("loginMessage");

    function show(text) {
        if (message) {
            message.textContent = text;
            message.className =
                "client-login-message show success";
        } else {
            alert(text);
        }
    }

    if (form) {
        form.addEventListener("submit", function (event) {
            event.preventDefault();
            event.stopPropagation();

            show("✓ O botão Entrar está a funcionar.");
        });
    }

    if (forgotButton) {
        forgotButton.addEventListener("click", function (event) {
            event.preventDefault();

            show("✓ O botão Esqueci a palavra-passe está a funcionar.");
        });
    }

    if (toggleButton && password) {
        toggleButton.addEventListener("click", function (event) {
            event.preventDefault();

            if (password.type === "password") {
                password.type = "text";
                toggleButton.textContent = "Ocultar";
            } else {
                password.type = "password";
                toggleButton.textContent = "Mostrar";
            }
        });
    }

    console.log("MOSELI: todos os testes JS carregados.");
});
