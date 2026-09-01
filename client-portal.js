“use strict”;

/* =========================================================
MOSELI | CLIENT PORTAL
LIVE DASHBOARD
========================================================= */

const SUPABASE_URL =
“https://esumonohssxxalxsfshc.supabase.co”;

const SUPABASE_KEY =
“sb_publishable_lryWHU1aV0782oIFi4JKKg_Y4qugSlt”;

let db;
let client;

/* =========================================================
START
========================================================= */

document.addEventListener(“DOMContentLoaded”, async () => {

console.log("MOSELI PORTAL: starting");
if (!window.supabase) {
    console.error("Supabase library not loaded.");
    return;
}
db = window.supabase.createClient(
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
const {
    data: sessionData,
    error: sessionError
} = await db.auth.getSession();
if (sessionError || !sessionData.session) {
    console.error(
        "No authenticated session."
    );
    window.location.replace(
        "./client-login.html"
    );
    return;
}
const user =
    sessionData.session.user;
/* =====================================================
   CLIENT
   ===================================================== */
const {
    data: clientData,
    error: clientError
} = await db
    .from("clients")
    .select("*")
    .eq("auth_user_id", user.id)
    .maybeSingle();
if (clientError) {
    console.error(
        "Client query error:",
        clientError
    );
    showError(
        "Não foi possível carregar os dados do cliente."
    );
    return;
}
if (!clientData) {
    console.error(
        "No client linked to Auth user."
    );
    await db.auth.signOut();
    window.location.replace(
        "./client-login.html"
    );
    return;
}
client = clientData;
if (
    String(client.status).toLowerCase() !==
    "active"
) {
    showError(
        "A sua conta de cliente não está activa."
    );
    return;
}
/* =====================================================
   CLIENT HEADER
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
    translateStatus(client.status)
);
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
   PROFILE
   ===================================================== */
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
    translateStatus(client.status)
);
/* =====================================================
   NAVIGATION
   ===================================================== */
setupNavigation();
/* =====================================================
   LOGOUT
   ===================================================== */
setupLogout();
/* =====================================================
   LOAD DASHBOARD
   ===================================================== */
await loadDashboard();
/* =====================================================
   SHOW PORTAL
   ===================================================== */
const loading =
    document.getElementById("portalLoading");
const content =
    document.getElementById("portalContent");
if (loading) {
    loading.hidden = true;
}
if (content) {
    content.hidden = false;
}
console.log(
    "MOSELI PORTAL: ready"
);

});

/* =========================================================
DASHBOARD
========================================================= */

async function loadDashboard() {

await Promise.all([
    loadSubscription(),
    loadNextCollection(),
    loadPayments(),
    loadRequests()
]);

}

/* =========================================================
SUBSCRIPTION
========================================================= */

async function loadSubscription() {

const {
    data,
    error
} = await db
    .from("subscriptions")
    .select("*")
    .eq("client_id", client.id)
    .eq("status", "active")
    .order("start_date", {
        ascending: false
    })
    .limit(1)
    .maybeSingle();
if (error) {
    console.error(
        "Subscription error:",
        error
    );
    return;
}
const box =
    document.getElementById(
        "serviceInfo"
    );
if (!box) {
    return;
}
if (!data) {
    box.innerHTML =
        "Nenhum serviço activo encontrado.";
    return;
}
box.innerHTML = `
    <strong>
        ${safe(data.plan_name)}
    </strong>
    <br><br>
    <strong>Frequência:</strong>
    ${safe(data.frequency)}
    <br>
    <strong>Preço:</strong>
    ${money(
        data.price,
        data.currency
    )}
    <br>
    <strong>Início:</strong>
    ${formatDate(data.start_date)}
    <br>
    <strong>Estado:</strong>
    ${translateStatus(data.status)}
`;
/* =====================================================
   DASHBOARD SERVICE CARD
   ===================================================== */
const dashboard =
    document.querySelector(
        '[data-content="dashboard"]'
    );
if (!dashboard) {
    return;
}
const serviceCard =
    dashboard.querySelector(
        ".portal-card:nth-child(3) strong"
    );
if (serviceCard) {
    serviceCard.textContent =
        data.plan_name;
}

}

/* =========================================================
NEXT COLLECTION
========================================================= */

async function loadNextCollection() {

const today =
    new Date()
        .toISOString()
        .split("T")[0];
const {
    data,
    error
} = await db
    .from("collections")
    .select("*")
    .eq("client_id", client.id)
    .gte(
        "collection_date",
        today
    )
    .neq(
        "status",
        "cancelled"
    )
    .order(
        "collection_date",
        {
            ascending: true
        }
    )
    .limit(1)
    .maybeSingle();
if (error) {
    console.error(
        "Collection error:",
        error
    );
    return;
}
const dashboard =
    document.querySelector(
        '[data-content="dashboard"]'
    );
if (!dashboard) {
    return;
}
let existing =
    document.getElementById(
        "nextCollectionCard"
    );
if (!existing) {
    existing =
        document.createElement("div");
    existing.id =
        "nextCollectionCard";
    existing.className =
        "portal-section";
    dashboard.appendChild(
        existing
    );
}
if (!data) {
    existing.innerHTML = `
        <h2>
            Próxima Recolha
        </h2>
        <div class="empty-state">
            Não existem recolhas agendadas.
        </div>
    `;
    return;
}
existing.innerHTML = `
    <h2>
        Próxima Recolha
    </h2>
    <div class="info-box">
        <strong>
            ${formatDate(
                data.collection_date
            )}
        </strong>
        <br>
        Hora:
        ${safe(
            data.collection_time ||
            "--"
        )}
        <br>
        Local:
        ${safe(
            data.location ||
            "--"
        )}
        <br>
        Frequência:
        ${safe(
            data.frequency ||
            "--"
        )}
        <br>
        Estado:
        ${translateStatus(
            data.status
        )}
    </div>
`;

}

