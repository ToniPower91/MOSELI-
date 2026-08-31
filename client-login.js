“use strict”;

console.log(“MOSELI DIAGNOSTIC: JavaScript carregado”);

document.addEventListener(“DOMContentLoaded”, function () {

console.log(“MOSELI DIAGNOSTIC: DOM carregado”);

// Create visible diagnostic message
const message = document.createElement(“div”);

message.textContent = “✓ JavaScript carregado”;

message.style.position = “fixed”;
message.style.top = “15px”;
message.style.left = “50%”;
message.style.transform = “translateX(-50%)”;
message.style.zIndex = “99999”;

message.style.padding = “12px 20px”;
message.style.borderRadius = “8px”;

message.style.background = “#166534”;
message.style.color = “#ffffff”;

message.style.fontFamily =
“Arial, sans-serif”;

message.style.fontSize = “14px”;
message.style.fontWeight = “700”;

message.style.boxShadow =
“0 5px 20px rgba(0,0,0,0.2)”;

document.body.appendChild(message);

// Test the login button
const loginButton =
document.getElementById(“loginButton”);

if (loginButton) {

console.log(
  "MOSELI DIAGNOSTIC: Botão Entrar encontrado"
);
loginButton.addEventListener(
  "click",
  function () {
    alert(
      "✓ JavaScript está funcionando!\n\n" +
      "O botão Entrar foi clicado."
    );
  }
);

} else {

console.error(
  "MOSELI DIAGNOSTIC: Botão Entrar NÃO encontrado"
);

}

// Test forgot password
const forgotButton =
document.getElementById(
“forgotPasswordBtn”
);

if (forgotButton) {

console.log(
  "MOSELI DIAGNOSTIC: Botão recuperação encontrado"
);
forgotButton.addEventListener(
  "click",
  function () {
    alert(
      "✓ JavaScript está funcionando!\n\n" +
      "O botão 'Esqueci a palavra-passe' foi clicado."
    );
  }
);

}

// Test password visibility
const passwordInput =
document.getElementById(
“clientPassword”
);

const togglePassword =
document.getElementById(
“togglePassword”
);

if (
passwordInput &&
togglePassword
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

});
