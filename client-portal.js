“use strict”;

/* =========================================================
MOSELI | CLIENT PORTAL
Authentication + Client Verification + Navigation
========================================================= */

console.log(“MOSELI Client Portal: starting”);

/* =========================================================
SUPABASE CONFIG
========================================================= */

const SUPABASE_URL =
“https://esumonohssxxalxsfshc.supabase.co”;

const SUPABASE_KEY =
“sb_publishable_lryWHU1aV0782oIFi4JKKg_Y4qugSlt”;

/* =========================================================
START APPLICATION
========================================================= */

document.addEventListener(“DOMContentLoaded”, async function () {

console.log("MOSELI: DOM loaded");
/* =====================================================
   CHECK SUPABASE
   ===================================================== */
if (!window.supabase) {
    showFatalError(
        "Não foi possível carregar o sistema MOSELI."
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
window.moseliSupabase = supabaseClient;
/* =====================================================
   DOM ELEMENTS
   ===================================================== */
const loading =
    document.getElementById("portalLoading");
const content =
    document.getElementById("portalContent");
const logoutButton =
    document.getElementById("logoutButton");
/* =====================================================
   CHECK AUTH SESSION
   ===================================================== */
console.log("MOSELI: checking authentication...");
const {
    data: sessionData,
    error: sessionError
} = await supabaseClient.auth.getSession();
if (sessionError) {
    console.error(
        "MOSELI session error:",
        sessionError
    );
    showFatalError(
        "Não foi possível verificar a sessão."
    );
    return;
}
const session =
    sessionData.session;
/* =====================================================
   NO SESSION
   ===================================================== */
if (!session || !session.user) {
    console.log(
        "MOSELI: no active session"
    );
    window.location.replace(
        "./client-login.html"
    );
    return;
}
/* =====================================================
   AUTH USER
   ===================================================== */
const user =
    session.user;
console.log(
    "MOSELI authenticated:",
    user.id
);
/* =====================================================
   FIND CLIENT
   ===================================================== */
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
if (clientError) {
    console.error(
        "MOSELI client query error:",
        clientError
    );
    showFatalError(
        "Não foi possível carregar os dados do cliente."
    );
    return;
}
/* =====================================================
   CLIENT NOT FOUND
   ===================================================== */
if (!client) {
    console.error(
        "MOSELI: client not linked to Auth user"
    );
    await supabaseClient.auth.signOut();
    window.location.replace(
        "./client-login.html"
    );
    return;
}
/* =====================================================
   CLIENT STATUS
   ===================================================== */
if (
    client.status &&
    String(client.status).toLowerCase() !== "active"
) {
    await supabaseClient.auth.signOut();
    showFatalError(
        "A sua conta de cliente não está ativa."
    );
    return;
}
/* =====================================================
   SAVE CLIENT DATA
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
console.log(
    "MOSELI CLIENT VERIFIED:",
    client
);
/* =====================================================
   POPULATE USER INFORMATION
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
   PORTAL NAVIGATION
   ===================================================== */
setupNavigation();
/* =====================================================
   LOGOUT
   ===================================================== */
if (logoutButton) {
    logoutButton.type = "button";
    logoutButton.addEventListener(
        "click",
        async function (event) {
            event.preventDefault();
            logoutButton.disabled = true;
            logoutButton.textContent =
                "A sair...";
            try {
                await supabaseClient.auth.signOut();
            } catch (error) {
                console.error(
                    "MOSELI logout error:",
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
/* =====================================================
   NEW REQUEST BUTTON
   ===================================================== */
const newRequestButton =
    document.getElementById(
        "newRequestButton"
    );
if (newRequestButton) {
    newRequestButton.type = "button";
    newRequestButton.addEventListener(
        "click",
        function (event) {
            event.preventDefault();
            openPage("requests");
        }
    );
}
/* =====================================================
   AUTH STATE LISTENER
   ===================================================== */
supabaseClient.auth.onAuthStateChange(
    function (event, currentSession) {
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
/* =====================================================
   DEFAULT PAGE
   ===================================================== */
openPage("dashboard");
console.log(
    "MOSELI Client Portal: READY"
);

});

/* =========================================================
NAVIGATION SETUP
========================================================= */

function setupNavigation() {

const navItems =
    document.querySelectorAll(
        ".portal-nav-item"
    );
console.log(
    "MOSELI navigation buttons:",
    navItems.length
);
navItems.forEach(function (button) {
    /* Prevent form submission */
    button.type = "button";
    /* Remove old listeners by cloning */
    const newButton =
        button.cloneNode(true);
    button.parentNode.replaceChild(
        newButton,
        button
    );
    newButton.addEventListener(
        "click",
        function (event) {
            event.preventDefault();
            event.stopPropagation();
            const target =
                newButton.getAttribute(
                    "data-page"
                );
            console.log(
                "MOSELI navigation:",
                target
            );
            openPage(target);
        }
    );
});

}

/* =========================================================
OPEN PAGE
========================================================= */

function openPage(pageName) {

console.log(
    "MOSELI opening page:",
    pageName
);
const pages =
    document.querySelectorAll(
        ".portal-page"
    );
const navItems =
    document.querySelectorAll(
        ".portal-nav-item"
    );
const pageTitle =
    document.getElementById(
        "pageTitle"
    );
/* =====================================================
   PAGE TITLES
   ===================================================== */
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
/* =====================================================
   SHOW/HIDE PAGES
   ===================================================== */
pages.forEach(function (page) {
    const pageType =
        page.getAttribute(
            "data-content"
        );
    if (pageType === pageName) {
        page.hidden = false;
        page.style.display = "";
    } else {
        page.hidden = true;
        page.style.display = "none";
    }
});
/* =====================================================
   ACTIVE NAVIGATION
   ===================================================== */
navItems.forEach(function (button) {
    const buttonPage =
        button.getAttribute(
            "data-page"
        );
    if (buttonPage === pageName) {
        button.classList.add(
            "active"
        );
    } else {
        button.classList.remove(
            "active"
        );
    }
});
/* =====================================================
   UPDATE TITLE
   ===================================================== */
if (pageTitle) {
    pageTitle.textContent =
        titles[pageName] ||
        "Portal do Cliente";
}
/* =====================================================
   SCROLL TO TOP
   ===================================================== */
window.scrollTo({
    top: 0,
    behavior: "smooth"
});
console.log(
    "MOSELI page opened:",
    pageName
);

}

/* =========================================================
TEXT HELPER
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

/* =========================================================
ERROR
========================================================= */

function showFatalError(message) {

const loading =
    document.getElementById(
        "portalLoading"
    );
const content =
    document.getElementById(
        "portalContent"
    );
if (loading) {
    loading.hidden = false;
    loading.textContent =
        message;
    loading.classList.add(
        "portal-error"
    );
}
if (content) {
    content.hidden = true;
}

}