/* =========================================================
PAYMENTS
========================================================= */

async function loadPayments() {

const {
    data,
    error
} = await db
    .from("payments")
    .select("*")
    .eq("client_id", client.id)
    .order(
        "payment_date",
        {
            ascending: false
        }
    )
    .limit(5);
if (error) {
    console.error(
        "Payments error:",
        error
    );
    return;
}
const dashboard =
    document.querySelector(
        '[data-content="dashboard"]'
    );
if (!dashboard) {
    return;
}
let section =
    document.getElementById(
        "recentPayments"
    );
if (!section) {
    section =
        document.createElement("div");
    section.id =
        "recentPayments";
    section.className =
        "portal-section";
    dashboard.appendChild(
        section
    );
}
if (!data || data.length === 0) {
    section.innerHTML = `
        <h2>
            Pagamentos Recentes
        </h2>
        <div class="empty-state">
            Ainda não existem pagamentos.
        </div>
    `;
    return;
}
section.innerHTML = `
    <h2>
        Pagamentos Recentes
    </h2>
    ${data.map(payment => `
        <div class="info-box">
            <strong>
                ${money(
                    payment.amount,
                    payment.currency
                )}
            </strong>
            <br>
            Data:
            ${formatDate(
                payment.payment_date
            )}
            <br>
            Método:
            ${safe(
                payment.payment_method ||
                "--"
            )}
            <br>
            Estado:
            ${translateStatus(
                payment.status
            )}
        </div>
    `).join("")}
`;

}

/* =========================================================
REQUESTS
========================================================= */

async function loadRequests() {

const {
    data,
    error
} = await db
    .from("requests")
    .select("*")
    .eq("client_id", client.id)
    .in(
        "status",
        [
            "new",
            "in_progress"
        ]
    )
    .order(
        "created_at",
        {
            ascending: false
        }
    );
if (error) {
    console.error(
        "Requests error:",
        error
    );
    return;
}
const dashboard =
    document.querySelector(
        '[data-content="dashboard"]'
    );
if (!dashboard) {
    return;
}
let section =
    document.getElementById(
        "openRequests"
    );
if (!section) {
    section =
        document.createElement("div");
    section.id =
        "openRequests";
    section.className =
        "portal-section";
    dashboard.appendChild(
        section
    );
}
if (!data || data.length === 0) {
    section.innerHTML = `
        <h2>
            Pedidos em Aberto
        </h2>
        <div class="empty-state">
            Não existem pedidos em aberto.
        </div>
    `;
    return;
}
section.innerHTML = `
    <h2>
        Pedidos em Aberto
    </h2>
    ${data.map(request => `
        <div class="info-box">
            <strong>
                ${safe(
                    request.subject
                )}
            </strong>
            <br>
            Código:
            ${safe(
                request.request_code
            )}
            <br>
            Prioridade:
            ${safe(
                request.priority
            )}
            <br>
            Estado:
            ${translateStatus(
                request.status
            )}
        </div>
    `).join("")}
`;

}

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
buttons.forEach(button => {
    button.addEventListener(
        "click",
        () => {
            const target =
                button.dataset.page;
            buttons.forEach(item =>
                item.classList.remove(
                    "active"
                )
            );
            button.classList.add(
                "active"
            );
            pages.forEach(page => {
                page.hidden =
                    page.dataset.content !==
                    target;
            });
            if (pageTitle) {
                pageTitle.textContent =
                    titles[target] ||
                    "Portal do Cliente";
            }
        }
    );
});

}

/* =========================================================
LOGOUT
========================================================= */

function setupLogout() {

const button =
    document.getElementById(
        "logoutButton"
    );
if (!button) {
    return;
}
button.addEventListener(
    "click",
    async () => {
        button.disabled =
            true;
        button.textContent =
            "A sair...";
        await db.auth.signOut();
        sessionStorage.clear();
        window.location.replace(
            "./client-login.html"
        );
    }
);

}

/* =========================================================
HELPERS
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

function formatDate(value) {

if (!value) {
    return "--";
}
const date =
    new Date(
        value + "T00:00:00"
    );
if (Number.isNaN(date.getTime())) {
    return value;
}
return date.toLocaleDateString(
    "en-GB"
);

}

function money(amount, currency) {

return Number(
    amount || 0
).toLocaleString(
    "en-US",
    {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }
) +
" " +
(
    currency ||
    "MZN"
);

}

function translateStatus(status) {

const map = {
    active:
        "Active",
    inactive:
        "Inactive",
    suspended:
        "Suspended",
    scheduled:
        "Scheduled",
    completed:
        "Completed",
    missed:
        "Missed",
    cancelled:
        "Cancelled",
    pending:
        "Pending",
    paid:
        "Paid",
    failed:
        "Failed",
    new:
        "New",
    in_progress:
        "In progress",
    resolved:
        "Resolved",
    rejected:
        "Rejected"
};
return map[status] ||
    status ||
    "--";

}

function safe(value) {

return String(
    value ?? ""
)
    .replaceAll(
        "&",
        "&amp;"
    )
    .replaceAll(
        "<",
        "&lt;"
    )
    .replaceAll(
        ">",
        "&gt;"
    )
    .replaceAll(
        '"',
        "&quot;"
    )
    .replaceAll(
        "'",
        "&#039;"
    );

}

function showError(message) {

const loading =
    document.getElementById(
        "portalLoading"
    );
if (loading) {
    loading.hidden = false;
    loading.textContent =
        message;
}

}
