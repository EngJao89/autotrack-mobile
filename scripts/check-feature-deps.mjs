#!/usr/bin/env node
/**
 * Lightweight import-boundary check for feature-first architecture (ATP-7).
 * Does not require extra dependencies.
 */

import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(process.cwd(), 'src');
const IMPORT_RE = /from\s+['"](@\/[^'"]+|(\.\.?\/[^'"]+))['"]/g;

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.')) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, files);
    else if (/\.(ts|tsx)$/.test(entry.name) && !entry.name.endsWith('.test.ts')) {
      files.push(full);
    }
  }
  return files;
}

function toAlias(filePath) {
  const rel = path.relative(ROOT, filePath).split(path.sep).join('/');
  return `@/${rel.replace(/\.(tsx|ts)$/, '')}`;
}

function layerOf(aliasPath) {
  const p = aliasPath.replace(/^@\//, '');
  if (p.startsWith('app/') || p === 'app') return 'app';
  if (p.startsWith('features/')) return 'features';
  if (p.startsWith('services/')) return 'services';
  if (p.startsWith('config/')) return 'config';
  if (p.startsWith('theme/')) return 'theme';
  if (p.startsWith('components/')) return 'components';
  if (p.startsWith('hooks/')) return 'hooks';
  if (p.startsWith('types/')) return 'types';
  if (p.startsWith('constants/')) return 'constants';
  return 'other';
}

function featureName(aliasPath) {
  const m = aliasPath.replace(/^@\//, '').match(/^features\/([^/]+)/);
  return m?.[1] ?? null;
}

function resolveImport(fromFile, spec) {
  if (spec.startsWith('@/')) {
    return spec.replace(/\.(tsx|ts)$/, '');
  }
  const base = path.dirname(fromFile);
  let resolved = path.resolve(base, spec);
  const candidates = [
    resolved,
    `${resolved}.ts`,
    `${resolved}.tsx`,
    path.join(resolved, 'index.ts'),
    path.join(resolved, 'index.tsx'),
  ];
  for (const c of candidates) {
    if (fs.existsSync(c) && fs.statSync(c).isFile()) {
      return toAlias(c);
    }
  }
  // Unresolved relative — ignore
  return null;
}

const files = walk(ROOT);
const edges = [];
const violations = [];

for (const file of files) {
  const fromAlias = toAlias(file);
  const fromLayer = layerOf(fromAlias);
  const source = fs.readFileSync(file, 'utf8');
  let match;
  while ((match = IMPORT_RE.exec(source))) {
    const spec = match[1];
    const toAliasPath = resolveImport(file, spec);
    if (!toAliasPath || !toAliasPath.startsWith('@/')) continue;

    const toLayer = layerOf(toAliasPath);
    edges.push([fromAlias, toAliasPath]);

    const infra = ['services', 'config', 'theme', 'components', 'hooks', 'types', 'constants'];
    if (infra.includes(fromLayer) && (toLayer === 'features' || toLayer === 'app')) {
      violations.push(`${fromAlias} → ${toAliasPath} (infra não pode importar ${toLayer})`);
    }
    if (fromLayer === 'features' && toLayer === 'app') {
      violations.push(`${fromAlias} → ${toAliasPath} (feature não pode importar app)`);
    }

    const fromFeature = featureName(fromAlias);
    const toFeature = featureName(toAliasPath);
    if (
      fromFeature &&
      toFeature &&
      fromFeature !== toFeature &&
      !toAliasPath.startsWith(`@/features/${toFeature}`) === false
    ) {
      // Cross-feature: only allow barrel @/features/X (exact feature root index)
      const allowed = toAliasPath === `@/features/${toFeature}`;
      // Also allow @/features/X/... only if it's the public entry; enforce barrel-only
      if (!allowed && toAliasPath.startsWith(`@/features/${toFeature}/`)) {
        violations.push(
          `${fromAlias} → ${toAliasPath} (use API pública @/features/${toFeature})`
        );
      }
    }
  }
}

// Cycle detection among feature roots (coarse)
const featureGraph = new Map();
for (const [from, to] of edges) {
  const a = featureName(from);
  const b = featureName(to);
  if (!a || !b || a === b) continue;
  if (!featureGraph.has(a)) featureGraph.set(a, new Set());
  featureGraph.get(a).add(b);
}

function hasCycle() {
  const visiting = new Set();
  const visited = new Set();
  function dfs(node) {
    if (visiting.has(node)) return true;
    if (visited.has(node)) return false;
    visiting.add(node);
    for (const next of featureGraph.get(node) ?? []) {
      if (dfs(next)) return true;
    }
    visiting.delete(node);
    visited.add(node);
    return false;
  }
  for (const node of featureGraph.keys()) {
    if (dfs(node)) return true;
  }
  return false;
}

if (hasCycle()) {
  violations.push('Ciclo detectado entre features');
}

if (violations.length) {
  console.error('Boundary violations:\n' + violations.map((v) => ` - ${v}`).join('\n'));
  process.exit(1);
}

console.log(
  `OK: ${files.length} files, ${edges.length} imports checked; no infra→feature/app or feature→app violations; no feature cycles.`
);
