“use strict”;

/* =========================================================
MOSELI | CLIENT PORTAL
Production Client Portal
Supabase Authentication + Client Data
========================================================= */

console.log(“MOSELI CLIENT PORTAL: START”);

/* =========================================================
SUPABASE CONFIG
========================================================= */

const SUPABASE_URL =
“https://esumonohssxxalxsfshc.supabase.co”;

const SUPABASE_KEY =
“sb_publishable_lryWHU1aV0782oIFi4JKKg_Y4qugSlt”;

let supabaseClient = null;
let currentUser = null;
let currentClient = null;

/* =========================================================
DOM READY
========================================================= */

document.addEventListener(
“DOMContentLoaded”,
initializePortal
);

/* =========================================================
INITIALIZE
========================================================= */

async function initializePortal() {

try {
    showLoading(
        "A iniciar o Portal do Cliente..."
    );
    /* ---------------------------------------------
       SUPABASE
       --------------------------------------------- */
    if (!window.supabase) {
        throw new Error(
            "A biblioteca Supabase não foi carregada."
        );
    }
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
    window.moseliSupabase =
        supabaseClient;
    /* ---------------------------------------------
       SESSION
       --------------------------------------------- */
    showLoading(
        "A verificar autenticação..."
    );
    const {
        data: sessionData,
        error: sessionError
    } =
        await supabaseClient.auth.getSession();
    if (sessionError) {
        throw sessionError;
    }
    if (
        !sessionData ||
        !sessionData.session ||
        !sessionData.session.user
    ) {
        window.location.replace(
            "./client-login.html"
        );
        return;
    }
    currentUser =
        sessionData.session.user;
    console.log(
        "MOSELI AUTH USER:",
        currentUser.id
    );
    /* ---------------------------------------------
       CLIENT
       --------------------------------------------- */
    showLoading(
        "A verificar os dados do cliente..."
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
                currentUser.id
            )
            .maybeSingle();
    if (clientError) {
        throw clientError;
    }
    if (!client) {
        throw new Error(
            "O utilizador autenticado não está ligado a nenhum cliente."
        );
    }
    if (
        String(client.status).toLowerCase() !==
        "active"
    ) {
        throw new Error(
            "A conta deste cliente não está ativa."
        );
    }
    currentClient =
        client;
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
    /* ---------------------------------------------
       CLIENT HEADER
       --------------------------------------------- */
    populateClient(client);
    /* ---------------------------------------------
       NAVIGATION
       --------------------------------------------- */
    setupNavigation();
    /* ---------------------------------------------
       LOGOUT
       --------------------------------------------- */
    setupLogout();
    /* ---------------------------------------------
       REQUEST BUTTON
       --------------------------------------------- */
    setupRequestButtons();
    /* ---------------------------------------------
       SHOW PORTAL
       --------------------------------------------- */
    hideLoading();
    const content =
        document.getElementById(
            "portalContent"
        );
    if (content) {
        content.hidden = false;
    }
    /* ---------------------------------------------
       LOAD DASHBOARD
       --------------------------------------------- */
    await loadDashboard();
    console.log(
        "MOSELI CLIENT PORTAL: READY"
    );
} catch (error) {
    console.error(
        "MOSELI PORTAL ERROR:",
        error
    );
    showError(
        error.message ||
        "Não foi possível carregar o Portal do Cliente."
    );
}
/* ---------------------------------------------
   AUTH LISTENER
   --------------------------------------------- */
if (supabaseClient) {
    supabaseClient.auth.onAuthStateChange(
        function (
            event,
            session
        ) {
            console.log(
                "MOSELI AUTH EVENT:",
                event
            );
            if (
                event === "SIGNED_OUT" ||
                !session
            ) {
                window.location.replace(
                    "./client-login.html"
                );
            }
        }
    );
}

}

/* =========================================================
POPULATE CLIENT
========================================================= */

function populateClient(client) {

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
    formatStatus(client.status)
);
setText(
    "profileName",
    client.full_name
);
setText(
    "profileEmail",
    client.email || currentUser.email
);
setText(
    "profileCode",
    client.client_code
);
setText(
    "profileStatus",
    formatStatus(client.status)
);
setText(
    "profilePhone",
    client.phone
);
setText(
    "profileAddress",
    buildAddress(client)
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

}

/* =========================================================
DASHBOARD
========================================================= */

