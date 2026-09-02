/* =========================================================
   MOSELI | ADMIN CRM
   Full Functional Supabase Administration
   Uses existing MOSELI tables
========================================================= */
"use strict";
/* =========================================================
   SUPABASE CONFIG
========================================================= */
const SUPABASE_URL =
  "https://esumonohssxxalxsfshc.supabase.co";
const SUPABASE_KEY =
  "sb_publishable_lryWHU1aV0782oIFi4JKKg_Y4qugSlt";
let db = null;
let currentUser = null;
let clients = [];
let subscriptions = [];
let collections = [];
let collectionRequests = [];
let payments = [];
let requests = [];
let notifications = [];
let announcements = [];
let currentClient = null;
let currentPage = "dashboard";
let confirmCallback = null;
/* =========================================================
   INITIALIZATION
========================================================= */
document.addEventListener(
  "DOMContentLoaded",
  () => {
    initializeAdmin();
  }
);
async function initializeAdmin() {
  try {
    if (!window.supabase) {
      throw new Error(
        "Biblioteca Supabase não carregada."
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
    setupNavigation();
    setupUI();
    setupModal();
    setupDrawer();
    setupConfirm();
    setupFilters();
    setupAuthListener();
    const {
      data,
      error
    } = await db.auth.getSession();
    if (error) {
      throw error;
    }
    if (!data?.session) {
      redirectToLogin();
      return;
    }
    currentUser =
      data.session.user;
    populateAdminInformation();
    showAdminContent();
    await loadAllData();
  } catch (error) {
    console.error(
      "Erro ao inicializar Admin CRM:",
      error
    );
    showFatalError(
      error.message ||
      "Não foi possível carregar o sistema."
    );
  }
}
/* =========================================================
   AUTH
========================================================= */
function setupAuthListener() {
  db.auth.onAuthStateChange(
    async (
      event,
      session
    ) => {
      if (
        event === "SIGNED_OUT" ||
        !session
      ) {
        redirectToLogin();
        return;
      }
      if (
        event === "SIGNED_IN" ||
        event === "TOKEN_REFRESHED"
      ) {
        currentUser =
          session.user;
        populateAdminInformation();
      }
    }
  );
}
/* =========================================================
   LOAD ALL DATA
========================================================= */
async function loadAllData() {
  await Promise.allSettled([
    loadClients(),
    loadSubscriptions(),
    loadCollections(),
    loadCollectionRequests(),
    loadPayments(),
    loadRequests(),
    loadNotifications(),
    loadAnnouncements()
  ]);
  updateDashboard();
  updateReports();
  updateNavigationCounters();
  updateSettings();
  renderCurrentPage();
}
/* =========================================================
   CLIENTS
========================================================= */
async function loadClients() {
  try {
    const {
      data,
      error
    } =
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
          status,
          created_at,
          updated_at
        `)
        .order(
          "created_at",
          {
            ascending: false
          }
        );
    if (error) {
      throw error;
    }
    clients =
      data || [];
    populateCityFilter();
  } catch (error) {
    console.error(
      "Erro ao carregar clientes:",
      error
    );
    clients = [];
    renderError(
      "clientsTable",
      "Não foi possível carregar os clientes."
    );
  }
}
/* =========================================================
   SUBSCRIPTIONS
========================================================= */
async function loadSubscriptions() {
  try {
    const {
      data,
      error
    } =
      await db
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
        .order(
          "created_at",
          {
            ascending: false
          }
        );
    if (error) {
      throw error;
    }
    subscriptions =
      data || [];
  } catch (error) {
    console.error(
      "Erro ao carregar serviços:",
      error
    );
    subscriptions = [];
    renderError(
      "subscriptionsTable",
      "Não foi possível carregar os serviços."
    );
  }
}
/* =========================================================
   COLLECTIONS
========================================================= */
async function loadCollections() {
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
          client_id,
          collection_date,
          collection_time,
          frequency,
          location,
          status,
          notes,
          created_at,
          updated_at
        `)
        .order(
          "collection_date",
          {
            ascending: true
          }
        );
    if (error) {
      throw error;
    }
    collections =
      data || [];
  } catch (error) {
    console.error(
      "Erro ao carregar recolhas:",
      error
    );
    collections = [];
    renderError(
      "collectionsTable",
      "Não foi possível carregar as recolhas."
    );
  }
}
/* =========================================================
   COLLECTION REQUESTS
========================================================= */
async function loadCollectionRequests() {
  try {
    const {
      data,
      error
    } =
      await db
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
          created_at,
          updated_at
        `)
        .order(
          "requested_date",
          {
            ascending: true
          }
        );
    if (error) {
      throw error;
    }
    collectionRequests =
      data || [];
  } catch (error) {
    console.error(
      "Erro ao carregar pedidos de recolha:",
      error
    );
    collectionRequests = [];
    renderError(
      "collectionRequestsTable",
      "Não foi possível carregar os pedidos de recolha."
    );
  }
}
/* =========================================================
   PAYMENTS LOAD
========================================================= */
async function loadPayments() {
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
          created_at,
          updated_at
        `)
        .order(
          "payment_date",
          {
            ascending: false
          }
        );
    if (error) {
      throw error;
    }
    payments =
      data || [];
  } catch (error) {
    console.error(
      "Erro ao carregar pagamentos:",
      error
    );
    payments = [];
    renderError(
      "paymentsTable",
      "Não foi possível carregar os pagamentos."
    );
  }
}
/* =========================================================
   REQUESTS LOAD
========================================================= */
async function loadRequests() {
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
          client_id,
          request_type,
          priority,
          subject,
          effective_date,
          description,
          status,
          admin_response,
          resolved_at,
          created_at,
          updated_at
        `)
        .order(
          "created_at",
          {
            ascending: false
          }
        );
    if (error) {
      throw error;
    }
    requests =
      data || [];
  } catch (error) {
    console.error(
      "Erro ao carregar pedidos:",
      error
    );
    requests = [];
    renderError(
      "requestsTable",
      "Não foi possível carregar os pedidos."
    );
  }
}
/* =========================================================
   NOTIFICATIONS LOAD
========================================================= */
async function loadNotifications() {
  try {
    const {
      data,
      error
    } =
      await db
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
        .order(
          "created_at",
          {
            ascending: false
          }
        );
    if (error) {
      throw error;
    }
    notifications =
      data || [];
  } catch (error) {
    console.error(
      "Erro ao carregar notificações:",
      error
    );
    notifications = [];
    renderError(
      "notificationsTable",
      "Não foi possível carregar as notificações."
    );
  }
}
/* =========================================================
   ANNOUNCEMENTS LOAD
========================================================= */
async function loadAnnouncements() {
  try {
    const {
      data,
      error
    } =
      await db
        .from("announcements")
        .select(`
          id,
          title,
          content,
          announcement_type,
          published,
          publish_date,
          expires_at,
          created_at,
          updated_at
        `)
        .order(
          "created_at",
          {
            ascending: false
          }
        );
    if (error) {
      throw error;
    }
    announcements =
      data || [];
  } catch (error) {
    console.error(
      "Erro ao carregar avisos:",
      error
    );
    announcements = [];
    renderError(
      "announcementsTable",
      "Não foi possível carregar os avisos."
    );
  }
}
/* =========================================================
   NAVIGATION
========================================================= */
function setupNavigation() {
  document.addEventListener(
    "click",
    event => {
      const element =
        event.target.closest(
          "[data-page]"
        );
      if (!element) return;
      event.preventDefault();
      const page =
        element.dataset.page;
      if (!page) return;
      navigateTo(page);
    }
  );
}
function navigateTo(page) {
  const section =
    document.querySelector(
      `[data-page-section="${page}"]`
    );
  if (!section) return;
  currentPage =
    page;
  document
    .querySelectorAll(
      ".page-section"
    )
    .forEach(
      element => {
        element.classList.toggle(
          "active",
          element === section
        );
      }
    );
  document
    .querySelectorAll(
      ".nav-item"
    )
    .forEach(
      item => {
        item.classList.toggle(
          "active",
          item.dataset.page === page
        );
      }
    );
  const titles = {
    dashboard: [
      "Dashboard",
      "Dashboard"
    ],
    clients: [
      "Clientes",
      "Clientes"
    ],
    subscriptions: [
      "Serviços",
      "Serviços"
    ],
    collections: [
      "Recolhas",
      "Recolhas"
    ],
    payments: [
      "Pagamentos",
      "Pagamentos"
    ],
    requests: [
      "Pedidos",
      "Pedidos"
    ],
    notifications: [
      "Notificações",
      "Notificações"
    ],
    announcements: [
      "Avisos",
      "Avisos"
    ],
    reports: [
      "Relatórios",
      "Relatórios"
    ],
    settings: [
      "Definições",
      "Definições"
    ]
  };
  const title =
    titles[page] ||
    ["Dashboard", "Dashboard"];
  setText(
    "pageTitle",
    title[0]
  );
  setText(
    "breadcrumbPage",
    title[1]
  );
  renderCurrentPage();
  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
  closeSidebarMobile();
}
function renderCurrentPage() {
  switch (currentPage) {
    case "dashboard":
      updateDashboard();
      break;
    case "clients":
      renderClients();
      break;
    case "subscriptions":
      renderSubscriptions();
      break;
    case "collections":
      renderCollections();
      renderCollectionRequests();
      break;
    case "payments":
      renderPayments();
      break;
    case "requests":
      renderRequests();
      break;
    case "notifications":
      renderNotifications();
      break;
    case "announcements":
      renderAnnouncements();
      break;
    case "reports":
      updateReports();
      break;
    case "settings":
      updateSettings();
      break;
  }
}
/* =========================================================
   DASHBOARD
========================================================= */
function updateDashboard() {
  const today =
    getTodayISO();
  const activeClients =
    clients.filter(
      client =>
        client.status === "active"
    );
  const activeSubscriptions =
    subscriptions.filter(
      subscription =>
        subscription.status === "active"
    );
  const upcomingCollections =
    collections.filter(
      collection =>
        collection.status === "scheduled" &&
        collection.collection_date >= today
    );
  const paidPayments =
    payments.filter(
      payment =>
        payment.status === "paid"
    );
  const pendingPayments =
    payments.filter(
      payment =>
        payment.status === "pending"
    );
  const openRequests =
    requests.filter(
      request =>
        request.status === "new" ||
        request.status === "in_progress"
    );
  const newCollectionRequests =
    collectionRequests.filter(
      request =>
        request.status === "new"
    );
  const unreadNotifications =
    notifications.filter(
      notification =>
        !notification.is_read
    );
  const revenue =
    paidPayments.reduce(
      (sum, payment) =>
        sum +
        Number(
          payment.amount || 0
        ),
      0
    );
  setText(
    "statTotalClients",
    clients.length
  );
  setText(
    "statActiveClients",
    `${activeClients.length} activos`
  );
  setText(
    "statActiveSubscriptions",
    activeSubscriptions.length
  );
  setText(
    "statUpcomingCollections",
    upcomingCollections.length
  );
  setText(
    "statRevenue",
    formatMoney(revenue)
  );
  setText(
    "statPendingPayments",
    pendingPayments.length
  );
  setText(
    "statOpenRequests",
    openRequests.length
  );
  setText(
    "statCollectionRequests",
    newCollectionRequests.length
  );
  setText(
    "statUnreadNotifications",
    unreadNotifications.length
  );
  renderDashboardClients();
  renderDashboardCollections();
  renderDashboardActivity();
}
/* =========================================================
   DASHBOARD CLIENTS
========================================================= */
function renderDashboardClients() {
  const container =
    document.getElementById(
      "dashboardClients"
    );
  if (!container) return;
  const list =
    clients.slice(0, 6);
  if (!list.length) {
    container.innerHTML =
      emptyHTML(
        "Nenhum cliente registado."
      );
    return;
  }
  container.innerHTML = `
    <table>
      <thead>
        <tr>
          <th>Cliente</th>
          <th>Código</th>
          <th>Estado</th>
        </tr>
      </thead>
      <tbody>
        ${list.map(client => `
          <tr>
            <td>
              ${clientCellHTML(client)}
            </td>
            <td>
              ${safe(
                client.client_code
              )}
            </td>
            <td>
              ${statusBadge(
                client.status
              )}
            </td>
          </tr>
        `).join("")}
      </tbody>
    </table>
  `;
}
/* =========================================================
   DASHBOARD COLLECTIONS
========================================================= */
function renderDashboardCollections() {
  const container =
    document.getElementById(
      "dashboardCollections"
    );
  if (!container) return;
  const today =
    getTodayISO();
  const list =
    collections
      .filter(
        collection =>
          collection.status === "scheduled" &&
          collection.collection_date >= today
      )
      .slice(0, 5);
  if (!list.length) {
    container.innerHTML =
      emptyHTML(
        "Nenhuma recolha agendada."
      );
    return;
  }
  container.innerHTML =
    list.map(
      collection => {
        const client =
          getClient(
            collection.client_id
          );
        return `
          <div class="activity-item">
            <div class="activity-icon">
              ♻
            </div>
            <div class="activity-content">
              <strong>
                ${safe(
                  client?.full_name ||
                  "Cliente"
                )}
              </strong>
              <span>
                ${formatDate(
                  collection.collection_date
                )}
                ${
                  collection.collection_time
                    ? ` · ${formatTime(
                        collection.collection_time
                      )}`
                    : ""
                }
              </span>
              <small>
                ${safe(
                  collection.collection_code ||
                  ""
                )}
              </small>
            </div>
          </div>
        `;
      }
    ).join("");
}
/* =========================================================
   DASHBOARD ACTIVITY
========================================================= */
function renderDashboardActivity() {
  const container =
    document.getElementById(
      "dashboardActivity"
    );
  if (!container) return;
  const activity = [];
  clients
    .slice(0, 3)
    .forEach(
      client => {
        activity.push({
          type: "Cliente",
          title:
            client.full_name,
          date:
            client.created_at,
          icon: "♙"
        });
      }
    );
  requests
    .slice(0, 3)
    .forEach(
      request => {
        activity.push({
          type: "Pedido",
          title:
            request.subject,
          date:
            request.created_at,
          icon: "?"
        });
      }
    );
  payments
    .filter(
      payment =>
        payment.status === "paid"
    )
    .slice(0, 3)
    .forEach(
      payment => {
        activity.push({
          type: "Pagamento",
          title:
            payment.payment_code,
          date:
            payment.payment_date,
          icon: "MZN"
        });
      }
    );
  activity.sort(
    (a, b) =>
      new Date(b.date || 0) -
      new Date(a.date || 0)
  );
  const list =
    activity.slice(0, 8);
  if (!list.length) {
    container.innerHTML =
      emptyHTML(
        "Nenhuma actividade recente."
      );
    return;
  }
  container.innerHTML =
    list.map(
      item => `
        <div class="activity-item">
          <div class="activity-icon">
            ${safe(item.icon)}
          </div>
          <div class="activity-content">
            <strong>
              ${safe(item.title || "—")}
            </strong>
            <span>
              ${safe(item.type)}
            </span>
            <small>
              ${formatDateTime(item.date)}
            </small>
          </div>
        </div>
      `
    ).join("");
}
/* =========================================================
   CLIENTS
========================================================= */
function renderClients() {
  const container =
    document.getElementById(
      "clientsTable"
    );
  if (!container) return;
  const search =
    value("clientSearch")
      .toLowerCase();
  const status =
    value(
      "clientStatusFilter"
    );
  const city =
    value(
      "clientCityFilter"
    );
  const filtered =
    clients.filter(
      client => {
        const searchable = [
          client.full_name,
          client.business_name,
          client.client_code,
          client.email,
          client.phone
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return (
          (
            !search ||
            searchable.includes(search)
          ) &&
          (
            status === "all" ||
            client.status === status
          ) &&
          (
            city === "all" ||
            client.city === city
          )
        );
      }
    );
  setText(
    "clientsResultCount",
    `${filtered.length} cliente(s)`
  );
  if (!filtered.length) {
    container.innerHTML =
      emptyHTML(
        "Nenhum cliente encontrado."
      );
    return;
  }
  container.innerHTML = `
    <table>
      <thead>
        <tr>
          <th>Cliente</th>
          <th>Código</th>
          <th>Contacto</th>
          <th>Localização</th>
          <th>Estado</th>
          <th>Data</th>
          <th>Acções</th>
        </tr>
      </thead>
      <tbody>
        ${filtered.map(client => `
          <tr>
            <td>
              ${clientCellHTML(client)}
            </td>
            <td>
              ${safe(
                client.client_code
              )}
            </td>
            <td>
              <div>
                ${safe(
                  client.email || "—"
                )}
              </div>
              <div class="table-secondary">
                ${safe(
                  client.phone || "—"
                )}
              </div>
            </td>
            <td>
              <div>
                ${safe(
                  client.city || "—"
                )}
              </div>
              <div class="table-secondary">
                ${safe(
                  client.bairro || ""
                )}
              </div>
            </td>
            <td>
              ${statusBadge(
                client.status
              )}
            </td>
            <td>
              ${formatDate(
                client.created_at
              )}
            </td>
            <td>
              <div class="table-actions">
                <button
                  type="button"
                  class="table-action"
                  data-client-view="${client.id}"
                >
                  Ver
                </button>
                <button
                  type="button"
                  class="table-action"
                  data-client-edit="${client.id}"
                >
                  Editar
                </button>
              </div>
            </td>
          </tr>
        `).join("")}
      </tbody>
    </table>
  `;
}
document.addEventListener(
  "click",
  event => {
    const view =
      event.target.closest(
        "[data-client-view]"
      );
    if (view) {
      openClientDrawer(
        view.dataset.clientView
      );
      return;
    }
    const edit =
      event.target.closest(
        "[data-client-edit]"
      );
    if (edit) {
      openClientForm(
        edit.dataset.clientEdit
      );
    }
  }
);
/* =========================================================
   CLIENT FORM
========================================================= */
function openClientForm(
  clientId = null
) {
  const client =
    clientId
      ? clients.find(
          c => c.id === clientId
        )
      : null;
  openModal(
    client
      ? "Editar cliente"
      : "Novo cliente",
    `
      <form id="clientForm">
        <div class="form-grid">
          <div class="form-group">
            <label>
              Nome completo <span>*</span>
            </label>
            <input
              type="text"
              id="clientFullName"
              required
              value="${safeAttr(
                client?.full_name || ""
              )}"
            >
          </div>
          <div class="form-group">
            <label>
              Empresa
            </label>
            <input
              type="text"
              id="clientBusinessName"
              value="${safeAttr(
                client?.business_name || ""
              )}"
            >
          </div>
          <div class="form-group">
            <label>
              Email
            </label>
            <input
              type="email"
              id="clientEmail"
              value="${safeAttr(
                client?.email || ""
              )}"
            >
          </div>
          <div class="form-group">
            <label>
              Telefone
            </label>
            <input
              type="text"
              id="clientPhone"
              value="${safeAttr(
                client?.phone || ""
              )}"
            >
          </div>
          <div class="form-group full">
            <label>
              Endereço
            </label>
            <input
              type="text"
              id="clientAddress"
              value="${safeAttr(
                client?.address || ""
              )}"
            >
          </div>
          <div class="form-group">
            <label>
              Bairro
            </label>
            <input
              type="text"
              id="clientBairro"
              value="${safeAttr(
                client?.bairro || ""
              )}"
            >
          </div>
          <div class="form-group">
            <label>
              Cidade
            </label>
            <input
              type="text"
              id="clientCity"
              value="${safeAttr(
                client?.city || ""
              )}"
            >
          </div>
          <div class="form-group full">
            <label>
              Local de recolha
            </label>
            <input
              type="text"
              id="clientServiceLocation"
              value="${safeAttr(
                client?.service_location || ""
              )}"
            >
          </div>
          <div class="form-group">
            <label>
              Estado
            </label>
            <select id="clientStatus">
              <option
                value="active"
                ${(!client ||
                  client.status === "active")
                  ? "selected"
                  : ""}
              >
                Activo
              </option>
              <option
                value="inactive"
                ${client?.status === "inactive"
                  ? "selected"
                  : ""}
              >
                Inactivo
              </option>
              <option
                value="suspended"
                ${client?.status === "suspended"
                  ? "selected"
                  : ""}
              >
                Suspenso
              </option>
            </select>
          </div>
        </div>
      </form>
    `,
    `
      <button
        type="button"
        class="btn btn-secondary"
        data-modal-close
      >
        Cancelar
      </button>
      <button
        type="submit"
        form="clientForm"
        class="btn btn-primary"
      >
        ${
          client
            ? "Guardar alterações"
            : "Criar cliente"
        }
      </button>
    `
  );
  document
    .getElementById(
      "clientForm"
    )
    ?.addEventListener(
      "submit",
      async event => {
        event.preventDefault();
        await saveClient(
          clientId
        );
      }
    );
}
async function saveClient(
  clientId
) {
  const fullName =
    value(
      "clientFullName"
    ).trim();
  if (!fullName) {
    showToast(
      "error",
      "O nome completo é obrigatório."
    );
    return;
  }
  const payload = {
    full_name:
      fullName,
    business_name:
      value(
        "clientBusinessName"
      ).trim() || null,
    email:
      value(
        "clientEmail"
      ).trim() || null,
    phone:
      value(
        "clientPhone"
      ).trim() || null,
    address:
      value(
        "clientAddress"
      ).trim() || null,
    bairro:
      value(
        "clientBairro"
      ).trim() || null,
    city:
      value(
        "clientCity"
      ).trim() || null,
    service_location:
      value(
        "clientServiceLocation"
      ).trim() || null,
    status:
      value(
        "clientStatus"
      )
  };
  try {
    let result;
    if (clientId) {
      result =
        await db
          .from("clients")
          .update(payload)
          .eq("id", clientId);
    } else {
      payload.client_code =
        await generateUniqueClientCode();
      result =
        await db
          .from("clients")
          .insert(payload);
    }
    if (result.error) {
      throw result.error;
    }
    closeModal();
    showToast(
      "success",
      "Cliente guardado com sucesso."
    );
    await loadClients();
    updateDashboard();
    updateNavigationCounters();
    renderClients();
  } catch (error) {
    console.error(error);
    showToast(
      "error",
      error.message ||
      "Não foi possível guardar o cliente."
    );
  }
}
/* =========================================================
   SUBSCRIPTIONS
========================================================= */
function renderSubscriptions() {
  const container =
    document.getElementById(
      "subscriptionsTable"
    );
  if (!container) return;
  const search =
    value(
      "subscriptionSearch"
    )
      .toLowerCase();
  const status =
    value(
      "subscriptionStatusFilter"
    );
  const filtered =
    subscriptions.filter(
      subscription => {
        const client =
          getClient(
            subscription.client_id
          );
        const searchable = [
          client?.full_name,
          client?.client_code,
          subscription.plan_name
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return (
          (
            !search ||
            searchable.includes(search)
          ) &&
          (
            status === "all" ||
            subscription.status === status
          )
        );
      }
    );
  setText(
    "subscriptionsResultCount",
    `${filtered.length} serviço(s)`
  );
  if (!filtered.length) {
    container.innerHTML =
      emptyHTML(
        "Nenhum serviço encontrado."
      );
    return;
  }
  container.innerHTML = `
    <table>
      <thead>
        <tr>
          <th>Cliente</th>
          <th>Plano</th>
          <th>Frequência</th>
          <th>Preço</th>
          <th>Início</th>
          <th>Estado</th>
          <th>Acções</th>
        </tr>
      </thead>
      <tbody>
        ${filtered.map(subscription => {
          const client =
            getClient(
              subscription.client_id
            );
          return `
            <tr>
              <td>
                ${clientCellHTML(client)}
              </td>
              <td>
                <strong>
                  ${safe(
                    subscription.plan_name
                  )}
                </strong>
              </td>
              <td>
                ${translateFrequency(
                  subscription.frequency
                )}
              </td>
              <td>
                ${formatMoney(
                  subscription.price,
                  subscription.currency
                )}
              </td>
              <td>
                ${formatDate(
                  subscription.start_date
                )}
              </td>
              <td>
                ${statusBadge(
                  subscription.status
                )}
              </td>
              <td>
                <div class="table-actions">
                  <button
                    type="button"
                    class="table-action"
                    data-subscription-edit="${subscription.id}"
                  >
                    Editar
                  </button>
                </div>
              </td>
            </tr>
          `;
        }).join("")}
      </tbody>
    </table>
  `;
}
document.addEventListener(
  "click",
  event => {
    const button =
      event.target.closest(
        "[data-subscription-edit]"
      );
    if (button) {
      openSubscriptionForm(
        button.dataset.subscriptionEdit
      );
    }
  }
);
function openSubscriptionForm(
  subscriptionId = null
) {
  const subscription =
    subscriptionId
      ? subscriptions.find(
          s => s.id === subscriptionId
        )
      : null;
  openModal(
    subscription
      ? "Editar serviço"
      : "Novo serviço",
    `
      <form id="subscriptionForm">
        <div class="form-grid">
          <div class="form-group full">
            <label>
              Cliente <span>*</span>
            </label>
            <select
              id="subscriptionClient"
              required
            >
              <option value="">
                Seleccionar cliente
              </option>
              ${clients.map(client => `
                <option
                  value="${client.id}"
                  ${
                    subscription?.client_id ===
                    client.id
                      ? "selected"
                      : ""
                  }
                >
                  ${safe(client.full_name)}
                  — ${safe(client.client_code)}
                </option>
              `).join("")}
            </select>
          </div>
          <div class="form-group">
            <label>
              Plano <span>*</span>
            </label>
            <input
              type="text"
              id="subscriptionPlan"
              required
              value="${safeAttr(
                subscription?.plan_name || ""
              )}"
            >
          </div>
          <div class="form-group">
            <label>
              Frequência
            </label>
            <select id="subscriptionFrequency">
              ${frequencyOptions(
                subscription?.frequency
              )}
            </select>
          </div>
          <div class="form-group">
            <label>
              Preço
            </label>
            <input
              type="number"
              id="subscriptionPrice"
              min="0"
              step="0.01"
              value="${safeAttr(
                subscription?.price ?? ""
              )}"
            >
          </div>
          <div class="form-group">
            <label>
              Moeda
            </label>
            <select id="subscriptionCurrency">
              <option
                value="MZN"
                ${
                  !subscription ||
                  subscription.currency === "MZN"
                    ? "selected"
                    : ""
                }
              >
                MZN
              </option>
              <option
                value="USD"
                ${
                  subscription?.currency === "USD"
                    ? "selected"
                    : ""
                }
              >
                USD
              </option>
            </select>
          </div>
          <div class="form-group">
            <label>
              Data de início
            </label>
            <input
              type="date"
              id="subscriptionStart"
              value="${safeAttr(
                subscription?.start_date || ""
              )}"
            >
          </div>
          <div class="form-group">
            <label>
              Data de fim
            </label>
            <input
              type="date"
              id="subscriptionEnd"
              value="${safeAttr(
                subscription?.end_date || ""
              )}"
            >
          </div>
          <div class="form-group">
            <label>
              Estado
            </label>
            <select id="subscriptionStatus">
              ${subscriptionStatusOptions(
                subscription?.status
              )}
            </select>
          </div>
          <div class="form-group full">
            <label>
              Notas
            </label>
            <textarea
              id="subscriptionNotes"
            >${safe(
              subscription?.notes || ""
            )}</textarea>
          </div>
        </div>
      </form>
    `,
    `
      <button
        type="button"
        class="btn btn-secondary"
        data-modal-close
      >
        Cancelar
      </button>
      <button
        type="submit"
        form="subscriptionForm"
        class="btn btn-primary"
      >
        ${
          subscription
            ? "Guardar alterações"
            : "Criar serviço"
        }
      </button>
    `
  );
  document
    .getElementById(
      "subscriptionForm"
    )
    ?.addEventListener(
      "submit",
      async event => {
        event.preventDefault();
        await saveSubscription(
          subscriptionId
        );
      }
    );
}
async function saveSubscription(
  subscriptionId
) {
  const payload = {
    client_id:
      value(
        "subscriptionClient"
      ),
    plan_name:
      value(
        "subscriptionPlan"
      ).trim(),
    frequency:
      value(
        "subscriptionFrequency"
      ),
    price:
      Number(
        value(
          "subscriptionPrice"
        ) || 0
      ),
    currency:
      value(
        "subscriptionCurrency"
      ),
    start_date:
      value(
        "subscriptionStart"
      ) || null,
    end_date:
      value(
        "subscriptionEnd"
      ) || null,
    status:
      value(
        "subscriptionStatus"
      ),
    notes:
      value(
        "subscriptionNotes"
      ).trim() || null
  };
  try {
    let result;
    if (subscriptionId) {
      result =
        await db
          .from("subscriptions")
          .update(payload)
          .eq("id", subscriptionId);
    } else {
      result =
        await db
          .from("subscriptions")
          .insert(payload);
    }
    if (result.error) {
      throw result.error;
    }
    closeModal();
    showToast(
      "success",
      "Serviço guardado com sucesso."
    );
    await loadSubscriptions();
    updateDashboard();
    renderSubscriptions();
  } catch (error) {
    console.error(error);
    showToast(
      "error",
      error.message ||
      "Não foi possível guardar o serviço."
    );
  }
}
/* =========================================================
   COLLECTIONS
========================================================= */
function renderCollections() {
  const container =
    document.getElementById(
      "collectionsTable"
    );
  if (!container) return;
  const search =
    value(
      "collectionSearch"
    )
      .toLowerCase();
  const status =
    value(
      "collectionStatusFilter"
    );
  const date =
    value(
      "collectionDateFilter"
    );
  const filtered =
    collections.filter(
      collection => {
        const client =
          getClient(
            collection.client_id
          );
        const searchable = [
          collection.collection_code,
          collection.location,
          client?.full_name,
          client?.client_code
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return (
          (
            !search ||
            searchable.includes(search)
          ) &&
          (
            status === "all" ||
            collection.status === status
          ) &&
          (
            !date ||
            collection.collection_date === date
          )
        );
      }
    );
  setText(
    "collectionsResultCount",
    `${filtered.length} recolha(s)`
  );
  updateCollectionSummary();
  if (!filtered.length) {
    container.innerHTML =
      emptyHTML(
        "Nenhuma recolha encontrada."
      );
    return;
  }
  container.innerHTML = `
    <table>
      <thead>
        <tr>
          <th>Data</th>
          <th>Cliente</th>
          <th>Código</th>
          <th>Local</th>
          <th>Frequência</th>
          <th>Estado</th>
          <th>Acções</th>
        </tr>
      </thead>
      <tbody>
        ${filtered.map(collection => {
          const client =
            getClient(
              collection.client_id
            );
          return `
            <tr>
              <td>
                <strong>
                  ${formatDate(
                    collection.collection_date
                  )}
                </strong>
                <div class="table-secondary">
                  ${formatTime(
                    collection.collection_time
                  )}
                </div>
              </td>
              <td>
                ${clientCellHTML(client)}
              </td>
              <td>
                ${safe(
                  collection.collection_code
                )}
              </td>
              <td>
                ${safe(
                  collection.location || "—"
                )}
              </td>
              <td>
                ${translateFrequency(
                  collection.frequency
                )}
              </td>
              <td>
                ${statusBadge(
                  collection.status
                )}
              </td>
              <td>
                <div class="table-actions">
                  <button
                    type="button"
                    class="table-action"
                    data-collection-edit="${collection.id}"
                  >
                    Editar
                  </button>
                </div>
              </td>
            </tr>
          `;
        }).join("")}
      </tbody>
    </table>
  `;
}
function updateCollectionSummary() {
  setText(
    "collectionsScheduledCount",
    collections.filter(
      c => c.status === "scheduled"
    ).length
  );
  setText(
    "collectionsCompletedCount",
    collections.filter(
      c => c.status === "completed"
    ).length
  );
  setText(
    "collectionsMissedCount",
    collections.filter(
      c => c.status === "missed"
    ).length
  );
  setText(
    "collectionsCancelledCount",
    collections.filter(
      c => c.status === "cancelled"
    ).length
  );
}
document.addEventListener(
  "click",
  event => {
    const button =
      event.target.closest(
        "[data-collection-edit]"
      );
    if (button) {
      openCollectionForm(
        button.dataset.collectionEdit
      );
    }
  }
);
function openCollectionForm(
  collectionId = null
) {
  const collection =
    collectionId
      ? collections.find(
          c => c.id === collectionId
        )
      : null;
  openModal(
    collection
      ? "Editar recolha"
      : "Nova recolha",
    `
      <form id="collectionForm">
        <div class="form-grid">
          <div class="form-group full">
            <label>
              Cliente <span>*</span>
            </label>
            <select
              id="collectionClient"
              required
            >
              <option value="">
                Seleccionar cliente
              </option>
              ${clients.map(client => `
                <option
                  value="${client.id}"
                  ${
                    collection?.client_id ===
                    client.id
                      ? "selected"
                      : ""
                  }
                >
                  ${safe(client.full_name)}
                  — ${safe(client.client_code)}
                </option>
              `).join("")}
            </select>
          </div>
          <div class="form-group">
            <label>
              Data <span>*</span>
            </label>
            <input
              type="date"
              id="collectionDate"
              required
              value="${safeAttr(
                collection?.collection_date ||
                getTodayISO()
              )}"
            >
          </div>
          <div class="form-group">
            <label>
              Hora
            </label>
            <input
              type="time"
              id="collectionTime"
              value="${safeAttr(
                formatTime(
                  collection?.collection_time
                )
              )}"
            >
          </div>
          <div class="form-group">
            <label>
              Frequência
            </label>
            <select id="collectionFrequency">
              <option value="">
                Seleccionar
              </option>
              ${frequencyOptions(
                collection?.frequency
              )}
            </select>
          </div>
          <div class="form-group">
            <label>
              Estado
            </label>
            <select id="collectionStatus">
              <option
                value="scheduled"
                ${
                  !collection ||
                  collection.status === "scheduled"
                    ? "selected"
                    : ""
                }
              >
                Agendada
              </option>
              <option
                value="completed"
                ${
                  collection?.status === "completed"
                    ? "selected"
                    : ""
                }
              >
                Concluída
              </option>
              <option
                value="missed"
                ${
                  collection?.status === "missed"
                    ? "selected"
                    : ""
                }
              >
                Em falta
              </option>
              <option
                value="cancelled"
                ${
                  collection?.status === "cancelled"
                    ? "selected"
                    : ""
                }
              >
                Cancelada
              </option>
            </select>
          </div>
          <div class="form-group full">
            <label>
              Local
            </label>
            <input
              type="text"
              id="collectionLocation"
              value="${safeAttr(
                collection?.location || ""
              )}"
            >
          </div>
          <div class="form-group full">
            <label>
              Notas
            </label>
            <textarea
              id="collectionNotes"
            >${safe(
              collection?.notes || ""
            )}</textarea>
          </div>
        </div>
      </form>
    `,
    `
      <button
        type="button"
        class="btn btn-secondary"
        data-modal-close
      >
        Cancelar
      </button>
      <button
        type="submit"
        form="collectionForm"
        class="btn btn-primary"
      >
        ${
          collection
            ? "Guardar alterações"
            : "Criar recolha"
        }
      </button>
    `
  );
  document
    .getElementById(
      "collectionForm"
    )
    ?.addEventListener(
      "submit",
      async event => {
        event.preventDefault();
        await saveCollection(
          collectionId
        );
      }
    );
}
async function saveCollection(
  collectionId
) {
  const payload = {
    client_id:
      value(
        "collectionClient"
      ),
    collection_date:
      value(
        "collectionDate"
      ),
    collection_time:
      value(
        "collectionTime"
      ) || null,
    frequency:
      value(
        "collectionFrequency"
      ) || null,
    location:
      value(
        "collectionLocation"
      ).trim() || null,
    status:
      value(
        "collectionStatus"
      ),
    notes:
      value(
        "collectionNotes"
      ).trim() || null
  };
  try {
    let result;
    if (collectionId) {
      result =
        await db
          .from("collections")
          .update(payload)
          .eq("id", collectionId);
    } else {
      payload.collection_code =
        await generateUniqueCode(
          "COL",
          "collections",
          "collection_code"
        );
      result =
        await db
          .from("collections")
          .insert(payload);
    }
    if (result.error) {
      throw result.error;
    }
    closeModal();
    showToast(
      "success",
      "Recolha guardada com sucesso."
    );
    await loadCollections();
    renderCollections();
    updateDashboard();
  } catch (error) {
    console.error(error);
    showToast(
      "error",
      error.message ||
      "Não foi possível guardar a recolha."
    );
  }
}
/* =========================================================
   COLLECTION REQUESTS
========================================================= */
function renderCollectionRequests() {
  const container =
    document.getElementById(
      "collectionRequestsTable"
    );
  if (!container) return;
  const pending =
    collectionRequests.filter(
      request =>
        request.status === "new"
    );
  setText(
    "collectionRequestsCount",
    pending.length
  );
  if (!collectionRequests.length) {
    container.innerHTML =
      emptyHTML(
        "Nenhum pedido de recolha encontrado."
      );
    return;
  }
  container.innerHTML = `
    <table>
      <thead>
        <tr>
          <th>Pedido</th>
          <th>Cliente</th>
          <th>Data</th>
          <th>Hora</th>
          <th>Notas</th>
          <th>Estado</th>
          <th>Acções</th>
        </tr>
      </thead>
      <tbody>
        ${collectionRequests.map(request => {
          const client =
            getClient(
              request.client_id
            );
          return `
            <tr>
              <td>
                <strong>
                  ${safe(
                    request.request_code
                  )}
                </strong>
              </td>
              <td>
                ${clientCellHTML(client)}
              </td>
              <td>
                ${formatDate(
                  request.requested_date
                )}
              </td>
              <td>
                ${formatTime(
                  request.requested_time
                )}
              </td>
              <td>
                ${safe(
                  truncate(
                    request.notes,
                    60
                  )
                )}
              </td>
              <td>
                ${collectionRequestStatusBadge(
                  request.status
                )}
              </td>
              <td>
                <div class="table-actions">
                  ${
                    request.status === "new"
                      ? `
                        <button
                          type="button"
                          class="table-action"
                          data-collection-request-approve="${request.id}"
                        >
                          Aprovar
                        </button>
                        <button
                          type="button"
                          class="table-action"
                          data-collection-request-reject="${request.id}"
                        >
                          Rejeitar
                        </button>
                      `
                      : `
                        <button
                          type="button"
                          class="table-action"
                          data-collection-request-view="${request.id}"
                        >
                          Ver
                        </button>
                      `
                  }
                </div>
              </td>
            </tr>
          `;
        }).join("")}
      </tbody>
    </table>
  `;
}
document.addEventListener(
  "click",
  event => {
    const approve =
      event.target.closest(
        "[data-collection-request-approve]"
      );
    if (approve) {
      approveCollectionRequest(
        approve.dataset
          .collectionRequestApprove
      );
      return;
    }
    const reject =
      event.target.closest(
        "[data-collection-request-reject]"
      );
    if (reject) {
      updateCollectionRequestStatus(
        reject.dataset
          .collectionRequestReject,
        "rejected"
      );
    }
  }
);
function approveCollectionRequest(
  requestId
) {
  const request =
    collectionRequests.find(
      item =>
        item.id === requestId
    );
  if (!request) return;
  openModal(
    "Aprovar pedido de recolha",
    `
      <form id="approveCollectionRequestForm">
        <div class="form-grid">
          <div class="form-group">
            <label>
              Data aprovada <span>*</span>
            </label>
            <input
              type="date"
              id="approvedCollectionDate"
              required
              value="${safeAttr(
                request.requested_date ||
                getTodayISO()
              )}"
            >
          </div>
          <div class="form-group">
            <label>
              Hora aprovada
            </label>
            <input
              type="time"
              id="approvedCollectionTime"
              value="${safeAttr(
                formatTime(
                  request.requested_time
                )
              )}"
            >
          </div>
          <div class="form-group full">
            <label>
              Notas administrativas
            </label>
            <textarea
              id="approvedCollectionNotes"
            >${safe(
              request.admin_notes || ""
            )}</textarea>
          </div>
        </div>
      </form>
    `,
    `
      <button
        type="button"
        class="btn btn-secondary"
        data-modal-close
      >
        Cancelar
      </button>
      <button
        type="submit"
        form="approveCollectionRequestForm"
        class="btn btn-primary"
      >
        Aprovar e agendar
      </button>
    `
  );
  document
    .getElementById(
      "approveCollectionRequestForm"
    )
    ?.addEventListener(
      "submit",
      async event => {
        event.preventDefault();
        await finalizeCollectionRequestApproval(
          request
        );
      }
    );
}
async function finalizeCollectionRequestApproval(
  request
) {
  const client =
    getClient(
      request.client_id
    );
  try {
    const collectionPayload = {
      collection_code:
        await generateUniqueCode(
          "COL",
          "collections",
          "collection_code"
        ),
      client_id:
        request.client_id,
      collection_date:
        value(
          "approvedCollectionDate"
        ),
      collection_time:
        value(
          "approvedCollectionTime"
        ) || null,
      frequency:
        null,
      location:
        client?.service_location ||
        client?.address ||
        null,
      status:
        "scheduled",
      notes:
        value(
          "approvedCollectionNotes"
        ).trim() ||
        request.notes ||
        null
    };
    const collectionResult =
      await db
        .from("collections")
        .insert(
          collectionPayload
        );
    if (collectionResult.error) {
      throw collectionResult.error;
    }
    const requestResult =
      await db
        .from("collection_requests")
        .update({
          status: "scheduled",
          admin_notes:
            value(
              "approvedCollectionNotes"
            ).trim() ||
            null
        })
        .eq(
          "id",
          request.id
        );
    if (requestResult.error) {
      throw requestResult.error;
    }
    await createNotification(
      request.client_id,
      `Pedido ${request.request_code} aprovado`,
      "O seu pedido de recolha foi aprovado e agendado.",
      "collection"
    );
    closeModal();
    showToast(
      "success",
      "Pedido aprovado e recolha agendada."
    );
    await loadCollections();
    await loadCollectionRequests();
    await loadNotifications();
    renderCollections();
    renderCollectionRequests();
    updateDashboard();
    updateNavigationCounters();
  } catch (error) {
    console.error(error);
    showToast(
      "error",
      error.message ||
      "Não foi possível aprovar o pedido."
    );
  }
}
async function updateCollectionRequestStatus(
  requestId,
  status
) {
  try {
    const result =
      await db
        .from("collection_requests")
        .update({
          status
        })
        .eq(
          "id",
          requestId
        );
    if (result.error) {
      throw result.error;
    }
    const request =
      collectionRequests.find(
        item =>
          item.id === requestId
      );
    if (request) {
      const message =
        status === "rejected"
          ? "O seu pedido de recolha foi rejeitado."
          : `O estado do seu pedido foi alterado para ${translateStatus(status)}.`;
      await createNotification(
        request.client_id,
        `Actualização do pedido ${request.request_code}`,
        message,
        "collection"
      );
    }
    showToast(
      "success",
      "Estado do pedido actualizado."
    );
    await loadCollectionRequests();
    await loadNotifications();
    renderCollectionRequests();
    updateDashboard();
    updateNavigationCounters();
  } catch (error) {
    console.error(error);
    showToast(
      "error",
      error.message ||
      "Não foi possível actualizar o pedido."
    );
  }
}
/* =========================================================
   PAYMENTS
========================================================= */
function renderPayments() {
  const container =
    document.getElementById(
      "paymentsTable"
    );
  if (!container) return;
  const search =
    value("paymentSearch")
      .toLowerCase();
  const status =
    value("paymentStatusFilter");
  const method =
    value("paymentMethodFilter");
  const filtered =
    payments.filter(payment => {
      const client =
        getClient(
          payment.client_id
        );
      const searchable = [
        payment.payment_code,
        payment.reference,
        client?.full_name,
        client?.client_code
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return (
        (
          !search ||
          searchable.includes(search)
        ) &&
        (
          status === "all" ||
          payment.status === status
        ) &&
        (
          method === "all" ||
          payment.payment_method === method
        )
      );
    });
  const paid =
    payments.filter(
      p =>
        p.status === "paid"
    );
  const pending =
    payments.filter(
      p =>
        p.status === "pending"
    );
  const failed =
    payments.filter(
      p =>
        p.status === "failed"
    );
  const total =
    paid.reduce(
      (sum, payment) =>
        sum +
        Number(
          payment.amount || 0
        ),
      0
    );
  setText(
    "paymentsTotalReceived",
    formatMoney(total)
  );
  setText(
    "paymentsPaidCount",
    paid.length
  );
  setText(
    "paymentsPendingCount",
    pending.length
  );
  setText(
    "paymentsFailedCount",
    failed.length
  );
  setText(
    "paymentsResultCount",
    `${filtered.length} pagamento(s)`
  );
  if (!filtered.length) {
    container.innerHTML =
      emptyHTML(
        "Nenhum pagamento encontrado."
      );
    return;
  }
  container.innerHTML = `
    <table>
      <thead>
        <tr>
          <th>Pagamento</th>
          <th>Cliente</th>
          <th>Data</th>
          <th>Valor</th>
          <th>Método</th>
          <th>Referência</th>
          <th>Estado</th>
          <th>Acções</th>
        </tr>
      </thead>
      <tbody>
        ${filtered.map(payment => {
          const client =
            getClient(
              payment.client_id
            );
          return `
            <tr>
              <td>
                <strong>
                  ${safe(
                    payment.payment_code
                  )}
                </strong>
              </td>
              <td>
                ${clientCellHTML(client)}
              </td>
              <td>
                ${formatDate(
                  payment.payment_date
                )}
              </td>
              <td>
                <strong>
                  ${formatMoney(
                    payment.amount,
                    payment.currency
                  )}
                </strong>
              </td>
              <td>
                ${translatePaymentMethod(
                  payment.payment_method
                )}
              </td>
              <td>
                ${safe(
                  payment.reference || "—"
                )}
              </td>
              <td>
                ${statusBadge(
                  payment.status
                )}
              </td>
              <td>
                <div class="table-actions">
                  <button
                    type="button"
                    class="table-action"
                    data-payment-edit="${payment.id}"
                  >
                    Editar
                  </button>
                </div>
              </td>
            </tr>
          `;
        }).join("")}
      </tbody>
    </table>
  `;
}
document.addEventListener(
  "click",
  event => {
    const button =
      event.target.closest(
        "[data-payment-edit]"
      );
    if (button) {
      openPaymentForm(
        button.dataset.paymentEdit
      );
    }
  }
);
function openPaymentForm(
  paymentId = null
) {
  const payment =
    paymentId
      ? payments.find(
          p => p.id === paymentId
        )
      : null;
  openModal(
    payment
      ? "Editar pagamento"
      : "Registar pagamento",
    `
      <form id="paymentForm">
        <div class="form-grid">
          <div class="form-group full">
            <label>
              Cliente <span>*</span>
            </label>
            <select
              id="paymentClient"
              required
            >
              <option value="">
                Seleccionar cliente
              </option>
              ${clients.map(client => `
                <option
                  value="${client.id}"
                  ${
                    payment?.client_id ===
                    client.id
                      ? "selected"
                      : ""
                  }
                >
                  ${safe(client.full_name)}
                  — ${safe(client.client_code)}
                </option>
              `).join("")}
            </select>
          </div>
          <div class="form-group">
            <label>
              Data <span>*</span>
            </label>
            <input
              type="date"
              id="paymentDate"
              required
              value="${safeAttr(
                payment?.payment_date ||
                getTodayISO()
              )}"
            >
          </div>
          <div class="form-group">
            <label>
              Valor <span>*</span>
            </label>
            <input
              type="number"
              id="paymentAmount"
              min="0"
              step="0.01"
              required
              value="${safeAttr(
                payment?.amount ?? ""
              )}"
            >
          </div>
          <div class="form-group">
            <label>
              Método
            </label>
            <select id="paymentMethod">
              ${paymentMethodOptions(
                payment?.payment_method
              )}
            </select>
          </div>
          <div class="form-group">
            <label>
              Estado
            </label>
            <select id="paymentStatus">
              ${paymentStatusOptions(
                payment?.status
              )}
            </select>
          </div>
          <div class="form-group">
            <label>
              Período inicial
            </label>
            <input
              type="date"
              id="paymentPeriodStart"
              value="${safeAttr(
                payment?.period_start || ""
              )}"
            >
          </div>
          <div class="form-group">
            <label>
              Período final
            </label>
            <input
              type="date"
              id="paymentPeriodEnd"
              value="${safeAttr(
                payment?.period_end || ""
              )}"
            >
          </div>
          <div class="form-group full">
            <label>
              Referência
            </label>
            <input
              type="text"
              id="paymentReference"
              value="${safeAttr(
                payment?.reference || ""
              )}"
            >
          </div>
          <div class="form-group full">
            <label>
              Notas
            </label>
            <textarea
              id="paymentNotes"
            >${safe(
              payment?.notes || ""
            )}</textarea>
          </div>
        </div>
      </form>
    `,
    `
      <button
        type="button"
        class="btn btn-secondary"
        data-modal-close
      >
        Cancelar
      </button>
      <button
        type="submit"
        form="paymentForm"
        class="btn btn-primary"
      >
        ${
          payment
            ? "Guardar alterações"
            : "Registar pagamento"
        }
      </button>
    `
  );
  document
    .getElementById(
      "paymentForm"
    )
    ?.addEventListener(
      "submit",
      async event => {
        event.preventDefault();
        await savePayment(
          paymentId
        );
      }
    );
}
async function savePayment(
  paymentId
) {
  const payload = {
    client_id:
      value(
        "paymentClient"
      ),
    payment_date:
      value(
        "paymentDate"
      ),
    amount:
      Number(
        value(
          "paymentAmount"
        )
      ),
    currency:
      "MZN",
    payment_method:
      value(
        "paymentMethod"
      ) || null,
    status:
      value(
        "paymentStatus"
      ),
    period_start:
      value(
        "paymentPeriodStart"
      ) || null,
    period_end:
      value(
        "paymentPeriodEnd"
      ) || null,
    reference:
      value(
        "paymentReference"
      ).trim() || null,
    notes:
      value(
        "paymentNotes"
      ).trim() || null
  };
  try {
    let result;
    if (paymentId) {
      result =
        await db
          .from("payments")
          .update(payload)
          .eq("id", paymentId);
    } else {
      payload.payment_code =
        await generateUniqueCode(
          "PAY",
          "payments",
          "payment_code"
        );
      result =
        await db
          .from("payments")
          .insert(payload);
    }
    if (result.error) {
      throw result.error;
    }
    closeModal();
    showToast(
      "success",
      "Pagamento guardado com sucesso."
    );
    await loadPayments();
    updateDashboard();
    updateReports();
    renderPayments();
  } catch (error) {
    console.error(error);
    showToast(
      "error",
      error.message ||
      "Não foi possível guardar o pagamento."
    );
  }
}
/* =========================================================
   REQUESTS
========================================================= */
function renderRequests() {
  const container =
    document.getElementById(
      "requestsTable"
    );
  if (!container) return;
  const search =
    value("requestSearch")
      .toLowerCase();
  const status =
    value(
      "requestStatusFilter"
    );
  const priority =
    value(
      "requestPriorityFilter"
    );
  const filtered =
    requests.filter(request => {
      const client =
        getClient(
          request.client_id
        );
      const searchable = [
        request.request_code,
        request.subject,
        request.description,
        client?.full_name,
        client?.client_code
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return (
        (
          !search ||
          searchable.includes(search)
        ) &&
        (
          status === "all" ||
          request.status === status
        ) &&
        (
          priority === "all" ||
          request.priority === priority
        )
      );
    });
  setText(
    "requestsNewCount",
    requests.filter(
      r =>
        r.status === "new"
    ).length
  );
  setText(
    "requestsProgressCount",
    requests.filter(
      r =>
        r.status === "in_progress"
    ).length
  );
  setText(
    "requestsResolvedCount",
    requests.filter(
      r =>
        r.status === "resolved"
    ).length
  );
  setText(
    "requestsUrgentCount",
    requests.filter(
      r =>
        r.priority === "urgent" &&
        r.status !== "resolved"
    ).length
  );
  setText(
    "requestsResultCount",
    `${filtered.length} pedido(s)`
  );
  if (!filtered.length) {
    container.innerHTML =
      emptyHTML(
        "Nenhum pedido encontrado."
      );
    return;
  }
  container.innerHTML = `
    <table>
      <thead>
        <tr>
          <th>Pedido</th>
          <th>Cliente</th>
          <th>Assunto</th>
          <th>Tipo</th>
          <th>Prioridade</th>
          <th>Data</th>
          <th>Estado</th>
          <th>Acções</th>
        </tr>
      </thead>
      <tbody>
        ${filtered.map(request => {
          const client =
            getClient(
              request.client_id
            );
          return `
            <tr>
              <td>
                <strong>
                  ${safe(
                    request.request_code
                  )}
                </strong>
              </td>
              <td>
                ${clientCellHTML(client)}
              </td>
              <td>
                <strong>
                  ${safe(
                    request.subject
                  )}
                </strong>
                <div class="table-secondary">
                  ${safe(
                    truncate(
                      request.description,
                      60
                    )
                  )}
                </div>
              </td>
              <td>
                ${translateRequestType(
                  request.request_type
                )}
              </td>
              <td>
                ${priorityBadge(
                  request.priority
                )}
              </td>
              <td>
                ${formatDateTime(
                  request.created_at
                )}
              </td>
              <td>
                ${statusBadge(
                  request.status
                )}
              </td>
              <td>
                <div class="table-actions">
                  <button
                    type="button"
                    class="table-action"
                    data-request-view="${request.id}"
                  >
                    Ver
                  </button>
                  <button
                    type="button"
                    class="table-action"
                    data-request-edit="${request.id}"
                  >
                    Responder
                  </button>
                </div>
              </td>
            </tr>
          `;
        }).join("")}
      </tbody>
    </table>
  `;
}
document.addEventListener(
  "click",
  event => {
    const button =
      event.target.closest(
        "[data-request-edit]"
      );
    if (button) {
      openRequestResponseForm(
        button.dataset.requestEdit
      );
      return;
    }
    const view =
      event.target.closest(
        "[data-request-view]"
      );
    if (view) {
      openRequestResponseForm(
        view.dataset.requestView,
        true
      );
    }
  }
);
function openRequestResponseForm(
  requestId,
  readOnly = false
) {
  const request =
    requests.find(
      r => r.id === requestId
    );
  if (!request) return;
  const client =
    getClient(
      request.client_id
    );
  openModal(
    readOnly
      ? "Detalhes do pedido"
      : "Responder ao pedido",
    `
      <div class="form-grid">
        <div class="form-group">
          <label>
            Cliente
          </label>
          <input
            type="text"
            readonly
            value="${safeAttr(
              client?.full_name ||
              "—"
            )}"
          >
        </div>
        <div class="form-group">
          <label>
            Código
          </label>
          <input
            type="text"
            readonly
            value="${safeAttr(
              request.request_code
            )}"
          >
        </div>
        <div class="form-group full">
          <label>
            Assunto
          </label>
          <input
            type="text"
            readonly
            value="${safeAttr(
              request.subject
            )}"
          >
        </div>
        <div class="form-group full">
          <label>
            Descrição
          </label>
          <textarea readonly>${safe(
            request.description
          )}</textarea>
        </div>
        ${
          readOnly
            ? `
              <div class="form-group">
                <label>
                  Estado
                </label>
                <input
                  type="text"
                  readonly
                  value="${safeAttr(
                    translateStatus(
                      request.status
                    )
                  )}"
                >
              </div>
            `
            : `
              <div class="form-group">
                <label>
                  Estado
                </label>
                <select id="requestStatus">
                  <option
                    value="new"
                    ${
                      request.status === "new"
                        ? "selected"
                        : ""
                    }
                  >
                    Novo
                  </option>
                  <option
                    value="in_progress"
                    ${
                      request.status ===
                      "in_progress"
                        ? "selected"
                        : ""
                    }
                  >
                    Em tratamento
                  </option>
                  <option
                    value="resolved"
                    ${
                      request.status ===
                      "resolved"
                        ? "selected"
                        : ""
                    }
                  >
                    Resolvido
                  </option>
                  <option
                    value="rejected"
                    ${
                      request.status ===
                      "rejected"
                        ? "selected"
                        : ""
                    }
                  >
                    Rejeitado
                  </option>
                </select>
              </div>
            `
        }
        <div class="form-group full">
          <label>
            Resposta do administrador
          </label>
          <textarea
            id="requestResponse"
            ${readOnly ? "readonly" : ""}
          >${safe(
            request.admin_response || ""
          )}</textarea>
        </div>
      </div>
    `,
    readOnly
      ? `
        <button
          type="button"
          class="btn btn-secondary"
          data-modal-close
        >
          Fechar
        </button>
      `
      : `
        <button
          type="button"
          class="btn btn-secondary"
          data-modal-close
        >
          Cancelar
        </button>
        <button
          type="button"
          class="btn btn-primary"
          id="saveRequestResponse"
        >
          Guardar resposta
        </button>
      `
  );
  if (!readOnly) {
    document
      .getElementById(
        "saveRequestResponse"
      )
      ?.addEventListener(
        "click",
        async () => {
          await saveRequestResponse(
            request
          );
        }
      );
  }
}
async function saveRequestResponse(
  request
) {
  const newStatus =
    value(
      "requestStatus"
    );
  const response =
    value(
      "requestResponse"
    ).trim();
  const payload = {
    status:
      newStatus,
    admin_response:
      response || null,
    resolved_at:
      newStatus === "resolved"
        ? new Date().toISOString()
        : null
  };
  try {
    const result =
      await db
        .from("requests")
        .update(payload)
        .eq(
          "id",
          request.id
        );
    if (result.error) {
      throw result.error;
    }
    if (response) {
      await createNotification(
        request.client_id,
        `Actualização do pedido ${request.request_code}`,
        response,
        "request"
      );
    }
    closeModal();
    showToast(
      "success",
      "Pedido actualizado com sucesso."
    );
    await loadRequests();
    await loadNotifications();
    renderRequests();
    updateDashboard();
    updateReports();
  } catch (error) {
    console.error(error);
    showToast(
      "error",
      error.message ||
      "Não foi possível actualizar o pedido."
    );
  }
}
/* =========================================================
   NOTIFICATIONS
========================================================= */
function renderNotifications() {
  const container =
    document.getElementById(
      "notificationsTable"
    );
  if (!container) return;
  const search =
    value(
      "notificationSearch"
    )
      .toLowerCase();
  const type =
    value(
      "notificationTypeFilter"
    );
  const filtered =
    notifications.filter(
      notification => {
        const client =
          getClient(
            notification.client_id
          );
        const searchable = [
          notification.title,
          notification.message,
          client?.full_name,
          client?.client_code
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return (
          (
            !search ||
            searchable.includes(search)
          ) &&
          (
            type === "all" ||
            notification.notification_type === type
          )
        );
      }
    );
  setText(
    "notificationsResultCount",
    `${filtered.length} notificação(ões)`
  );
  if (!filtered.length) {
    container.innerHTML =
      emptyHTML(
        "Nenhuma notificação encontrada."
      );
    return;
  }
  container.innerHTML = `
    <table>
      <thead>
        <tr>
          <th>Cliente</th>
          <th>Título</th>
          <th>Mensagem</th>
          <th>Tipo</th>
          <th>Estado</th>
          <th>Data</th>
        </tr>
      </thead>
      <tbody>
        ${filtered.map(notification => {
          const client =
            getClient(
              notification.client_id
            );
          return `
            <tr>
              <td>
                ${clientCellHTML(client)}
              </td>
              <td>
                <strong>
                  ${safe(
                    notification.title
                  )}
                </strong>
              </td>
              <td>
                ${safe(
                  truncate(
                    notification.message,
                    80
                  )
                )}
              </td>
              <td>
                ${translateNotificationType(
                  notification.notification_type
                )}
              </td>
              <td>
                ${
                  notification.is_read
                    ? `
                      <span class="badge badge-neutral">
                        Lida
                      </span>
                    `
                    : `
                      <span class="badge badge-warning">
                        Não lida
                      </span>
                    `
                }
              </td>
              <td>
                ${formatDateTime(
                  notification.created_at
                )}
              </td>
            </tr>
          `;
        }).join("")}
      </tbody>
    </table>
  `;
}
function openNotificationForm() {
  openModal(
    "Nova notificação",
    `
      <form id="notificationForm">
        <div class="form-grid">
          <div class="form-group full">
            <label>
              Cliente <span>*</span>
            </label>
            <select
              id="notificationClient"
              required
            >
              <option value="">
                Seleccionar cliente
              </option>
              ${clients.map(client => `
                <option value="${client.id}">
                  ${safe(client.full_name)}
                  — ${safe(client.client_code)}
                </option>
              `).join("")}
            </select>
          </div>
          <div class="form-group">
            <label>
              Tipo
            </label>
            <select id="notificationType">
              <option value="general">
                Geral
              </option>
              <option value="collection">
                Recolha
              </option>
              <option value="payment">
                Pagamento
              </option>
              <option value="request">
                Pedido
              </option>
              <option value="announcement">
                Aviso
              </option>
              <option value="system">
                Sistema
              </option>
            </select>
          </div>
          <div class="form-group">
            <label>
              Título <span>*</span>
            </label>
            <input
              type="text"
              id="notificationTitle"
              required
            >
          </div>
          <div class="form-group full">
            <label>
              Mensagem <span>*</span>
            </label>
            <textarea
              id="notificationMessage"
              required
            ></textarea>
          </div>
        </div>
      </form>
    `,
    `
      <button
        type="button"
        class="btn btn-secondary"
        data-modal-close
      >
        Cancelar
      </button>
      <button
        type="submit"
        form="notificationForm"
        class="btn btn-primary"
      >
        Enviar notificação
      </button>
    `
  );
  document
    .getElementById(
      "notificationForm"
    )
    ?.addEventListener(
      "submit",
      async event => {
        event.preventDefault();
        await saveNotification();
      }
    );
}
async function saveNotification() {
  try {
    await createNotification(
      value(
        "notificationClient"
      ),
      value(
        "notificationTitle"
      ).trim(),
      value(
        "notificationMessage"
      ).trim(),
      value(
        "notificationType"
      )
    );
    closeModal();
    showToast(
      "success",
      "Notificação enviada com sucesso."
    );
    await loadNotifications();
    renderNotifications();
    updateDashboard();
    updateNavigationCounters();
  } catch (error) {
    console.error(error);
    showToast(
      "error",
      error.message ||
      "Não foi possível enviar a notificação."
    );
  }
}
async function createNotification(
  clientId,
  title,
  message,
  type = "general"
) {
  if (
    !clientId ||
    !title ||
    !message
  ) {
    throw new Error(
      "Cliente, título e mensagem são obrigatórios."
    );
  }
  const result =
    await db
      .from("notifications")
      .insert({
        client_id:
          clientId,
        title,
        message,
        notification_type:
          type,
        is_read:
          false
      });
  if (result.error) {
    throw result.error;
  }
}
/* =========================================================
   ANNOUNCEMENTS
========================================================= */
function renderAnnouncements() {
  const grid =
    document.getElementById(
      "announcementsGrid"
    );
  const table =
    document.getElementById(
      "announcementsTable"
    );
  if (!grid || !table) return;
  const published =
    announcements.filter(
      announcement =>
        announcement.published
    );
  if (!published.length) {
    grid.innerHTML =
      emptyHTML(
        "Nenhum aviso publicado."
      );
  } else {
    grid.innerHTML =
      published
        .slice(0, 6)
        .map(
          announcement => `
            <article class="announcement-card">
              <span class="badge badge-success">
                ${translateAnnouncementType(
                  announcement.announcement_type
                )}
              </span>
              <h3>
                ${safe(
                  announcement.title
                )}
              </h3>
              <p>
                ${safe(
                  announcement.content
                )}
              </p>
              <div class="announcement-date">
                ${formatDate(
                  announcement.publish_date
                )}
              </div>
            </article>
          `
        )
        .join("");
  }
  if (!announcements.length) {
    table.innerHTML =
      emptyHTML(
        "Nenhum aviso criado."
      );
    return;
  }
  table.innerHTML = `
    <table>
      <thead>
        <tr>
          <th>Título</th>
          <th>Tipo</th>
          <th>Estado</th>
          <th>Publicação</th>
          <th>Expiração</th>
          <th>Acções</th>
        </tr>
      </thead>
      <tbody>
        ${announcements.map(
          announcement => `
            <tr>
              <td>
                <strong>
                  ${safe(
                    announcement.title
                  )}
                </strong>
                <div class="table-secondary">
                  ${safe(
                    truncate(
                      announcement.content,
                      70
                    )
                  )}
                </div>
              </td>
              <td>
                ${translateAnnouncementType(
                  announcement.announcement_type
                )}
              </td>
              <td>
                ${
                  announcement.published
                    ? `
                      <span class="badge badge-success">
                        Publicado
                      </span>
                    `
                    : `
                      <span class="badge badge-neutral">
                        Rascunho
                      </span>
                    `
                }
              </td>
              <td>
                ${formatDate(
                  announcement.publish_date
                )}
              </td>
              <td>
                ${formatDate(
                  announcement.expires_at
                )}
              </td>
              <td>
                <div class="table-actions">
                  <button
                    type="button"
                    class="table-action"
                    data-announcement-edit="${announcement.id}"
                  >
                    Editar
                  </button>
                </div>
              </td>
            </tr>
          `
        ).join("")}
      </tbody>
    </table>
  `;
}
document.addEventListener(
  "click",
  event => {
    const button =
      event.target.closest(
        "[data-announcement-edit]"
      );
    if (button) {
      openAnnouncementForm(
        button.dataset.announcementEdit
      );
    }
  }
);
function openAnnouncementForm(
  announcementId = null
) {
  const announcement =
    announcementId
      ? announcements.find(
          a => a.id === announcementId
        )
      : null;
  openModal(
    announcement
      ? "Editar aviso"
      : "Novo aviso",
    `
      <form id="announcementForm">
        <div class="form-grid">
          <div class="form-group full">
            <label>
              Título <span>*</span>
            </label>
            <input
              type="text"
              id="announcementTitle"
              required
              value="${safeAttr(
                announcement?.title || ""
              )}"
            >
          </div>
          <div class="form-group">
            <label>
              Tipo
            </label>
            <select id="announcementType">
              ${announcementTypeOptions(
                announcement?.announcement_type
              )}
            </select>
          </div>
          <div class="form-group">
            <label>
              Publicado
            </label>
            <select id="announcementPublished">
              <option
                value="true"
                ${
                  announcement?.published
                    ? "selected"
                    : ""
                }
              >
                Sim
              </option>
              <option
                value="false"
                ${
                  announcement &&
                  !announcement.published
                    ? "selected"
                    : ""
                }
              >
                Não
              </option>
            </select>
          </div>
          <div class="form-group">
            <label>
              Data de publicação
            </label>
            <input
              type="datetime-local"
              id="announcementPublishDate"
              value="${datetimeLocalValue(
                announcement?.publish_date
              )}"
            >
          </div>
          <div class="form-group">
            <label>
              Data de expiração
            </label>
            <input
              type="datetime-local"
              id="announcementExpiresAt"
              value="${datetimeLocalValue(
                announcement?.expires_at
              )}"
            >
          </div>
          <div class="form-group full">
            <label>
              Conteúdo <span>*</span>
            </label>
            <textarea
              id="announcementContent"
              required
            >${safe(
              announcement?.content || ""
            )}</textarea>
          </div>
        </div>
      </form>
    `,
    `
      <button
        type="button"
        class="btn btn-secondary"
        data-modal-close
      >
        Cancelar
      </button>
      <button
        type="submit"
        form="announcementForm"
        class="btn btn-primary"
      >
        ${
          announcement
            ? "Guardar alterações"
            : "Criar aviso"
        }
      </button>
    `
  );
  document
    .getElementById(
      "announcementForm"
    )
    ?.addEventListener(
      "submit",
      async event => {
        event.preventDefault();
        await saveAnnouncement(
          announcementId
        );
      }
    );
}
async function saveAnnouncement(
  announcementId
) {
  const payload = {
    title:
      value(
        "announcementTitle"
      ).trim(),
    content:
      value(
        "announcementContent"
      ).trim(),
    announcement_type:
      value(
        "announcementType"
      ),
    published:
      value(
        "announcementPublished"
      ) === "true",
    publish_date:
      value(
        "announcementPublishDate"
      )
        ? new Date(
            value(
              "announcementPublishDate"
            )
          ).toISOString()
        : new Date().toISOString(),
    expires_at:
      value(
        "announcementExpiresAt"
      )
        ? new Date(
            value(
              "announcementExpiresAt"
            )
          ).toISOString()
        : null
  };
  try {
    const result =
      announcementId
        ? await db
            .from("announcements")
            .update(payload)
            .eq(
              "id",
              announcementId
            )
        : await db
            .from("announcements")
            .insert(payload);
    if (result.error) {
      throw result.error;
    }
    closeModal();
    showToast(
      "success",
      "Aviso guardado com sucesso."
    );
    await loadAnnouncements();
    renderAnnouncements();
  } catch (error) {
    console.error(error);
    showToast(
      "error",
      error.message ||
      "Não foi possível guardar o aviso."
    );
  }
}
/* =========================================================
   REPORTS
========================================================= */
function updateReports() {
  const active =
    clients.filter(
      c =>
        c.status === "active"
    ).length;
  const revenue =
    payments
      .filter(
        p =>
          p.status === "paid"
      )
      .reduce(
        (sum, p) =>
          sum +
          Number(
            p.amount || 0
          ),
        0
      );
  const completedCollections =
    collections.filter(
      c =>
        c.status === "completed"
    ).length;
  const resolvedRequests =
    requests.filter(
      r =>
        r.status === "resolved"
    ).length;
  setText(
    "reportClients",
    clients.length
  );
  setText(
    "reportActiveClients",
    `${active} activos`
  );
  setText(
    "reportRevenue",
    formatMoney(revenue)
  );
  setText(
    "reportCompletedCollections",
    completedCollections
  );
  setText(
    "reportResolvedRequests",
    resolvedRequests
  );
  const clientReport =
    document.getElementById(
      "clientReport"
    );
  if (clientReport) {
    const statuses = [
      ["Activos", "active"],
      ["Inactivos", "inactive"],
      ["Suspensos", "suspended"]
    ];
    clientReport.innerHTML =
      statuses
        .map(
          ([label, status]) => {
            const count =
              clients.filter(
                c =>
                  c.status === status
              ).length;
            return `
              <div class="report-row">
                <span class="report-row-label">
                  ${label}
                </span>
                <strong class="report-row-value">
                  ${count}
                </strong>
              </div>
            `;
          }
        )
        .join("");
  }
  const collectionReport =
    document.getElementById(
      "collectionReport"
    );
  if (collectionReport) {
    const statuses = [
      ["Agendadas", "scheduled"],
      ["Concluídas", "completed"],
      ["Em falta", "missed"],
      ["Canceladas", "cancelled"]
    ];
    collectionReport.innerHTML =
      statuses
        .map(
          ([label, status]) => {
            const count =
              collections.filter(
                c =>
                  c.status === status
              ).length;
            return `
              <div class="report-row">
                <span class="report-row-label">
                  ${label}
                </span>
                <strong class="report-row-value">
                  ${count}
                </strong>
              </div>
            `;
          }
        )
        .join("");
  }
  const paymentReport =
    document.getElementById(
      "paymentReport"
    );
  if (paymentReport) {
    const statuses = [
      ["Pagos", "paid"],
      ["Pendentes", "pending"],
      ["Falhados", "failed"],
      ["Cancelados", "cancelled"]
    ];
    paymentReport.innerHTML =
      statuses
        .map(
          ([label, status]) => {
            const count =
              payments.filter(
                p =>
                  p.status === status
              ).length;
            return `
              <div class="report-row">
                <span class="report-row-label">
                  ${label}
                </span>
                <strong class="report-row-value">
                  ${count}
                </strong>
              </div>
            `;
          }
        )
        .join("");
  }
}
/* =========================================================
   CLIENT DRAWER
========================================================= */
function openClientDrawer(
  clientId
) {
  const client =
    getClient(clientId);
  if (!client) return;
  currentClient =
    client;
  setText(
    "drawerClientName",
    client.full_name
  );
  setText(
    "drawerClientCode",
    client.client_code
  );
  setText(
    "drawerFullName",
    client.full_name
  );
  setText(
    "drawerBusinessName",
    client.business_name ||
    "—"
  );
  setText(
    "drawerEmail",
    client.email ||
    "—"
  );
  setText(
    "drawerPhone",
    client.phone ||
    "—"
  );
  setText(
    "drawerAddress",
    client.address ||
    "—"
  );
  setText(
    "drawerBairro",
    client.bairro ||
    "—"
  );
  setText(
    "drawerCity",
    client.city ||
    "—"
  );
  setText(
    "drawerServiceLocation",
    client.service_location ||
    "—"
  );
  const status =
    document.getElementById(
      "drawerStatus"
    );
  if (status) {
    status.innerHTML =
      statusBadge(
        client.status
      );
  }
  const serviceContainer =
    document.getElementById(
      "drawerService"
    );
  if (serviceContainer) {
    const service =
      subscriptions.find(
        s =>
          s.client_id ===
            client.id &&
          s.status ===
            "active"
      );
    serviceContainer.innerHTML =
      service
        ? `
          <div class="detail-list">
            <div class="detail-item">
              <span>
                Plano
              </span>
              <strong>
                ${safe(
                  service.plan_name
                )}
              </strong>
            </div>
            <div class="detail-item">
              <span>
                Frequência
              </span>
              <strong>
                ${translateFrequency(
                  service.frequency
                )}
              </strong>
            </div>
            <div class="detail-item">
              <span>
                Preço
              </span>
              <strong>
                ${formatMoney(
                  service.price,
                  service.currency
                )}
              </strong>
            </div>
          </div>
        `
        : emptyHTML(
            "Sem serviço activo."
          );
  }
  const drawer =
    document.getElementById(
      "detailsDrawer"
    );
  const overlay =
    document.getElementById(
      "drawerOverlay"
    );
  drawer?.classList.add(
    "open"
  );
  drawer?.setAttribute(
    "aria-hidden",
    "false"
  );
  if (overlay) {
    overlay.hidden =
      false;
  }
}
function closeClientDrawer() {
  const drawer =
    document.getElementById(
      "detailsDrawer"
    );
  const overlay =
    document.getElementById(
      "drawerOverlay"
    );
  drawer?.classList.remove(
    "open"
  );
  drawer?.setAttribute(
    "aria-hidden",
    "true"
  );
  if (overlay) {
    overlay.hidden =
      true;
  }
}
/* =========================================================
   DRAWER SETUP
========================================================= */
function setupDrawer() {
  document
    .getElementById(
      "drawerClose"
    )
    ?.addEventListener(
      "click",
      closeClientDrawer
    );
  document
    .getElementById(
      "drawerOverlay"
    )
    ?.addEventListener(
      "click",
      closeClientDrawer
    );
  document
    .getElementById(
      "drawerEditClient"
    )
    ?.addEventListener(
      "click",
      () => {
        if (!currentClient) return;
        closeClientDrawer();
        openClientForm(
          currentClient.id
        );
      }
    );
  document
    .getElementById(
      "drawerViewCollections"
    )
    ?.addEventListener(
      "click",
      () => {
        closeClientDrawer();
        navigateTo(
          "collections"
        );
        const search =
          document.getElementById(
            "collectionSearch"
          );
        if (search) {
          search.value =
            currentClient.client_code;
          renderCollections();
        }
      }
    );
  document
    .getElementById(
      "drawerViewPayments"
    )
    ?.addEventListener(
      "click",
      () => {
        closeClientDrawer();
        navigateTo(
          "payments"
        );
        const search =
          document.getElementById(
            "paymentSearch"
          );
        if (search) {
          search.value =
            currentClient.client_code;
          renderPayments();
        }
      }
    );
}
/* =========================================================
   MODAL SYSTEM
========================================================= */
function setupModal() {
  document
    .getElementById(
      "modalClose"
    )
    ?.addEventListener(
      "click",
      closeModal
    );
  document
    .getElementById(
      "modalBackdrop"
    )
    ?.addEventListener(
      "click",
      event => {
        if (
          event.target.id ===
          "modalBackdrop"
        ) {
          closeModal();
        }
      }
    );
  document.addEventListener(
    "click",
    event => {
      if (
        event.target.closest(
          "[data-modal-close]"
        )
      ) {
        closeModal();
      }
    }
  );
}
function openModal(
  title,
  body,
  footer = ""
) {
  const backdrop =
    document.getElementById(
      "modalBackdrop"
    );
  setText(
    "modalTitle",
    title
  );
  const bodyElement =
    document.getElementById(
      "modalBody"
    );
  const footerElement =
    document.getElementById(
      "modalFooter"
    );
  if (bodyElement) {
    bodyElement.innerHTML =
      body;
  }
  if (footerElement) {
    footerElement.innerHTML =
      footer;
  }
  if (backdrop) {
    backdrop.hidden =
      false;
  }
  document.body.style.overflow =
    "hidden";
}
function closeModal() {
  const backdrop =
    document.getElementById(
      "modalBackdrop"
    );
  if (backdrop) {
    backdrop.hidden =
      true;
  }
  document.body.style.overflow =
    "";
}
/* =========================================================
   CONFIRMATION
========================================================= */
function setupConfirm() {
  document
    .getElementById(
      "confirmCancel"
    )
    ?.addEventListener(
      "click",
      closeConfirm
    );
  document
    .getElementById(
      "confirmProceed"
    )
    ?.addEventListener(
      "click",
      async () => {
        const callback =
          confirmCallback;
        closeConfirm();
        if (callback) {
          await callback();
        }
      }
    );
}
function openConfirm(
  title,
  message,
  callback
) {
  setText(
    "confirmTitle",
    title
  );
  setText(
    "confirmMessage",
    message
  );
  confirmCallback =
    callback;
  const backdrop =
    document.getElementById(
      "confirmBackdrop"
    );
  if (backdrop) {
    backdrop.hidden =
      false;
  }
}
function closeConfirm() {
  const backdrop =
    document.getElementById(
      "confirmBackdrop"
    );
  if (backdrop) {
    backdrop.hidden =
      true;
  }
  confirmCallback =
    null;
}
/* =========================================================
   UI SETUP
========================================================= */
function setupUI() {
  document
    .getElementById(
      "mobileMenuButton"
    )
    ?.addEventListener(
      "click",
      openSidebarMobile
    );
  document
    .getElementById(
      "sidebarClose"
    )
    ?.addEventListener(
      "click",
      closeSidebarMobile
    );
  document
    .getElementById(
      "refreshButton"
    )
    ?.addEventListener(
      "click",
      async () => {
        await refreshAll();
      }
    );
  document
    .getElementById(
      "refreshReportsButton"
    )
    ?.addEventListener(
      "click",
      async () => {
        await refreshAll();
      }
    );
  document
    .getElementById(
      "logoutButton"
    )
    ?.addEventListener(
      "click",
      logout
    );
  document
    .getElementById(
      "newClientButton"
    )
    ?.addEventListener(
      "click",
      () =>
        openClientForm()
    );
  document
    .getElementById(
      "newSubscriptionButton"
    )
    ?.addEventListener(
      "click",
      () =>
        openSubscriptionForm()
    );
  document
    .getElementById(
      "newCollectionButton"
    )
    ?.addEventListener(
      "click",
      () =>
        openCollectionForm()
    );
  document
    .getElementById(
      "newPaymentButton"
    )
    ?.addEventListener(
      "click",
      () =>
        openPaymentForm()
    );
  document
    .getElementById(
      "newNotificationButton"
    )
    ?.addEventListener(
      "click",
      () =>
        openNotificationForm()
    );
  document
    .getElementById(
      "newAnnouncementButton"
    )
    ?.addEventListener(
      "click",
      () =>
        openAnnouncementForm()
    );
}
async function refreshAll() {
  showToast(
    "info",
    "A actualizar dados..."
  );
  await loadAllData();
  showToast(
    "success",
    "Dados actualizados."
  );
}
/* =========================================================
   FILTERS
========================================================= */
function setupFilters() {
  const filters = [
    "clientSearch",
    "clientStatusFilter",
    "clientCityFilter",
    "subscriptionSearch",
    "subscriptionStatusFilter",
    "collectionSearch",
    "collectionStatusFilter",
    "collectionDateFilter",
    "paymentSearch",
    "paymentStatusFilter",
    "paymentMethodFilter",
    "requestSearch",
    "requestStatusFilter",
    "requestPriorityFilter",
    "notificationSearch",
    "notificationTypeFilter"
  ];
  filters.forEach(
    id => {
      const element =
        document.getElementById(
          id
        );
      if (!element) return;
      element.addEventListener(
        "input",
        () =>
          renderCurrentPage()
      );
      element.addEventListener(
        "change",
        () =>
          renderCurrentPage()
      );
    }
  );
}
/* =========================================================
   MOBILE SIDEBAR
========================================================= */
function openSidebarMobile() {
  document
    .getElementById(
      "sidebar"
    )
    ?.classList.add(
      "open"
    );
}
function closeSidebarMobile() {
  document
    .getElementById(
      "sidebar"
    )
    ?.classList.remove(
      "open"
    );
}
/* =========================================================
   ADMIN INFORMATION
========================================================= */
function populateAdminInformation() {
  if (!currentUser) return;
  const email =
    currentUser.email ||
    "Administrador";
  const name =
    currentUser.user_metadata?.full_name ||
    currentUser.user_metadata?.name ||
    "Administrador";
  const initial =
    name
      .trim()
      .charAt(0)
      .toUpperCase() ||
    "A";
  setText(
    "adminName",
    name
  );
  setText(
    "adminEmail",
    email
  );
  setText(
    "topAdminName",
    name
  );
  setText(
    "adminInitial",
    initial
  );
  setText(
    "topAdminInitial",
    initial
  );
  setText(
    "settingsEmail",
    email
  );
}
/* =========================================================
   SETTINGS
========================================================= */
function updateSettings() {
  setText(
    "settingsClientsCount",
    clients.length
  );
  setText(
    "settingsSubscriptionsCount",
    subscriptions.length
  );
  setText(
    "databaseStatus",
    "Ligado"
  );
}
/* =========================================================
   NAVIGATION COUNTERS
========================================================= */
function updateNavigationCounters() {
  setText(
    "clientsNavCount",
    clients.length
  );
  setText(
    "collectionsNavCount",
    collections.filter(
      c =>
        c.status === "scheduled"
    ).length
  );
  setText(
    "paymentsNavCount",
    payments.filter(
      p =>
        p.status === "pending"
    ).length
  );
  setText(
    "requestsNavCount",
    requests.filter(
      r =>
        r.status === "new" ||
        r.status === "in_progress"
    ).length
  );
  const unread =
    notifications.filter(
      n =>
        !n.is_read
    ).length;
  setText(
    "notificationsNavCount",
    unread
  );
  const dot =
    document.getElementById(
      "topNotificationDot"
    );
  if (dot) {
    dot.hidden =
      unread === 0;
  }
}
/* =========================================================
   LOGOUT
========================================================= */
async function logout() {
  openConfirm(
    "Terminar sessão",
    "Tem a certeza de que deseja terminar a sessão?",
    async () => {
      try {
        const {
          error
        } =
          await db.auth.signOut();
        if (error) {
          throw error;
        }
        sessionStorage.clear();
        redirectToLogin();
      } catch (error) {
        console.error(error);
        showToast(
          "error",
          "Não foi possível terminar a sessão."
        );
      }
    }
  );
}
/* =========================================================
   LOGIN REDIRECT
========================================================= */
function redirectToLogin() {
  window.location.replace(
    "./admin-login.html"
  );
}
/* =========================================================
   SHOW ADMIN
========================================================= */
function showAdminContent() {
  const loading =
    document.getElementById(
      "globalLoading"
    );
  const content =
    document.getElementById(
      "adminContent"
    );
  if (loading) {
    loading.hidden =
      true;
  }
  if (content) {
    content.hidden =
      false;
  }
}
function hideGlobalLoading() {
  const loading =
    document.getElementById(
      "globalLoading"
    );
  if (loading) {
    loading.hidden =
      true;
  }
}
/* =========================================================
   ERROR
========================================================= */
function showFatalError(
  message
) {
  const loading =
    document.getElementById(
      "globalLoading"
    );
  if (loading) {
    loading.innerHTML = `
      <div class="error-state">
        <strong>
          Erro ao carregar o MOSELI CRM
        </strong>
        <p style="margin-top:8px;">
          ${safe(message)}
        </p>
        <button
          type="button"
          class="btn btn-primary"
          style="margin-top:15px;"
          onclick="location.reload()"
        >
          Tentar novamente
        </button>
      </div>
    `;
  }
}
function renderError(
  elementId,
  message
) {
  const element =
    document.getElementById(
      elementId
    );
  if (!element) return;
  element.innerHTML = `
    <div class="error-state">
      ${safe(message)}
    </div>
  `;
}
/* =========================================================
   HELPERS
========================================================= */
function getClient(
  clientId
) {
  return clients.find(
    client =>
      client.id === clientId
  ) || null;
}
function clientCellHTML(
  client
) {
  if (!client) {
    return `
      <div class="client-name-cell">
        <div class="client-mini-avatar">
          ?
        </div>
        <div>
          <strong>
            Cliente
          </strong>
          <span>
            Não encontrado
          </span>
        </div>
      </div>
    `;
  }
  const initial =
    client.full_name
      ?.trim()
      .charAt(0)
      .toUpperCase() ||
    "C";
  return `
    <div class="client-name-cell">
      <div class="client-mini-avatar">
        ${safe(initial)}
      </div>
      <div>
        <strong>
          ${safe(
            client.full_name
          )}
        </strong>
        <span>
          ${safe(
            client.business_name ||
            client.client_code ||
            ""
          )}
        </span>
      </div>
    </div>
  `;
}
function statusBadge(
  status
) {
  const map = {
    active: [
      "Activo",
      "badge-success"
    ],
    inactive: [
      "Inactivo",
      "badge-neutral"
    ],
    suspended: [
      "Suspenso",
      "badge-danger"
    ],
    scheduled: [
      "Agendada",
      "badge-info"
    ],
    completed: [
      "Concluída",
      "badge-success"
    ],
    missed: [
      "Em falta",
      "badge-danger"
    ],
    cancelled: [
      "Cancelada",
      "badge-neutral"
    ],
    paused: [
      "Pausado",
      "badge-warning"
    ],
    expired: [
      "Expirado",
      "badge-neutral"
    ],
    pending: [
      "Pendente",
      "badge-warning"
    ],
    paid: [
      "Pago",
      "badge-success"
    ],
    failed: [
      "Falhado",
      "badge-danger"
    ],
    new: [
      "Novo",
      "badge-info"
    ],
    in_progress: [
      "Em tratamento",
      "badge-warning"
    ],
    resolved: [
      "Resolvido",
      "badge-success"
    ],
    rejected: [
      "Rejeitado",
      "badge-danger"
    ]
  };
  const item =
    map[status] ||
    [
      translateStatus(status),
      "badge-neutral"
    ];
  return `
    <span class="badge ${item[1]}">
      ${safe(item[0])}
    </span>
  `;
}
function collectionRequestStatusBadge(
  status
) {
  const map = {
    new: [
      "Novo",
      "badge-info"
    ],
    approved: [
      "Aprovado",
      "badge-success"
    ],
    scheduled: [
      "Agendado",
      "badge-success"
    ],
    completed: [
      "Concluído",
      "badge-success"
    ],
    rejected: [
      "Rejeitado",
      "badge-danger"
    ],
    cancelled: [
      "Cancelado",
      "badge-neutral"
    ]
  };
  const item =
    map[status] ||
    [
      translateStatus(status),
      "badge-neutral"
    ];
  return `
    <span class="badge ${item[1]}">
      ${safe(item[0])}
    </span>
  `;
}
function priorityBadge(
  priority
) {
  const map = {
    normal: [
      "Normal",
      "badge-neutral"
    ],
    high: [
      "Alta",
      "badge-warning"
    ],
    urgent: [
      "Urgente",
      "badge-danger"
    ]
  };
  const item =
    map[priority] ||
    [
      "Normal",
      "badge-neutral"
    ];
  return `
    <span class="badge ${item[1]}">
      ${safe(item[0])}
    </span>
  `;
}
function translateStatus(
  status
) {
  const map = {
    active: "Activo",
    inactive: "Inactivo",
    suspended: "Suspenso",
    scheduled: "Agendada",
    completed: "Concluída",
    missed: "Em falta",
    cancelled: "Cancelada",
    paused: "Pausado",
    expired: "Expirado",
    pending: "Pendente",
    paid: "Pago",
    failed: "Falhado",
    new: "Novo",
    in_progress: "Em tratamento",
    resolved: "Resolvido",
    rejected: "Rejeitado"
  };
  return map[status] ||
    status ||
    "—";
}
function translateFrequency(
  frequency
) {
  const map = {
    daily: "Diária",
    weekly: "Semanal",
    biweekly: "Quinzenal",
    monthly: "Mensal",
    custom: "Personalizada"
  };
  return map[frequency] ||
    frequency ||
    "—";
}
function translateRequestType(
  type
) {
  const map = {
    cancellation: "Cancelamento",
    pause: "Pausa",
    resume: "Retoma",
    collection_change: "Alteração de recolha",
    address_change: "Alteração de endereço",
    complaint: "Reclamação",
    general: "Geral"
  };
  return map[type] ||
    type ||
    "—";
}
function translatePaymentMethod(
  method
) {
  const map = {
    mpesa: "M-Pesa",
    emola: "e-Mola",
    bank: "Transferência",
    cash: "Numerário",
    other: "Outro"
  };
  return map[method] ||
    method ||
    "—";
}
function translateNotificationType(
  type
) {
  const map = {
    general: "Geral",
    collection: "Recolha",
    payment: "Pagamento",
    request: "Pedido",
    announcement: "Aviso",
    system: "Sistema"
  };
  return map[type] ||
    type ||
    "—";
}
function translateAnnouncementType(
  type
) {
  const map = {
    general: "Geral",
    service: "Serviço",
    payment: "Pagamento",
    maintenance: "Manutenção",
    important: "Importante"
  };
  return map[type] ||
    type ||
    "Geral";
}
/* =========================================================
   OPTION HELPERS
========================================================= */
function frequencyOptions(
  selected
) {
  const values = [
    ["daily", "Diária"],
    ["weekly", "Semanal"],
    ["biweekly", "Quinzenal"],
    ["monthly", "Mensal"],
    ["custom", "Personalizada"]
  ];
  return values
    .map(
      ([optionValue, label]) => `
        <option
          value="${optionValue}"
          ${
            selected ===
            optionValue
              ? "selected"
              : ""
          }
        >
          ${label}
        </option>
      `
    )
    .join("");
}
function subscriptionStatusOptions(
  selected
) {
  const values = [
    ["active", "Activo"],
    ["paused", "Pausado"],
    ["cancelled", "Cancelado"],
    ["expired", "Expirado"]
  ];
  return values
    .map(
      ([optionValue, label]) => `
        <option
          value="${optionValue}"
          ${
            selected ===
            optionValue
              ? "selected"
              : ""
          }
        >
          ${label}
        </option>
      `
    )
    .join("");
}
function paymentStatusOptions(
  selected
) {
  const values = [
    ["pending", "Pendente"],
    ["paid", "Pago"],
    ["failed", "Falhado"],
    ["cancelled", "Cancelado"]
  ];
  return values
    .map(
      ([optionValue, label]) => `
        <option
          value="${optionValue}"
          ${
            (
              !selected &&
              optionValue ===
                "pending"
            ) ||
            selected ===
              optionValue
              ? "selected"
              : ""
          }
        >
          ${label}
        </option>
      `
    )
    .join("");
}
function paymentMethodOptions(
  selected
) {
  const values = [
    ["mpesa", "M-Pesa"],
    ["emola", "e-Mola"],
    ["bank", "Transferência bancária"],
    ["cash", "Numerário"],
    ["other", "Outro"]
  ];
  return `
    <option value="">
      Seleccionar
    </option>
    ${values.map(
      ([optionValue, label]) => `
        <option
          value="${optionValue}"
          ${
            selected ===
            optionValue
              ? "selected"
              : ""
          }
        >
          ${label}
        </option>
      `
    ).join("")}
  `;
}
function announcementTypeOptions(
  selected
) {
  const values = [
    ["general", "Geral"],
    ["service", "Serviço"],
    ["payment", "Pagamento"],
    ["maintenance", "Manutenção"],
    ["important", "Importante"]
  ];
  return values
    .map(
      ([optionValue, label]) => `
        <option
          value="${optionValue}"
          ${
            (
              !selected &&
              optionValue ===
                "general"
            ) ||
            selected ===
              optionValue
              ? "selected"
              : ""
          }
        >
          ${label}
        </option>
      `
    )
    .join("");
}
/* =========================================================
   CODE GENERATION
========================================================= */
async function generateUniqueClientCode() {
  return generateUniqueCode(
    "CLI",
    "clients",
    "client_code"
  );
}
async function generateUniqueCode(
  prefix,
  table,
  column
) {
  for (
    let attempt = 0;
    attempt < 10;
    attempt++
  ) {
    const code =
      `${prefix}-${Date.now()
        .toString()
        .slice(-6)}${Math.floor(
          Math.random() * 10
        )}`;
    const {
      data,
      error
    } =
      await db
        .from(table)
        .select("id")
        .eq(
          column,
          code
        )
        .maybeSingle();
    if (error) {
      throw error;
    }
    if (!data) {
      return code;
    }
  }
  throw new Error(
    "Não foi possível gerar um código único."
  );
}
/* =========================================================
   BASIC HELPERS
========================================================= */
function value(
  id
) {
  const element =
    document.getElementById(
      id
    );
  return element?.value ||
    "";
}
function setText(
  id,
  text
) {
  const element =
    document.getElementById(
      id
    );
  if (element) {
    element.textContent =
      text ?? "";
  }
}
function safe(
  value
) {
  if (
    value === null ||
    value === undefined
  ) {
    return "";
  }
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
function safeAttr(
  value
) {
  return safe(value);
}
function truncate(
  text,
  length = 80
) {
  const string =
    String(
      text || ""
    );
  return string.length > length
    ? `${string.slice(
        0,
        length
      )}…`
    : string;
}
function emptyHTML(
  message
) {
  return `
    <div class="empty-state">
      ${safe(message)}
    </div>
  `;
}
/* =========================================================
   DATE / TIME
========================================================= */
function formatDate(
  date
) {
  if (!date) return "—";
  const parsed =
    new Date(date);
  if (
    Number.isNaN(
      parsed.getTime()
    )
  ) {
    return "—";
  }
  return parsed.toLocaleDateString(
    "pt-PT",
    {
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    }
  );
}
function formatDateTime(
  date
) {
  if (!date) return "—";
  const parsed =
    new Date(date);
  if (
    Number.isNaN(
      parsed.getTime()
    )
  ) {
    return "—";
  }
  return parsed.toLocaleString(
    "pt-PT",
    {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    }
  );
}
function formatTime(
  time
) {
  if (!time) return "";
  return String(time)
    .slice(
      0,
      5
    );
}
function formatMoney(
  amount,
  currency = "MZN"
) {
  const number =
    Number(
      amount || 0
    );
  return new Intl.NumberFormat(
    "pt-MZ",
    {
      minimumFractionDigits:
        2,
      maximumFractionDigits:
        2
    }
  ).format(number) +
    ` ${
      currency === "MZN"
        ? "MT"
        : currency
    }`;
}
function getTodayISO() {
  const now =
    new Date();
  const year =
    now.getFullYear();
  const month =
    String(
      now.getMonth() + 1
    )
      .padStart(
        2,
        "0"
      );
  const day =
    String(
      now.getDate()
    )
      .padStart(
        2,
        "0"
      );
  return `${year}-${month}-${day}`;
}
function datetimeLocalValue(
  value
) {
  if (!value) return "";
  const date =
    new Date(value);
  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "";
  }
  const year =
    date.getFullYear();
  const month =
    String(
      date.getMonth() + 1
    )
      .padStart(
        2,
        "0"
      );
  const day =
    String(
      date.getDate()
    )
      .padStart(
        2,
        "0"
      );
  const hours =
    String(
      date.getHours()
    )
      .padStart(
        2,
        "0"
      );
  const minutes =
    String(
      date.getMinutes()
    )
      .padStart(
        2,
        "0"
      );
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}
/* =========================================================
   CITY FILTER
========================================================= */
function populateCityFilter() {
  const select =
    document.getElementById(
      "clientCityFilter"
    );
  if (!select) return;
  const current =
    select.value;
  const cities =
    [
      ...new Set(
        clients
          .map(
            client =>
              client.city
          )
          .filter(Boolean)
      )
    ]
      .sort();
  select.innerHTML = `
    <option value="all">
      Todas as cidades
    </option>
    ${cities.map(
      city => `
        <option
          value="${safeAttr(city)}"
        >
          ${safe(city)}
        </option>
      `
    ).join("")}
  `;
  if (
    cities.includes(current)
  ) {
    select.value =
      current;
  }
}
/* =========================================================
   TOAST
========================================================= */
function showToast(
  type,
  message
) {
  const container =
    document.getElementById(
      "toastContainer"
    );
  if (!container) return;
  const icons = {
    success: "✓",
    error: "!",
    warning: "!",
    info: "i"
  };
  const toast =
    document.createElement(
      "div"
    );
  toast.className =
    `toast toast-${type}`;
  toast.innerHTML = `
    <div class="toast-icon">
      ${safe(
        icons[type] ||
        "i"
      )}
    </div>
    <div class="toast-content">
      <strong>
        ${
          type === "success"
            ? "Sucesso"
            : type === "error"
              ? "Erro"
              : type === "warning"
                ? "Atenção"
                : "Informação"
        }
      </strong>
      <p>
        ${safe(message)}
      </p>
    </div>
  `;
  container.appendChild(
    toast
  );
  setTimeout(
    () => {
      toast.style.opacity =
        "0";
      toast.style.transform =
        "translateY(8px)";
      setTimeout(
        () =>
          toast.remove(),
        200
      );
    },
    4000
  );
}
/* =========================================================
   KEYBOARD
========================================================= */
document.addEventListener(
  "keydown",
  event => {
    if (
      event.key ===
      "Escape"
    ) {
      closeModal();
      closeConfirm();
      closeClientDrawer();
      closeSidebarMobile();
    }
  }
);
/* =========================================================
   GLOBAL EXPOSED HELPERS
========================================================= */
window.MOSELI_ADMIN = {
  refresh:
    refreshAll,
  navigate:
    navigateTo,
  getClient,
  clients:
    () => clients,
  subscriptions:
    () => subscriptions,
  collections:
    () => collections,
  payments:
    () => payments,
  requests:
    () => requests,
  notifications:
    () => notifications,
  announcements:
    () => announcements
};
