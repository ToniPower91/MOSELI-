“use strict”;

alert(“MOSELI JAVASCRIPT ESTÁ A FUNCIONAR!”);

document.addEventListener(“DOMContentLoaded”, async function () {

const loading =
    document.getElementById("portalLoading");
function show(message) {
    if (loading) {
        loading.hidden = false;
        loading.innerHTML =
            "<strong>MOSELI DIAGNOSTIC</strong><br><br>" +
            message;
    }
    console.log("MOSELI:", message);
}
show("1. JavaScript carregado ✓");
/* =====================================================
   SUPABASE LIBRARY
   ===================================================== */
if (!window.supabase) {
    show(
        "2. ERRO: A biblioteca Supabase não carregou."
    );
    return;
}
show(
    "2. Supabase carregado ✓"
);
/* =====================================================
   SUPABASE CLIENT
   ===================================================== */
const SUPABASE_URL =
    "https://esumonohssxxalxsfshc.supabase.co";
const SUPABASE_KEY =
    "sb_publishable_lryWHU1aV0782oIFi4JKKg_Y4qugSlt";
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
show(
    "3. Cliente Supabase criado ✓"
);
/* =====================================================
   SESSION
   ===================================================== */
let sessionResult;
try {
    sessionResult =
        await supabaseClient.auth.getSession();
} catch (error) {
    show(
        "4. ERRO AO OBTER SESSÃO:<br><br>" +
        error.message
    );
    return;
}
const sessionData =
    sessionResult.data;
const sessionError =
    sessionResult.error;
if (sessionError) {
    show(
        "4. ERRO DE SESSÃO:<br><br>" +
        sessionError.message
    );
    return;
}
if (
    !sessionData ||
    !sessionData.session ||
    !sessionData.session.user
) {
    show(
        "4. NÃO EXISTE SESSÃO ATIVA.<br><br>" +
        "Faça login novamente."
    );
    return;
}
const user =
    sessionData.session.user;
show(
    "4. AUTENTICAÇÃO OK ✓<br><br>" +
    "User ID:<br>" +
    user.id
);
/* =====================================================
   CLIENT TABLE
   ===================================================== */
show(
    "5. A consultar a tabela clients..."
);
let clientResult;
try {
    clientResult =
        await supabaseClient
            .from("clients")
            .select("*")
            .eq(
                "auth_user_id",
                user.id
            )
            .maybeSingle();
} catch (error) {
    show(
        "5. ERRO JAVASCRIPT NA CONSULTA:<br><br>" +
        error.message
    );
    return;
}
const client =
    clientResult.data;
const clientError =
    clientResult.error;
if (clientError) {
    show(
        "5. ERRO DA TABELA CLIENTS:<br><br>" +
        clientError.message +
        "<br><br>" +
        "Código: " +
        (clientError.code || "--")
    );
    return;
}
if (!client) {
    show(
        "5. CLIENTE NÃO ENCONTRADO.<br><br>" +
        "O login está correto, mas não existe um registro em clients ligado a este User ID.<br><br>" +
        "User ID:<br>" +
        user.id
    );
    return;
}
/* =====================================================
   CLIENT VERIFIED
   ===================================================== */
show(
    "6. CLIENTE ENCONTRADO ✓<br><br>" +
    "Nome: " +
    client.full_name +
    "<br><br>" +
    "Código: " +
    client.client_code +
    "<br><br>" +
    "Estado: " +
    client.status
);
/* =====================================================
   TEST PORTAL CONTENT
   ===================================================== */
const content =
    document.getElementById(
        "portalContent"
    );
if (content) {
    content.hidden = false;
}
/* =====================================================
   TEST USER DATA
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
if (loading) {
    loading.innerHTML =
        "<strong>MOSELI ✓</strong><br><br>" +
        "Autenticação e cliente verificados com sucesso.";
}
console.log(
    "MOSELI DIAGNOSTIC COMPLETE"
);

});

/* =========================================================
HELPER
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