async function loadDashboard() {

const results =
    await Promise.allSettled([
        loadNotifications(),
        loadAnnouncements(),
        loadDashboardSubscription(),
        loadNextCollection()
    ]);
results.forEach(function (result) {
    if (
        result.status === "rejected"
    ) {
        console.error(
            "Dashboard module error:",
            result.reason
        );
    }
});

}

/* =========================================================
SUBSCRIPTION SUMMARY
========================================================= */

async function loadDashboardSubscription() {

const {
    data,
    error
} =
    await supabaseClient
        .from("subscriptions")
        .select(`
            id,
            plan_name,
            frequency,
            price,
            currency,
            start_date,
            end_date,
            status
        `)
        .eq(
            "client_id",
            currentClient.id
        )
        .eq(
            "status",
            "active"
        )
        .order(
            "start_date",
            {
                ascending: false
            }
        )
        .limit(1);
if (error) {
    throw error;
}
const subscription =
    data && data.length
        ? data[0]
        : null;
if (!subscription) {
    return;
}
setText(
    "serviceInfo",
    formatServiceSummary(
        subscription
    )
);

}

/* =========================================================
SERVICE
========================================================= */

async function loadServicePage() {

const container =
    document.getElementById(
        "serviceInfo"
    );
if (!container) {
    return;
}
container.textContent =
    "A carregar o seu serviço...";
const {
    data,
    error
} =
    await supabaseClient
        .from("subscriptions")
        .select(`
            id,
            plan_name,
            frequency,
            price,
            currency,
            start_date,
            end_date,
            status,
            notes
        `)
        .eq(
            "client_id",
            currentClient.id
        )
        .order(
            "start_date",
            {
                ascending: false
            }
        );
if (error) {
    container.textContent =
        "Não foi possível carregar o serviço.";
    console.error(
        error
    );
    return;
}
if (!data || !data.length) {
    container.textContent =
        "Ainda não existem serviços registados.";
    return;
}
container.innerHTML =
    data.map(
        formatSubscriptionCard
    ).join("");

}

/* =========================================================
COLLECTIONS
========================================================= */

async function loadCollections() {

const container =
    document.getElementById(
        "collectionsList"
    );
if (!container) {
    return;
}
container.textContent =
    "A carregar recolhas...";
const {
    data,
    error
} =
    await supabaseClient
        .from("collections")
        .select(`
            id,
            collection_code,
            collection_date,
            collection_time,
            frequency,
            location,
            status,
            notes
        `)
        .eq(
            "client_id",
            currentClient.id
        )
        .order(
            "collection_date",
            {
                ascending: false
            }
        );
if (error) {
    container.textContent =
        "Não foi possível carregar as recolhas.";
    console.error(
        error
    );
    return;
}
if (!data || !data.length) {
    container.textContent =
        "Ainda não existem recolhas registadas.";
    return;
}
container.innerHTML =
    data.map(
        formatCollectionCard
    ).join("");

}

/* =========================================================
NEXT COLLECTION
========================================================= */

async function loadNextCollection() {

const {
    data,
    error
} =
    await supabaseClient
        .from("collections")
        .select(`
            collection_code,
            collection_date,
            collection_time,
            status,
            location
        `)
        .eq(
            "client_id",
            currentClient.id
        )
        .eq(
            "status",
            "scheduled"
        )
        .gte(
            "collection_date",
            new Date()
                .toISOString()
                .split("T")[0]
        )
        .order(
            "collection_date",
            {
                ascending: true
            }
        )
        .limit(1);
if (error) {
    throw error;
}
if (!data || !data.length) {
    return;
}
const collection =
    data[0];
const dashboard =
    document.querySelector(
        '[data-content="dashboard"]'
    );
if (!dashboard) {
    return;
}
const existing =
    dashboard.querySelector(
        ".next-collection-card"
    );
if (existing) {
    existing.remove();
}
const card =
    document.createElement(
        "div"
    );
card.className =
    "portal-section next-collection-card";
card.innerHTML =
    "<h2>Próxima Recolha</h2>" +
    "<p>" +
    formatDate(
        collection.collection_date
    ) +
    (
        collection.collection_time
            ? " às " +
              collection.collection_time.substring(
                  0,
                  5
              )
            : ""
    ) +
    "</p>" +
    "<p>" +
    escapeHTML(
        collection.location || ""
    ) +
    "</p>";
dashboard.appendChild(card);

}

