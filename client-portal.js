“use strict”;

/* =========================================================
MOSELI | CLIENT PORTAL
COMPLETE FUNCTIONAL VERSION
Supabase Authentication + Client Data
========================================================= */

const SUPABASE_URL =
“https://esumonohssxxalxsfshc.supabase.co”;

const SUPABASE_KEY =
“sb_publishable_lryWHU1aV0782oIFi4JKKg_Y4qugSlt”;

let db = null;
let currentUser = null;
let currentClient = null;

/* =========================================================
DOM READY
========================================================= */

document.addEventListener(
“DOMContentLoaded”,
async function () {

    console.log(
        "MOSELI Client Portal: starting"
    );
    if (!window.supabase) {
        showFatalError(
            "Supabase não foi carregado."
        );
        return;
    }
    /* =================================================
       SUPABASE
       ================================================= */
    db =
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
    await initializePortal();
}

);

/* =========================================================
INITIALIZE PORTAL
========================================================= */

async function initializePortal() {

try {
    const {
        data,
        error
    } =
        await db.auth.getSession();
    if (error) {
        console.error(
            "Session error:",
            error
        );
        redirectToLogin();
        return;
    }
    if (
        !data ||
        !data.session ||
        !data.session.user
    ) {
        redirectToLogin();
        return;
    }
    currentUser =
        data.session.user;
    console.log(
        "MOSELI Authenticated:",
        currentUser.id
    );
    /* =================================================
       FIND CLIENT
       ================================================= */
    const {
        data: client,
        error: clientError
    } =
        await db
            .from("clients")
            .select("*")
            .eq(
                "auth_user_id",
                currentUser.id
            )
            .maybeSingle();
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
    if (!client) {
        console.error(
            "Authenticated user has no client record."
        );
        await db.auth.signOut();
        redirectToLogin();
        return;
    }
    currentClient =
        client;
    /* =================================================
       VERIFY STATUS
       ================================================= */
    if (
        String(
            currentClient.status
        ).toLowerCase() !== "active"
    ) {
        showFatalError(
            "A sua conta de cliente não está activa."
        );
        return;
    }
    /* =================================================
       SESSION STORAGE
       ================================================= */
    sessionStorage.setItem(
        "moseli_client_id",
        currentClient.id
    );
    sessionStorage.setItem(
        "moseli_client_code",
        currentClient.client_code
    );
    /* =================================================
       HEADER + PROFILE
       ================================================= */
    populateClientInformation();
    /* =================================================
       NAVIGATION
       ================================================= */
    setupNavigation();
    /* =================================================
       LOGOUT
       ================================================= */
    setupLogout();
    /* =================================================
       NEW REQUEST
       ================================================= */
    setupRequestButton();
    /* =================================================
       LOAD ALL PAGES
       ================================================= */
    await loadDashboard();
    await loadService();
    await loadCollections();
    await loadPayments();
    await loadRequests();
    await loadNotifications();
    await loadAnnouncements();
    /* =================================================
       SHOW PORTAL
       ================================================= */
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
    console.log(
        "MOSELI Client Portal: READY"
    );
} catch (error) {
    console.error(
        "MOSELI Portal error:",
        error
    );
    showFatalError(
        "Ocorreu um erro ao carregar o portal."
    );
}

}

/* =========================================================
CLIENT INFORMATION
========================================================= */

function populateClientInformation() {

const name =
    currentClient.full_name ||
    "Cliente";
setText(
    "userName",
    name
);
setText(
    "welcomeName",
    name
);
setText(
    "userCode",
    currentClient.client_code
);
setText(
    "dashboardClientCode",
    currentClient.client_code
);
setText(
    "dashboardStatus",
    translateStatus(
        currentClient.status
    )
);
setText(
    "profileName",
    currentClient.full_name
);
setText(
    "profileEmail",
    currentClient.email ||
    currentUser.email
);
setText(
    "profileCode",
    currentClient.client_code
);
setText(
    "profileStatus",
    translateStatus(
        currentClient.status
    )
);
/* Optional profile fields */
setText(
    "profilePhone",
    currentClient.phone
);
setText(
    "profileAddress",
    currentClient.address
);
setText(
    "profileBairro",
    currentClient.bairro
);
setText(
    "profileCity",
    currentClient.city
);
setText(
    "profileServiceLocation",
    currentClient.service_location
);
/* Avatar */
const initial =
    name
        .trim()
        .charAt(0)
        .toUpperCase();
setText(
    "userInitial",
    initial || "M"
);

}

