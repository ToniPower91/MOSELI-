“use strict”;

console.log(“MOSELI DIAGNOSTIC JS LOADED”);

const SUPABASE_URL =
“https://esumonohssxxalxsfshc.supabase.co”;

const SUPABASE_KEY =
“sb_publishable_lryWHU1aV0782oIFi4JKKg_Y4qugSlt”;

document.addEventListener(“DOMContentLoaded”, async function () {

console.log("MOSELI: DOM READY");
const loading =
    document.getElementById("portalLoading");
const content =
    document.getElementById("portalContent");
/* =====================================================
   STEP 1
   ===================================================== */
showStatus(
    "STEP 1: JavaScript carregado..."
);
if (!window.supabase) {
    showError(
        "ERRO: Supabase JavaScript não foi carregado."
    );
    return;
}
console.log(
    "MOSELI: Supabase library detected"
);
/* =====================================================
   STEP 2
   ===================================================== */
showStatus(
    "STEP 2: Supabase carregado. A verificar sessão..."
);
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
window.moseliSupabase =
    supabaseClient;
/* =====================================================
   STEP 3
   ===================================================== */
console.log(
    "MOSELI: calling getSession()"
);
const {
    data: sessionData,
    error: sessionError
} =
    await supabaseClient.auth.getSession();
if (sessionError) {
    console.error(
        "SESSION ERROR:",
        sessionError
    );
    showError(
        "ERRO NA SESSÃO: " +
        sessionError.message
    );
    return;
}
const session =
    sessionData.session;
console.log(
    "MOSELI SESSION:",
    session
);
if (!session || !session.user) {
    showError(
        "SEM SESSÃO. O utilizador não está autenticado."
    );
    return;
}
/* =====================================================
   STEP 4
   ===================================================== */
const user =
    session.user;
console.log(
    "MOSELI AUTH USER ID:",
    user.id
);
showStatus(
    "STEP 3: Sessão OK. User ID: " +
    user.id +
    "<br><br>" +
    "STEP 4: A procurar cliente..."
);
/* =====================================================
   STEP 5
   CLIENT QUERY
   ===================================================== */
console.log(
    "MOSELI: querying clients table..."
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
console.log(
    "MOSELI CLIENT RESULT:",
    client
);
console.log(
    "MOSELI CLIENT ERROR:",
    clientError
);
/* =====================================================
   CLIENT QUERY ERROR
   ===================================================== */
if (clientError) {
    showError(
        "ERRO AO CONSULTAR CLIENTS:<br><br>" +
        clientError.message +
        "<br><br>" +
        "Código: " +
        (clientError.code || "--")
    );
    return;
}
/* =====================================================
   CLIENT NOT FOUND
   ===================================================== */
if (!client) {
    showError(
        "AUTENTICAÇÃO OK, MAS CLIENTE NÃO ENCONTRADO.<br><br>" +
        "User ID:<br>" +
        user.id +
        "<br><br>" +
        "Verifique se public.clients.auth_user_id " +
        "é exatamente igual a este User ID."
    );
    return;
}
/* =====================================================
   CLIENT FOUND
   ===================================================== */
console.log(
    "MOSELI CLIENT VERIFIED:",
    client
);
showStatus(
    "STEP 5: CLIENTE ENCONTRADO ✓<br><br>" +
    "Nome: " +
    escapeHTML(client.full_name) +
    "<br>" +
    "Código: " +
    escapeHTML(client.client_code) +
    "<br>" +
    "Estado: " +
    escapeHTML(client.status) +
    "<br><br>" +
    "STEP 6: Portal carregado ✓"
);
/* =====================================================
   POPULATE BASIC DATA
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
/* =====================================================
   AVATAR
   ===================================================== */
setText(
    "userInitial",
    client.full_name
        ? client.full_name
            .trim()
            .charAt(0)
            .toUpperCase()
        : "M"
);
/* =====================================================
   HIDE LOADING
   ===================================================== */
if (loading) {
    loading.hidden = true;
}
/* =====================================================
   SHOW CONTENT
   ===================================================== */
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
            await supabaseClient.auth.signOut();
            window.location.replace(
                "./client-login.html"
            );
        }
    );
}
console.log(
    "MOSELI PORTAL FULLY LOADED"
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
const title =
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
                button.dataset.page;
            console.log(
                "MOSELI NAVIGATION:",
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
                        page.dataset.content;
                    if (
                        pageName === target
                    ) {
                        page.hidden = false;
                    } else {
                        page.hidden = true;
                    }
                }
            );
            if (title) {
                title.textContent =
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
element.textContent =
    value === null ||
    value === undefined ||
    value === ""
        ? "--"
        : value;

}

/* =========================================================
STATUS MESSAGE
========================================================= */

function showStatus(message) {

const loading =
    document.getElementById(
        "portalLoading"
    );
if (!loading) {
    return;
}
loading.hidden = false;
loading.innerHTML =
    "<strong>MOSELI DIAGNOSTIC</strong><br><br>" +
    message;

}

/* =========================================================
ERROR MESSAGE
========================================================= */

function showError(message) {

const loading =
    document.getElementById(
        "portalLoading"
    );
if (!loading) {
    return;
}
loading.hidden = false;
loading.innerHTML =
    "<strong>MOSELI ERROR</strong><br><br>" +
    message;
loading.style.color =
    "#b91c1c";

}

/* =========================================================
HTML ESCAPE
========================================================= */

function escapeHTML(value) {

return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

}
