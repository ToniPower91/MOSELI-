"use strict";

/* =========================================================
   MOSELI | CLIENT PORTAL
   Supabase Session + Client Verification
   ========================================================= */

console.log(
    "MOSELI Client Portal: starting"
);


/* =========================================================
   SUPABASE CONFIG
   ========================================================= */

const SUPABASE_URL =
    "https://esumonohssxxalxsfshc.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_lryWHU1aV0782oIFi4JKKg_Y4qugSlt";


/* =========================================================
   START
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    async function () {

        /* =================================================
           SUPABASE CHECK
           ================================================= */

        if (!window.supabase) {

            showFatalError(
                "Não foi possível carregar o sistema MOSELI."
            );

            return;
        }


        /* =================================================
           SUPABASE CLIENT
           ================================================= */

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


        /* =================================================
           DOM
           ================================================= */

        const loading =
            document.getElementById(
                "portalLoading"
            );

        const content =
            document.getElementById(
                "portalContent"
            );

        const logoutButton =
            document.getElementById(
                "logoutButton"
            );


        /* =================================================
           GET SESSION
           ================================================= */

        console.log(
            "MOSELI: checking session..."
        );


        const {
            data: sessionData,
            error: sessionError
        } =
            await supabaseClient.auth
                .getSession();


        if (sessionError) {

            console.error(
                "Session error:",
                sessionError
            );

            showFatalError(
                "Não foi possível verificar a sessão."
            );

            return;
        }


        const session =
            sessionData.session;


        /* =================================================
           NO SESSION
           ================================================= */

        if (
            !session ||
            !session.user
        ) {

            console.log(
                "MOSELI: no active session"
            );

            window.location.replace(
                "./client-login.html"
            );

            return;
        }


        /* =================================================
           AUTH USER
           ================================================= */

        const user =
            session.user;


        console.log(
            "MOSELI authenticated user:",
            user.id
        );


        /* =================================================
           FIND CLIENT
           ================================================= */

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


        /* =================================================
           CLIENT QUERY ERROR
           ================================================= */

        if (clientError) {

            console.error(
                "Client query error:",
                clientError
            );


            showFatalError(
                "Não foi possível carregar os dados do cliente."
            );

            return;
        }


        /* =================================================
           CLIENT NOT FOUND
           ================================================= */

        if (!client) {

            console.error(
                "No client linked to Auth user."
            );


            await supabaseClient.auth.signOut();


            window.location.replace(
                "./client-login.html"
            );

            return;
        }


        /* =================================================
           STATUS
           ================================================= */

        if (
            client.status &&
            String(client.status).toLowerCase() !==
            "active"
        ) {

            await supabaseClient.auth.signOut();


            showFatalError(
                "A sua conta de cliente não está ativa."
            );

            return;
        }


        /* =================================================
           CLIENT VERIFIED
           ================================================= */

        console.log(
            "MOSELI CLIENT VERIFIED:",
            client
        );


        /* =================================================
           POPULATE PORTAL
           ================================================= */

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


        /* =================================================
           AVATAR
           ================================================= */

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


        /* =================================================
           SHOW PORTAL
           ================================================= */

        if (loading) {
            loading.hidden = true;
        }

        if (content) {
            content.hidden = false;
        }


        /* =================================================
           NAVIGATION
           ================================================= */

        const navItems =
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


        navItems.forEach(
            function (button) {

                button.addEventListener(
                    "click",
                    function () {

                        const target =
                            button.dataset.page;


                        navItems.forEach(
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

                                page.hidden =
                                    page.dataset.content !==
                                    target;

                            }
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


                        if (pageTitle) {

                            pageTitle.textContent =
                                titles[target] ||
                                "Portal do Cliente";
                        }

                    }
                );

            }
        );


        /* =================================================
           LOGOUT
           ================================================= */

        if (logoutButton) {

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


                    window.location.replace(
                        "./client-login.html"
                    );

                }
            );

        }


        /* =================================================
           AUTH STATE LISTENER
           ================================================= */

        supabaseClient.auth.onAuthStateChange(
            function (
                event,
                currentSession
            ) {

                console.log(
                    "MOSELI AUTH EVENT:",
                    event
                );


                if (
                    event === "SIGNED_OUT" ||
                    !currentSession
                ) {

                    window.location.replace(
                        "./client-login.html"
                    );

                }

            }
        );


        console.log(
            "MOSELI Client Portal: ready"
        );

    }
);


/* =========================================================
   HELPERS
   ========================================================= */

function setText(
    id,
    value
) {

    const element =
        document.getElementById(id);

    if (!element) return;

    element.textContent =
        value === null ||
        value === undefined ||
        value === ""
            ? "--"
            : value;
}


function showFatalError(
    message
) {

    const loading =
        document.getElementById(
            "portalLoading"
        );

    if (loading) {

        loading.hidden = false;

        loading.textContent =
            message;

        loading.classList.add(
            "portal-error"
        );
    }

    const content =
        document.getElementById(
            "portalContent"
        );

    if (content) {

        content.hidden = true;
    }

}