/* =========================================================
DASHBOARD
========================================================= */

async function loadDashboard() {

const page =
    document.querySelector(
        '[data-content="dashboard"]'
    );
if (!page) {
    return;
}
/* -----------------------------------------------------
   Subscription
   ----------------------------------------------------- */
const {
    data: subscription,
    error: subscriptionError
} =
    await db
        .from("subscriptions")
        .select("*")
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
        .limit(1)
        .maybeSingle();
if (subscriptionError) {
    console.error(
        "Dashboard subscription:",
        subscriptionError
    );
}
/* -----------------------------------------------------
   Next collection
   ----------------------------------------------------- */
const today =
    new Date()
        .toISOString()
        .split("T")[0];
const {
    data: nextCollection,
    error: collectionError
} =
    await db
        .from("collections")
        .select("*")
        .eq(
            "client_id",
            currentClient.id
        )
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
if (collectionError) {
    console.error(
        "Dashboard collection:",
        collectionError
    );
}
/* -----------------------------------------------------
   Payments
   ----------------------------------------------------- */
const {
    data: payments,
    error: paymentError
} =
    await db
        .from("payments")
        .select("*")
        .eq(
            "client_id",
            currentClient.id
        )
        .order(
            "payment_date",
            {
                ascending: false
            }
        )
        .limit(5);
if (paymentError) {
    console.error(
        "Dashboard payments:",
        paymentError
    );
}
/* -----------------------------------------------------
   Requests
   ----------------------------------------------------- */
const {
    data: requests,
    error: requestError
} =
    await db
        .from("requests")
        .select("*")
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
        .limit(5);
if (requestError) {
    console.error(
        "Dashboard requests:",
        requestError
    );
}
/* -----------------------------------------------------
   Dashboard dynamic area
   ----------------------------------------------------- */
let area =
    document.getElementById(
        "dashboardLiveData"
    );
if (!area) {
    area =
        document.createElement("div");
    area.id =
        "dashboardLiveData";
    area.className =
        "dashboard-live-data";
    page.appendChild(
        area
    );
}
area.innerHTML = `
    <div class="portal-cards">
        <div class="portal-card">
            <span>
                Serviço
            </span>
            <strong>
                ${
                    subscription
                        ? safe(subscription.plan_name)
                        : "--"
                }
            </strong>
        </div>
        <div class="portal-card">
            <span>
                Próxima Recolha
            </span>
            <strong>
                ${
                    nextCollection
                        ? formatDate(
                            nextCollection.collection_date
                        )
                        : "--"
                }
            </strong>
        </div>
        <div class="portal-card">
            <span>
                Pagamentos
            </span>
            <strong>
                ${
                    payments
                        ? payments.length
                        : 0
                }
            </strong>
        </div>
        <div class="portal-card">
            <span>
                Pedidos
            </span>
            <strong>
                ${
                    requests
                        ? requests.filter(
                            r =>
                                r.status === "new" ||
                                r.status === "in_progress"
                          ).length
                        : 0
                }
            </strong>
        </div>
    </div>
    <div class="portal-section">
        <h2>
            Próxima Recolha
        </h2>
        ${
            nextCollection
                ? `
                    <div class="info-box">
                        <strong>
                            ${formatDate(
                                nextCollection.collection_date
                            )}
                        </strong>
                        <br>
                        Hora:
                        ${safe(
                            nextCollection.collection_time ||
                            "--"
                        )}
                        <br>
                        Local:
                        ${safe(
                            nextCollection.location ||
                            "--"
                        )}
                        <br>
                        Estado:
                        ${translateStatus(
                            nextCollection.status
                        )}
                    </div>
                  `
                : `
                    <div class="empty-state">
                        Não existem recolhas agendadas.
                    </div>
                  `
        }
    </div>
    <div class="portal-section">
        <h2>
            Serviço Actual
        </h2>
        ${
            subscription
                ? `
                    <div class="info-box">
                        <strong>
                            ${safe(
                                subscription.plan_name
                            )}
                        </strong>
                        <br>
                        Frequência:
                        ${safe(
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
                    </div>
                  `
                : `
                    <div class="empty-state">
                        Nenhum serviço activo encontrado.
                    </div>
                  `
        }
    </div>
    <div class="portal-section">
        <h2>
            Actividade Recente
        </h2>
        ${
            requests &&
            requests.length
                ? requests
                    .slice(0, 3)
                    .map(
                        request => `
                            <div class="info-box">
                                <strong>
                                    ${safe(
                                        request.subject
                                    )}
                                </strong>
                                <br>
                                ${safe(
                                    request.request_code
                                )}
                                <br>
                                Estado:
                                ${translateStatus(
                                    request.status
                                )}
                            </div>
                        `
                    )
                    .join("")
                : `
                    <div class="empty-state">
                        Nenhuma actividade recente.
                    </div>
                  `
        }
    </div>
`;

}

/* =========================================================
SERVICE
subscriptions
========================================================= */

async function loadService() {

const page =
    document.querySelector(
        '[data-content="service"]'
    );
if (!page) {
    return;
}
const {
    data,
    error
} =
    await db
        .from("subscriptions")
        .select("*")
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
    console.error(
        "Service error:",
        error
    );
    return;
}
const info =
    document.getElementById(
        "serviceInfo"
    );
if (!info) {
    return;
}
if (!data || data.length === 0) {
    info.innerHTML =
        "Nenhum serviço encontrado.";
    return;
}
info.innerHTML = `
    ${data.map(
        service => `
            <div class="info-box">
                <h3>
                    ${safe(
                        service.plan_name
                    )}
                </h3>
                <strong>
                    Estado:
                </strong>
                ${translateStatus(
                    service.status
                )}
                <br>
                <strong>
                    Frequência:
                </strong>
                ${safe(
                    service.frequency
                )}
                <br>
                <strong>
                    Preço:
                </strong>
                ${formatMoney(
                    service.price,
                    service.currency
                )}
                <br>
                <strong>
                    Data de início:
                </strong>
                ${formatDate(
                    service.start_date
                )}
                ${
                    service.end_date
                        ? `
                            <br>
                            <strong>
                                Data de fim:
                            </strong>
                            ${formatDate(
                                service.end_date
                            )}
                          `
                        : ""
                }
                ${
                    service.notes
                        ? `
                            <br><br>
                            <strong>
                                Observações:
                            </strong>
                            ${safe(
                                service.notes
                            )}
                          `
                        : ""
                }
            </div>
        `
    ).join("")}
`;

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
const {
    data,
    error
} =
    await db
        .from("collections")
        .select("*")
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
    console.error(
        "Collections error:",
        error
    );
    return;
}
const empty =
    page.querySelector(
        ".empty-state"
    );
if (!data || data.length === 0) {
    if (empty) {
        empty.textContent =
            "Ainda não existem recolhas disponíveis.";
    }
    return;
}
if (empty) {
    empty.remove();
}
let list =
    document.getElementById(
        "collectionsList"
    );
if (!list) {
    list =
        document.createElement("div");
    list.id =
        "collectionsList";
    page.appendChild(
        list
    );
}
list.innerHTML = `
    ${data.map(
        collection => `
            <div class="info-box">
                <strong>
                    ${formatDate(
                        collection.collection_date
                    )}
                </strong>
                <br>
                Código:
                ${safe(
                    collection.collection_code
                )}
                <br>
                ${
                    collection.collection_time
                        ? `
                            Hora:
                            ${safe(
                                collection.collection_time
                            )}
                            <br>
                          `
                        : ""
                }
                Frequência:
                ${safe(
                    collection.frequency ||
                    "--"
                )}
                <br>
                Local:
                ${safe(
                    collection.location ||
                    "--"
                )}
                <br>
                Estado:
                ${translateStatus(
                    collection.status
                )}
                ${
                    collection.notes
                        ? `
                            <br>
                            Notas:
                            ${safe(
                                collection.notes
                            )}
                          `
                        : ""
                }
            </div>
        `
    ).join("")}
`;

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
const {
    data,
    error
} =
    await db
        .from("payments")
        .select("*")
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
    console.error(
        "Payments error:",
        error
    );
    return;
}
const empty =
    page.querySelector(
        ".empty-state"
    );
