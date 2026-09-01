“use strict”;

console.log(“MOSELI TEST: JS STARTED”);

document.addEventListener(“DOMContentLoaded”, async function () {

console.log("MOSELI TEST: DOM READY");
const loading =
    document.getElementById("portalLoading");
function show(message) {
    if (loading) {
        loading.hidden = false;
        loading.innerHTML =
            "<strong>MOSELI TEST</strong><br><br>" +
            message;
    }
    console.log(message);
}
/* ============================================
   TEST 1
   ============================================ */
show(
    "1. JavaScript carregado ✓"
);
/* ============================================
   TEST 2
   ============================================ */
if (!window.supabase) {
    show(
        "2. ERRO: Supabase não carregou."
    );
    return;
}
show(
    "2. Supabase carregado ✓"
);
/* ============================================
   CREATE SUPABASE CLIENT
   ============================================ */
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
    "3. Cliente Supabase criado ✓<br><br>" +
    "A verificar sessão..."
);
/* ============================================
   GET SESSION
   ============================================ */
try {
    const {
        data,
        error
    } =
        await supabaseClient.auth.getSession();
    if (error) {
        show(
            "4. ERRO Supabase:<br><br>" +
            error.message
        );
        return;
    }
    if (
        !data ||
        !data.session ||
        !data.session.user
    ) {
        show(
            "4. Nenhuma sessão encontrada."
        );
        return;
    }
    const user =
        data.session.user;
    show(
        "4. AUTENTICAÇÃO OK ✓<br><br>" +
        "User ID:<br>" +
        user.id +
        "<br><br>" +
        "A procurar cliente..."
    );
    /* ========================================
       CLIENT QUERY
       ======================================== */
    const {
        data: client,
        error: clientError
    } =
        await supabaseClient
            .from("clients")
            .select("*")
            .eq(
                "auth_user_id",
                user.id
            )
            .maybeSingle();
    if (clientError) {
        show(
            "5. ERRO NA TABELA CLIENTS:<br><br>" +
            clientError.message +
            "<br><br>" +
            "Código: " +
            (clientError.code || "--")
        );
        return;
    }
    if (!client) {
        show(
            "5. AUTENTICAÇÃO OK ✓<br><br>" +
            "Mas nenhum cliente foi encontrado para este User ID:<br><br>" +
            user.id
        );
        return;
    }
    /* ========================================
       CLIENT FOUND
       ======================================== */
    show(
        "5. CLIENTE ENCONTRADO ✓<br><br>" +
        "Nome: " +
        client.full_name +
        "<br>" +
        "Código: " +
        client.client_code +
        "<br>" +
        "Estado: " +
        client.status +
        "<br><br>" +
        "SUPABASE + CLIENT VERIFICATION OK ✓"
    );
    /* ========================================
       SHOW PORTAL
       ======================================== */
    const content =
        document.getElementById(
            "portalContent"
        );
    if (content) {
        content.hidden = false;
    }
    if (loading) {
        loading.hidden = false;
    }
} catch (error) {
    console.error(
        "MOSELI TEST ERROR:",
        error
    );
    show(
        "ERRO INESPERADO:<br><br>" +
        error.message
    );
}

});
