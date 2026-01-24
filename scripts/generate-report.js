/**
 * Script para gerar relatório HTML dos testes k6
 * Processa output JSON do k6 e cria dashboard visual detalhado
 * Mostra checks separados por cenário de teste
 * 
 * Uso:
 *   node scripts/generate-report.js <resultados-json> <output-html>
 */

const fs = require('fs');
const path = require('path');

function parseK6Results(jsonFile) {
  const content = fs.readFileSync(jsonFile, 'utf-8');
  const lines = content.split('\n').filter(line => line.trim());
  
  const metrics = {
    http_reqs: { count: 0, rate: 0 },
    http_req_duration: { avg: 0, p90: 0, p95: 0, p99: 0, min: 0, max: 0 },
    http_req_failed: { count: 0, rate: 0 },
    http_req_waiting: { avg: 0, p95: 0, min: 0, max: 0 },
    checks: { passed: 0, failed: 0, rate: 0, total: 0 },
    iterations: { count: 0, rate: 0 },
    vu_max: 0,
    duration: 0,
    timestamp: new Date().toLocaleString('pt-BR')
  };

  const checkResults = {}; // Nome do check -> {passed, failed}
  const checkByScenario = {}; // Cenário -> [checks]
  const thresholds = { passed: [], failed: [] };
  
  lines.forEach(line => {
    try {
      const entry = JSON.parse(line);
      
      if (entry.type === 'Metric') {
        const metric = entry.metric;
        const value = entry.data?.value;
        
        if (metric === 'http_reqs') metrics.http_reqs.count = value;
        if (metric === 'http_reqs' && entry.data?.rate) metrics.http_reqs.rate = entry.data.rate;
        
        if (metric === 'http_req_duration') {
          metrics.http_req_duration.avg = value;
        }
        
        if (metric === 'http_req_waiting') {
          metrics.http_req_waiting.avg = value;
        }
        
        if (metric === 'http_req_failed') {
          metrics.http_req_failed.count = value;
          if (entry.data?.rate) metrics.http_req_failed.rate = entry.data.rate;
        }
        
        if (metric === 'checks') {
          const name = entry.data?.name;
          const pass = entry.data?.pass;
          if (name) {
            if (!checkResults[name]) {
              checkResults[name] = { passed: 0, failed: 0 };
            }
            if (pass) checkResults[name].passed++;
            else checkResults[name].failed++;
          }
        }
        
        if (metric === 'vus_max') metrics.vu_max = value;
      }
      
      if (entry.type === 'Point') {
        if (entry.metric === 'http_req_duration' && entry.data?.tags?.['http_req_duration']) {
          // Capturar percentis
          const value = entry.data?.value || 0;
          if (!metrics.http_req_duration.p95 || value > metrics.http_req_duration.p95) {
            metrics.http_req_duration.p95 = value;
          }
        }
      }

      if (entry.type === 'ThresholdEvent') {
        const threshold = entry.data?.name;
        const met = entry.data?.met;
        if (threshold) {
          if (met) {
            thresholds.passed.push(threshold);
          } else {
            thresholds.failed.push(threshold);
          }
        }
      }
    } catch (e) {
      // Ignorar linhas que não são JSON válido
    }
  });

  // Calcular totais de checks
  Object.entries(checkResults).forEach(([name, result]) => {
    metrics.checks.passed += result.passed;
    metrics.checks.failed += result.failed;
    metrics.checks.total += result.passed + result.failed;
  });
  
  const totalChecks = metrics.checks.passed + metrics.checks.failed;
  metrics.checks.rate = totalChecks > 0 ? ((metrics.checks.passed / totalChecks) * 100).toFixed(2) : 0;

  return { metrics, checkResults, thresholds };
}

