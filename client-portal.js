“use strict”;

/* =========================================================
MOSELI | CLIENT PORTAL
Real Supabase Data
Portuguese + English
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
GLOBAL STATE
========================================================= */

let supabaseClient = null;

let currentUser = null;

let currentClient = null;

let currentLanguage =
localStorage.getItem(“moseli_language”) || “pt”;

let portalData = {
subscriptions: [],
collections: [],
payments: [],
requests: [],
collectionRequests: [],
notifications: [],
announcements: []
};

/* =========================================================
TRANSLATIONS
========================================================= */

const translations = {

pt: {
    brandSubtitle: "Gestão de Resíduos",
    navDashboard: "Dashboard",
    navService: "Meu Serviço",
    navCollections: "Recolhas",
    navPayments: "Pagamentos",
    navRequests: "Pedidos",
    navNotifications: "Notificações",
    navProfile: "Meu Perfil",
    languageLabel: "Idioma",
    logout: "Sair",
    dashboardWelcome:
        "Aqui pode consultar os seus serviços, recolhas, pagamentos e pedidos.",
    clientCode: "Código do Cliente",
    accountStatus: "Estado da Conta",
    subscription: "Subscrição",
    nextCollection: "Próxima Recolha",
    paymentStatus: "Estado do Pagamento",
    openRequests: "Pedidos em Aberto",
    latestAnnouncements:
        "Últimos Anúncios",
    announcementsDescription:
        "Informações importantes da MOSELI.",
    serviceTitle: "Meu Serviço",
    serviceDescription:
        "Informações do seu serviço MOSELI.",
    collectionsTitle: "Recolhas",
    collectionsDescription:
        "Histórico e próximas recolhas.",
    paymentsTitle: "Pagamentos",
    paymentsDescription:
        "Consulte os seus pagamentos.",
    requestsTitle: "Pedidos",
    requestsDescription:
        "Envie e acompanhe os seus pedidos à MOSELI.",
    newRequest: "Novo Pedido",
    notificationsTitle: "Notificações",
    notificationsDescription:
        "Avisos e atualizações da sua conta.",
    markAllRead: "Marcar como lidas",
    profileTitle: "Meu Perfil",
    profileDescription:
        "Consulte os seus dados de cliente.",
    name: "Nome",
    business: "Empresa",
    email: "Email",
    phone: "Telefone",
    status: "Estado",
    address: "Morada",
    serviceLocation: "Local do Serviço",
    dashboardTitle:
        "Dashboard",
    dashboardSubtitle:
        "Bem-vindo ao Portal do Cliente",
    servicePageTitle:
        "Meu Serviço",
    collectionsPageTitle:
        "Recolhas",
    paymentsPageTitle:
        "Pagamentos",
    requestsPageTitle:
        "Pedidos",
    notificationsPageTitle:
        "Notificações",
    profilePageTitle:
        "Meu Perfil",
    loading:
        "A carregar o seu portal...",
    noData:
        "Não existem dados disponíveis.",
    noCollections:
        "Ainda não existem recolhas disponíveis.",
    noPayments:
        "Ainda não existem pagamentos disponíveis.",
    noRequests:
        "Ainda não existem pedidos.",
    noNotifications:
        "Não existem notificações.",
    noAnnouncements:
        "Não existem anúncios publicados.",
    noSubscription:
        "Nenhuma subscrição ativa",
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
        "Falhado",
    new:
        "Novo",
    inProgress:
        "Em andamento",
    resolved:
        "Resolvido",
    rejected:
        "Rejeitado",
    active:
        "Ativo",
    paused:
        "Pausado",
    expired:
        "Expirado",
    requestCreated:
        "Pedido criado com sucesso.",
    notificationsMarked:
        "Notificações marcadas como lidas.",
    errorLoading:
        "Não foi possível carregar os dados do portal."
},
en: {
    brandSubtitle: "Waste Management",
    navDashboard: "Dashboard",
    navService: "My Service",
    navCollections: "Collections",
    navPayments: "Payments",
    navRequests: "Requests",
    navNotifications: "Notifications",
    navProfile: "My Profile",
    languageLabel: "Language",
    logout: "Logout",
    dashboardWelcome:
        "View your services, collections, payments and requests.",
    clientCode: "Client Code",
    accountStatus: "Account Status",
    subscription: "Subscription",
    nextCollection: "Next Collection",
    paymentStatus: "Payment Status",
    openRequests: "Open Requests",
    latestAnnouncements:
        "Latest Announcements",
    announcementsDescription:
        "Important information from MOSELI.",
    serviceTitle: "My Service",
    serviceDescription:
        "Information about your MOSELI service.",
    collectionsTitle: "Collections",
    collectionsDescription:
        "Upcoming and previous collections.",
    paymentsTitle: "Payments",
    paymentsDescription:
        "View your payments.",
    requestsTitle: "Requests",
    requestsDescription:
        "Submit and track your requests to MOSELI.",
    newRequest: "New Request",
    notificationsTitle: "Notifications",
    notificationsDescription:
        "Alerts and account updates.",
    markAllRead: "Mark all as read",
    profileTitle: "My Profile",
    profileDescription:
        "View your client information.",
    name: "Name",
    business: "Business",
    email: "Email",
    phone: "Phone",
    status: "Status",
    address: "Address",
    serviceLocation: "Service Location",
    dashboardTitle:
        "Dashboard",
    dashboardSubtitle:
        "Welcome to the Client Portal",
    servicePageTitle:
        "My Service",
    collectionsPageTitle:
        "Collections",
    paymentsPageTitle:
        "Payments",
    requestsPageTitle:
        "Requests",
    notificationsPageTitle:
        "Notifications",
    profilePageTitle:
        "My Profile",
    loading:
        "Loading your portal...",
    noData:
        "No data available.",
    noCollections:
        "No collections available.",
    noPayments:
        "No payments available.",
    noRequests:
        "No requests yet.",
    noNotifications:
        "No notifications.",
    noAnnouncements:
        "No published announcements.",
    noSubscription:
        "No active subscription",
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
    inProgress:
        "In progress",
    resolved:
        "Resolved",
    rejected:
        "Rejected",
    active:
        "Active",
    paused:
        "Paused",
    expired:
        "Expired",
    requestCreated:
        "Request created successfully.",
    notificationsMarked:
        "Notifications marked as read.",
    errorLoading:
        "Unable to load portal data."
}

};

