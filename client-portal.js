"use strict";

/* =========================================================
   MOSELI | CLIENT PORTAL
   Authentication + Client Verification + Navigation
   ========================================================= */

console.log("MOSELI PORTAL JS STARTED");


const SUPABASE_URL =
    "https://esumonohssxxalxsfshc.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_lryWHU1aV0782oIFi4JKKg_Y4qugSlt";


document.addEventListener("DOMContentLoaded", async function () {

    const loading =
        document.getElementById("portalLoading");

    const content =
        document.getElementById("portalContent");


    /* =====================================================
       HELPER
       ===================================================== */

    function status(message) {

        console.log("MOSELI:", message);

        if (loading) {

            loading.hidden = false;

            loading.innerHTML =
                "<strong>MOSELI</strong><br><br>" +
                message;
        }
    }


    /* =====================================================
       START
       ===================================================== */

    status("A iniciar o Portal do Cliente...");


    /* =====================================================
       SUPABASE LIBRARY
       ===================================================== */

    if (!window.supabase) {

        status(
            "ERRO: A biblioteca Supabase não foi carregada."
        );

        return;
    }


    status(
        "Supabase carregado. A verificar sessão..."
    );


    /* =====================================================
       CREATE CLIENT
       ===================================================== */

    let supabaseClient;

    try {

        supabaseClient =
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

    } catch (error) {

        status(
            "ERRO AO CRIAR CLIENTE SUPABASE:<br><br>" +
            error.message
        );

        return;
    }


    window.moseliSupabase =
        supabaseClient;


    /* =====================================================
       GET SESSION
       ===================================================== */

    let sessionResult;

    try {

        sessionResult =
            await supabaseClient.auth.getSession();

    } catch (error) {

        status(
            "ERRO AO VERIFICAR SESSÃO:<br><br>" +
            error.message
        );

        return;
    }


    if (sessionResult.error) {

        status(
            "ERRO SUPABASE:<br><br>" +
            sessionResult.error.message
        );

        return;
    }


    const session =
        sessionResult.data.session;


    /* =====================================================
       NO SESSION
       ===================================================== */

    if (!session || !session.user) {

        status(
            "Sessão não encontrada.<br><br>" +
            "A redirecionar para o login..."
        );

        setTimeout(function () {

            window.location.href =
                "./client-login.html";

        }, 1500);

        return;
    }


    /* =====================================================
       AUTH USER
       ===================================================== */

    const user =
        session.user;


    console.log(
        "MOSELI AUTH USER:",
        user.id
    );


    status(
        "Autenticação OK ✓<br><br>" +
        "A verificar o cliente..."
    );


    /* =====================================================
       CLIENT QUERY
       ===================================================== */

    let clientResult;

    try {

        clientResult =
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
                    user.id
                )
                .maybeSingle();

    } catch (error) {

        status(
            "ERRO AO CONSULTAR CLIENTS:<br><br>" +
            error.message
        );

        return;
    }


    /* =====================================================
       CLIENT QUERY ERROR
       ===================================================== */

    if (clientResult.error) {

        console.error(
            "MOSELI CLIENT ERROR:",
            clientResult.error
        );


        status(
            "ERRO NA TABELA CLIENTS:<br><br>" +
            clientResult.error.message +
            "<br><br>" +
            "Código: " +
            (
                clientResult.error.code ||
                "--"
            )
        );

        return;
    }


    /* =====================================================
       CLIENT NOT FOUND
       ===================================================== */

    if (!clientResult.data) {

        status(
            "Autenticação OK ✓<br><br>" +

            "Mas o cliente não está ligado a este utilizador.<br><br>" +

            "User ID:<br>" +

            user.id
        );

        return;
    }


    /* =====================================================
       CLIENT
       ===================================================== */

    const client =
        clientResult.data;


    console.log(
        "MOSELI CLIENT:",
        client
    );


    /* =====================================================
       STATUS CHECK
       ===================================================== */

    if (
        client.status &&
        String(client.status).toLowerCase() !== "active"
    ) {

        status(
            "A conta do cliente não está ativa.<br><br>" +
            "Estado: " +
            client.status
        );

        return;
    }


    /* =====================================================
       SAVE CLIENT
       ===================================================== */

    window.moseliClient =
        client;


    sessionStorage.setItem(
        "moseli_client_id",
        client.id
    );


    sessionStorage.setItem(
        "moseli_client_code",
        client.client_code
    );


    /* =====================================================
       POPULATE HEADER
       ===================================================== */

    setText(
        "userName",
        client.full_name
    );


    setText(
        "welcomeName",
        client.full_name
    );


    setText(
        "userCode",
        client.client_code
    );


    setText(
        "dashboardClientCode",
        client.client_code
    );


    setText(
        "dashboardStatus",
        client.status
    );


    setText(
        "profileName",
        client.full_name
    );


    setText(
        "profileEmail",
        client.email || user.email
    );


    setText(
        "profileCode",
        client.client_code
    );


    setText(
        "profileStatus",
        client.status
    );


    setText(
        "profilePhone",
        client.phone
    );


    setText(
        "profileAddress",
        client.address
    );


    /* =====================================================
       AVATAR
       ===================================================== */

    const initial =
        client.full_name
            ? client.full_name
                .trim()
                .charAt(0)
                .toUpperCase()
            : "M";


    setText(
        "userInitial",
        initial
    );


    /* =====================================================
       SHOW PORTAL
       ===================================================== */

    if (loading) {

        loading.hidden = true;

    }


    if (content) {

        content.hidden = false;

    }


    /* =====================================================
       NAVIGATION
       ===================================================== */

    setupNavigation();


    /* =====================================================
       LOGOUT
       ===================================================== */

    const logoutButton =
        document.getElementById(
            "logoutButton"
        );


    if (logoutButton) {

        logoutButton.type = "button";


        logoutButton.addEventListener(
            "click",
            async function () {

                logoutButton.disabled =
                    true;

                logoutButton.textContent =
                    "A sair...";


                try {

                    await supabaseClient.auth.signOut();

                } catch (error) {

                    console.error(
                        "Logout error:",
                        error
                    );

                }


                sessionStorage.removeItem(
                    "moseli_client_id"
                );


                sessionStorage.removeItem(
                    "moseli_client_code"
                );


                window.location.href =
                    "./client-login.html";

            }
        );

    }


    console.log(
        "MOSELI PORTAL READY ✓"
    );

});