function generateHTML(data, outputFile) {
  const { metrics, checkResults, thresholds } = data;

  const passed = metrics.checks.rate >= 95 && metrics.http_req_failed.rate < 0.05;
  const statusColor = passed ? '#10b981' : '#ef4444';
  const statusText = passed ? '✅ PASSOU' : '❌ FALHOU';

  const checksHTML = Object.entries(checkResults)
    .sort((a, b) => {
      const aTotal = a[1].passed + a[1].failed;
      const bTotal = b[1].passed + b[1].failed;
      const aRate = (a[1].passed / aTotal) * 100;
      const bRate = (b[1].passed / bTotal) * 100;
      return bRate - aRate;
    })
    .map(([name, result]) => {
      const total = result.passed + result.failed;
      const rate = ((result.passed / total) * 100).toFixed(2);
      const color = rate >= 95 ? '#10b981' : rate >= 80 ? '#f59e0b' : '#ef4444';
      return `
        <div class="check-item" style="border-left-color: ${color}">
          <div class="check-header">
            <div class="check-name">${name}</div>
            <div class="check-rate" style="color: ${color}">${rate}%</div>
          </div>
          <div class="check-stats">
            <span class="check-passed">✓ ${result.passed}</span>
            <span class="check-failed">✗ ${result.failed}</span>
            <span class="check-total">Total: ${total}</span>
          </div>
        </div>
      `;
    })
    .join('');

  const thresholdsHTML = `
    <div class="thresholds-section">
      <div class="section-title">📊 Thresholds Status</div>
      <div class="thresholds-grid">
        ${thresholds.passed.map(t => `<div class="threshold-item passed"><span class="icon">✓</span> ${t}</div>`).join('')}
        ${thresholds.failed.map(t => `<div class="threshold-item failed"><span class="icon">✗</span> ${t}</div>`).join('')}
      </div>
    </div>
  `;

  const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Relatório k6 - ServeRest Performance Tests</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background: linear-gradient(135deg, #1e1e2e 0%, #2d2d44 100%);
      color: #e0e0e0;
      padding: 2rem;
      min-height: 100vh;
    }

    .container {
      max-width: 1400px;
      margin: 0 auto;
    }

    .header {
      text-align: center;
      margin-bottom: 2rem;
      border-bottom: 2px solid #4a4a6a;
      padding-bottom: 1.5rem;
    }

    .header h1 {
      font-size: 2.5rem;
      margin-bottom: 0.5rem;
      background: linear-gradient(135deg, #6366f1 0%, #ec4899 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .header p {
      font-size: 0.95rem;
      color: #a0a0c0;
    }

    .timestamp {
      font-size: 0.85rem;
      color: #808090;
      margin-top: 0.5rem;
    }

    .status-badge {
      display: inline-block;
      padding: 0.75rem 1.5rem;
      border-radius: 0.5rem;
      font-weight: bold;
      font-size: 1.1rem;
      background-color: ${statusColor}22;
      color: ${statusColor};
      border: 2px solid ${statusColor};
      margin-top: 1rem;
    }

    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .card {
      background: linear-gradient(135deg, #2d2d44 0%, #383854 100%);
      border-radius: 0.75rem;
      padding: 1.5rem;
      border: 1px solid #4a4a6a;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
      transition: transform 0.2s, box-shadow 0.2s;
    }

    .card:hover {
      transform: translateY(-2px);
      box-shadow: 0 15px 40px rgba(0, 0, 0, 0.4);
    }

    .card-title {
      font-size: 0.85rem;
      color: #a0a0c0;
      margin-bottom: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      font-weight: 600;
    }

    .card-value {
      font-size: 2rem;
      font-weight: bold;
      color: #e0e0e0;
      margin-bottom: 0.5rem;
    }

    .card-subtext {
      font-size: 0.85rem;
      color: #808090;
      line-height: 1.5;
    }

    .metric-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.75rem 0;
      border-bottom: 1px solid #3a3a5a;
    }

    .metric-row:last-child {
      border-bottom: none;
    }

    .metric-label {
      color: #a0a0c0;
      font-size: 0.9rem;
    }

    .metric-value {
      font-weight: 600;
      color: #e0e0e0;
    }

    .checks-container {
      background: linear-gradient(135deg, #2d2d44 0%, #383854 100%);
      border-radius: 0.75rem;
      padding: 1.5rem;
      border: 1px solid #4a4a6a;
      margin-bottom: 2rem;
    }

    .checks-title {
      font-size: 1.1rem;
      font-weight: bold;
      margin-bottom: 1.5rem;
      color: #e0e0e0;
    }

    .check-item {
      background: rgba(255, 255, 255, 0.02);
      padding: 1rem;
      border-radius: 0.5rem;
      margin-bottom: 0.75rem;
      border-left: 4px solid #4a4a6a;
    }

    .check-item:last-child {
      margin-bottom: 0;
    }

    .check-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.5rem;
    }

    .check-name {
      font-size: 0.95rem;
      color: #e0e0e0;
      font-weight: 500;
      flex: 1;
    }

    .check-rate {
      font-weight: 600;
      font-size: 0.95rem;
    }

    .check-stats {
      display: flex;
      gap: 1.5rem;
      font-size: 0.85rem;
    }

    .check-passed {
      color: #10b981;
      font-weight: 600;
    }

    .check-failed {
      color: #ef4444;
      font-weight: 600;
    }

    .check-total {
      color: #a0a0c0;
    }

    .thresholds-section {
      background: linear-gradient(135deg, #2d2d44 0%, #383854 100%);
      border-radius: 0.75rem;
      padding: 1.5rem;
      border: 1px solid #4a4a6a;
      margin-bottom: 2rem;
    }

    .section-title {
      font-size: 1.1rem;
      font-weight: bold;
      margin-bottom: 1.5rem;
      color: #e0e0e0;
    }

    .thresholds-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1rem;
    }

    .threshold-item {
      padding: 1rem;
      border-radius: 0.5rem;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      font-weight: 600;
    }

    .threshold-item.passed {
      background: rgba(16, 185, 129, 0.1);
      color: #10b981;
      border: 1px solid #10b981;
    }

    .threshold-item.failed {
      background: rgba(239, 68, 68, 0.1);
      color: #ef4444;
      border: 1px solid #ef4444;
    }

    .threshold-item .icon {
      font-weight: bold;
      font-size: 1.1rem;
    }

    .success {
      color: #10b981;
    }

    .warning {
      color: #f59e0b;
    }

    .error {
      color: #ef4444;
    }

    .footer {
      text-align: center;
      margin-top: 3rem;
      padding-top: 2rem;
      border-top: 1px solid #4a4a6a;
      color: #808090;
      font-size: 0.85rem;
    }

    @media (max-width: 768px) {
      .header h1 {
        font-size: 1.8rem;
      }

      .grid {
        grid-template-columns: 1fr;
      }

      .card-value {
        font-size: 1.5rem;
      }

      .thresholds-grid {
        grid-template-columns: 1fr;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📊 Relatório de Testes - ServeRest k6</h1>
      <p>Performance Testing Suite | Detalhado</p>
      <div class="status-badge">${statusText}</div>
      <div class="timestamp">Gerado em: ${metrics.timestamp}</div>
    </div>

    <div class="grid">
      <div class="card">
        <div class="card-title">Requisições HTTP</div>
        <div class="card-value success">${metrics.http_reqs.count}</div>
        <div class="card-subtext">${(metrics.http_reqs.rate || 0).toFixed(2)} req/s</div>
      </div>

      <div class="card">
        <div class="card-title">Taxa de Falha HTTP</div>
        <div class="card-value ${(metrics.http_req_failed.rate * 100) > 5 ? 'error' : 'success'}">
          ${((metrics.http_req_failed.rate || 0) * 100).toFixed(2)}%
        </div>
        <div class="card-subtext">${metrics.http_req_failed.count} requisições falharam</div>
      </div>

      <div class="card">
        <div class="card-title">Taxa de Checks</div>
        <div class="card-value ${metrics.checks.rate >= 95 ? 'success' : 'error'}">
          ${metrics.checks.rate}%
        </div>
        <div class="card-subtext">${metrics.checks.passed}✓ / ${metrics.checks.failed}✗</div>
      </div>

      <div class="card">
        <div class="card-title">VUs Máximo</div>
        <div class="card-value">${metrics.vu_max}</div>
        <div class="card-subtext">Virtual Users simultâneos</div>
      </div>

      <div class="card">
        <div class="card-title">Duração de Requisição</div>
        <div class="card-value">${(metrics.http_req_duration.avg || 0).toFixed(0)}ms</div>
        <div class="card-subtext">
          Min: ${(metrics.http_req_duration.min || 0).toFixed(0)}ms | 
          Max: ${(metrics.http_req_duration.max || 0).toFixed(0)}ms
        </div>
      </div>

      <div class="card">
        <div class="card-title">Percentis de Latência</div>
        <div style="display: flex; flex-direction: column; gap: 0.5rem;">
          <div class="metric-row" style="padding: 0; border: none;">
            <span class="metric-label">P90</span>
            <span class="metric-value">${(metrics.http_req_duration.p90 || 0).toFixed(0)}ms</span>
          </div>
          <div class="metric-row" style="padding: 0; border: none;">
            <span class="metric-label">P95</span>
            <span class="metric-value">${(metrics.http_req_duration.p95 || 0).toFixed(0)}ms</span>
          </div>
          <div class="metric-row" style="padding: 0; border: none;">
            <span class="metric-label">P99</span>
            <span class="metric-value">${(metrics.http_req_duration.p99 || 0).toFixed(0)}ms</span>
          </div>
        </div>
      </div>
    </div>

    ${thresholds.passed.length > 0 || thresholds.failed.length > 0 ? thresholdsHTML : ''}

    <div class="checks-container">
      <div class="checks-title">📋 Detalhes dos Checks (${Object.keys(checkResults).length})</div>
      ${checksHTML || '<p style="color: #a0a0c0;">Nenhum check executado</p>'}
    </div>

    <div class="footer">
      <p>💡 Relatório gerado automaticamente | k6 Performance Testing</p>
      <p style="margin-top: 0.5rem; font-size: 0.75rem;">Checks ordenados por taxa de sucesso (maior para menor)</p>
    </div>
  </div>
</body>
</html>
  `;

  fs.writeFileSync(outputFile, html, 'utf-8');
  console.log(`✅ Relatório gerado: ${outputFile}`);
}

// Main
const jsonFile = process.argv[2];
const outputFile = process.argv[3] || 'test-results/report.html';

if (!jsonFile) {
  console.error('Uso: node scripts/generate-report.js <results.json> [output.html]');
  process.exit(1);
}

if (!fs.existsSync(jsonFile)) {
  console.error(`Arquivo não encontrado: ${jsonFile}`);
  process.exit(1);
}

// Criar diretório de output se não existir
const outputDir = path.dirname(outputFile);
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

try {
  const data = parseK6Results(jsonFile);
  generateHTML(data, outputFile);
} catch (error) {
  console.error('Erro ao gerar relatório:', error.message);
  process.exit(1);
}

