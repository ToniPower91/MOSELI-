“use strict”;

/* =========================================================
MOSELI | CLIENT PORTAL
FINAL PRODUCTION VERSION
========================================================= */

const SUPABASE_URL =
“https://esumonohssxxalxsfshc.supabase.co”;

const SUPABASE_KEY =
“sb_publishable_lryWHU1aV0782oIFi4JKKg_Y4qugSlt”;

let db = null;
let authUser = null;
let client = null;

/* =========================================================
START
========================================================= */

document.addEventListener(“DOMContentLoaded”, async () => {

console.log("MOSELI PORTAL START");
try {
    if (!window.supabase) {
        throw new Error(
            "Supabase não foi carregado."
        );
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
    /*
     * Get authenticated session
     */
    const {
        data,
        error
    } = await db.auth.getSession();
    if (error) {
        throw error;
    }
    if (!data.session) {
        window.location.href =
            "./client-login.html";
        return;
    }
    authUser =
        data.session.user;
    /*
     * Find client
     */
    const result =
        await db
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
                authUser.id
            )
            .maybeSingle();
    if (result.error) {
        throw result.error;
    }
    if (!result.data) {
        await db.auth.signOut();
        window.location.href =
            "./client-login.html";
        return;
    }
    client =
        result.data;
    /*
     * Client must be active
     */
    if (
        String(client.status).toLowerCase()
        !== "active"
    ) {
        await db.auth.signOut();
        showError(
            "A sua conta de cliente não está ativa."
        );
        return;
    }
    /*
     * Save client locally
     */
    sessionStorage.setItem(
        "moseli_client_id",
        client.id
    );
    sessionStorage.setItem(
        "moseli_client_code",
        client.client_code
    );
    /*
     * Populate dashboard
     */
    populateClient();
    /*
     * IMPORTANT:
     * Show portal NOW.
     */
    showPortal();
    /*
     * Setup buttons/navigation
     */
    setupNavigation();
    setupLogout();
    setupRequestButton();
    /*
     * Load secondary data independently.
     * None of these can block the dashboard.
     */
    loadService();
    loadCollections();
    loadPayments();
    loadRequests();
    console.log(
        "MOSELI PORTAL READY"
    );
} catch (error) {
    console.error(
        "MOSELI PORTAL ERROR:",
        error
    );
    showError(
        "Não foi possível carregar o Portal do Cliente."
    );
}

});

/* =========================================================
POPULATE CLIENT
========================================================= */

function populateClient() {

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
    translateStatus(
        client.status
    )
);
setText(
    "profileName",
    client.full_name
);
setText(
    "profileEmail",
    client.email ||
    authUser.email ||
    "--"
);
setText(
    "profileCode",
    client.client_code
);
setText(
    "profileStatus",
    translateStatus(
        client.status
    )
);
/*
 * Optional profile fields.
 * These work if added to HTML later.
 */
