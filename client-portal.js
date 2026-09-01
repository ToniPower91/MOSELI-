“use strict”;

/* =========================================================
MOSELI | CLIENT PORTAL
FINAL MATCHED VERSION
NO LOADING SCREEN
========================================================= */

const SUPABASE_URL =
“https://esumonohssxxalxsfshc.supabase.co”;

const SUPABASE_KEY =
“sb_publishable_lryWHU1aV0782oIFi4JKKg_Y4qugSlt”;

let supabaseClient = null;
let currentUser = null;
let currentClient = null;

/* =========================================================
START
========================================================= */

document.addEventListener(
“DOMContentLoaded”,
function () {

    console.log(
        "MOSELI CLIENT PORTAL STARTED"
    );
    initializePortal();
}

);

/* =========================================================
INITIALIZE
========================================================= */

async function initializePortal() {

try {
    if (!window.supabase) {
        console.error(
            "Supabase library not loaded."
        );
        return;
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
    const {
        data,
        error
    } =
        await supabaseClient.auth.getSession();
    if (error) {
        console.error(
            "Session error:",
            error
        );
        return;
    }
    if (
        !data ||
        !data.session ||
        !data.session.user
    ) {
        window.location.replace(
            "./client-login.html"
        );
        return;
    }
    currentUser =
        data.session.user;
    console.log(
        "Authenticated:",
        currentUser.id
    );
    /*
     * Find matching client.
     */
    const {
        data: clientData,
        error: clientError
    } =
        await supabaseClient
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
        return;
    }
    if (!clientData) {
        console.error(
            "No client found for Auth user."
        );
        await supabaseClient.auth.signOut();
        window.location.replace(
            "./client-login.html"
        );
        return;
    }
    currentClient =
        clientData;
    /*
     * Account status.
     */
    if (
        String(
            currentClient.status
        ).toLowerCase() !== "active"
    ) {
        console.error(
            "Client account inactive."
        );
        await supabaseClient.auth.signOut();
        window.location.replace(
            "./client-login.html"
        );
        return;
    }
    /*
     * Store identifiers.
     */
    sessionStorage.setItem(
        "moseli_client_id",
        currentClient.id
    );
    sessionStorage.setItem(
        "moseli_client_code",
        currentClient.client_code
    );
    /*
     * Display client.
     */
    populateClient();
    /*
     * Activate interface.
     */
    setupNavigation();
    setupLogout();
    setupNewRequest();
    /*
     * Load portal data.
     */
    loadSubscription();
    loadCollections();
    loadPayments();
    loadRequests();
    console.log(
        "MOSELI CLIENT PORTAL READY"
    );
} catch (error) {
    console.error(
        "MOSELI ERROR:",
        error
    );
}

}

/* =========================================================
CLIENT
========================================================= */