/* =========================================================
TRANSLATION HELPER
========================================================= */

function t(key) {

return (
    translations[currentLanguage] &&
    translations[currentLanguage][key]
) || key;

}

/* =========================================================
APPLY LANGUAGE
========================================================= */

function applyLanguage() {

document.documentElement.lang =
    currentLanguage === "pt"
        ? "pt"
        : "en";
document
    .querySelectorAll("[data-i18n]")
    .forEach(function (element) {
        const key =
            element.dataset.i18n;
        if (
            translations[currentLanguage][key]
        ) {
            element.textContent =
                translations[currentLanguage][key];
        }
    });
const pt =
    document.getElementById("languagePT");
const en =
    document.getElementById("languageEN");
if (pt) {
    pt.classList.toggle(
        "active",
        currentLanguage === "pt"
    );
}
if (en) {
    en.classList.toggle(
        "active",
        currentLanguage === "en"
    );
}
updatePageTitle(
    getCurrentPage()
);
renderAllData();

}

/* =========================================================
LANGUAGE BUTTONS
========================================================= */

function setupLanguageButtons() {

const pt =
    document.getElementById("languagePT");
const en =
    document.getElementById("languageEN");
if (pt) {
    pt.addEventListener(
        "click",
        function () {
            currentLanguage = "pt";
            localStorage.setItem(
                "moseli_language",
                "pt"
            );
            applyLanguage();
        }
    );
}
if (en) {
    en.addEventListener(
        "click",
        function () {
            currentLanguage = "en";
            localStorage.setItem(
                "moseli_language",
                "en"
            );
            applyLanguage();
        }
    );
}

}

/* =========================================================
START
========================================================= */

document.addEventListener(
“DOMContentLoaded”,
initializePortal
);