setText(
    "profilePhone",
    client.phone
);
setText(
    "profileAddress",
    [
        client.address,
        client.bairro,
        client.city
    ]
    .filter(Boolean)
    .join(", ")
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
SHOW PORTAL
========================================================= */

function showPortal() {

const loading =
    document.getElementById(
        "portalLoading"
    );
const content =
    document.getElementById(
        "portalContent"
    );
if (loading) {
    loading.hidden = true;
}
if (content) {
    content.hidden = false;
}

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
buttons.forEach(button => {
    button.type = "button";
    button.addEventListener(
        "click",
        () => {
            const target =
                button.dataset.page;
            buttons.forEach(
                item =>
                    item.classList.remove(
                        "active"
                    )
            );
            button.classList.add(
                "active"
            );
            pages.forEach(page => {
                page.hidden =
                    page.dataset.content
                    !== target;
            });
            if (title) {
                title.textContent =
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
button.type = "button";
button.addEventListener(
    "click",
    async () => {
        button.disabled = true;
        button.textContent =
            "A sair...";
        await db.auth.signOut();
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

/* =========================================================
SERVICE
========================================================= */

async function loadService() {

const box =
    document.getElementById(
        "serviceInfo"
    );
if (!box) {
    return;
}
try {
    const {
        data,
        error
    } =
        await db
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
                client.id
            )
            .order(
                "start_date",
                {
                    ascending: false
                }
            );
    if (error) {
        throw error;
    }
    if (!data || !data.length) {
        box.innerHTML =
            "Ainda não existem dados de serviço registados.";
        return;
    }
    box.innerHTML =
        data
            .map(subscription => `
                <div class="info-box">
                    <strong>
                        ${escapeHTML(
                            subscription.plan_name
                        )}
                    </strong>
                    <br>
                    Frequência:
                    ${escapeHTML(
                        subscription.frequency
                    )}
                    <br>
                    Preço:
                    ${formatMoney(
                        subscription.price,
                        subscription.currency
                    )}
                    <br>
                    Início:
                    ${formatDate(
                        subscription.start_date
                    )}
                    <br>
                    Estado:
                    ${translateStatus(
                        subscription.status
                    )}
                    ${
                        subscription.end_date
                            ? `
                                <br>
                                Fim:
                                ${formatDate(
                                    subscription.end_date
                                )}
                              `
                            : ""
                    }
                </div>
            `)
            .join("");
} catch (error) {
    console.error(
        "Service error:",
        error
    );
    box.innerHTML =
        "Não foi possível carregar os dados do serviço.";
}

}

/* =========================================================
COLLECTIONS
========================================================= */

async function loadCollections() {

const page =
    document.querySelector(
        '[data-content="collections"]'
    );
if (!page) {
    return;
}
const section =
    page.querySelector(
        ".portal-section"
    );
if (!section) {
    return;
}
try {
    const {
        data,
        error
    } =
        await db
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
                client.id
            )
            .order(
                "collection_date",
                {
                    ascending: false
                }
            );
    if (error) {
        throw error;
    }
    const oldEmpty =
        section.querySelector(
            ".empty-state"
        );
    if (oldEmpty) {
        oldEmpty.remove();
    }
    let list =
        section.querySelector(
            ".collections-list"
        );
    if (!list) {
        list =
            document.createElement(
                "div"
            );
        list.className =
            "collections-list";
        section.appendChild(
            list
        );
    }
    if (!data || !data.length) {
        list.innerHTML =
            "<div class='empty-state'>" +
            "Ainda não existem recolhas disponíveis." +
            "</div>";
        return;
    }
    list.innerHTML =
        data
            .map(item => `
                <div class="info-box">
                    <strong>
                        Recolha
                        ${escapeHTML(
                            item.collection_code
                        )}
                    </strong>
                    <br>
                    Data:
                    ${formatDate(
                        item.collection_date
                    )}
                    ${
                        item.collection_time
                            ? `
                                <br>
                                Hora:
                                ${item.collection_time.substring(
                                    0,
                                    5
                                )}
                              `
                            : ""
                    }
                    ${
                        item.frequency
                            ? `
                                <br>
                                Frequência:
                                ${escapeHTML(
                                    item.frequency
                                )}
                              `
                            : ""
                    }
                    ${
                        item.location
                            ? `
                                <br>
                                Local:
                                ${escapeHTML(
                                    item.location
                                )}
                              `
                            : ""
                    }
                    <br>
                    Estado:
                    ${translateStatus(
                        item.status
                    )}
                </div>
            `)
            .join("");
} catch (error) {
    console.error(
        "Collections error:",
        error
    );
}

}

/* =========================================================
PAYMENTS
========================================================= */

async function loadPayments() {

const page =
    document.querySelector(
        '[data-content="payments"]'
    );
if (!page) {
    return;
}
const section =
    page.querySelector(
        ".portal-section"
    );
if (!section) {
    return;
}
try {
    const {
        data,
        error
    } =
        await db
            .from("payments")
            .select(`
                id,
                payment_code,
                payment_date,
                amount,
                currency,
                payment_method,
                status,
                reference
            `)
            .eq(
                "client_id",
                client.id
            )
            .order(
                "payment_date",
                {
                    ascending: false
                }
            );
    if (error) {
        throw error;
    }
    const oldEmpty =
        section.querySelector(
            ".empty-state"
        );
    if (oldEmpty) {
        oldEmpty.remove();
    }
    let list =
        section.querySelector(
            ".payments-list"
        );
    if (!list) {
        list =
            document.createElement(
                "div"
            );
        list.className =
            "payments-list";
        section.appendChild(
            list
        );
    }
    if (!data || !data.length) {
        list.innerHTML =
            "<div class='empty-state'>" +
            "Ainda não existem pagamentos disponíveis." +
            "</div>";
        return;
    }
    list.innerHTML =
        data
            .map(item => `
                <div class="info-box">
                    <strong>
                        Pagamento
                        ${escapeHTML(
                            item.payment_code
                        )}
                    </strong>
                    <br>
                    Data:
                    ${formatDate(
                        item.payment_date
                    )}
                    <br>
                    Valor:
                    ${formatMoney(
                        item.amount,
                        item.currency
                    )}
                    ${
                        item.payment_method
                            ? `
                                <br>
                                Método:
                                ${escapeHTML(
                                    item.payment_method
                                )}
                              `
                            : ""
                    }
                    ${
                        item.reference
                            ? `
                                <br>
                                Referência:
                                ${escapeHTML(
                                    item.reference
                                )}
                              `
                            : ""
                    }
                    <br>
                    Estado:
                    ${translateStatus(
                        item.status
                    )}
                </div>
            `)
            .join("");
} catch (error) {
    console.error(
        "Payments error:",
        error
    );
}

}

/* =========================================================
REQUESTS
========================================================= */

async function loadRequests() {

const page =
    document.querySelector(
        '[data-content="requests"]'
    );
if (!page) {
    return;
}
let list =
    document.getElementById(
        "requestsList"
    );
if (!list) {
    list =
        document.createElement(
            "div"
        );
    list.id =
        "requestsList";
    list.className =
        "requests-list";
    page
        .querySelector(
            ".portal-section"
        )
        .appendChild(
            list
        );
}
try {
    const {
        data,
        error
    } =
        await db
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
                created_at
            `)
            .eq(
                "client_id",
                client.id
            )
            .order(
                "created_at",
                {
                    ascending: false
                }
            );
    if (error) {
        throw error;
    }
    if (!data || !data.length) {
        list.innerHTML =
            "<div class='empty-state'>" +
            "Ainda não existem pedidos." +
            "</div>";
        return;
    }
    list.innerHTML =
        data
            .map(item => `
                <div class="info-box">
                    <strong>
                        ${escapeHTML(
                            item.subject
                        )}
                    </strong>
                    <br>
                    Código:
                    ${escapeHTML(
                        item.request_code
                    )}
                    <br>
                    Tipo:
                    ${escapeHTML(
                        item.request_type
                    )}
                    <br>
                    Prioridade:
                    ${escapeHTML(
                        item.priority
                    )}
                    <br>
                    Estado:
                    ${translateStatus(
                        item.status
                    )}
                    <br>
                    ${escapeHTML(
                        item.description
                    )}
                    ${
                        item.admin_response
                            ? `
                                <br><br>
                                Resposta MOSELI:
                                ${escapeHTML(
                                    item.admin_response
                                )}
                              `
                            : ""
                    }
                </div>
            `)
            .join("");
} catch (error) {
    console.error(
        "Requests error:",
        error
    );
    list.innerHTML =
        "<div class='empty-state'>" +
        "Não foi possível carregar os pedidos." +
        "</div>";
}

}

/* =========================================================
NEW REQUEST
========================================================= */

function setupRequestButton() {

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
    () => {
        if (
            document.getElementById(
                "moseliRequestForm"
            )
        ) {
            return;
        }
        const page =
            document.querySelector(
                '[data-content="requests"]'
            );
        if (!page) {
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
                <select
                    id="requestType"
                    required
                >
                    <option value="general">
                        Geral
                    </option>
                    <option value="complaint">
                        Reclamação
                    </option>
                    <option value="pause">
                        Pausa
                    </option>
                    <option value="resume">
                        Retomar serviço
                    </option>
                    <option value="cancellation">
                        Cancelamento
                    </option>
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
                <select
                    id="requestPriority"
                    required
                >
                    <option value="normal">
                        Normal
                    </option>
                    <option value="high">
                        Alta
                    </option>
                    <option value="urgent">
                        Urgente
                    </option>
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
                id="cancelRequest"
            >
                Cancelar
            </button>
            <div
                id="requestMessage"
            ></div>
        `;
        page.prepend(
            form
        );
        document
            .getElementById(
                "cancelRequest"
            )
            .addEventListener(
                "click",
                () => form.remove()
            );
        form.addEventListener(
            "submit",
            submitRequest
        );
    }
);

}

/* =========================================================
SUBMIT REQUEST
========================================================= */

async function submitRequest(event) {

event.preventDefault();
const form =
    event.target;
const button =
    form.querySelector(
        "button[type='submit']"
    );
const message =
    document.getElementById(
        "requestMessage"
    );
button.disabled = true;
button.textContent =
    "A enviar...";
const code =
    "REQ-" +
    Date.now();
try {
    const {
        error
    } =
        await db
            .from("requests")
            .insert({
                request_code:
                    code,
                client_id:
                    client.id,
                request_type:
                    document
                        .getElementById(
                            "requestType"
                        )
                        .value,
                priority:
                    document
                        .getElementById(
                            "requestPriority"
                        )
                        .value,
                subject:
                    document
                        .getElementById(
                            "requestSubject"
                        )
                        .value
                        .trim(),
                description:
                    document
                        .getElementById(
                            "requestDescription"
                        )
                        .value
                        .trim(),
                status:
                    "new"
            });
    if (error) {
        throw error;
    }
    message.textContent =
        "Pedido enviado com sucesso.";
    form.reset();
    await loadRequests();
} catch (error) {
    console.error(
        "Request submit error:",
        error
    );
    message.textContent =
        "Erro ao enviar o pedido.";
}
button.disabled = false;
button.textContent =
    "Enviar Pedido";

}

/* =========================================================
STATUS
========================================================= */

function translateStatus(status) {

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

/* =========================================================
DATE
========================================================= */

function formatDate(value) {

if (!value) {
    return "--";
}
const date =
    new Date(
        value + "T00:00:00"
    );
if (
    Number.isNaN(
        date.getTime()
    )
) {
    return value;
}
return date.toLocaleDateString(
    "pt-MZ"
);

}

/* =========================================================
MONEY
========================================================= */

function formatMoney(
amount,
currency
) {

return Number(
    amount || 0
).toLocaleString(
    "pt-MZ",
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

/* =========================================================
TEXT
========================================================= */

function setText(
id,
value
) {

const element =
    document.getElementById(
        id
    );
if (!element) {
    return;
}
element.textContent =
    value ||
    "--";

}

/* =========================================================
ERROR
========================================================= */

function showError(
message
) {

const loading =
    document.getElementById(
        "portalLoading"
    );
const content =
    document.getElementById(
        "portalContent"
    );
if (content) {
    content.hidden = true;
}
if (loading) {
    loading.hidden = false;
    loading.innerHTML =
        "<strong>MOSELI</strong><br><br>" +
        escapeHTML(
            message
        );
}

}

/* =========================================================
SECURITY
========================================================= */

function escapeHTML(
value
) {

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
