“use strict”;

/* =========================================================
MOSELI | CLIENT PORTAL
DASHBOARD - LIVE SUPABASE DATA
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

document.addEventListener(“DOMContentLoaded”, async function () {

console.log("MOSELI DASHBOARD START");
if (!window.supabase) {
    console.error("Supabase library not loaded.");
    return;
}
supabaseClient = window.supabase.createClient(
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
await startPortal();

});

/* =========================================================
START PORTAL
========================================================= */

async function startPortal() {

try {
    const {
        data,
        error
    } = await supabaseClient.auth.getSession();
    if (error) {
        console.error("Session error:", error);
        return;
    }
    if (!data.session) {
        window.location.replace(
            "./client-login.html"
        );
        return;
    }
    currentUser =
        data.session.user;
    console.log(
        "Authenticated user:",
        currentUser.id
    );
    /* -------------------------------------------------
       GET CLIENT
       ------------------------------------------------- */
    const {
        data: client,
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
            "Client error:",
            clientError
        );
        return;
    }
    if (!client) {
        console.error(
            "No client linked to user."
        );
        await supabaseClient.auth.signOut();
        window.location.replace(
            "./client-login.html"
        );
        return;
    }
    currentClient =
        client;
    if (
        String(
            client.status
        ).toLowerCase() !== "active"
    ) {
        console.error(
            "Client account is not active."
        );
        return;
    }
    /* -------------------------------------------------
       SAVE CLIENT
       ------------------------------------------------- */
    sessionStorage.setItem(
        "moseli_client_id",
        client.id
    );
    sessionStorage.setItem(
        "moseli_client_code",
        client.client_code
    );
    /* -------------------------------------------------
       DISPLAY CLIENT
       ------------------------------------------------- */
    populateClient();
    /* -------------------------------------------------
       NAVIGATION
       ------------------------------------------------- */
    setupNavigation();
    /* -------------------------------------------------
       LOGOUT
       ------------------------------------------------- */
    setupLogout();
    /* -------------------------------------------------
       DASHBOARD
       ------------------------------------------------- */
    await loadDashboard();
    /* -------------------------------------------------
       OTHER PAGES
       ------------------------------------------------- */
    setupOtherPages();
    console.log(
        "MOSELI DASHBOARD READY"
    );
} catch (error) {
    console.error(
        "MOSELI PORTAL ERROR:",
        error
    );
}

}

/* =========================================================
CLIENT INFORMATION
========================================================= */

function populateClient() {

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
    name
);
setText(
    "profileEmail",
    currentClient.email ||
    currentUser.email ||
    "--"
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

const dashboard =
    document.querySelector(
        '[data-content="dashboard"]'
    );
if (!dashboard) {
    return;
}
/* -----------------------------------------------------
   SERVICE
   ----------------------------------------------------- */
const {
    data: subscriptions,
    error: subscriptionError
} =
    await supabaseClient
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
        );
if (subscriptionError) {
    console.error(
        "Subscription error:",
        subscriptionError
    );
}
/* -----------------------------------------------------
   NEXT COLLECTION
   ----------------------------------------------------- */
const today =
    new Date()
        .toISOString()
        .split("T")[0];
const {
    data: collections,
    error: collectionError
} =
    await supabaseClient
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
        .limit(1);
if (collectionError) {
    console.error(
        "Collection error:",
        collectionError
    );
}
/* -----------------------------------------------------
   PAYMENTS
   ----------------------------------------------------- */
const {
    data: payments,
    error: paymentError
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
        )
        .limit(5);
if (paymentError) {
    console.error(
        "Payment error:",
        paymentError
    );
}
/* -----------------------------------------------------
   REQUESTS
   ----------------------------------------------------- */
const {
    data: requests,
    error: requestError
} =
    await supabaseClient
        .from("requests")
        .select("*")
        .eq(
            "client_id",
            currentClient.id
        )
        .in(
            "status",
            [
                "new",
                "in_progress"
            ]
        );
if (requestError) {
    console.error(
        "Request error:",
        requestError
    );
}
/* -----------------------------------------------------
   BUILD DASHBOARD
   ----------------------------------------------------- */
let dashboardHTML = "";
/* -----------------------------------------------------
   ACTIVE SERVICE
   ----------------------------------------------------- */
