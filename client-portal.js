“use strict”;

/* =========================================================
MOSELI | CLIENT PORTAL
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
INITIALIZE
========================================================= */

document.addEventListener(“DOMContentLoaded”, function () {

console.log("MOSELI PORTAL JS STARTED");
/*
 * The portal is visible immediately.
 */
const content =
    document.getElementById("portalContent");
if (content) {
    content.hidden = false;
    content.style.display = "";
}
/*
 * Start authentication.
 */
initializePortal();

});

/* =========================================================
AUTHENTICATION
========================================================= */

async function initializePortal() {

try {
    if (!window.supabase) {
        console.error(
            "Supabase library not available."
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
            "Authentication error:",
            error
        );
        return;
    }
    if (
        !data ||
        !data.session ||
        !data.session.user
    ) {
        window.location.href =
            "./client-login.html";
        return;
    }
    currentUser =
        data.session.user;
    /*
     * Find client.
     */
    const result =
        await supabaseClient
            .from("clients")
            .select("*")
            .eq(
                "auth_user_id",
                currentUser.id
            )
            .maybeSingle();
    if (result.error) {
        console.error(
            "Client lookup error:",
            result.error
        );
        return;
    }
    if (!result.data) {
        console.error(
            "No client linked to this account."
        );
        await supabaseClient.auth.signOut();
        window.location.href =
            "./client-login.html";
        return;
    }
    currentClient =
        result.data;
    /*
     * Check account status.
     */
    if (
        String(
            currentClient.status
        ).toLowerCase() !== "active"
    ) {
        console.error(
            "Client account is not active."
        );
        await supabaseClient.auth.signOut();
        window.location.href =
            "./client-login.html";
        return;
    }
    /*
     * Store client information.
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
     * Populate dashboard.
     */
    populateClient(
        currentClient,
        currentUser
    );
    /*
     * Activate portal functions.
     */
    setupNavigation();
    setupLogout();
    setupRequestButton();
    /*
     * Load database sections.
     */
    loadService();
    loadCollections();
    loadPayments();
    loadRequests();
    console.log(
        "MOSELI PORTAL AUTHENTICATED"
    );
} catch (error) {
    console.error(
        "MOSELI PORTAL ERROR:",
        error
    );
}

}

/* =========================================================
CLIENT DATA
========================================================= */

function populateClient(
client,
user
) {

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
    user.email ||
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
        button.type = "button";
        button.onclick =
            function () {
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
                if (title) {
                    title.textContent =
                        titles[target] ||
                        "Portal do Cliente";
                }
            };
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
button.onclick =
    async function () {
        button.disabled = true;
        button.textContent =
            "A sair...";
        if (supabaseClient) {
            await supabaseClient.auth.signOut();
        }
        sessionStorage.removeItem(
            "moseli_client_id"
        );
        sessionStorage.removeItem(
            "moseli_client_code"
        );
        window.location.href =
            "./client-login.html";
    };

}

/* =========================================================
SERVICE
========================================================= */

async function loadService() {

if (!currentClient) {
    return;
}
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
        console.error(
            "Subscriptions:",
            error
        );
        box.textContent =
            "Não existem informações de serviço disponíveis.";
        return;
    }
    if (!data || !data.length) {
        box.textContent =
            "Ainda não existem serviços registados.";
        return;
    }
    box.innerHTML =
        data.map(
            function (item) {
                return `
                    <div class="info-box">
                        <strong>
                            ${escapeHTML(
                                item.plan_name
                            )}
                        </strong>
                        <br><br>
                        Frequência:
                        ${escapeHTML(
                            item.frequency
                        )}
                        <br>
                        Preço:
                        ${formatMoney(
                            item.price,
                            item.currency
                        )}
                        <br>
                        Estado:
                        ${translateStatus(
                            item.status
                        )}
                    </div>
                `;
            }
        ).join("");
} catch (error) {
    console.error(
        "Service error:",
        error
    );
}

}

/* =========================================================
COLLECTIONS
========================================================= */

async function loadCollections() {

if (!currentClient) {
    return;
}
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
        console.error(
            "Collections:",
            error
        );
        return;
    }
    const empty =
        section.querySelector(
            ".empty-state"
        );
    if (empty) {
        empty.remove();
    }
    const list =
        document.createElement(
            "div"
        );
    list.className =
        "collections-list";
    if (!data || !data.length) {
        list.innerHTML =
            "<div class='empty-state'>" +
            "Ainda não existem recolhas disponíveis." +
            "</div>";
    } else {
        list.innerHTML =
            data.map(
                function (item) {
                    return `
                        <div class="info-box">
                            <strong>
                                Recolha
                                ${escapeHTML(
                                    item.collection_code
                                )}
                            </strong>
                            <br><br>
                            Data:
                            ${formatDate(
                                item.collection_date
                            )}
                            <br>
                            Estado:
                            ${translateStatus(
                                item.status
                            )}
                        </div>
                    `;
                }
            ).join("");
    }
    section.appendChild(
        list
    );
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

if (!currentClient) {
    return;
}
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
        console.error(
            "Payments:",
            error
        );
        return;
    }
    const empty =
        section.querySelector(
            ".empty-state"
        );
    if (empty) {
        empty.remove();
    }
    const list =
        document.createElement(
            "div"
        );
    list.className =
        "payments-list";
    if (!data || !data.length) {
        list.innerHTML =
            "<div class='empty-state'>" +
            "Ainda não existem pagamentos disponíveis." +
            "</div>";
    } else {
        list.innerHTML =
            data.map(
                function (item) {
                    return `
                        <div class="info-box">
                            <strong>
                                Pagamento
                                ${escapeHTML(
                                    item.payment_code
                                )}
                            </strong>
                            <br><br>
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
                            <br>
                            Estado:
                            ${translateStatus(
                                item.status
                            )}
                        </div>
                    `;
                }
            ).join("");
    }
    section.appendChild(
        list
    );
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

if (!currentClient) {
    return;
}
const page =
    document.querySelector(
        '[data-content="requests"]'
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
        console.error(
            "Requests:",
            error
        );
        return;
    }
    const list =
        document.createElement(
            "div"
        );
    list.className =
        "requests-list";
    if (!data || !data.length) {
        list.innerHTML =
            "<div class='empty-state'>" +
            "Ainda não existem pedidos." +
            "</div>";
    } else {
        list.innerHTML =
            data.map(
                function (item) {
                    return `
                        <div class="info-box">
                            <strong>
                                ${escapeHTML(
                                    item.subject
                                )}
                            </strong>
                            <br><br>
                            Código:
                            ${escapeHTML(
                                item.request_code
                            )}
                            <br>
                            Estado:
                            ${translateStatus(
                                item.status
                            )}
                            <br><br>
                            ${escapeHTML(
                                item.description
                            )}
                        </div>
                    `;
                }
            ).join("");
    }
    section.appendChild(
        list
    );
} catch (error) {
    console.error(
        "Requests error:",
        error
    );
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
button.onclick =
    function () {
        alert(
            "O formulário de Novo Pedido será aberto aqui."
        );
    };

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
if (!element) {
    return;
}
element.textContent =
    value ||
    "--";

}

function translateStatus(
status
) {

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

function formatDate(
value
) {

if (!value) {
    return "--";
}
return new Date(
    value + "T00:00:00"
).toLocaleDateString(
    "pt-MZ"
);

}

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