if (!data || data.length === 0) {
    if (empty) {
        empty.textContent =
            "Ainda não existem pagamentos disponíveis.";
    }
    return;
}
if (empty) {
    empty.remove();
}
let list =
    document.getElementById(
        "paymentsList"
    );
if (!list) {
    list =
        document.createElement("div");
    list.id =
        "paymentsList";
    page.appendChild(
        list
    );
}
list.innerHTML = `
    ${data.map(
        payment => `
            <div class="info-box">
                <strong>
                    ${formatMoney(
                        payment.amount,
                        payment.currency
                    )}
                </strong>
                <br>
                Código:
                ${safe(
                    payment.payment_code
                )}
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
                ${
                    payment.reference
                        ? `
                            <br>
                            Referência:
                            ${safe(
                                payment.reference
                            )}
                          `
                        : ""
                }
                ${
                    payment.period_start ||
                    payment.period_end
                        ? `
                            <br>
                            Período:
                            ${formatDate(
                                payment.period_start
                            )}
                            -
                            ${formatDate(
                                payment.period_end
                            )}
                          `
                        : ""
                }
            </div>
        `
    ).join("")}
`;

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
const {
    data,
    error
} =
    await db
        .from("requests")
        .select("*")
        .eq(
            "client_id",
            currentClient.id
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
let list =
    document.getElementById(
        "requestsList"
    );
if (!list) {
    list =
        document.createElement("div");
    list.id =
        "requestsList";
    list.className =
        "requests-list";
    page.appendChild(
        list
    );
}
if (!data || data.length === 0) {
    list.innerHTML = `
        <div class="empty-state">
            Ainda não existem pedidos.
        </div>
    `;
    return;
}
list.innerHTML = `
    ${data.map(
        request => `
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
                Tipo:
                ${translateRequestType(
                    request.request_type
                )}
                <br>
                Prioridade:
                ${translatePriority(
                    request.priority
                )}
                <br>
                Estado:
                ${translateStatus(
                    request.status
                )}
                ${
                    request.effective_date
                        ? `
                            <br>
                            Data efectiva:
                            ${formatDate(
                                request.effective_date
                            )}
                          `
                        : ""
                }
                <br><br>
                ${safe(
                    request.description
                )}
                ${
                    request.admin_response
                        ? `
                            <br><br>
                            <strong>
                                Resposta da MOSELI:
                            </strong>
                            <br>
                            ${safe(
                                request.admin_response
                            )}
                          `
                        : ""
                }
                ${
                    request.resolved_at
                        ? `
                            <br>
                            Resolvido em:
                            ${formatDateTime(
                                request.resolved_at
                            )}
                          `
                        : ""
                }
            </div>
        `
    ).join("")}
`;

}