if (
    subscriptions &&
    subscriptions.length
) {
    const service =
        subscriptions[0];
    dashboardHTML += `
        <div class="portal-section">
            <h2>
                Meu Serviço
            </h2>
            <div class="info-box">
                <strong>
                    ${safe(
                        service.plan_name
                    )}
                </strong>
                <br><br>
                Frequência:
                ${safe(
                    service.frequency
                )}
                <br>
                Valor:
                ${money(
                    service.price,
                    service.currency
                )}
                <br>
                Estado:
                ${translateStatus(
                    service.status
                )}
            </div>
        </div>
    `;
} else {
    dashboardHTML += `
        <div class="portal-section">
            <h2>
                Meu Serviço
            </h2>
            <div class="empty-state">
                Não existe um serviço activo
                registado.
            </div>
        </div>
    `;
}
/* -----------------------------------------------------
   NEXT COLLECTION
   ----------------------------------------------------- */
dashboardHTML += `
    <div class="portal-section">
        <h2>
            Próxima Recolha
        </h2>
`;
if (
    collections &&
    collections.length
) {
    const collection =
        collections[0];
    dashboardHTML += `
        <div class="info-box">
            <strong>
                ${date(
                    collection.collection_date
                )}
            </strong>
            ${
                collection.collection_time
                    ? `
                        <br>
                        Hora:
                        ${safe(
                            collection.collection_time
                        )}
                      `
                    : ""
            }
            ${
                collection.location
                    ? `
                        <br>
                        Local:
                        ${safe(
                            collection.location
                        )}
                      `
                    : ""
            }
            <br>
            Estado:
            ${translateStatus(
                collection.status
            )}
        </div>
    `;
} else {
    dashboardHTML += `
        <div class="empty-state">
            Não existem recolhas agendadas.
        </div>
    `;
}
dashboardHTML += `
    </div>
`;
/* -----------------------------------------------------
   PAYMENTS
   ----------------------------------------------------- */
dashboardHTML += `
    <div class="portal-section">
        <h2>
            Pagamentos Recentes
        </h2>
`;
if (
    payments &&
    payments.length
) {
    payments.forEach(
        function (payment) {
            dashboardHTML += `
                <div class="info-box">
                    <strong>
                        ${money(
                            payment.amount,
                            payment.currency
                        )}
                    </strong>
                    <br>
                    Data:
                    ${date(
                        payment.payment_date
                    )}
                    <br>
                    Estado:
                    ${translateStatus(
                        payment.status
                    )}
                </div>
            `;
        }
    );
} else {
    dashboardHTML += `
        <div class="empty-state">
            Ainda não existem pagamentos.
        </div>
    `;
}
dashboardHTML += `
    </div>
`;
/* -----------------------------------------------------
   OPEN REQUESTS
   ----------------------------------------------------- */
dashboardHTML += `
    <div class="portal-section">
        <h2>
            Pedidos em Aberto
        </h2>
`;
if (
    requests &&
    requests.length
) {
    requests.forEach(
        function (request) {
            dashboardHTML += `
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
                    Estado:
                    ${translateStatus(
                        request.status
                    )}
                </div>
            `;
        }
    );
} else {
    dashboardHTML += `
        <div class="empty-state">
            Não existem pedidos em aberto.
        </div>
    `;
}
dashboardHTML += `
    </div>
`;
/* -----------------------------------------------------
   INSERT
   ----------------------------------------------------- */
const existingCards =
    dashboard.querySelector(
        ".portal-cards"
    );
if (existingCards) {
    existingCards.insertAdjacentHTML(
        "afterend",
        dashboardHTML
    );
} else {
    dashboard.insertAdjacentHTML(
        "beforeend",
        dashboardHTML
    );
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
        button.addEventListener(
            "click",
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
                if (pageTitle) {
                    pageTitle.textContent =
                        titles[target] ||
                        "Portal do Cliente";
                }
            }
        );
    }
);

}

/* =========================================================
OTHER PAGE BUTTONS
========================================================= */

function setupOtherPages() {

const newRequestButton =
    document.getElementById(
        "newRequestButton"
    );
if (
    newRequestButton
) {
    newRequestButton.addEventListener(
        "click",
        function () {
            alert(
                "A funcionalidade de novo pedido será ligada à tabela requests no próximo passo."
            );
        }
    );
}

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
        await supabaseClient.auth.signOut();
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
        "Rejeitado"
};
return map[status] ||
    status ||
    "--";

}

function date(
value
) {

if (!value) {
    return "--";
}
const d =
    new Date(
        value + "T00:00:00"
    );
if (
    Number.isNaN(
        d.getTime()
    )
) {
    return value;
}
return d.toLocaleDateString(
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
