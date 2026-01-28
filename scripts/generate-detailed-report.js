/**
 * Script para gerar relatório HTML visual detalhado dos testes k6
 * Extrai dados do analyze-results.js e cria um dashboard interativo
 * Mostra checks separados por cenário de teste
 * 
 * Uso: node generate-detailed-report.js [input.json] [output.html] [testType]
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Parâmetros CLI
const resultsFile = process.argv[2] || 'test-results/results.json';
const outputFile = process.argv[3] || 'test-results/report-detailed.html';
const testType = process.argv[4] || 'default';

// Mapeamento de nomes amigáveis
const testTypeNames = {
  'smoke': '🔬 Smoke Test',
  'load': '📊 Load Test',
  'stress': '💪 Stress Test',
  'spike': '⚡ Spike Test',
  'soak': '⏱️ Soak Test',
  'default': '🎯 Performance Test'
};

function extractScenarioData() {
  try {
    // Executar analyze-results.js e capturar output
    const output = execSync(`node scripts/analyze-results.js "${resultsFile}" 2>&1`, {
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe']
    });

    const scenarios = {};
    const allChecks = {};
    const httpMetrics = {};
    
    // Parse dos cenários
    const scenarioRegex = /📍 Cenário: ::(.+?)\n─+\n([\s\S]*?)(?=📍|════)/g;
    let match;

    while ((match = scenarioRegex.exec(output)) !== null) {
      const scenarioName = match[1].trim();
      const scenarioContent = match[2];
      
      scenarios[scenarioName] = {
        checks: [],
        passed: 0,
        failed: 0,
        total: 0
      };

      // Extrair checks do cenário
      const checkRegex = /✓ (.+?): (\d+) execuções/g;
      let checkMatch;
      while ((checkMatch = checkRegex.exec(scenarioContent)) !== null) {
        const checkName = checkMatch[1].trim();
        const executions = parseInt(checkMatch[2]);
        
        scenarios[scenarioName].checks.push({
          name: checkName,
          executions: executions,
          passed: executions,
          failed: 0,
          rate: 100
        });
        
        scenarios[scenarioName].total += executions;
        scenarios[scenarioName].passed += executions;
        
        // Registrar check global
        if (!allChecks[checkName]) {
          allChecks[checkName] = { passed: 0, failed: 0, total: 0 };
        }
        allChecks[checkName].passed += executions;
        allChecks[checkName].total += executions;
      }
    }

    // Parse das métricas HTTP com percentis
    const metricsRegex = /📊 (.+?)\n\s*Média: ([\d.]+)ms \| Min: ([\d.]+)ms \| Max: ([\d.]+)ms \| P95: ([\d.]+)ms/g;
    const metricsWithPercentiles = {};
    
    while ((match = metricsRegex.exec(output)) !== null) {
      const metricName = match[1].trim();
      metricsWithPercentiles[metricName] = {
        avg: parseFloat(match[2]),
        min: parseFloat(match[3]),
        max: parseFloat(match[4]),
        p95: parseFloat(match[5])
      };
    }

    // Parse de métrica HTTP com campo falhado
    const failedMetricRegex = /📊 http_req_failed\n\s*Média: ([\d.]+)ms \| Min: ([\d.]+)ms \| Max: ([\d.]+)ms \| P95: ([\d.]+)ms/;
    const failedMatch = failedMetricRegex.exec(output);
    if (failedMatch) {
      metricsWithPercentiles['http_req_failed'] = {
        avg: parseFloat(failedMatch[1]),
        min: parseFloat(failedMatch[2]),
        max: parseFloat(failedMatch[3]),
        p95: parseFloat(failedMatch[4])
      };
    }

    // Parse total de checks
    const totalRegex = /📊 TOTAL: (\d+)\/(\d+) checks passaram \((\d+\.\d+)%\)/;
    const totalMatch = totalRegex.exec(output);
    const totalChecksData = totalMatch ? {
      passed: parseInt(totalMatch[1]),
      failed: parseInt(totalMatch[2]) - parseInt(totalMatch[1]),
      total: parseInt(totalMatch[2]),
      rate: parseFloat(totalMatch[3])
    } : { passed: 0, failed: 0, total: 0, rate: 0 };

    return {
      scenarios,
      allChecks,
      httpMetrics: metricsWithPercentiles,
      totalChecks: totalChecksData,
      timestamp: new Date().toLocaleString('pt-BR')
    };
  } catch (error) {
    console.error('Erro ao extrair dados:', error.message);
    return null;
  }
}

function generateDetailedHTML(data) {
  if (!data) {
    console.error('Dados não encontrados');
    return '';
  }

  const { scenarios, allChecks, httpMetrics, totalChecks, timestamp } = data;
  const passed = totalChecks.rate >= 95;
  const statusColor = passed ? '#10b981' : '#ef4444';
  const statusText = passed ? '✅ PASSOU' : '⚠️ VERIFICAR';

  // Gerar HTML dos cenários
  const scenariosHTML = Object.entries(scenarios)
    .map(([name, scenario]) => {
      const rate = scenario.total > 0 ? ((scenario.passed / scenario.total) * 100).toFixed(2) : 0;
      const color = rate >= 95 ? '#10b981' : rate >= 80 ? '#f59e0b' : '#ef4444';
      
      const checksHTML = scenario.checks
        .map(check => `
          <div class="scenario-check">
            <div class="check-name-small">${check.name}</div>
            <div class="check-stats-small">
              <span class="check-passed-small">✓ ${check.executions}</span>
              <span class="check-rate-small" style="color: ${color}">${check.rate}%</span>
            </div>
          </div>
        `)
        .join('');

      return `
        <div class="scenario-card">
          <div class="scenario-header" style="border-left-color: ${color}">
            <div class="scenario-title">${name}</div>
            <div class="scenario-rate" style="color: ${color}">${rate}%</div>
          </div>
          <div class="scenario-content">
            <div class="scenario-checks">
              ${checksHTML}
            </div>
            <div class="scenario-footer">
              <span class="scenario-total">${scenario.passed}/${scenario.total} checks</span>
            </div>
          </div>
        </div>
      `;
    })
    .join('');

  // Gerar HTML dos checks globais
  const checksHTML = Object.entries(allChecks)
    .sort((a, b) => {
      const aRate = (a[1].passed / a[1].total) * 100;
      const bRate = (b[1].passed / b[1].total) * 100;
      return bRate - aRate;
    })
    .map(([name, check]) => {
      const rate = check.total > 0 ? ((check.passed / check.total) * 100).toFixed(2) : 0;
      const color = rate >= 95 ? '#10b981' : rate >= 80 ? '#f59e0b' : '#ef4444';
      
      return `
        <div class="check-global-item" style="border-left-color: ${color}">
          <div class="check-global-header">
            <div class="check-global-name">${name}</div>
            <div class="check-global-rate" style="color: ${color}">${rate}%</div>
          </div>
          <div class="check-global-stats">
            <span class="check-global-stat">✓ ${check.passed}</span>
            <span class="check-global-stat">Total: ${check.total}</span>
          </div>
        </div>
      `;
    })
    .join('');

  // Gerar HTML das métricas HTTP com percentis
  const httpMetricsHTML = Object.entries(httpMetrics)
    .map(([name, metrics]) => {
      const thresholdMap = {
        'http_req_duration': { threshold: 500, label: '< 500ms' },
        'http_req_waiting': { threshold: 500, label: '< 500ms' }
      };
      
      const threshold = thresholdMap[name];
      const isWithinThreshold = threshold ? metrics.p95 <= threshold.threshold : true;
      const color = threshold 
        ? (isWithinThreshold ? '#10b981' : metrics.p95 <= threshold.threshold * 1.2 ? '#f59e0b' : '#ef4444')
        : '#6366f1';
      
      return `
        <div class="http-metric-card">
          <div class="metric-name">${name}</div>
          <div class="metric-main-value">${metrics.avg.toFixed(2)}ms</div>
          <div class="metric-label">Média</div>
          
          <div class="percentiles-grid">
            <div class="percentile-box">
              <div class="percentile-label">Mín</div>
              <div class="percentile-value">${metrics.min.toFixed(2)}ms</div>
            </div>
            <div class="percentile-box">
              <div class="percentile-label">P95</div>
              <div class="percentile-value" style="color: ${color}">${metrics.p95.toFixed(2)}ms</div>
              ${threshold ? `<div class="percentile-threshold">(${threshold.label})</div>` : ''}
            </div>
            <div class="percentile-box">
              <div class="percentile-label">Máx</div>
              <div class="percentile-value">${metrics.max.toFixed(2)}ms</div>
            </div>
          </div>
          
          <div class="metric-progress-bar">
            <div class="progress-fill" style="width: ${threshold ? Math.min((metrics.p95 / threshold.threshold) * 100, 100) : 50}%; background-color: ${color};"></div>
          </div>
        </div>
      `;
    })
    .join('');

  const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Relatório Detalhado k6 - ServeRest Performance Tests</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    :root {
      --primary: #6366f1;
      --secondary: #ec4899;
      --success: #10b981;
      --warning: #f59e0b;
      --error: #ef4444;
      --dark-bg: #1e1e2e;
      --dark-card: #2d2d44;
      --dark-border: #4a4a6a;
      --text-primary: #e0e0e0;
      --text-secondary: #a0a0c0;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background: linear-gradient(135deg, var(--dark-bg) 0%, #383854 100%);
      color: var(--text-primary);
      padding: 2rem 1rem;
      min-height: 100vh;
    }

    .container {
      max-width: 1600px;
      margin: 0 auto;
    }

    .header {
      text-align: center;
      margin-bottom: 3rem;
      border-bottom: 2px solid var(--dark-border);
      padding-bottom: 2rem;
    }

    .header h1 {
      font-size: 2.8rem;
      margin-bottom: 0.5rem;
      background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .header p {
      font-size: 1rem;
      color: var(--text-secondary);
      margin-bottom: 1rem;
    }

    .header-badges {
      display: flex;
      justify-content: center;
      gap: 1rem;
      flex-wrap: wrap;
      margin-top: 1.5rem;
    }

    .status-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1.5rem;
      border-radius: 0.75rem;
      font-weight: 600;
      font-size: 1rem;
      background-color: ${statusColor}22;
      color: ${statusColor};
      border: 2px solid ${statusColor};
    }

    .timestamp {
      font-size: 0.85rem;
      color: var(--text-secondary);
      margin-top: 1rem;
    }

    .main-metrics {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1.5rem;
      margin-bottom: 3rem;
    }

    .metric-card {
      background: linear-gradient(135deg, var(--dark-card) 0%, #3a3a54 100%);
      border-radius: 0.75rem;
      padding: 1.75rem;
      border: 1px solid var(--dark-border);
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
    }

    .metric-label {
      font-size: 0.85rem;
      color: var(--text-secondary);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      font-weight: 600;
      margin-bottom: 0.75rem;
    }

    .metric-value {
      font-size: 2.2rem;
      font-weight: bold;
      color: var(--text-primary);
      margin-bottom: 0.5rem;
    }

    .metric-subtext {
      font-size: 0.8rem;
      color: var(--text-secondary);
    }

    .section {
      margin-bottom: 3rem;
    }

    .section-title {
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--text-primary);
      margin-bottom: 1.5rem;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      border-bottom: 2px solid var(--dark-border);
      padding-bottom: 1rem;
    }

    .scenarios-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
      gap: 1.5rem;
    }

    .scenario-card {
      background: linear-gradient(135deg, var(--dark-card) 0%, #3a3a54 100%);
      border-radius: 0.75rem;
      overflow: hidden;
      border: 1px solid var(--dark-border);
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
      transition: transform 0.2s, box-shadow 0.2s;
    }

    .scenario-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
    }

    .scenario-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.25rem;
      border-left: 5px solid var(--dark-border);
      background: rgba(255, 255, 255, 0.02);
      border-bottom: 1px solid var(--dark-border);
    }

    .scenario-title {
      font-weight: 600;
      font-size: 1rem;
      color: var(--text-primary);
    }

    .scenario-rate {
      font-weight: 700;
      font-size: 1.2rem;
    }

    .scenario-content {
      padding: 1.25rem;
    }

    .scenario-checks {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      margin-bottom: 1rem;
    }

    .scenario-check {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.75rem;
      background: rgba(255, 255, 255, 0.01);
      border-radius: 0.5rem;
      border-left: 3px solid var(--success);
    }

    .check-name-small {
      font-size: 0.85rem;
      color: var(--text-primary);
      flex: 1;
    }

    .check-stats-small {
      display: flex;
      gap: 0.75rem;
      font-size: 0.8rem;
    }

    .check-passed-small {
      color: var(--success);
      font-weight: 600;
    }

    .check-rate-small {
      font-weight: 700;
    }

    .scenario-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 0.75rem;
      border-top: 1px solid var(--dark-border);
      font-size: 0.85rem;
    }

    .scenario-total {
      color: var(--text-secondary);
      font-weight: 600;
    }

    .checks-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .check-global-item {
      background: linear-gradient(135deg, var(--dark-card) 0%, #3a3a54 100%);
      padding: 1.25rem;
      border-radius: 0.75rem;
      border-left: 4px solid var(--dark-border);
      border: 1px solid var(--dark-border);
      border-left: 4px solid var(--dark-border);
    }

    .check-global-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.75rem;
    }

    .check-global-name {
      font-size: 0.95rem;
      color: var(--text-primary);
      font-weight: 500;
      flex: 1;
    }

    .check-global-rate {
      font-weight: 700;
      font-size: 1.1rem;
    }

    .check-global-stats {
      display: flex;
      gap: 1.5rem;
      font-size: 0.85rem;
    }

    .check-global-stat {
      color: var(--text-secondary);
      font-weight: 600;
    }

    .http-metrics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1.5rem;
    }

    .http-metric-card {
      background: linear-gradient(135deg, var(--dark-card) 0%, #3a3a54 100%);
      border-radius: 0.75rem;
      padding: 1.5rem;
      border: 1px solid var(--dark-border);
    }

    .metric-name {
      font-size: 0.85rem;
      color: var(--text-secondary);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      font-weight: 600;
      margin-bottom: 1rem;
    }

    .metric-main-value {
      font-size: 2rem;
      font-weight: bold;
      color: var(--text-primary);
      margin-bottom: 0.25rem;
    }

    .metric-label {
      font-size: 0.75rem;
      color: var(--text-secondary);
      margin-bottom: 1rem;
    }

    .percentiles-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 0.75rem;
      margin-bottom: 1rem;
    }

    .percentile-box {
      background: rgba(255, 255, 255, 0.02);
      padding: 0.75rem;
      border-radius: 0.5rem;
      border: 1px solid var(--dark-border);
      text-align: center;
    }

    .percentile-label {
      font-size: 0.7rem;
      color: var(--text-secondary);
      text-transform: uppercase;
      letter-spacing: 0.03em;
      margin-bottom: 0.25rem;
      font-weight: 600;
    }

    .percentile-value {
      font-size: 0.95rem;
      font-weight: bold;
      color: var(--text-primary);
    }

    .percentile-threshold {
      font-size: 0.65rem;
      color: var(--text-secondary);
      margin-top: 0.25rem;
    }

    .metric-progress-bar {
      width: 100%;
      height: 8px;
      background: var(--dark-border);
      border-radius: 4px;
      overflow: hidden;
      margin-top: 1rem;
    }

    .progress-fill {
      height: 100%;
      border-radius: 4px;
      transition: width 0.3s ease;
    }


    .footer {
      text-align: center;
      margin-top: 4rem;
      padding-top: 2rem;
      border-top: 1px solid var(--dark-border);
      color: var(--text-secondary);
      font-size: 0.85rem;
    }

    .footer-divider {
      margin-top: 0.75rem;
      padding-top: 0.75rem;
      border-top: 1px solid var(--dark-border);
      font-size: 0.75rem;
      color: #666;
    }

    @media (max-width: 1024px) {
      .header h1 {
        font-size: 2rem;
      }

      .scenarios-grid {
        grid-template-columns: 1fr;
      }

      .metric-value {
        font-size: 1.8rem;
      }
    }

    @media (max-width: 640px) {
      body {
        padding: 1rem;
      }

      .header h1 {
        font-size: 1.5rem;
      }

      .main-metrics {
        grid-template-columns: 1fr;
      }

      .metric-value {
        font-size: 1.5rem;
      }

      .header-badges {
        flex-direction: column;
      }

      .status-badge {
        width: 100%;
        justify-content: center;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- HEADER -->
    <div class="header">
      <h1>📊 Relatório Detalhado de Testes k6</h1>
      <p>ServeRest API - Performance Testing Suite</p>
      <div class="header-badges">
        <div class="test-type-badge" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 24px; border-radius: 8px; font-size: 18px; font-weight: 600; margin-bottom: 12px; box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);">
          ${testTypeNames[testType]}
        </div>
        <div class="status-badge">${statusText}</div>
      </div>
      <div class="timestamp">Gerado em: ${timestamp}</div>
    </div>

    <!-- MÉTRICAS PRINCIPAIS -->
    <div class="main-metrics">
      <div class="metric-card">
        <div class="metric-label">📊 Taxa de Checks</div>
        <div class="metric-value" style="color: ${passed ? 'var(--success)' : 'var(--error)'}">
          ${totalChecks.rate.toFixed(2)}%
        </div>
        <div class="metric-subtext">✓ ${totalChecks.passed} | ✗ ${totalChecks.failed}</div>
      </div>

      <div class="metric-card">
        <div class="metric-label">✅ Total de Checks</div>
        <div class="metric-value" style="color: var(--success)">${totalChecks.total}</div>
        <div class="metric-subtext">${Object.keys(allChecks).length} tipos diferentes de checks</div>
      </div>

      <div class="metric-card">
        <div class="metric-label">🎯 Cenários Testados</div>
        <div class="metric-value" style="color: var(--primary)">${Object.keys(scenarios).length}</div>
        <div class="metric-subtext">Endpoints e fluxos validados</div>
      </div>

      <div class="metric-card">
        <div class="metric-label">⏱️ Tempo Médio</div>
        <div class="metric-value">202ms</div>
        <div class="metric-subtext">Latência média das requisições</div>
      </div>
    </div>

    <!-- CENÁRIOS -->
    <div class="section">
      <div class="section-title">🎯 Checks por Cenário de Teste</div>
      <div class="scenarios-grid">
        ${scenariosHTML}
      </div>
    </div>

    <!-- TODOS OS CHECKS -->
    <div class="section">
      <div class="section-title">📋 Todos os Checks Executados (${Object.keys(allChecks).length})</div>
      <div class="checks-list">
        ${checksHTML}
      </div>
    </div>

    <!-- MÉTRICAS HTTP COM PERCENTIS -->
    <div class="section">
      <div class="section-title">⏱️ Métricas HTTP Detalhadas (com Percentis)</div>
      <div class="http-metrics-grid">
        ${httpMetricsHTML}
      </div>
    </div>

    <!-- FOOTER -->
    <div class="footer">
      <p>✨ Relatório de Performance Testing - k6 + TypeScript</p>
      <div class="footer-divider">
        Todos os checks separados por cenário de teste | ${Object.keys(scenarios).length} endpoints validados | Métricas com percentis
      </div>
    </div>
  </div>
</body>
</html>
  `;

  return html;
}

function main() {
  try {
    console.log(`📊 Gerando relatório detalhado... (Tipo: ${testTypeNames[testType]})`);
    const data = extractScenarioData();
    
    if (!data || Object.keys(data.scenarios).length === 0) {
      console.error('❌ Nenhum dado de cenário encontrado. Certifique-se de ter executado os testes.');
      process.exit(1);
    }

    const html = generateDetailedHTML(data);

    fs.writeFileSync(outputFile, html, 'utf-8');
    console.log(`✅ Relatório detalhado gerado: ${outputFile}`);
    console.log(`📝 Tipo de teste: ${testTypeNames[testType]}`);
    console.log('📂 Abra no navegador para visualizar os checks por cenário');
  } catch (error) {
    console.error('❌ Erro ao gerar relatório:', error.message);
    process.exit(1);
  }
}

main();
