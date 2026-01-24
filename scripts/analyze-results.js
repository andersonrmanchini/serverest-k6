#!/usr/bin/env node

/**
 * Script para analisar resultados dos testes K6
 * Extrai métricas detalhadas de checks, agrupa por cenário e gera relatório
 */

const fs = require('fs');
const path = require('path');

function analyzeResults(jsonFile) {
  if (!fs.existsSync(jsonFile)) {
    console.error(`❌ Arquivo não encontrado: ${jsonFile}`);
    process.exit(1);
  }

  const lines = fs.readFileSync(jsonFile, 'utf8').split('\n').filter(l => l.trim());
  
  // Estruturas para agrupar dados
  const checks = {};
  const metrics = {};
  const groups = {};
  const scenarios = new Set();

  // Parse NDJSON
  lines.forEach(line => {
    try {
      const data = JSON.parse(line);
      
      if (data.metric === 'checks' && data.type === 'Point') {
        const checkName = data.data.tags?.check;
        const group = data.data.tags?.group || 'default';
        const scenario = data.data.tags?.scenario || 'default';
        
        if (checkName) {
          scenarios.add(scenario);
          
          if (!checks[checkName]) {
            checks[checkName] = { passed: 0, failed: 0, groups: {} };
          }
          
          const value = data.data.value;
          if (value === 1) {
            checks[checkName].passed++;
          } else {
            checks[checkName].failed++;
          }
          
          if (!checks[checkName].groups[group]) {
            checks[checkName].groups[group] = { passed: 0, failed: 0 };
          }
          
          if (value === 1) {
            checks[checkName].groups[group].passed++;
          } else {
            checks[checkName].groups[group].failed++;
          }
        }
      }

      // Coletar outras métricas
      if (data.type === 'Point' && data.metric && !['checks', 'iterations', 'vus', 'vus_max'].includes(data.metric)) {
        const metric = data.metric;
        if (!metrics[metric]) {
          metrics[metric] = [];
        }
        metrics[metric].push(data.data.value);
      }

      // Agrupar por grupo
      if (data.data.tags?.group) {
        const grp = data.data.tags.group;
        if (!groups[grp]) {
          groups[grp] = { checks: {}, requests: 0 };
        }
        
        if (data.metric === 'http_reqs') {
          groups[grp].requests += data.data.value;
        }
        
        if (data.metric === 'checks') {
          const checkName = data.data.tags?.check;
          if (checkName) {
            if (!groups[grp].checks[checkName]) {
              groups[grp].checks[checkName] = 0;
            }
            groups[grp].checks[checkName] += data.data.value;
          }
        }
      }
    } catch (e) {
      // Ignorar linhas inválidas
    }
  });

  return { checks, metrics, groups, scenarios: Array.from(scenarios) };
}

function printReport(analysis) {
  const { checks, metrics, groups, scenarios } = analysis;
  
  console.log('\n' + '═'.repeat(80));
  console.log('📊 RELATÓRIO DETALHADO DE TESTES K6');
  console.log('═'.repeat(80));

  // === RESUMO GERAL ===
  console.log('\n📈 RESUMO GERAL DE CHECKS\n');
  
  let totalPassed = 0;
  let totalFailed = 0;
  
  Object.entries(checks).forEach(([checkName, data]) => {
    totalPassed += data.passed;
    totalFailed += data.failed;
    const total = data.passed + data.failed;
    const rate = ((data.passed / total) * 100).toFixed(2);
    const status = data.failed === 0 ? '✅' : '⚠️ ';
    console.log(`${status} ${checkName}`);
    console.log(`   Passaram: ${data.passed} | Falharam: ${data.failed} | Taxa: ${rate}%\n`);
  });

  const totalChecks = totalPassed + totalFailed;
  const totalRate = ((totalPassed / totalChecks) * 100).toFixed(2);
  console.log('─'.repeat(80));
  console.log(`📊 TOTAL: ${totalPassed}/${totalChecks} checks passaram (${totalRate}%)`);
  
  // === CHECKS POR GRUPO/CENÁRIO ===
  console.log('\n' + '═'.repeat(80));
  console.log('🎯 CHECKS POR CENÁRIO\n');
  
  Object.entries(groups).forEach(([groupName, groupData]) => {
    console.log(`\n📍 Cenário: ${groupName}`);
    console.log('─'.repeat(80));
    
    Object.entries(groupData.checks).forEach(([checkName, count]) => {
      console.log(`   ✓ ${checkName}: ${count} execuções`);
    });
  });

  // === MÉTRICAS HTTP ===
  console.log('\n' + '═'.repeat(80));
  console.log('⏱️  MÉTRICAS HTTP\n');
  
  const relevantMetrics = [
    'http_reqs',
    'http_req_duration',
    'http_req_failed',
    'http_req_waiting',
    'http_req_duration{expected_response:true}'
  ];

  relevantMetrics.forEach(metricName => {
    if (metrics[metricName] && metrics[metricName].length > 0) {
      const values = metrics[metricName].filter(v => typeof v === 'number');
      if (values.length > 0) {
        const avg = (values.reduce((a, b) => a + b, 0) / values.length).toFixed(2);
        const min = Math.min(...values).toFixed(2);
        const max = Math.max(...values).toFixed(2);
        const p95 = calculatePercentile(values, 95).toFixed(2);
        
        console.log(`📊 ${metricName}`);
        console.log(`   Média: ${avg}ms | Min: ${min}ms | Max: ${max}ms | P95: ${p95}ms`);
        console.log('');
      }
    }
  });

  // === ERROS E FALHAS ===
  console.log('\n' + '═'.repeat(80));
  console.log('⚠️  ANÁLISE DE ERROS E FALHAS\n');
  
  if (metrics['http_req_failed'] && metrics['http_req_failed'].length > 0) {
    const failedReqs = metrics['http_req_failed'].filter(v => v !== 0).length;
    const totalReqs = metrics['http_req_failed'].length;
    const failureRate = ((failedReqs / totalReqs) * 100).toFixed(2);
    
    console.log(`🔴 Requisições falhadas: ${failedReqs}/${totalReqs} (${failureRate}%)`);
    console.log('   Nota: Falhas esperadas em autenticação (401) são registradas como falhas de requisição\n');
  }

  // === STATUS FINAL ===
  console.log('═'.repeat(80));
  const allPassed = totalFailed === 0;
  const status = allPassed ? '✅ TODOS OS CHECKS PASSARAM' : '⚠️  ALGUNS CHECKS FALHARAM';
  console.log(`${status}\n`);
  console.log('═'.repeat(80));
}

function calculatePercentile(values, percentile) {
  const sorted = values.sort((a, b) => a - b);
  const index = Math.ceil((percentile / 100) * sorted.length) - 1;
  return sorted[Math.max(0, index)];
}

// Main
const resultsFile = process.argv[2] || 'test-results/results.json';
console.log(`\n📂 Analisando: ${resultsFile}`);

const analysis = analyzeResults(resultsFile);
printReport(analysis);