async function initializePortal() {

console.log(
    "MOSELI: initializing portal..."
);
if (!window.supabase) {
    showFatalError(
        "Supabase não foi carregado."
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
setupLanguageButtons();
const loading =
    document.getElementById(
        "portalLoading"
    );
try {
    /* =============================================
       SESSION
       ============================================= */
    const {
        data: sessionData,
        error: sessionError
    } =
        await supabaseClient.auth
            .getSession();
    if (sessionError) {
        throw sessionError;
    }
    const session =
        sessionData.session;
    if (
        !session ||
        !session.user
    ) {
        window.location.replace(
            "./client-login.html"
        );
        return;
    }
    currentUser =
        session.user;
    console.log(
        "MOSELI Auth User:",
        currentUser.id
    );
    /* =============================================
       CLIENT
       ============================================= */
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
                status,
                created_at,
                updated_at
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
        await supabaseClient.auth.signOut();
        window.location.replace(
            "./client-login.html"
        );
        return;
    }
    if (
        String(client.status)
            .toLowerCase() !== "active"
    ) {
        await supabaseClient.auth.signOut();
        showFatalError(
            t("errorLoading")
        );
        return;
    }
    currentClient =
        client;
    sessionStorage.setItem(
        "moseli_client_id",
        client.id
    );
    sessionStorage.setItem(
        "moseli_client_code",
        client.client_code
    );
    /* =============================================
       BASIC CLIENT UI
       ============================================= */
    renderClient();
    if (loading) {
        loading.hidden = true;
    }
    const content =
        document.getElementById(
            "portalContent"
        );
    if (content) {
        content.hidden = false;
    }
    /* =============================================
       NAVIGATION
       ============================================= */
    setupNavigation();
    /* =============================================
       LOGOUT
       ============================================= */
    setupLogout();
    /* =============================================
       REQUEST BUTTON
       ============================================= */
    setupRequestButton();
    /* =============================================
       NOTIFICATION BUTTON
       ============================================= */
    setupNotificationButton();
    /* =============================================
       LOAD DATABASE DATA
       ============================================= */
    await loadPortalData();
    applyLanguage();
    console.log(
        "MOSELI Client Portal: READY"
    );
} catch (error) {
    console.error(
        "MOSELI Portal initialization error:",
        error
    );
    showFatalError(
        t("errorLoading") +
        " " +
        (
            error.message ||
            ""
        )
    );
}
/* =============================================
   AUTH STATE
   ============================================= */
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

/* =========================================================
CLIENT RENDER
========================================================= */

function renderClient() {

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
    "profileBusiness",
    currentClient.business_name
);
setText(
    "profileEmail",
    currentClient.email ||
    currentUser.email
);
setText(
    "profilePhone",
    currentClient.phone
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
const addressParts = [
    currentClient.address,
    currentClient.bairro,
    currentClient.city
]
    .filter(Boolean);
setText(
    "profileAddress",
    addressParts.join(", ")
);
setText(
    "profileServiceLocation",
    currentClient.service_location
);
const initial =
    name
        .trim()
        .charAt(0)
        .toUpperCase() ||
    "M";
setText(
    "userInitial",
    initial
);

}

/* =========================================================
LOAD ALL PORTAL DATA
========================================================= */

async function loadPortalData() {

console.log(
    "MOSELI: loading portal data..."
);
await Promise.all([
    loadSubscriptions(),
    loadCollections(),
    loadPayments(),
    loadRequests(),
    loadCollectionRequests(),
    loadNotifications(),
    loadAnnouncements()
]);
renderAllData();

}

/* =========================================================
SUBSCRIPTIONS
========================================================= */

async function loadSubscriptions() {

const result =
    await supabaseClient
        .from("subscriptions")
        .select(`
            id,
            client_id,
            plan_name,
            frequency,
            price,
            currency,
            start_date,
            end_date,
            status,
            notes,
            created_at,
            updated_at
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
        );
if (result.error) {
    console.error(
        "MOSELI subscriptions error:",
        result.error
    );
    return;
}
portalData.subscriptions =
    result.data || [];

}

/* =========================================================
COLLECTIONS
========================================================= */

async function loadCollections() {

const result =
    await supabaseClient
        .from("collections")
        .select(`
            id,
            collection_code,
            client_id,
            collection_date,
            collection_time,
            frequency,
            location,
            status,
            notes,
            created_at
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
if (result.error) {
    console.error(
        "MOSELI collections error:",
        result.error
    );
    return;
}
portalData.collections =
    result.data || [];

}

/* =========================================================
PAYMENTS
========================================================= */

async function loadPayments() {

const result =
    await supabaseClient
        .from("payments")
        .select(`
            id,
            payment_code,
            client_id,
            payment_date,
            period_start,
            period_end,
            amount,
            currency,
            payment_method,
            status,
            reference,
            notes,
            created_at
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
if (result.error) {
    console.error(
        "MOSELI payments error:",
        result.error
    );
    return;
}
portalData.payments =
    result.data || [];

}

/* =========================================================
REQUESTS
========================================================= */

async function loadRequests() {

const result =
    await supabaseClient
        .from("requests")
        .select(`
            id,
            request_code,
            client_id,
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
        );
if (result.error) {
    console.error(
        "MOSELI requests error:",
        result.error
    );
    return;
}
portalData.requests =
    result.data || [];

}

/* =========================================================
COLLECTION REQUESTS
========================================================= */

async function loadCollectionRequests() {

const result =
    await supabaseClient
        .from("collection_requests")
        .select(`
            id,
            request_code,
            client_id,
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
        );
if (result.error) {
    console.error(
        "MOSELI collection_requests error:",
        result.error
    );
    return;
}
portalData.collectionRequests =
    result.data || [];

}

/* =========================================================
NOTIFICATIONS
========================================================= */

async function loadNotifications() {

const result =
    await supabaseClient
        .from("notifications")
        .select(`
            id,
            client_id,
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
        );
if (result.error) {
    console.error(
        "MOSELI notifications error:",
        result.error
    );
    return;
}
portalData.notifications =
    result.data || [];

}

/* =========================================================
ANNOUNCEMENTS
========================================================= */

async function loadAnnouncements() {

const now =
    new Date().toISOString();
const result =
    await supabaseClient
        .from("announcements")
        .select(`
            id,
            title,
            content,
            announcement_type,
            published,
            publish_date,
            expires_at,
            created_at
        `)
        .eq(
            "published",
            true
        )
        .lte(
            "publish_date",
            now
        )
        .order(
            "publish_date",
            {
                ascending: false
            }
        );
if (result.error) {
    console.error(
        "MOSELI announcements error:",
        result.error
    );
    return;
}
portalData.announcements =
    (
        result.data || []
    ).filter(function (item) {
        return (
            !item.expires_at ||
            new Date(item.expires_at) >=
            new Date()
        );
    });

}

/* =========================================================
RENDER ALL
========================================================= */

function renderAllData() {

renderDashboard();
renderService();
renderCollections();
renderPayments();
renderRequests();
renderNotifications();

}

/* =========================================================
DASHBOARD
========================================================= */

function renderDashboard() {

const activeSubscription =
    portalData.subscriptions.find(
        function (subscription) {
            return (
                String(subscription.status)
                    .toLowerCase() ===
                "active"
            );
        }
    );
setText(
    "dashboardPlan",
    activeSubscription
        ? activeSubscription.plan_name
        : t("noSubscription")
);
const today =
    new Date();
today.setHours(
    0,
    0,
    0,
    0
);
const nextCollection =
    portalData.collections
        .filter(function (collection) {
            return (
                collection.collection_date &&
                new Date(
                    collection.collection_date
                ) >= today &&
                String(collection.status)
                    .toLowerCase() !==
                "cancelled"
            );
        })
        .sort(function (a, b) {
            return (
                new Date(a.collection_date) -
                new Date(b.collection_date)
            );
        })[0];
if (nextCollection) {
    setText(
        "dashboardNextCollection",
        formatDate(
            nextCollection.collection_date
        )
    );
} else {
    setText(
        "dashboardNextCollection",
        t("noData")
    );
}
const latestPayment =
    portalData.payments[0];
setText(
    "dashboardPaymentStatus",
    latestPayment
        ? translateStatus(
            latestPayment.status
        )
        : t("noData")
);
const openRequests =
    portalData.requests.filter(
        function (request) {
            return [
                "new",
                "in_progress"
            ].includes(
                String(request.status)
                    .toLowerCase()
            );
        }
    ).length;
const openCollectionRequests =
    portalData.collectionRequests.filter(
        function (request) {
            return [
                "new",
                "approved",
                "scheduled"
            ].includes(
                String(request.status)
                    .toLowerCase()
            );
        }
    ).length;
setText(
    "dashboardOpenRequests",
    openRequests +
    openCollectionRequests
);
renderAnnouncements();

}

/* =========================================================
SERVICE
========================================================= */

function renderService() {

const container =
    document.getElementById(
        "serviceInfo"
    );
if (!container) return;
const subscription =
    portalData.subscriptions.find(
        function (item) {
            return (
                String(item.status)
                    .toLowerCase() ===
                "active"
            );
        }
    );
if (!subscription) {
    container.innerHTML =
        `<div class="empty-state">
            ${escapeHtml(
                t("noSubscription")
            )}
        </div>`;
    return;
}
container.innerHTML = `
    <div class="info-card">
        <span>${escapeHtml(
            currentLanguage === "pt"
                ? "Plano"
                : "Plan"
        )}</span>
        <strong>${escapeHtml(
            subscription.plan_name
        )}</strong>
    </div>
    <div class="info-card">
        <span>${escapeHtml(
            currentLanguage === "pt"
                ? "Frequência"
                : "Frequency"
        )}</span>
        <strong>${escapeHtml(
            translateFrequency(
                subscription.frequency
            )
        )}</strong>
    </div>
    <div class="info-card">
        <span>${escapeHtml(
            currentLanguage === "pt"
                ? "Preço"
                : "Price"
        )}</span>
        <strong>${formatMoney(
            subscription.price,
            subscription.currency
        )}</strong>
    </div>
    <div class="info-card">
        <span>${escapeHtml(
            currentLanguage === "pt"
                ? "Início"
                : "Start Date"
        )}</span>
        <strong>${formatDate(
            subscription.start_date
        )}</strong>
    </div>
    <div class="info-card">
        <span>${escapeHtml(
            currentLanguage === "pt"
                ? "Estado"
                : "Status"
        )}</span>
        <strong>${escapeHtml(
            translateStatus(
                subscription.status
            )
        )}</strong>
    </div>
`;

}

/* =========================================================
COLLECTIONS
========================================================= */

function renderCollections() {

const container =
    document.getElementById(
        "collectionsList"
    );
if (!container) return;
if (
    !portalData.collections.length
) {
    container.innerHTML =
        `<div class="empty-state">
            ${escapeHtml(
                t("noCollections")
            )}
        </div>`;
    return;
}
container.innerHTML =
    portalData.collections
        .map(function (item) {
            return `
                <div class="data-card">
                    <div>
                        <strong>
                            ${escapeHtml(
                                item.collection_code
                            )}
                        </strong>
                        <span>
                            ${escapeHtml(
                                formatDate(
                                    item.collection_date
                                )
                            )}
                        </span>
                    </div>
                    <div>
                        <span>
                            ${escapeHtml(
                                item.collection_time ||
                                "--"
                            )}
                        </span>
                        <strong>
                            ${escapeHtml(
                                translateStatus(
                                    item.status
                                )
                            )}
                        </strong>
                    </div>
                </div>
            `;
        })
        .join("");

}

/* =========================================================
PAYMENTS
========================================================= */

function renderPayments() {

const container =
    document.getElementById(
        "paymentsList"
    );
if (!container) return;
if (
    !portalData.payments.length
) {
    container.innerHTML =
        `<div class="empty-state">
            ${escapeHtml(
                t("noPayments")
            )}
        </div>`;
    return;
}
container.innerHTML =
    portalData.payments
        .map(function (payment) {
            return `
                <div class="data-card">
                    <div>
                        <strong>
                            ${escapeHtml(
                                payment.payment_code
                            )}
                        </strong>
                        <span>
                            ${escapeHtml(
                                formatDate(
                                    payment.payment_date
                                )
                            )}
                        </span>
                    </div>
                    <div>
                        <strong>
                            ${formatMoney(
                                payment.amount,
                                payment.currency
                            )}
                        </strong>
                        <span>
                            ${escapeHtml(
                                translateStatus(
                                    payment.status
                                )
                            )}
                        </span>
                    </div>
                </div>
            `;
        })
        .join("");

}

/* =========================================================
REQUESTS
========================================================= */

function renderRequests() {

const container =
    document.getElementById(
        "requestsList"
    );
if (!container) return;
const allRequests = [
    ...portalData.requests.map(
        function (item) {
            return {
                ...item,
                source:
                    "request"
            };
        }
    ),
    ...portalData.collectionRequests.map(
        function (item) {
            return {
                ...item,
                source:
                    "collection_request"
            };
        }
    )
];
if (!allRequests.length) {
    container.innerHTML =
        `<div class="empty-state">
            ${escapeHtml(
                t("noRequests")
            )}
        </div>`;
    return;
}
allRequests.sort(
    function (a, b) {
        return (
            new Date(b.created_at) -
            new Date(a.created_at)
        );
    }
);
container.innerHTML =
    allRequests
        .map(function (request) {
            const title =
                request.subject ||
                (
                    currentLanguage === "pt"
                        ? "Pedido de recolha"
                        : "Collection request"
                );
            return `
                <div class="data-card">
                    <div>
                        <strong>
                            ${escapeHtml(
                                title
                            )}
                        </strong>
                        <span>
                            ${escapeHtml(
                                request.request_code
                            )}
                        </span>
                    </div>
                    <div>
                        <strong>
                            ${escapeHtml(
                                translateStatus(
                                    request.status
                                )
                            )}
                        </strong>
                        <span>
                            ${escapeHtml(
                                formatDateTime(
                                    request.created_at
                                )
                            )}
                        </span>
                    </div>
                </div>
            `;
        })
        .join("");

}

/* =========================================================
NOTIFICATIONS
========================================================= */

function renderNotifications() {

const container =
    document.getElementById(
        "notificationsList"
    );
if (!container) return;
const unread =
    portalData.notifications.filter(
        function (item) {
            return !item.is_read;
        }
    ).length;
const badge =
    document.getElementById(
        "notificationBadge"
    );
if (badge) {
    badge.hidden =
        unread === 0;
    badge.textContent =
        unread;
}
if (
    !portalData.notifications.length
) {
    container.innerHTML =
        `<div class="empty-state">
            ${escapeHtml(
                t("noNotifications")
            )}
        </div>`;
    return;
}
container.innerHTML =
    portalData.notifications
        .map(function (notification) {
            return `
                <div
                    class="data-card ${
                        notification.is_read
                            ? ""
                            : "unread"
                    }"
                    data-notification-id="${
                        notification.id
                    }"
                >
                    <div>
                        <strong>
                            ${escapeHtml(
                                notification.title
                            )}
                        </strong>
                        <span>
                            ${escapeHtml(
                                notification.message
                            )}
                        </span>
                    </div>
                    <div>
                        <span>
                            ${escapeHtml(
                                formatDateTime(
                                    notification.created_at
                                )
                            )}
                        </span>
                        ${
                            notification.is_read
                                ? ""
                                : `
                                    <button
                                        type="button"
                                        class="notification-read-button"
                                        data-notification-id="${notification.id}"
                                    >
                                        ✓
                                    </button>
                                `
                        }
                    </div>
                </div>
            `;
        })
        .join("");
container
    .querySelectorAll(
        ".notification-read-button"
    )
    .forEach(function (button) {
        button.addEventListener(
            "click",
            function () {
                markNotificationRead(
                    button.dataset.notificationId
                );
            }
        );
    });

}

/* =========================================================
ANNOUNCEMENTS
========================================================= */

function renderAnnouncements() {

const container =
    document.getElementById(
        "dashboardAnnouncements"
    );
if (!container) return;
if (
    !portalData.announcements.length
) {
    container.innerHTML =
        `<div class="empty-state">
            ${escapeHtml(
                t("noAnnouncements")
            )}
        </div>`;
    return;
}
container.innerHTML =
    portalData.announcements
        .slice(
            0,
            5
        )
        .map(function (announcement) {
            return `
                <article class="announcement-card">
                    <span class="announcement-type">
                        ${escapeHtml(
                            announcement.announcement_type
                        )}
                    </span>
                    <h3>
                        ${escapeHtml(
                            announcement.title
                        )}
                    </h3>
                    <p>
                        ${escapeHtml(
                            announcement.content
                        )}
                    </p>
                    <small>
                        ${escapeHtml(
                            formatDate(
                                announcement.publish_date
                            )
                        )}
                    </small>
                </article>
            `;
        })
        .join("");

}

/* =========================================================
NAVIGATION
========================================================= */

function setupNavigation() {

const navItems =
    document.querySelectorAll(
        ".portal-nav-item"
    );
const pages =
    document.querySelectorAll(
        ".portal-page"
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
                updatePageTitle(
                    target
                );
            }
        );
    }
);

}