/* =========================================================
NOTIFICATIONS
========================================================= */

async function loadNotifications() {

const {
    data,
    error
} =
    await db
        .from("notifications")
        .select("*")
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
    console.error(
        "Notifications error:",
        error
    );
    return;
}
window.moseliNotifications =
    data || [];
console.log(
    "MOSELI notifications:",
    window.moseliNotifications
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
    await db
        .from("announcements")
        .select("*")
        .eq(
            "published",
            true
        )
        .lte(
            "publish_date",
            now
        )
        .or(
            `expires_at.is.null,expires_at.gte.${now}`
        )
        .order(
            "publish_date",
            {
                ascending: false
            }
        )
        .limit(10);
if (error) {
    console.error(
        "Announcements error:",
        error
    );
    return;
}
window.moseliAnnouncements =
    data || [];
console.log(
    "MOSELI announcements:",
    window.moseliAnnouncements
);

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
button.addEventListener(
    "click",
    openRequestForm
);

}

/* =========================================================
REQUEST FORM
========================================================= */

function openRequestForm() {

const page =
    document.querySelector(
        '[data-content="requests"]'
    );
if (!page) {
    return;
}
let form =
    document.getElementById(
        "newRequestForm"
    );
if (form) {
    form.scrollIntoView({
        behavior: "smooth"
    });
    return;
}
form =
    document.createElement("form");
form.id =
    "newRequestForm";
form.className =
    "portal-section";
form.innerHTML = `
    <h2>
        Novo Pedido
    </h2>
    <label>
        Tipo de pedido
    </label>
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
        <option value="collection_change">
            Alteração de recolha
        </option>
        <option value="address_change">
            Alteração de endereço
        </option>
        <option value="pause">
            Pausar serviço
        </option>
        <option value="resume">
            Retomar serviço
        </option>
        <option value="cancellation">
            Cancelamento
        </option>
    </select>
    <br><br>
    <label>
        Prioridade
    </label>
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
    <br><br>
    <label>
        Assunto
    </label>
    <input
        type="text"
        id="requestSubject"
        required
        maxlength="150"
        placeholder="Assunto do pedido"
    >
    <br><br>
    <label>
        Descrição
    </label>
    <textarea
        id="requestDescription"
        required
        rows="5"
        maxlength="2000"
        placeholder="Descreva o seu pedido..."
    ></textarea>
    <br><br>
    <button
        type="submit"
        class="primary-button"
    >
        Enviar Pedido
    </button>
    <button
        type="button"
        id="cancelRequestButton"
    >
        Cancelar
    </button>
    <div
        id="requestFormMessage"
    ></div>
`;
page.appendChild(
    form
);
form.addEventListener(
    "submit",
    submitRequest
);
document
    .getElementById(
        "cancelRequestButton"
    )
    .addEventListener(
        "click",
        () => form.remove()
    );
form.scrollIntoView({
    behavior: "smooth"
});

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
const type =
    document.getElementById(
        "requestType"
    ).value;
const priority =
    document.getElementById(
        "requestPriority"
    ).value;
const subject =
    document.getElementById(
        "requestSubject"
    ).value.trim();
const description =
    document.getElementById(
        "requestDescription"
    ).value.trim();
if (!subject || !description) {
    if (message) {
        message.textContent =
            "Preencha o assunto e a descrição.";
    }
    return;
}
if (message) {
    message.textContent =
        "A enviar pedido...";
}
const requestCode =
    generateCode(
        "REQ"
    );
const {
    error
} =
    await db
        .from("requests")
        .insert({
            request_code:
                requestCode,
            client_id:
                currentClient.id,
            request_type:
                type,
            priority:
                priority,
            subject:
                subject,
            description:
                description,
            status:
                "new"
        });
if (error) {
    console.error(
        "Create request error:",
        error
    );
    if (message) {
        message.textContent =
            "Não foi possível enviar o pedido.";
    }
    return;
}
if (message) {
    message.textContent =
        "Pedido enviado com sucesso.";
}
event.target.reset();
await loadRequests();

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
    button => {
        button.addEventListener(
            "click",
            function () {
                const target =
                    button.dataset.page;
                buttons.forEach(
                    item => {
                        item.classList.remove(
                            "active"
                        );
                    }
                );
                button.classList.add(
                    "active"
                );
                pages.forEach(
                    page => {
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
                window.scrollTo({
                    top: 0,
                    behavior: "smooth"
                });
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
button.addEventListener(
    "click",
    async function () {
        button.disabled =
            true;
        button.textContent =
            "A sair...";
        try {
            await db.auth.signOut();
        } catch (error) {
            console.error(
                "Logout error:",
                error
            );
        }
        sessionStorage.clear();
        redirectToLogin();
    }
);

}

/* =========================================================
AUTH STATE
========================================================= */

dbAuthListener();

function dbAuthListener() {

if (!db) {
    return;
}
db.auth.onAuthStateChange(
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
            redirectToLogin();
        }
    }
);

}

/* =========================================================
REDIRECT
========================================================= */

function redirectToLogin() {

window.location.replace(
    "./client-login.html"
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
    value === null ||
    value === undefined ||
    value === ""
        ? "--"
        : value;

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
    "en-GB"
);

}

/* =========================================================
DATE + TIME
========================================================= */

function formatDateTime(value) {

if (!value) {
    return "--";
}
const date =
    new Date(value);
if (
    Number.isNaN(
        date.getTime()
    )
) {
    return value;
}
return date.toLocaleString(
    "en-GB"
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

/* =========================================================
STATUS
========================================================= */

function translateStatus(
status
) {

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
        "Rejected",
    paused:
        "Paused",
    expired:
        "Expired"
};
return map[status] ||
    status ||
    "--";

}

/* =========================================================
REQUEST TYPE
========================================================= */

function translateRequestType(
type
) {

const map = {
    cancellation:
        "Cancellation",
    pause:
        "Pause service",
    resume:
        "Resume service",
    collection_change:
        "Collection change",
    address_change:
        "Address change",
    complaint:
        "Complaint",
    general:
        "General"
};
return map[type] ||
    type ||
    "--";

}

/* =========================================================
PRIORITY
========================================================= */

function translatePriority(
priority
) {

const map = {
    normal:
        "Normal",
    high:
        "High",
    urgent:
        "Urgent"
};
return map[priority] ||
    priority ||
    "--";

}

/* =========================================================
GENERATE REQUEST CODE
========================================================= */

function generateCode(
prefix
) {

const timestamp =
    Date.now()
        .toString()
        .slice(-8);
const random =
    Math.floor(
        Math.random() * 1000
    )
    .toString()
    .padStart(
        3,
        "0"
    );
return (
    prefix +
    "-" +
    timestamp +
    "-" +
    random
);

}

/* =========================================================
HTML SAFETY
========================================================= */

function safe(
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

/* =========================================================
FATAL ERROR
========================================================= */

function showFatalError(
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
if (loading) {
    loading.hidden =
        false;
    loading.textContent =
        message;
    loading.classList.add(
        "portal-error"
    );
}
if (content) {
    content.hidden =
        true;
}

}