/* =========================================================
PAYMENTS
========================================================= */

async function loadPayments() {

const container =
    document.getElementById(
        "paymentsList"
    );
if (!container) {
    return;
}
container.textContent =
    "A carregar pagamentos...";
const {
    data,
    error
} =
    await supabaseClient
        .from("payments")
        .select(`
            id,
            payment_code,
            payment_date,
            period_start,
            period_end,
            amount,
            currency,
            payment_method,
            status,
            reference,
            notes
        `)
        .eq(
            "client_id",
            currentClient.id
        )
        .order(
            "payment_date",
            {
                ascending: false
            }
        );
if (error) {
    container.textContent =
        "Não foi possível carregar os pagamentos.";
    console.error(
        error
    );
    return;
}
if (!data || !data.length) {
    container.textContent =
        "Ainda não existem pagamentos registados.";
    return;
}
container.innerHTML =
    data.map(
        formatPaymentCard
    ).join("");

}

/* =========================================================
REQUESTS
========================================================= */

async function loadRequests() {

const container =
    document.getElementById(
        "requestsList"
    );
if (!container) {
    return;
}
container.textContent =
    "A carregar pedidos...";
const [
    requestsResult,
    collectionRequestsResult
] =
    await Promise.all([
        supabaseClient
            .from("requests")
            .select(`
                id,
                request_code,
                request_type,
                priority,
                subject,
                effective_date,
                description,
                status,
                admin_response,
                resolved_at,
                created_at
            `)
            .eq(
                "client_id",
                currentClient.id
            )
            .order(
                "created_at",
                {
                    ascending: false
                }
            ),
        supabaseClient
            .from("collection_requests")
            .select(`
                id,
                request_code,
                requested_date,
                requested_time,
                notes,
                status,
                admin_notes,
                created_at
            `)
            .eq(
                "client_id",
                currentClient.id
            )
            .order(
                "created_at",
                {
                    ascending: false
                }
            )
    ]);
if (requestsResult.error) {
    console.error(
        "Requests error:",
        requestsResult.error
    );
}
if (collectionRequestsResult.error) {
    console.error(
        "Collection requests error:",
        collectionRequestsResult.error
    );
}
const normalRequests =
    requestsResult.data || [];
const collectionRequests =
    collectionRequestsResult.data || [];
if (
    !normalRequests.length &&
    !collectionRequests.length
) {
    container.innerHTML =
        "Ainda não existem pedidos.";
    return;
}
let html = "";
html +=
    normalRequests
        .map(
            formatRequestCard
        )
        .join("");
html +=
    collectionRequests
        .map(
            formatCollectionRequestCard
        )
        .join("");
container.innerHTML =
    html;

}

/* =========================================================
NOTIFICATIONS
========================================================= */

async function loadNotifications() {

const {
    data,
    error
} =
    await supabaseClient
        .from("notifications")
        .select(`
            id,
            title,
            message,
            notification_type,
            is_read,
            created_at
        `)
        .eq(
            "client_id",
            currentClient.id
        )
        .order(
            "created_at",
            {
                ascending: false
            }
        )
        .limit(10);
if (error) {
    throw error;
}
const dashboard =
    document.querySelector(
        '[data-content="dashboard"]'
    );
if (!dashboard) {
    return;
}
const existing =
    dashboard.querySelector(
        ".notifications-section"
    );
if (existing) {
    existing.remove();
}
if (!data || !data.length) {
    return;
}
const section =
    document.createElement(
        "div"
    );
section.className =
    "portal-section notifications-section";
section.innerHTML =
    "<h2>Notificações</h2>" +
    data.map(
        function (item) {
            return (
                "<div class='info-box'>" +
                "<strong>" +
                escapeHTML(
                    item.title
                ) +
                "</strong><br>" +
                escapeHTML(
                    item.message
                ) +
                "<br><small>" +
                formatDateTime(
                    item.created_at
                ) +
                "</small>" +
                "</div>"
            );
        }
    ).join("");
dashboard.appendChild(
    section
);

}

/* =========================================================
ANNOUNCEMENTS
========================================================= */