/* =========================================================
PAGE TITLE
========================================================= */

function updatePageTitle(page) {

const titleMap = {
    dashboard:
        "dashboardTitle",
    service:
        "servicePageTitle",
    collections:
        "collectionsPageTitle",
    payments:
        "paymentsPageTitle",
    requests:
        "requestsPageTitle",
    notifications:
        "notificationsPageTitle",
    profile:
        "profilePageTitle"
};
const pageTitle =
    document.getElementById(
        "pageTitle"
    );
const pageSubtitle =
    document.getElementById(
        "pageSubtitle"
    );
if (pageTitle) {
    pageTitle.textContent =
        t(
            titleMap[page] ||
            "dashboardTitle"
        );
}
const subtitles = {
    dashboard:
        currentLanguage === "pt"
            ? "Bem-vindo ao Portal do Cliente"
            : "Welcome to the Client Portal",
    service:
        currentLanguage === "pt"
            ? "Informações do seu serviço"
            : "Information about your service",
    collections:
        currentLanguage === "pt"
            ? "As suas recolhas"
            : "Your collections",
    payments:
        currentLanguage === "pt"
            ? "Os seus pagamentos"
            : "Your payments",
    requests:
        currentLanguage === "pt"
            ? "Os seus pedidos"
            : "Your requests",
    notifications:
        currentLanguage === "pt"
            ? "Avisos e atualizações"
            : "Alerts and updates",
    profile:
        currentLanguage === "pt"
            ? "Os seus dados de cliente"
            : "Your client information"
};
if (pageSubtitle) {
    pageSubtitle.textContent =
        subtitles[page] ||
        subtitles.dashboard;
}

}

