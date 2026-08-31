"use strict";

alert("MOSELI TEST VERSION 2026 - NEW JS");

document.addEventListener("DOMContentLoaded", function () {

    const message = document.getElementById("loginMessage");

    if (message) {
        message.textContent =
            "NOVO client-login.js CARREGADO";
        message.className =
            "client-login-message show success";
    }

});