/* =========================================================
   NAVIGATION
   ========================================================= */

function setupNavigation() {

    const buttons =
        document.querySelectorAll(
            ".portal-nav-item"
        );


    const pages =
        document.querySelectorAll(
            ".portal-page"
        );


    const pageTitle =
        document.getElementById(
            "pageTitle"
        );


    const titles = {

        dashboard:
            "Dashboard",

        service:
            "Meu Serviço",

        collections:
            "Recolhas",

        payments:
            "Pagamentos",

        requests:
            "Pedidos",

        profile:
            "Meu Perfil"

    };


    buttons.forEach(function (button) {

        button.type = "button";


        button.addEventListener(
            "click",
            function (event) {

                event.preventDefault();


                const target =
                    button.getAttribute(
                        "data-page"
                    );


                console.log(
                    "MOSELI OPEN PAGE:",
                    target
                );


                buttons.forEach(
                    function (item) {

                        item.classList.remove(
                            "active"
                        );

                    }
                );


                button.classList.add(
                    "active"
                );


                pages.forEach(
                    function (page) {

                        const pageName =
                            page.getAttribute(
                                "data-content"
                            );


                        page.hidden =
                            pageName !== target;

                    }
                );


                if (pageTitle) {

                    pageTitle.textContent =
                        titles[target] ||
                        "Portal do Cliente";

                }

            }
        );

    });


    console.log(
        "MOSELI NAVIGATION READY:",
        buttons.length,
        "buttons"
    );

}


/* =========================================================
   SET TEXT
   ========================================================= */

function setText(id, value) {

    const element =
        document.getElementById(id);


    if (!element) {

        return;
    }


    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {

        element.textContent =
            "--";

        return;
    }


    element.textContent =
        value;

}