/* =========================================================
CURRENT PAGE
========================================================= */

function getCurrentPage() {

const active =
    document.querySelector(
        ".portal-nav-item.active"
    );
return active
    ? active.dataset.page
    : "dashboard";

}

/* =========================================================
NEW REQUEST
========================================================= */

function setupRequestButton() {

const button =
    document.getElementById(
        "newRequestButton"
    );
if (!button) return;
button.addEventListener(
    "click",
    function () {
        openRequestForm();
    }
);

}

/* =========================================================
REQUEST FORM
========================================================= */

function openRequestForm() {

const container =
    document.getElementById(
        "requestsList"
    );
if (!container) return;
if (
    document.getElementById(
        "requestForm"
    )
) {
    return;
}
const form =
    document.createElement(
        "form"
    );
form.id =
    "requestForm";
form.className =
    "portal-request-form";
form.innerHTML = `
    <div class="form-field">
        <label>
            ${
                currentLanguage === "pt"
                    ? "Tipo de Pedido"
                    : "Request Type"
            }
        </label>
        <select
            id="requestType"
            required
        >
            <option value="general">
                ${
                    currentLanguage === "pt"
                        ? "Geral"
                        : "General"
                }
            </option>
            <option value="collection_change">
                ${
                    currentLanguage === "pt"
                        ? "Alteração de Recolha"
                        : "Collection Change"
                }
            </option>
            <option value="address_change">
                ${
                    currentLanguage === "pt"
                        ? "Alteração de Morada"
                        : "Address Change"
                }
            </option>
            <option value="pause">
                ${
                    currentLanguage === "pt"
                        ? "Pausa do Serviço"
                        : "Pause Service"
                }
            </option>
            <option value="resume">
                ${
                    currentLanguage === "pt"
                        ? "Retomar Serviço"
                        : "Resume Service"
                }
            </option>
            <option value="complaint">
                ${
                    currentLanguage === "pt"
                        ? "Reclamação"
                        : "Complaint"
                }
            </option>
            <option value="cancellation">
                ${
                    currentLanguage === "pt"
                        ? "Cancelamento"
                        : "Cancellation"
                }
            </option>
        </select>
    </div>
    <div class="form-field">
        <label>
            ${
                currentLanguage === "pt"
                    ? "Assunto"
                    : "Subject"
            }
        </label>
        <input
            id="requestSubject"
            type="text"
            required
        >
    </div>
    <div class="form-field">
        <label>
            ${
                currentLanguage === "pt"
                    ? "Descrição"
                    : "Description"
            }
        </label>
        <textarea
            id="requestDescription"
            rows="4"
            required
        ></textarea>
    </div>
    <div class="form-actions">
        <button
            type="submit"
            class="primary-button"
        >
            ${
                currentLanguage === "pt"
                    ? "Enviar Pedido"
                    : "Submit Request"
            }
        </button>
        <button
            type="button"
            id="cancelRequestForm"
            class="secondary-button"
        >
            ${
                currentLanguage === "pt"
                    ? "Cancelar"
                    : "Cancel"
            }
        </button>
    </div>
`;
container.prepend(
    form
);
form.addEventListener(
    "submit",
    submitRequest
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

}

/* =========================================================
SUBMIT REQUEST
========================================================= */

async function submitRequest(event) {

event.preventDefault();
const type =
    document.getElementById(
        "requestType"
    ).value;
const subject =
    document.getElementById(
        "requestSubject"
    ).value.trim();
const description =
    document.getElementById(
        "requestDescription"
    ).value.trim();
if (
    !subject ||
    !description
) {
    return;
}
const requestCode =
    "REQ-" +
    Date.now();
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
                type,
            priority:
                "normal",
            subject:
                subject,
            description:
                description,
            status:
                "new"
        });
