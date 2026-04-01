/**
 * ENEM MASTER — Deploy automático da Edge Function via Management API
 * 
 * USO:
 *   node deploy-function.js SEU_ACCESS_TOKEN SUA_GROQ_KEY
 * 
 * Onde obter o Access Token:
 *   https://supabase.com/dashboard/account/tokens → "Generate new token"
 * 
 * Onde obter a Groq Key:
 *   https://console.groq.com/keys → "Create API key"
 * 
 * Exemplo:
 *   node deploy-function.js sbp_xxxx... gsk_...
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const PROJECT_REF = 'nkuiwdolkluetsadauwb';
const ACCESS_TOKEN = process.argv[2];
const GROQ_KEY = process.argv[3];

if (!ACCESS_TOKEN || !GROQ_KEY) {
    console.error('\n❌ ERRO: Passe o Access Token e a Groq Key como argumentos.\n');
    console.error('Uso: node deploy-function.js SEU_ACCESS_TOKEN SUA_GROQ_KEY\n');
    console.error('Access Token: https://supabase.com/dashboard/account/tokens');
    console.error('Groq Key:     https://console.groq.com/keys\n');
    process.exit(1);
}

// Lê o código da função
const fnPath = path.join(__dirname, 'supabase', 'functions', 'corrigir-redacao', 'index.ts');
if (!fs.existsSync(fnPath)) {
    console.error(`❌ Arquivo não encontrado: ${fnPath}`);
    process.exit(1);
}
const fnCode = fs.readFileSync(fnPath, 'utf8');

function apiRequest(method, urlPath, body) {
    return new Promise((resolve, reject) => {
        const data = body ? JSON.stringify(body) : null;
        const options = {
            hostname: 'api.supabase.com',
            port: 443,
            path: urlPath,
            method,
            headers: {
                'Authorization': `Bearer ${ACCESS_TOKEN}`,
                'Content-Type': 'application/json',
                ...(data ? { 'Content-Length': Buffer.byteLength(data) } : {}),
            },
        };
        const req = https.request(options, (res) => {
            let raw = '';
            res.on('data', (chunk) => raw += chunk);
            res.on('end', () => {
                try { resolve({ status: res.statusCode, body: JSON.parse(raw) }); }
                catch { resolve({ status: res.statusCode, body: raw }); }
            });
        });
        req.on('error', reject);
        if (data) req.write(data);
        req.end();
    });
}

async function main() {
    console.log('\n🚀 Iniciando deploy da Edge Function...\n');

    // 1. Verificar autenticação
    console.log('1️⃣  Verificando token de acesso...');
    const auth = await apiRequest('GET', '/v1/projects', null);
    if (auth.status !== 200) {
        console.error(`❌ Token inválido ou sem permissão (HTTP ${auth.status})`);
        console.error('   Gere um novo em: https://supabase.com/dashboard/account/tokens\n');
        process.exit(1);
    }
    const project = auth.body.find(p => p.id === PROJECT_REF);
    if (!project) {
        console.error(`❌ Projeto ${PROJECT_REF} não encontrado nessa conta.`);
        process.exit(1);
    }
    console.log(`   ✅ Autenticado — projeto: ${project.name}\n`);

    // 2. Verificar se a função já existe
    console.log('2️⃣  Verificando funções existentes...');
    const listRes = await apiRequest('GET', `/v1/projects/${PROJECT_REF}/functions`, null);
    const existing = Array.isArray(listRes.body) && listRes.body.find(f => f.slug === 'corrigir-redacao');

    // 3. Deploy da função (create ou update)
    const fnPayload = {
        slug: 'corrigir-redacao',
        name: 'corrigir-redacao',
        body: fnCode,
        verify_jwt: false,   // permite chamadas com anon key sem usuário logado
    };

    let deployRes;
    if (existing) {
        console.log('   Função já existe — atualizando código...');
        deployRes = await apiRequest('PATCH', `/v1/projects/${PROJECT_REF}/functions/corrigir-redacao`, fnPayload);
    } else {
        console.log('   Criando nova função...');
        deployRes = await apiRequest('POST', `/v1/projects/${PROJECT_REF}/functions`, fnPayload);
    }

    if (deployRes.status !== 200 && deployRes.status !== 201) {
        console.error(`❌ Erro no deploy (HTTP ${deployRes.status}):`);
        console.error(JSON.stringify(deployRes.body, null, 2));
        process.exit(1);
    }
    console.log('   ✅ Função deployada com sucesso!\n');

    // 4. Configurar GROQ_KEY como secret da função
    console.log('3️⃣  Configurando GROQ_KEY como secret...');
    const secretRes = await apiRequest(
        'POST',
        `/v1/projects/${PROJECT_REF}/secrets`,
        [{ name: 'GROQ_KEY', value: GROQ_KEY }]
    );

    if (secretRes.status !== 200 && secretRes.status !== 201) {
        console.error(`⚠️  Erro ao configurar secret (HTTP ${secretRes.status}):`);
        console.error(JSON.stringify(secretRes.body, null, 2));
        console.error('\n   Configure manualmente no dashboard:');
        console.error(`   https://supabase.com/dashboard/project/${PROJECT_REF}/settings/functions`);
    } else {
        console.log('   ✅ GROQ_KEY configurada no servidor!\n');
    }

    console.log('═══════════════════════════════════════════════════');
    console.log('✅ DEPLOY CONCLUÍDO!');
    console.log('   Todos os usuários agora podem corrigir redações');
    console.log('   sem precisar de chave própria.');
    console.log('═══════════════════════════════════════════════════\n');
}

main().catch(err => {
    console.error('\n❌ Erro inesperado:', err.message);
    process.exit(1);
});