function populateClient() {

setText(
    "userName",
    currentClient.full_name
);
setText(
    "welcomeName",
    currentClient.full_name
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
    statusText(
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
    statusText(
        currentClient.status
    )
);
setText(
    "profilePhone",
    currentClient.phone
);
setText(
    "profileAddress",
    [
        currentClient.address,
        currentClient.bairro,
        currentClient.city
    ]
    .filter(Boolean)
    .join(", ")
);
const initial =
    currentClient.full_name
        ? currentClient.full_name
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
buttons.forEach(
    function (button) {
        button.addEventListener(
            "click",
            function () {
                const page =
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
                    function (item) {
                        item.hidden =
                            item.dataset.content !==
                            page;
                    }
                );
                if (title) {
                    title.textContent =
                        titles[page] ||
                        "Portal do Cliente";
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
button.addEventListener(
    "click",
    async function () {
        button.disabled = true;
        button.textContent =
            "A sair...";
        try {
            await supabaseClient.auth.signOut();
        } catch (error) {
            console.error(
                "Logout error:",
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
SUBSCRIPTION
========================================================= */

async function loadSubscription() {

const container =
    document.getElementById(
        "serviceInfo"
    );
if (!container) {
    return;
}
try {
    const {
        data,
        error
    } =
        await supabaseClient
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
        throw error;
    }
    if (!data || !data.length) {
        container.innerHTML =
            "<p>Não existem serviços registados.</p>";
        return;
    }
    container.innerHTML =
        data.map(
            function (item) {
                return `
                    <div class="info-box">
                        <strong>
                            ${safe(
                                item.plan_name
                            )}
                        </strong>
                        <br><br>
                        Frequência:
                        ${safe(
                            item.frequency
                        )}
                        <br>
                        Preço:
                        ${money(
                            item.price,
                            item.currency
                        )}
                        <br>
                        Estado:
                        ${statusText(
                            item.status
                        )}
                        <br>
                        Início:
                        ${date(
                            item.start_date
                        )}
                    </div>
                `;
            }
        ).join("");
} catch (error) {
    console.error(
        "Subscription error:",
        error
    );
    container.innerHTML =
        "<p>Não foi possível consultar o serviço.</p>";
}

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
try {
    const {
        data,
        error
    } =
        await supabaseClient
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
        throw error;
    }
    if (!data || !data.length) {
        container.innerHTML =
            "<div class='empty-state'>" +
            "Ainda não existem recolhas disponíveis." +
            "</div>";
        return;
    }
    container.innerHTML =
        data.map(
            function (item) {
                return `
                    <div class="info-box">
                        <strong>
                            Recolha
                            ${safe(
                                item.collection_code
                            )}
                        </strong>
                        <br><br>
                        Data:
                        ${date(
                            item.collection_date
                        )}
                        <br>
                        Estado:
                        ${statusText(
                            item.status
                        )}
                        ${
                            item.collection_time
                                ? `
                                    <br>
                                    Hora:
                                    ${safe(
                                        item.collection_time
                                    )}
                                  `
                                : ""
                        }
                        ${
                            item.location
                                ? `
                                    <br>
                                    Local:
                                    ${safe(
                                        item.location
                                    )}
                                  `
                                : ""
                        }
                    </div>
                `;
            }
        ).join("");
} catch (error) {
    console.error(
        "Collections error:",
        error
    );
    container.innerHTML =
        "<div class='empty-state'>" +
        "Não foi possível consultar as recolhas." +
        "</div>";
}

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
try {
    const {
        data,
        error
    } =
        await supabaseClient
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
        throw error;
    }
    if (!data || !data.length) {
        container.innerHTML =
            "<div class='empty-state'>" +
            "Ainda não existem pagamentos disponíveis." +
            "</div>";
        return;
    }
    container.innerHTML =
        data.map(
            function (item) {
                return `
                    <div class="info-box">
                        <strong>
                            Pagamento
                            ${safe(
                                item.payment_code
                            )}
                        </strong>
                        <br><br>
                        Data:
                        ${date(
                            item.payment_date
                        )}
                        <br>
                        Valor:
                        ${money(
                            item.amount,
                            item.currency
                        )}
                        <br>
                        Estado:
                        ${statusText(
                            item.status
                        )}
                        ${
                            item.payment_method
                                ? `
                                    <br>
                                    Método:
                                    ${safe(
                                        item.payment_method
                                    )}
                                  `
                                : ""
                        }
                    </div>
                `;
            }
        ).join("");
} catch (error) {
    console.error(
        "Payments error:",
        error
    );
    container.innerHTML =
        "<div class='empty-state'>" +
        "Não foi possível consultar os pagamentos." +
        "</div>";
}

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
try {
    const {
        data,
        error
    } =
        await supabaseClient
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
        throw error;
    }
    if (!data || !data.length) {
        container.innerHTML =
            "<div class='empty-state'>" +
            "Ainda não existem pedidos." +
            "</div>";
        return;
    }
    container.innerHTML =
        data.map(
            function (item) {
                return `
                    <div class="info-box">
                        <strong>
                            ${safe(
                                item.subject
                            )}
                        </strong>
                        <br><br>
                        Código:
                        ${safe(
                            item.request_code
                        )}
                        <br>
                        Estado:
                        ${statusText(
                            item.status
                        )}
                        <br>
                        Prioridade:
                        ${safe(
                            item.priority
                        )}
                        <br><br>
                        ${safe(
                            item.description
                        )}
                        ${
                            item.admin_response
                                ? `
                                    <br><br>
                                    Resposta MOSELI:
                                    ${safe(
                                        item.admin_response
                                    )}
                                  `
                                : ""
                        }
                    </div>
                `;
            }
        ).join("");
} catch (error) {
    console.error(
        "Requests error:",
        error
    );
    container.innerHTML =
        "<div class='empty-state'>" +
        "Não foi possível consultar os pedidos." +
        "</div>";
}

}

/* =========================================================
NEW REQUEST
========================================================= */

function setupNewRequest() {

const button =
    document.getElementById(
        "newRequestButton"
    );
const container =
    document.getElementById(
        "requestFormContainer"
    );
if (!button || !container) {
    return;
}
button.addEventListener(
    "click",
    function () {
        if (
            document.getElementById(
                "moseliRequestForm"
            )
        ) {
            return;
        }
        container.innerHTML = `
            <form
                id="moseliRequestForm"
                class="portal-section"
            >
                <h3>
                    Novo Pedido
                </h3>
                <label>
                    Tipo
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
                            Pausar serviço
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
                <p
                    id="requestMessage"
                ></p>
            </form>
        `;
        document
            .getElementById(
                "cancelRequest"
            )
            .addEventListener(
                "click",
                function () {
                    container.innerHTML = "";
                }
            );
        document
            .getElementById(
                "moseliRequestForm"
            )
            .addEventListener(
                "submit",
                submitRequest
            );
    }
);

}

/* =========================================================
SUBMIT REQUEST
========================================================= */

async function submitRequest(
event
) {

event.preventDefault();
const button =
    event.target.querySelector(
        "button[type='submit']"
    );
const message =
    document.getElementById(
        "requestMessage"
    );
button.disabled = true;
button.textContent =
    "A enviar...";
const requestCode =
    "REQ-" +
    Date.now();
try {
    const {
        error
    } =
        await supabaseClient
            .from("requests")
            .insert({
                request_code:
                    requestCode,
                client_id:
                    currentClient.id,
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
    document
        .getElementById(
            "moseliRequestForm"
        )
        .reset();
    await loadRequests();
} catch (error) {
    console.error(
        "Request error:",
        error
    );
    message.textContent =
        "Não foi possível enviar o pedido.";
}
button.disabled = false;
button.textContent =
    "Enviar Pedido";

}

/* =========================================================
HELPERS
========================================================= */

function setText(
id,
value
) {

const element =
    document.getElementById(id);
if (element) {
    element.textContent =
        value === null ||
        value === undefined ||
        value === ""
            ? "--"
            : value;
}

}

function statusText(
status
) {

const values = {
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
return values[status] ||
    status ||
    "--";

}

function date(
value
) {

if (!value) {
    return "--";
}
const result =
    new Date(
        value + "T00:00:00"
    );
if (
    Number.isNaN(
        result.getTime()
    )
) {
    return value;
}
return result.toLocaleDateString(
    "pt-MZ"
);

}

function money(
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
