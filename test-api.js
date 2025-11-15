const http = require('http');

const BASE_URL = 'http://localhost:3000';
let sessionCookie = '';

function makeRequest(method, path, data = null, useSession = false) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      method: method,
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    if (useSession && sessionCookie) {
      options.headers['Cookie'] = sessionCookie;
    }

    if (data) {
      const jsonData = JSON.stringify(data);
      options.headers['Content-Length'] = Buffer.byteLength(jsonData);
    }

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        if (res.headers['set-cookie']) {
          sessionCookie = res.headers['set-cookie'][0].split(';')[0];
        }
        try {
          const parsed = body ? JSON.parse(body) : {};
          resolve({ status: res.statusCode, headers: res.headers, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, headers: res.headers, data: body });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

function printTest(name, passed, details = '') {
  const status = passed ? '✅ PASSOU' : '❌ FALHOU';
  console.log(`${status} - ${name}`);
  if (details) {
    console.log(`   ${details}`);
  }
  return passed;
}

async function runTests() {
  console.log('='.repeat(60));
  console.log('TESTES DA API FASTDELIVERY');
  console.log('='.repeat(60));
  console.log('');

  let passedTests = 0;
  let totalTests = 0;

  try {
    console.log('1. TESTANDO CONECTIVIDADE DO SERVIDOR');
    console.log('-'.repeat(60));
    totalTests++;
    try {
      const response = await makeRequest('GET', '/');
      if (response.status === 200 && response.data.message) {
        printTest('Servidor está rodando', true, `Mensagem: ${response.data.message}`);
        passedTests++;
      } else {
        printTest('Servidor está rodando', false, `Status: ${response.status}`);
      }
    } catch (error) {
      printTest('Servidor está rodando', false, `Erro: ${error.message}`);
      console.log('\n❌ ERRO: Servidor não está rodando ou não está acessível!');
      console.log('   Execute: npm start');
      process.exit(1);
    }
    console.log('');

    console.log('2. TESTANDO AUTENTICAÇÃO');
    console.log('-'.repeat(60));
    
    totalTests++;
    try {
      const response = await makeRequest('POST', '/api/auth/login', {
        username: 'admin',
        password: 'admin123'
      });
      if (response.status === 200 && response.data.user) {
        printTest('Login com credenciais válidas', true, 
          `Usuário: ${response.data.user.username}, Role: ${response.data.user.role}`);
        passedTests++;
      } else {
        printTest('Login com credenciais válidas', false, 
          `Status: ${response.status}, Resposta: ${JSON.stringify(response.data)}`);
      }
    } catch (error) {
      printTest('Login com credenciais válidas', false, `Erro: ${error.message}`);
    }

    totalTests++;
    try {
      const response = await makeRequest('POST', '/api/auth/login', {
        username: 'admin',
        password: 'senhaerrada'
      });
      if (response.status === 401) {
        printTest('Login com credenciais inválidas retorna 401', true);
        passedTests++;
      } else {
        printTest('Login com credenciais inválidas retorna 401', false, 
          `Status: ${response.status}`);
      }
    } catch (error) {
      printTest('Login com credenciais inválidas retorna 401', false, `Erro: ${error.message}`);
    }

    totalTests++;
    try {
      const response = await makeRequest('GET', '/api/auth/me', null, true);
      if (response.status === 200 && response.data.user) {
        printTest('Verificar usuário autenticado (GET /api/auth/me)', true,
          `Usuário: ${response.data.user.username}`);
        passedTests++;
      } else {
        printTest('Verificar usuário autenticado (GET /api/auth/me)', false,
          `Status: ${response.status}`);
      }
    } catch (error) {
      printTest('Verificar usuário autenticado (GET /api/auth/me)', false, `Erro: ${error.message}`);
    }
    console.log('');

    console.log('3. TESTANDO VALIDAÇÃO DE CAMPOS OBRIGATÓRIOS');
    console.log('-'.repeat(60));
    
    totalTests++;
    try {
      const response = await makeRequest('POST', '/api/stores', {}, true);
      if (response.status === 400 && response.data.errors) {
        printTest('Validação: criar loja sem campos obrigatórios', true,
          `Erros: ${response.data.errors.join(', ')}`);
        passedTests++;
      } else {
        printTest('Validação: criar loja sem campos obrigatórios', false,
          `Status: ${response.status}`);
      }
    } catch (error) {
      printTest('Validação: criar loja sem campos obrigatórios', false, `Erro: ${error.message}`);
    }

    totalTests++;
    try {
      const response = await makeRequest('POST', '/api/orders', {}, false);
      if (response.status === 400 && response.data.errors) {
        printTest('Validação: criar pedido sem campos obrigatórios', true,
          `Erros encontrados: ${response.data.errors.length}`);
        passedTests++;
      } else {
        printTest('Validação: criar pedido sem campos obrigatórios', false,
          `Status: ${response.status}`);
      }
    } catch (error) {
      printTest('Validação: criar pedido sem campos obrigatórios', false, `Erro: ${error.message}`);
    }
    console.log('');

    console.log('4. TESTANDO GESTÃO DE LOJAS');
    console.log('-'.repeat(60));
    let storeId = null;
    let storeName = `Loja Teste ${Date.now()}`;

    totalTests++;
    try {
      const response = await makeRequest('POST', '/api/stores', {
        name: storeName,
        category: 'Lanches',
        address: 'Rua Teste, 123'
      }, true);
      if (response.status === 201 && response.data.store) {
        storeId = response.data.store._id || response.data.store.id;
        printTest('Criar loja', true, `ID: ${storeId}, Nome: ${response.data.store.name}`);
        passedTests++;
      } else {
        printTest('Criar loja', false, `Status: ${response.status}`);
      }
    } catch (error) {
      printTest('Criar loja', false, `Erro: ${error.message}`);
    }

    totalTests++;
    try {
      const response = await makeRequest('GET', '/api/stores', null, false);
      if (response.status === 200 && Array.isArray(response.data.stores)) {
        printTest('Listar lojas', true, `Total: ${response.data.stores.length} lojas`);
        passedTests++;
      } else {
        printTest('Listar lojas', false, `Status: ${response.status}`);
      }
    } catch (error) {
      printTest('Listar lojas', false, `Erro: ${error.message}`);
    }

    totalTests++;
    try {
      const response = await makeRequest('GET', `/api/stores/search?name=${encodeURIComponent(storeName)}`, null, false);
      if (response.status === 200 && response.data.store) {
        printTest('Buscar loja por nome', true, `Encontrada: ${response.data.store.name}`);
        passedTests++;
      } else {
        printTest('Buscar loja por nome', false, `Status: ${response.status}`);
      }
    } catch (error) {
      printTest('Buscar loja por nome', false, `Erro: ${error.message}`);
    }

    totalTests++;
    try {
      const response = await makeRequest('PATCH', `/api/stores/${encodeURIComponent(storeName)}/status`, {
        isOpen: false
      }, true);
      if (response.status === 200) {
        printTest('Atualizar status da loja', true, 'Loja fechada com sucesso');
        passedTests++;
      } else {
        printTest('Atualizar status da loja', false, `Status: ${response.status}`);
      }
    } catch (error) {
      printTest('Atualizar status da loja', false, `Erro: ${error.message}`);
    }
    console.log('');

    console.log('5. TESTANDO GESTÃO DE ENTREGADORES');
    console.log('-'.repeat(60));
    let courierId = null;

    totalTests++;
    try {
      const response = await makeRequest('POST', '/api/couriers', {
        name: `Entregador Teste ${Date.now()}`,
        vehicle: 'moto'
      }, true);
      if (response.status === 201 && response.data.courier) {
        courierId = response.data.courier._id || response.data.courier.id;
        printTest('Criar entregador', true, `ID: ${courierId}, Nome: ${response.data.courier.name}`);
        passedTests++;
      } else {
        printTest('Criar entregador', false, `Status: ${response.status}`);
      }
    } catch (error) {
      printTest('Criar entregador', false, `Erro: ${error.message}`);
    }

    totalTests++;
    try {
      const response = await makeRequest('GET', '/api/couriers/available', null, false);
      if (response.status === 200 && Array.isArray(response.data.couriers)) {
        printTest('Listar entregadores disponíveis', true, 
          `Total: ${response.data.couriers.length} entregadores disponíveis`);
        passedTests++;
      } else {
        printTest('Listar entregadores disponíveis', false, `Status: ${response.status}`);
      }
    } catch (error) {
      printTest('Listar entregadores disponíveis', false, `Erro: ${error.message}`);
    }

    if (courierId) {
      totalTests++;
      try {
        const response = await makeRequest('PATCH', `/api/couriers/${courierId}/availability`, {
          available: false
        }, true);
        if (response.status === 200) {
          printTest('Atualizar disponibilidade do entregador', true, 'Disponibilidade atualizada');
          passedTests++;
        } else {
          printTest('Atualizar disponibilidade do entregador', false, `Status: ${response.status}`);
        }
      } catch (error) {
        printTest('Atualizar disponibilidade do entregador', false, `Erro: ${error.message}`);
      }
    }
    console.log('');

    console.log('6. TESTANDO GESTÃO DE PEDIDOS');
    console.log('-'.repeat(60));
    let orderId = null;

    if (storeId) {
      totalTests++;
      try {
        const response = await makeRequest('POST', '/api/orders', {
          storeId: storeId,
          customerName: 'Cliente Teste',
          items: [
            { name: 'X-Burger', qty: 2, price: 15.50 },
            { name: 'Refrigerante', qty: 1, price: 5.00 }
          ]
        }, false);
        if (response.status === 201 && response.data.order) {
          orderId = response.data.order._id || response.data.order.id;
          printTest('Criar pedido', true, 
            `ID: ${orderId}, Total: R$ ${response.data.order.total.toFixed(2)}`);
          passedTests++;
        } else {
          printTest('Criar pedido', false, `Status: ${response.status}, Resposta: ${JSON.stringify(response.data)}`);
        }
      } catch (error) {
        printTest('Criar pedido', false, `Erro: ${error.message}`);
      }
    }

    totalTests++;
    try {
      const response = await makeRequest('GET', '/api/orders', null, false);
      if (response.status === 200 && Array.isArray(response.data.orders)) {
        printTest('Listar pedidos', true, `Total: ${response.data.orders.length} pedidos`);
        passedTests++;
      } else {
        printTest('Listar pedidos', false, `Status: ${response.status}`);
      }
    } catch (error) {
      printTest('Listar pedidos', false, `Erro: ${error.message}`);
    }

    totalTests++;
    try {
      const response = await makeRequest('GET', '/api/orders?status=PENDENTE', null, false);
      if (response.status === 200 && Array.isArray(response.data.orders)) {
        printTest('Listar pedidos por status', true, 
          `Pedidos PENDENTES: ${response.data.orders.length}`);
        passedTests++;
      } else {
        printTest('Listar pedidos por status', false, `Status: ${response.status}`);
      }
    } catch (error) {
      printTest('Listar pedidos por status', false, `Erro: ${error.message}`);
    }

    if (orderId && courierId) {
      totalTests++;
      try {
        const response = await makeRequest('POST', `/api/orders/${orderId}/approve`, {
          courierId: courierId
        }, true);
        if (response.status === 200) {
          printTest('Aprovar pedido e atribuir entregador', true, 'Pedido aprovado');
          passedTests++;
        } else {
          printTest('Aprovar pedido e atribuir entregador', false, 
            `Status: ${response.status}, Resposta: ${JSON.stringify(response.data)}`);
        }
      } catch (error) {
        printTest('Aprovar pedido e atribuir entregador', false, `Erro: ${error.message}`);
      }
    }

    if (orderId) {
      totalTests++;
      try {
        const response = await makeRequest('POST', `/api/orders/${orderId}/deliver`, null, true);
        if (response.status === 200) {
          printTest('Marcar pedido como entregue', true, 'Pedido marcado como entregue');
          passedTests++;
        } else {
          printTest('Marcar pedido como entregue', false, `Status: ${response.status}`);
        }
      } catch (error) {
        printTest('Marcar pedido como entregue', false, `Erro: ${error.message}`);
      }
    }
    console.log('');

    console.log('7. TESTANDO PROTEÇÃO DE ROTAS (AUTENTICAÇÃO)');
    console.log('-'.repeat(60));

    await makeRequest('POST', '/api/auth/logout', null, true);
    sessionCookie = '';

    totalTests++;
    try {
      const response = await makeRequest('POST', '/api/stores', {
        name: 'Loja Não Autorizada',
        category: 'Teste'
      }, false);
      if (response.status === 401) {
        printTest('Proteção: criar loja sem autenticação', true, 'Retorna 401');
        passedTests++;
      } else {
        printTest('Proteção: criar loja sem autenticação', false, 
          `Status: ${response.status} (esperado: 401)`);
      }
    } catch (error) {
      printTest('Proteção: criar loja sem autenticação', false, `Erro: ${error.message}`);
    }

    if (orderId) {
      totalTests++;
      try {
        const response = await makeRequest('POST', `/api/orders/${orderId}/approve`, {
          courierId: courierId
        }, false);
        if (response.status === 401) {
          printTest('Proteção: aprovar pedido sem autenticação', true, 'Retorna 401');
          passedTests++;
        } else {
          printTest('Proteção: aprovar pedido sem autenticação', false, 
            `Status: ${response.status} (esperado: 401)`);
        }
      } catch (error) {
        printTest('Proteção: aprovar pedido sem autenticação', false, `Erro: ${error.message}`);
      }
    }
    console.log('');

    console.log('8. TESTANDO LOGOUT');
    console.log('-'.repeat(60));

    await makeRequest('POST', '/api/auth/login', {
      username: 'admin',
      password: 'admin123'
    });

    totalTests++;
    try {
      const response = await makeRequest('POST', '/api/auth/logout', null, true);
      if (response.status === 200) {
        printTest('Logout', true, 'Logout realizado com sucesso');
        passedTests++;
        sessionCookie = '';
      } else {
        printTest('Logout', false, `Status: ${response.status}`);
      }
    } catch (error) {
      printTest('Logout', false, `Erro: ${error.message}`);
    }
    console.log('');

    console.log('='.repeat(60));
    console.log('RESUMO DOS TESTES');
    console.log('='.repeat(60));
    console.log(`Total de testes: ${totalTests}`);
    console.log(`Testes passaram: ${passedTests}`);
    console.log(`Testes falharam: ${totalTests - passedTests}`);
    console.log(`Taxa de sucesso: ${((passedTests / totalTests) * 100).toFixed(1)}%`);
    console.log('='.repeat(60));

    if (passedTests === totalTests) {
      console.log('✅ TODOS OS TESTES PASSARAM!');
      process.exit(0);
    } else {
      console.log('⚠️  ALGUNS TESTES FALHARAM');
      process.exit(1);
    }

  } catch (error) {
    console.error('\n❌ ERRO CRÍTICO:', error.message);
    process.exit(1);
  }
}

runTests();

