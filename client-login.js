"use strict";

/* =========================================================
   MOSELI | CLIENT LOGIN
   Supabase Authentication + Client Verification
   ========================================================= */

console.log("MOSELI Client Login: starting");


/* =========================================================
   SUPABASE CONFIG
   ========================================================= */

const SUPABASE_URL =
    "https://esumonohssxxalxsfshc.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_lryWHU1aV0782oIFi4JKKg_Y4qugSlt";


/* =========================================================
   DOM
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {

    const form =
        document.getElementById("clientLoginForm");

    const emailInput =
        document.getElementById("clientEmail");

    const passwordInput =
        document.getElementById("clientPassword");

    const loginButton =
        document.getElementById("loginButton");

    const messageBox =
        document.getElementById("loginMessage");

    const togglePassword =
        document.getElementById("togglePassword");

    const forgotPasswordBtn =
        document.getElementById("forgotPasswordBtn");


    /* =====================================================
       MESSAGE
       ===================================================== */

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
            "client-login-message show " +
            type;
    }


    function clearMessage() {

        if (!messageBox) return;

        messageBox.textContent = "";

        messageBox.className =
            "client-login-message";
    }


    /* =====================================================
       SUPABASE CHECK
       ===================================================== */

    if (!window.supabase) {

        showMessage(
            "Não foi possível carregar o sistema de autenticação.",
            "error"
        );

        console.error(
            "Supabase library not found."
        );

        return;
    }


    /* =====================================================
       CREATE SUPABASE CLIENT
       ===================================================== */

    const supabaseClient =
        window.supabase.createClient(
            SUPABASE_URL,
            SUPABASE_KEY,
            {
                auth: {
                    persistSession: true,
                    autoRefreshToken: true,
                    detectSessionInUrl: true
                }
            }
        );


    console.log(
        "MOSELI: Supabase initialized"
    );


    /* =====================================================
       PASSWORD TOGGLE
       ===================================================== */

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


    /* =====================================================
       FORGOT PASSWORD
       ===================================================== */

    if (forgotPasswordBtn) {

        forgotPasswordBtn.addEventListener(
            "click",
            async function () {

                clearMessage();

                const email =
                    emailInput.value.trim();


                if (!email) {

                    showMessage(
                        "Introduza o seu email primeiro.",
                        "error"
                    );

                    emailInput.focus();

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
                            "Password reset error:",
                            error
                        );

                        showMessage(
                            "Erro: " +
                            error.message,
                            "error"
                        );

                    } else {

                        showMessage(
                            "Foi enviado um email para redefinir a palavra-passe.",
                            "success"
                        );
                    }


                } catch (error) {

                    console.error(
                        "Password reset exception:",
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


    /* =====================================================
       LOGIN
       ===================================================== */

    if (!form) {

        console.error(
            "MOSELI: login form not found."
        );

        return;
    }


    form.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();

            clearMessage();


            const email =
                emailInput.value.trim();

            const password =
                passwordInput.value;


            /* ---------------------------------------------
               VALIDATION
            --------------------------------------------- */

            if (!email) {

                showMessage(
                    "Introduza o seu email.",
                    "error"
                );

                emailInput.focus();

                return;
            }


            if (!password) {

                showMessage(
                    "Introduza a sua palavra-passe.",
                    "error"
                );

                passwordInput.focus();

                return;
            }


            /* ---------------------------------------------
               LOADING
            --------------------------------------------- */

            loginButton.disabled =
                true;

            loginButton.textContent =
                "A autenticar...";


            try {

                /* =========================================
                   SUPABASE AUTH
                ========================================= */

                console.log(
                    "MOSELI: authenticating..."
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


                if (error) {

                    console.error(
                        "MOSELI AUTH ERROR:",
                        error
                    );

                    showMessage(
                        "Email ou palavra-passe incorretos.",
                        "error"
                    );

                    loginButton.disabled =
                        false;

                    loginButton.textContent =
                        "Entrar no Portal";

                    return;
                }


                if (
                    !data ||
                    !data.user
                ) {

                    showMessage(
                        "Não foi possível identificar a conta.",
                        "error"
                    );

                    loginButton.disabled =
                        false;

                    loginButton.textContent =
                        "Entrar no Portal";

                    return;
                }


                const user =
                    data.user;


                console.log(
                    "MOSELI: authenticated user:",
                    user.id
                );


                /* =========================================
                   CLIENT VERIFICATION
                ========================================= */

                showMessage(
                    "Login efetuado. A verificar a conta...",
                    "success"
                );


                const {
                    data: client,
                    error: clientError
                } =
                    await supabaseClient
                        .from("clients")
                        .select(`
                            id,
                            auth_user_id,
                            client_code,
                            full_name,
                            email,
                            status
                        `)
                        .eq(
                            "auth_user_id",
                            user.id
                        )
                        .maybeSingle();


                if (clientError) {

                    console.error(
                        "MOSELI CLIENT ERROR:",
                        clientError
                    );


                    await supabaseClient.auth.signOut();


                    showMessage(
                        "Não foi possível verificar o seu registo de cliente.",
                        "error"
                    );


                    loginButton.disabled =
                        false;

                    loginButton.textContent =
                        "Entrar no Portal";

                    return;
                }


                if (!client) {

                    console.error(
                        "No client record for:",
                        user.id
                    );


                    await supabaseClient.auth.signOut();


                    showMessage(
                        "Esta conta não está associada a um cliente MOSELI.",
                        "error"
                    );


                    loginButton.disabled =
                        false;

                    loginButton.textContent =
                        "Entrar no Portal";

                    return;
                }


                /* =========================================
                   STATUS
                ========================================= */

                if (
                    client.status &&
                    String(client.status).toLowerCase() !==
                    "active"
                ) {

                    await supabaseClient.auth.signOut();


                    showMessage(
                        "A sua conta de cliente não está ativa.",
                        "error"
                    );


                    loginButton.disabled =
                        false;

                    loginButton.textContent =
                        "Entrar no Portal";

                    return;
                }


                /* =========================================
                   SAVE CLIENT DATA
                ========================================= */

                sessionStorage.setItem(
                    "moseli_client_id",
                    client.id
                );

                sessionStorage.setItem(
                    "moseli_client_code",
                    client.client_code || ""
                );


                console.log(
                    "MOSELI CLIENT VERIFIED:",
                    client
                );


                /* =========================================
                   SUCCESS
                ========================================= */

                showMessage(
                    "Login efetuado com sucesso. A abrir o Portal...",
                    "success"
                );


                loginButton.textContent =
                    "A abrir o Portal...";


                /* =========================================
                   REDIRECT
                ========================================= */

                setTimeout(
                    function () {

                        window.location.href =
                            "./client-portal.html";

                    },
                    700
                );

            } catch (error) {

                console.error(
                    "MOSELI LOGIN EXCEPTION:",
                    error
                );


                showMessage(
                    "Ocorreu um erro ao iniciar sessão.",
                    "error"
                );


                loginButton.disabled =
                    false;

                loginButton.textContent =
                    "Entrar no Portal";
            }

        }
    );


    console.log(
        "MOSELI Client Login: ready"
    );

});