if (error) {
    console.error(
        "MOSELI request insert error:",
        error
    );
    alert(
        currentLanguage === "pt"
            ? "Não foi possível enviar o pedido."
            : "Unable to submit the request."
    );
    return;
}
alert(
    t("requestCreated")
);
const form =
    document.getElementById(
        "requestForm"
    );
if (form) {
    form.remove();
}
await loadRequests();
renderRequests();

}

/* =========================================================
NOTIFICATION SETUP
========================================================= */

function setupNotificationButton() {

const button =
    document.getElementById(
        "markNotificationsRead"
    );
if (!button) return;
button.addEventListener(
    "click",
    markAllNotificationsRead
);

}

/* =========================================================
MARK ALL NOTIFICATIONS READ
========================================================= */

async function markAllNotificationsRead() {

const unreadIds =
    portalData.notifications
        .filter(function (item) {
            return !item.is_read;
        })
        .map(function (item) {
            return item.id;
        });
if (!unreadIds.length) {
    return;
}
const {
    error
} =
    await supabaseClient
        .from("notifications")
        .update({
            is_read: true
        })
        .in(
            "id",
            unreadIds
        );
if (error) {
    console.error(
        "Notification update error:",
        error
    );
    alert(
        currentLanguage === "pt"
            ? "Não foi possível atualizar as notificações."
            : "Unable to update notifications."
    );
    return;
}
portalData.notifications =
    portalData.notifications.map(
        function (item) {
            return {
                ...item,
                is_read:
                    true
            };
        }
    );
renderNotifications();

}