async function loadAnnouncements() {

const now =
    new Date().toISOString();
const {
    data,
    error
} =
    await supabaseClient
        .from("announcements")
        .select(`
            id,
            title,
            content,
            announcement_type,
            publish_date,
            expires_at
        `)
        .eq(
            "published",
            true
        )
        .lte(
            "publish_date",
            now
        )
        .or(
            "expires_at.is.null,expires_at.gte." +
            now
        )
        .order(
            "publish_date",
            {
                ascending: false
            }
        )
        .limit(10);
if (error) {
    throw error;
}
const dashboard =
    document.querySelector(
        '[data-content="dashboard"]'
    );
if (!dashboard) {
    return;
}
if (!data || !data.length) {
    return;
}
const section =
    document.createElement(
        "div"
    );
section.className =
    "portal-section announcements-section";
section.innerHTML =
    "<h2>Avisos</h2>" +
    data.map(
        function (item) {
            return (
                "<div class='info-box'>" +
                "<strong>" +
                escapeHTML(
                    item.title
                ) +
                "</strong><br>" +
                escapeHTML(
                    item.content
                ) +
                "<br><small>" +
                formatDate(
                    item.publish_date
                ) +
                "</small>" +
                "</div>"
            );
        }
    ).join("");
dashboard.appendChild(
    section
);

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
buttons.forEach(
    function (button) {
        button.type = "button";
        button.addEventListener(
            "click",
            async function (event) {
                event.preventDefault();
                const target =
                    button.dataset.page;
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
                        page.hidden =
                            page.dataset.content !==
                            target;
                    }
                );
                if (pageTitle) {
                    pageTitle.textContent =
                        titles[target] ||
                        "Portal do Cliente";
                }
                try {
                    if (
                        target ===
                        "service"
                    ) {
                        await loadServicePage();
                    }
                    if (
                        target ===
                        "collections"
                    ) {
                        await loadCollections();
                    }
                    if (
                        target ===
                        "payments"
                    ) {
                        await loadPayments();
                    }
                    if (
                        target ===
                        "requests"
                    ) {
                        await loadRequests();
                    }
                } catch (error) {
                    console.error(
                        "Page loading error:",
                        error
                    );
                }
            }
        );
    }
);

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
button.type = "button";
button.addEventListener(
    "click",
    async function () {
        button.disabled =
            true;
        button.textContent =
            "A sair...";
        try {
            await supabaseClient.auth.signOut();
        } catch (error) {
            console.error(
                error
            );
        }
        sessionStorage.clear();
        window.location.replace(
            "./client-login.html"
        );
    }
);

}

/* =========================================================
REQUEST BUTTONS
========================================================= */

function setupRequestButtons() {

const button =
    document.getElementById(
        "newRequestButton"
    );
if (!button) {
    return;
}
button.type = "button";
button.addEventListener(
    "click",
    function () {
        openRequestForm();
    }
);

}

/* =========================================================
NEW REQUEST FORM
========================================================= */

function openRequestForm() {

const page =
    document.querySelector(
        '[data-content="requests"]'
    );
if (!page) {
    return;
}
const oldForm =
    document.getElementById(
        "moseliRequestForm"
    );
if (oldForm) {
    oldForm.remove();
    return;
}
const form =
    document.createElement(
        "form"
    );
form.id =
    "moseliRequestForm";
form.className =
    "portal-section";
form.innerHTML = `
    <h2>Novo Pedido</h2>
    <label>
        Tipo de pedido
        <select id="requestType" required>
            <option value="general">Geral</option>
            <option value="complaint">Reclamação</option>
            <option value="pause">Pausa</option>
            <option value="resume">Retomar serviço</option>
            <option value="cancellation">Cancelamento</option>
            <option value="collection_change">
                Alteração de recolha
            </option>
            <option value="address_change">
                Alteração de morada
            </option>
        </select>
    </label>
    <br>
    <label>
        Prioridade
        <select id="requestPriority" required>
            <option value="normal">Normal</option>
            <option value="high">Alta</option>
            <option value="urgent">Urgente</option>
        </select>
    </label>
    <br>
    <label>
        Assunto
        <input
            id="requestSubject"
            type="text"
            required
        >
    </label>
    <br>
    <label>
        Data efetiva
        <input
            id="requestEffectiveDate"
            type="date"
        >
    </label>
    <br>
    <label>
        Descrição
        <textarea
            id="requestDescription"
            rows="5"
            required
        ></textarea>
    </label>
    <br>
    <button
        type="submit"
        class="primary-button"
    >
        Enviar Pedido
    </button>
    <button
        type="button"
        id="cancelRequestForm"
    >
        Cancelar
    </button>
    <div id="requestFormMessage"></div>
`;
page.prepend(
    form
);
document
    .getElementById(
        "cancelRequestForm"
    )
    .addEventListener(
        "click",
        function () {
            form.remove();
        }
    );
form.addEventListener(
    "submit",
    submitRequest
);

}