/* =========================================================
MARK ONE NOTIFICATION READ
========================================================= */

async function markNotificationRead(
notificationId
) {

const {
    error
} =
    await supabaseClient
        .from("notifications")
        .update({
            is_read: true
        })
        .eq(
            "id",
            notificationId
        )
        .eq(
            "client_id",
            currentClient.id
        );
if (error) {
    console.error(
        "Notification read error:",
        error
    );
    return;
}
const notification =
    portalData.notifications.find(
        function (item) {
            return (
                item.id ===
                notificationId
            );
        }
    );
if (notification) {
    notification.is_read =
        true;
}
renderNotifications();

}

/* =========================================================
LOGOUT
========================================================= */

function setupLogout() {

const button =
    document.getElementById(
        "logoutButton"
    );
if (!button) return;
button.addEventListener(
    "click",
    async function () {
        button.disabled =
            true;
        button.textContent =
            currentLanguage === "pt"
                ? "A sair..."
                : "Logging out...";
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

/* =========================================================
STATUS TRANSLATION
========================================================= */

function translateStatus(status) {

const value =
    String(
        status || ""
    ).toLowerCase();
const map = {
    scheduled:
        "scheduled",
    completed:
        "completed",
    missed:
        "missed",
    cancelled:
        "cancelled",
    pending:
        "pending",
    paid:
        "paid",
    failed:
        "failed",
    new:
        "new",
    in_progress:
        "inProgress",
    resolved:
        "resolved",
    rejected:
        "rejected",
    active:
        "active",
    paused:
        "paused",
    expired:
        "expired"
};
return t(
    map[value] ||
    value ||
    "noData"
);

}

/* =========================================================
FREQUENCY TRANSLATION
========================================================= */

function translateFrequency(
frequency
) {

const value =
    String(
        frequency || ""
    ).toLowerCase();
const mapPT = {
    daily:
        "Diária",
    weekly:
        "Semanal",
    biweekly:
        "Quinzenal",
    monthly:
        "Mensal",
    custom:
        "Personalizada"
};
const mapEN = {
    daily:
        "Daily",
    weekly:
        "Weekly",
    biweekly:
        "Biweekly",
    monthly:
        "Monthly",
    custom:
        "Custom"
};
return (
    currentLanguage === "pt"
        ? mapPT[value]
        : mapEN[value]
) || frequency || "--";

}

/* =========================================================
DATE
========================================================= */

function formatDate(
value
) {

if (!value) return "--";
const date =
    new Date(
        value + (
            String(value).includes("T")
                ? ""
                : "T00:00:00"
        )
    );
if (
    Number.isNaN(
        date.getTime()
    )
) {
    return value;
}
return new Intl.DateTimeFormat(
    currentLanguage === "pt"
        ? "pt-PT"
        : "en-GB",
    {
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
    }
).format(date);

}

/* =========================================================
DATE + TIME
========================================================= */

function formatDateTime(
value
) {

if (!value) return "--";
const date =
    new Date(value);
if (
    Number.isNaN(
        date.getTime()
    )
) {
    return value;
}
return new Intl.DateTimeFormat(
    currentLanguage === "pt"
        ? "pt-PT"
        : "en-GB",
    {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    }
).format(date);

}

/* =========================================================
MONEY
========================================================= */

function formatMoney(
amount,
currency
) {

const number =
    Number(amount || 0);
try {
    return new Intl.NumberFormat(
        currentLanguage === "pt"
            ? "pt-MZ"
            : "en-GB",
        {
            style: "currency",
            currency:
                currency || "MZN"
        }
    ).format(number);
} catch (error) {
    return (
        number.toFixed(2) +
        " " +
        (
            currency ||
            "MZN"
        )
    );
}

}

/* =========================================================
TEXT HELPER
========================================================= */

function setText(
id,
value
) {

const element =
    document.getElementById(
        id
    );
if (!element) return;
element.textContent =
    value === null ||
    value === undefined ||
    value === ""
        ? "--"
        : value;

}

/* =========================================================
HTML ESCAPE
========================================================= */

function escapeHtml(
value
) {

return String(
    value === null ||
    value === undefined
        ? ""
        : value
)
    .replace(
        /&/g,
        "&amp;"
    )
    .replace(
        /</g,
        "&lt;"
    )
    .replace(
        />/g,
        "&gt;"
    )
    .replace(
        /"/g,
        "&quot;"
    )
    .replace(
        /'/g,
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
if (loading) {
    loading.hidden =
        false;
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
    content.hidden =
        true;
}

}