/* =========================================================
SUBMIT REQUEST
========================================================= */

async function submitRequest(event) {

event.preventDefault();
const message =
    document.getElementById(
        "requestFormMessage"
    );
const button =
    event.target.querySelector(
        "button[type='submit']"
    );
button.disabled =
    true;
button.textContent =
    "A enviar...";
const code =
    "REQ-" +
    Date.now();
const payload = {
    request_code:
        code,
    client_id:
        currentClient.id,
    request_type:
        document.getElementById(
            "requestType"
        ).value,
    priority:
        document.getElementById(
            "requestPriority"
        ).value,
    subject:
        document.getElementById(
            "requestSubject"
        ).value.trim(),
    effective_date:
        document.getElementById(
            "requestEffectiveDate"
        ).value ||
        null,
    description:
        document.getElementById(
            "requestDescription"
        ).value.trim(),
    status:
        "new"
};
const {
    error
} =
    await supabaseClient
        .from("requests")
        .insert(
            payload
        );
if (error) {
    console.error(
        error
    );
    message.textContent =
        "Não foi possível enviar o pedido: " +
        error.message;
    button.disabled =
        false;
    button.textContent =
        "Enviar Pedido";
    return;
}
message.textContent =
    "Pedido enviado com sucesso.";
event.target.reset();
button.disabled =
    false;
button.textContent =
    "Enviar Pedido";
await loadRequests();

}

/* =========================================================
FORMATTING
========================================================= */

function formatSubscriptionCard(item) {

return `
    <div class="info-box">
        <strong>
            ${escapeHTML(item.plan_name)}
        </strong>
        <br>
        Frequência:
        ${escapeHTML(item.frequency)}
        <br>
        Preço:
        ${formatMoney(
            item.price,
            item.currency
        )}
        <br>
        Início:
        ${formatDate(item.start_date)}
        <br>
        Estado:
        ${formatStatus(item.status)}
        ${
            item.end_date
                ? "<br>Fim: " +
                  formatDate(item.end_date)
                : ""
        }
        ${
            item.notes
                ? "<br>" +
                  escapeHTML(item.notes)
                : ""
        }
    </div>
`;

}

function formatCollectionCard(item) {

return `
    <div class="info-box">
        <strong>
            Recolha ${escapeHTML(
                item.collection_code
            )}
        </strong>
        <br>
        Data:
        ${formatDate(item.collection_date)}
        ${
            item.collection_time
                ? "<br>Hora: " +
                  item.collection_time.substring(
                      0,
                      5
                  )
                : ""
        }
        ${
            item.frequency
                ? "<br>Frequência: " +
                  escapeHTML(item.frequency)
                : ""
        }
        ${
            item.location
                ? "<br>Local: " +
                  escapeHTML(item.location)
                : ""
        }
        <br>
        Estado:
        ${formatStatus(item.status)}
        ${
            item.notes
                ? "<br>" +
                  escapeHTML(item.notes)
                : ""
        }
    </div>
`;

}

function formatPaymentCard(item) {

return `
    <div class="info-box">
        <strong>
            Pagamento ${escapeHTML(
                item.payment_code
            )}
        </strong>
        <br>
        Data:
        ${formatDate(item.payment_date)}
        <br>
        Valor:
        ${formatMoney(
            item.amount,
            item.currency
        )}
        ${
            item.payment_method
                ? "<br>Método: " +
                  escapeHTML(
                      item.payment_method
                  )
                : ""
        }
        ${
            item.reference
                ? "<br>Referência: " +
                  escapeHTML(
                      item.reference
                  )
                : ""
        }
        <br>
        Estado:
        ${formatStatus(item.status)}
    </div>
`;

}

function formatRequestCard(item) {

return `
    <div class="info-box">
        <strong>
            ${escapeHTML(item.subject)}
        </strong>
        <br>
        Código:
        ${escapeHTML(item.request_code)}
        <br>
        Tipo:
        ${escapeHTML(item.request_type)}
        <br>
        Prioridade:
        ${escapeHTML(item.priority)}
        <br>
        Estado:
        ${formatStatus(item.status)}
        <br>
        ${escapeHTML(item.description)}
        ${
            item.admin_response
                ? "<br><br>Resposta MOSELI: " +
                  escapeHTML(
                      item.admin_response
                  )
                : ""
        }
        <br>
        <small>
            ${formatDateTime(item.created_at)}
        </small>
    </div>
`;

}

function formatCollectionRequestCard(item) {

return `
    <div class="info-box">
        <strong>
            Pedido de Recolha
        </strong>
        <br>
        Código:
        ${escapeHTML(item.request_code)}
        <br>
        Data:
        ${formatDate(item.requested_date)}
        ${
            item.requested_time
                ? "<br>Hora: " +
                  item.requested_time.substring(
                      0,
                      5
                  )
                : ""
        }
        <br>
        Estado:
        ${formatStatus(item.status)}
        ${
            item.notes
                ? "<br>" +
                  escapeHTML(item.notes)
                : ""
        }
        ${
            item.admin_notes
                ? "<br><br>Nota MOSELI: " +
                  escapeHTML(
                      item.admin_notes
                  )
                : ""
        }
    </div>
`;

}

function formatServiceSummary(item) {

return (
    escapeHTML(item.plan_name) +
    " • " +
    escapeHTML(item.frequency) +
    " • " +
    formatMoney(
        item.price,
        item.currency
    )
);

}

function formatStatus(status) {

const map = {
    active:
        "Activo",
    inactive:
        "Inactivo",
    suspended:
        "Suspenso",
    scheduled:
        "Agendada",
    completed:
        "Concluída",
    missed:
        "Não realizada",
    cancelled:
        "Cancelada",
    pending:
        "Pendente",
    paid:
        "Pago",
    failed:
        "Falhou",
    new:
        "Novo",
    in_progress:
        "Em andamento",
    resolved:
        "Resolvido",
    rejected:
        "Rejeitado",
    approved:
        "Aprovado"
};
return map[status] ||
    status ||
    "--";

}

function formatMoney(
amount,
currency
) {

const value =
    Number(amount || 0);
return value.toLocaleString(
    "pt-MZ",
    {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }
) +
" " +
(currency || "MZN");

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
    "pt-MZ"
);

}

function formatDateTime(value) {

if (!value) {
    return "--";
}
const date =
    new Date(value);
if (Number.isNaN(date.getTime())) {
    return value;
}
return date.toLocaleString(
    "pt-MZ"
);

}

function buildAddress(client) {

return [
    client.address,
    client.bairro,
    client.city
]
    .filter(Boolean)
    .join(
        ", "
    ) || "--";

}

/* =========================================================
UI HELPERS
========================================================= */

function setText(
id,
value
) {

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

function showLoading(message) {

const loading =
    document.getElementById(
        "portalLoading"
    );
if (!loading) {
    return;
}
loading.hidden =
    false;
loading.textContent =
    message;

}

function hideLoading() {

const loading =
    document.getElementById(
        "portalLoading"
    );
if (loading) {
    loading.hidden =
        true;
}

}

function showError(message) {

const loading =
    document.getElementById(
        "portalLoading"
    );
if (!loading) {
    return;
}
loading.hidden =
    false;
loading.innerHTML =
    "<strong>MOSELI</strong><br><br>" +
    escapeHTML(message);
loading.style.color =
    "#b91c1c";
const content =
    document.getElementById(
        "portalContent"
    );
if (content) {
    content.hidden =
        true;
}

}

function escapeHTML(value) {

return String(value)
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

### After saving
Commit the file to GitHub and wait for GitHub Pages to deploy.
Then open:
[MOSELI Client Portal](https://tonipower91.github.io/MOSELI-/client-portal.html?v=20260901-production1&utm_source=chatgpt.com)
Log in normally.
### Test in this order
1. **Dashboard**
2. **Meu Serviço**
3. **Recolhas**
4. **Pagamentos**
5. **Pedidos**
6. **Meu Perfil**
7. Click **Novo Pedido**
8. Test the form **without submitting yet**
One important point: **if a page says "Não foi possível carregar..." after this update, don't change anything.** Send me the exact message. That will usually mean an RLS policy needs adjusting for that particular table.
Also, don't worry if the pages don't look beautiful yet. **First we're making the data flow correctly.** Once the data is working, we can make the portal UI much more professional and add the Portuguese/English language toggle you requested.
