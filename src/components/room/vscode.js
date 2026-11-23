// The desk monitor: a VS Code-style editor that types real-looking code for the selected project, a terminal
// that runs it, and a live preview pane that hot-reloads when the file is "saved". Drawn into a 2D canvas that
// is used as a texture; `drawEditor` is pure (state in, pixels out) so it can be called at a low frame rate.

const W = 1024;
const H = 640;
const MONO = '"JetBrains Mono", "SFMono-Regular", Menlo, Consolas, monospace';
const UI = '"Space Grotesk", system-ui, sans-serif';

const C = {
  bg: '#1e1f22', side: '#18191b', bar: '#151617', border: '#2b2d31', text: '#cdd1d6', dim: '#7b8088',
  line: '#5a5f68', select: '#2c3a4f', keyword: '#c586c0', string: '#ce9178', fn: '#dcdcaa', type: '#4ec9b0',
  number: '#b5cea8', comment: '#6a9955', tag: '#569cd6', attr: '#9cdcfe', punct: '#d4d4d4', accent: '#3794ff',
};

/* ---------------- code snippets per stack ---------------- */

const kebab = (value) => value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
const pascal = (value) => value.replace(/[^A-Za-z0-9 ]/g, ' ').split(' ').filter(Boolean).map((part) => part[0].toUpperCase() + part.slice(1)).join('');

function snippetFor(project) {
  const stack = project.stack.join(' ').toLowerCase();
  const name = pascal(project.title.split('&')[0].trim()) || 'App';
  const summary = project.summary.split('. ')[0].replace(/'/g, '’').slice(0, 64);
  if (stack.includes('make.com')) {
    return {
      file: 'scenario.ts', lang: 'ts', folder: kebab(project.title), kind: 'flow',
      tree: ['scenario.ts', 'prompts/', 'classify.md', 'router.ts', 'airtable.ts', '.env.example'],
      code: [
        `// ${project.title}: webhook → AI → router`,
        "import { webhook, openai, router } from './make';",
        '',
        'export const intake = webhook(\'/inquiry\')',
        '  .then(async (lead) => {',
        '    const result = await openai.json({',
        "      model: 'gpt-4o-mini',",
        "      schema: { intent: 'string', urgency: 'low|high' },",
        '      input: lead.message,',
        '    });',
        '    return { ...lead, ...result };',
        '  })',
        '  .then(router({',
        "    urgent: (l) => l.urgency === 'high',",
        "    sales: (l) => l.intent === 'quote',",
        '  }))',
        '  .onError(retry({ times: 3, backoff: 2_000 }));',
        '',
        '// a person approves every AI-drafted reply',
        'export const approval = requireHumanApproval();',
      ],
    };
  }
  if (stack.includes('kotlin')) {
    return {
      file: 'MainActivity.kt', lang: 'kt', folder: kebab(project.title), kind: 'phone',
      tree: ['app/', 'MainActivity.kt', 'ui/', 'Theme.kt', 'agent/', 'build.gradle.kts'],
      code: [
        `package dev.jazz.${kebab(project.title).replace(/-/g, '')}`,
        '',
        'class MainActivity : ComponentActivity() {',
        '  override fun onCreate(state: Bundle?) {',
        '    super.onCreate(state)',
        '    setContent {',
        `      ${name}Theme {`,
        `        ${name}Screen(viewModel())`,
        '      }',
        '    }',
        '  }',
        '}',
        '',
        '@Composable',
        `fun ${name}Screen(vm: ${name}ViewModel) {`,
        '  val state by vm.state.collectAsState()',
        '  Scaffold(topBar = { TopBar(state.title) }) { pad ->',
        '    LazyColumn(Modifier.padding(pad)) {',
        '      items(state.items) { ItemCard(it) }',
        '    }',
        '  }',
        '}',
      ],
    };
  }
  if (stack.includes('flutter')) {
    return {
      file: 'main.dart', lang: 'dart', folder: kebab(project.title), kind: 'phone',
      tree: ['lib/', 'main.dart', 'screens/', 'home.dart', 'pubspec.yaml', 'test/'],
      code: [
        "import 'package:flutter/material.dart';",
        "import 'package:flutter_riverpod/flutter_riverpod.dart';",
        '',
        'void main() => runApp(const ProviderScope(child: App()));',
        '',
        'class App extends StatelessWidget {',
        '  const App({super.key});',
        '',
        '  @override',
        '  Widget build(BuildContext context) {',
        '    return MaterialApp(',
        `      title: '${project.title}',`,
        '      theme: ThemeData(useMaterial3: true),',
        '      home: const HomeScreen(),',
        '    );',
        '  }',
        '}',
        '',
        `// ${summary}`,
      ],
    };
  }
  if (stack.includes('godot')) {
    return {
      file: 'player.gd', lang: 'gd', folder: kebab(project.title), kind: 'phone',
      tree: ['scenes/', 'player.gd', 'world.tscn', 'quests/', 'project.godot'],
      code: [
        'extends CharacterBody2D',
        '',
        '@export var speed := 120.0',
        '@onready var sprite: AnimatedSprite2D = $Sprite',
        '',
        'func _physics_process(delta: float) -> void:',
        '  var input := Input.get_vector("left", "right", "up", "down")',
        '  velocity = input * speed',
        '  move_and_slide()',
        '  if input.length() > 0.1:',
        '    sprite.play("walk")',
        '  else:',
        '    sprite.play("idle")',
        '',
        'func _on_guardian_defeated() -> void:',
        '  Quests.complete("petal_shrine")',
      ],
    };
  }
  if (stack.includes('hono') || stack.includes('express') || stack.includes('mcp')) {
    const hono = !stack.includes('express');
    return {
      file: hono ? 'server.ts' : 'app.ts', lang: 'ts', folder: kebab(project.title), kind: 'web',
      tree: ['src/', hono ? 'server.ts' : 'app.ts', 'routes/', 'db.ts', 'auth.ts', 'package.json'],
      code: [
        hono ? "import { Hono } from 'hono';" : "import express from 'express';",
        "import { db } from './db';",
        "import { requireUser } from './auth';",
        '',
        hono ? 'const app = new Hono();' : 'const app = express();',
        '',
        `// ${summary}`,
        "app.get('/api/health', (c) => c.json({ ok: true }));",
        '',
        "app.post('/api/items', requireUser, async (c) => {",
        '  const body = await c.req.json();',
        '  const item = await db.transaction(async (tx) => {',
        '    const row = await tx.insert(items).values(body);',
        "    await audit(tx, 'item.created', row.id);",
        '    return row;',
        '  });',
        '  return c.json(item, 201);',
        '});',
        '',
        'export default app;',
      ],
    };
  }
  return {
    file: 'page.tsx', lang: 'tsx', folder: kebab(project.title), kind: 'web',
    tree: ['app/', 'page.tsx', 'layout.tsx', 'components/', 'lib/', 'package.json'],
    code: [
      "import { Hero } from '@/components/hero';",
      "import { getProjects } from '@/lib/data';",
      '',
      `export default async function ${name}() {`,
      '  const items = await getProjects();',
      '  return (',
      '    <main className="mx-auto max-w-5xl">',
      `      <Hero title="${project.title}" />`,
      '      <section className="grid gap-4">',
      '        {items.map((item) => (',
      '          <Card key={item.id} {...item} />',
      '        ))}',
      '      </section>',
      '    </main>',
      '  );',
      '}',
      '',
      `// ${summary}`,
    ],
  };
}

/* ---------------- tiny syntax highlighter ---------------- */

const KEYWORDS = new Set(('import from export default const let var async await return function class extends override fun val by '
  + 'package new if else true false null void static super this func onready export var for in of package @Composable @override '
  + 'type interface await then extends').split(' '));

function tokenize(line, lang) {
  const tokens = [];
  const pattern = /(\/\/.*$|#.*$)|('[^']*'?|"[^"]*"?|`[^`]*`?)|(<\/?[A-Za-z][\w.]*|\/?>)|(@?[A-Za-z_][\w$]*)|(\d[\d_.]*)|(\s+)|(.)/g;
  let match;
  let previous = '';
  while ((match = pattern.exec(line))) {
    const [text, comment, string, tag, word, number, space] = match;
    let color = C.punct;
    if (comment && (comment.startsWith('//') || (lang === 'gd' && comment.startsWith('#')))) color = C.comment;
    else if (comment) color = C.punct;
    else if (string) color = C.string;
    else if (tag && (lang === 'tsx')) color = C.tag;
    else if (word) {
      const next = line[match.index + text.length];
      if (KEYWORDS.has(word)) color = C.keyword;
      else if (/^[A-Z]/.test(word)) color = C.type;
      else if (next === '(') color = C.fn;
      else if (previous === '.' || next === ':' || next === '=') color = C.attr;
      else color = '#9cdcfe';
    } else if (number) color = C.number;
    else if (space) color = null;
    if (tag && lang !== 'tsx') color = C.punct;
    tokens.push([text, color]);
    if (!space) previous = text;
  }
  return tokens;
}

/* ---------------- drawing helpers ---------------- */

function rr(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function text(ctx, value, x, y, color, font, align = 'left') {
  ctx.fillStyle = color;
  ctx.font = font;
  ctx.textAlign = align;
  ctx.fillText(value, x, y);
}

function fileColor(name) {
  if (name.endsWith('/')) return '#c09553';
  if (/\.(tsx?|js)$/.test(name)) return '#3178c6';
  if (name.endsWith('.kt') || name.endsWith('.kts')) return '#a97bff';
  if (name.endsWith('.dart')) return '#40c4ff';
  if (name.endsWith('.gd') || name.endsWith('.godot') || name.endsWith('.tscn')) return '#478cbf';
  if (name.endsWith('.md')) return '#519aba';
  if (name.endsWith('.json') || name.endsWith('.yaml')) return '#cbcb41';
  return '#8a8f98';
}

// Activity-bar icons, drawn as simple strokes.
function icon(ctx, kind, x, y, active) {
  ctx.strokeStyle = active ? '#e6e6e6' : '#6e737b';
  ctx.lineWidth = 2;
  ctx.beginPath();
  if (kind === 0) { ctx.rect(x - 7, y - 9, 12, 16); ctx.moveTo(x - 3, y - 13); ctx.lineTo(x + 9, y - 13); ctx.lineTo(x + 9, y + 3); }
  if (kind === 1) { ctx.arc(x - 2, y - 2, 6, 0, Math.PI * 2); ctx.moveTo(x + 3, y + 3); ctx.lineTo(x + 9, y + 9); }
  if (kind === 2) { ctx.arc(x - 5, y - 7, 3, 0, Math.PI * 2); ctx.moveTo(x - 5, y - 4); ctx.lineTo(x - 5, y + 8); ctx.moveTo(x + 6, y - 4); ctx.arc(x + 6, y - 7, 3, Math.PI / 2, Math.PI * 2.5); ctx.moveTo(x + 6, y - 4); ctx.quadraticCurveTo(x + 6, y + 2, x - 5, y + 4); }
  if (kind === 3) { ctx.moveTo(x - 6, y - 9); ctx.lineTo(x + 8, y); ctx.lineTo(x - 6, y + 9); ctx.closePath(); }
  if (kind === 4) { ctx.rect(x - 9, y - 1, 8, 8); ctx.rect(x + 1, y - 1, 8, 8); ctx.rect(x - 9, y - 11, 8, 8); ctx.rect(x + 3, y - 13, 7, 7); }
  ctx.stroke();
}

/* ---------------- preview pane ---------------- */

function drawPreview(ctx, project, snippet, x, y, w, h, state, image) {
  const { flash, built, time } = state;
  ctx.fillStyle = '#202124';
  ctx.fillRect(x, y, w, h);
  // Pane header (VS Code "Simple Browser" style)
  ctx.fillStyle = C.bar;
  ctx.fillRect(x, y, w, 30);
  text(ctx, '▶ RUN  ·  PREVIEW', x + 14, y + 20, C.dim, `600 11px ${UI}`);
  ctx.fillStyle = built ? '#3fb950' : '#d29922';
  ctx.beginPath();
  ctx.arc(x + w - 18, y + 15, 4, 0, Math.PI * 2);
  ctx.fill();
  // URL bar
  ctx.fillStyle = '#2b2d31';
  rr(ctx, x + 12, y + 40, w - 24, 24, 12);
  ctx.fill();
  const url = snippet.kind === 'phone' ? 'emulator-5554 · Pixel 8' : snippet.kind === 'flow' ? 'make.com/scenarios/run' : 'localhost:3000';
  text(ctx, url, x + 28, y + 56, '#aab0b8', `500 12px ${UI}`);
  // Hot-reload progress line
  if (flash > 0) {
    ctx.fillStyle = project.color;
    ctx.fillRect(x + 12, y + 66, (w - 24) * (1 - flash), 2);
  }
  const top = y + 76;
  const area = { x: x + 12, y: top, w: w - 24, h: h - (top - y) - 12 };
  ctx.save();
  rr(ctx, area.x, area.y, area.w, area.h, 10);
  ctx.clip();
  ctx.fillStyle = '#f5f3ef';
  ctx.fillRect(area.x, area.y, area.w, area.h);

  if (snippet.kind === 'phone') {
    ctx.fillStyle = '#e9e6e1';
    ctx.fillRect(area.x, area.y, area.w, area.h);
    const pw = Math.min(area.w * 0.56, area.h * 0.5);
    const ph = pw * 2.05;
    const px = area.x + (area.w - pw) / 2;
    const py = area.y + (area.h - ph) / 2;
    ctx.fillStyle = '#111';
    rr(ctx, px - 6, py - 6, pw + 12, ph + 12, 26);
    ctx.fill();
    ctx.save();
    rr(ctx, px, py, pw, ph, 20);
    ctx.clip();
    if (image) {
      const scale = Math.max(pw / image.width, ph / image.height);
      ctx.drawImage(image, px + (pw - image.width * scale) / 2, py + (ph - image.height * scale) / 2, image.width * scale, image.height * scale);
    } else {
      mockApp(ctx, project, px, py, pw, ph, time, true);
    }
    ctx.restore();
  } else if (snippet.kind === 'flow') {
    flowDiagram(ctx, project, area, time);
  } else if (image) {
    const scale = Math.max(area.w / image.width, area.h / image.height);
    ctx.drawImage(image, area.x + (area.w - image.width * scale) / 2, area.y, image.width * scale, image.height * scale);
  } else {
    mockApp(ctx, project, area.x, area.y, area.w, area.h, time, false);
  }
  if (flash > 0) {
    ctx.fillStyle = `rgba(255,255,255,${flash * 0.55})`;
    ctx.fillRect(area.x, area.y, area.w, area.h);
  }
  ctx.restore();
}

function mockApp(ctx, project, x, y, w, h, time, phone) {
  ctx.fillStyle = '#faf8f5';
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = project.color;
  ctx.fillRect(x, y, w, phone ? 54 : 40);
  text(ctx, project.title, x + 14, y + (phone ? 38 : 26), '#fff', `700 ${phone ? 14 : 15}px ${UI}`);
  const pad = 12;
  const cols = phone ? 1 : 2;
  const cardW = (w - pad * (cols + 1)) / cols;
  for (let i = 0; i < (phone ? 5 : 6); i += 1) {
    const cx = x + pad + (i % cols) * (cardW + pad);
    const cy = y + (phone ? 66 : 54) + Math.floor(i / cols) * (phone ? 54 : 64);
    const pulse = 0.5 + 0.5 * Math.sin(time * 2 + i);
    ctx.fillStyle = '#ffffff';
    rr(ctx, cx, cy, cardW, phone ? 44 : 52, 8);
    ctx.fill();
    ctx.fillStyle = `${project.color}${i === 0 ? 'ff' : '55'}`;
    rr(ctx, cx + 8, cy + 8, 26, 26, 6);
    ctx.fill();
    ctx.fillStyle = '#d9d5cf';
    ctx.fillRect(cx + 42, cy + 12, cardW * 0.5, 7);
    ctx.fillStyle = '#ebe7e1';
    ctx.fillRect(cx + 42, cy + 25, cardW * (0.25 + pulse * 0.2), 6);
  }
}

function flowDiagram(ctx, project, area, time) {
  ctx.fillStyle = '#f3f1ee';
  ctx.fillRect(area.x, area.y, area.w, area.h);
  ctx.fillStyle = '#e4e0da';
  for (let gx = area.x + 10; gx < area.x + area.w; gx += 18) for (let gy = area.y + 10; gy < area.y + area.h; gy += 18) ctx.fillRect(gx, gy, 1.5, 1.5);
  const nodes = [
    ['Webhook', '#7a5cf0', 0.16, 0.3], ['OpenAI', '#10a37f', 0.42, 0.3], ['Router', '#e8a33d', 0.68, 0.3],
    ['Airtable', '#2d7ff9', 0.86, 0.12], ['Gmail', '#ea4335', 0.86, 0.48], ['Approve', project.color, 0.5, 0.75],
  ];
  const at = (n) => [area.x + n[2] * area.w, area.y + 30 + n[3] * (area.h - 60)];
  const links = [[0, 1], [1, 2], [2, 3], [2, 4], [4, 5]];
  ctx.lineWidth = 2;
  links.forEach(([a, b], index) => {
    const [ax, ay] = at(nodes[a]);
    const [bx, by] = at(nodes[b]);
    ctx.strokeStyle = '#c9c3ba';
    ctx.beginPath();
    ctx.moveTo(ax, ay);
    ctx.lineTo(bx, by);
    ctx.stroke();
    const t = (time * 0.6 + index * 0.2) % 1;
    ctx.fillStyle = project.color;
    ctx.beginPath();
    ctx.arc(ax + (bx - ax) * t, ay + (by - ay) * t, 3.5, 0, Math.PI * 2);
    ctx.fill();
  });
  nodes.forEach((n) => {
    const [nx, ny] = at(n);
    ctx.fillStyle = n[1];
    ctx.beginPath();
    ctx.arc(nx, ny, 22, 0, Math.PI * 2);
    ctx.fill();
    text(ctx, n[0], nx, ny + 38, '#4a4540', `600 11px ${UI}`, 'center');
  });
}

/* ---------------- main draw ---------------- */

export function createEditorState(project) {
  return { project, snippet: snippetFor(project), typed: 0, hold: 0, flash: 0, built: false, terminal: [], time: 0, cycle: 0, saved: false };
}

// Advance the animation. `typing` is true while the person at the desk is typing (code only grows then).
export function stepEditor(state, delta, typing) {
  state.time += delta;
  const total = state.snippet.code.join('\n').length;
  state.flash = Math.max(0, state.flash - delta * 1.4);
  if (state.typed < total) {
    state.typed = Math.min(total, state.typed + delta * (typing ? 1 : 0.6) * (18 + 14 * Math.random()));
    state.saved = false;
    if (state.terminal.length === 0) state.terminal = ['$ npm run dev', `> ${state.snippet.folder}@1.0.0 dev`, 'ready - started server on http://localhost:3000'];
  } else if (!state.saved) {
    state.saved = true;
    state.flash = 1;
    state.built = true;
    state.hold = 0;
    const ms = 180 + Math.round(Math.random() * 420);
    state.terminal.push(`✓ Compiled ${state.snippet.file} in ${ms} ms`);
    if (state.terminal.length > 6) state.terminal = state.terminal.slice(-6);
  } else {
    state.hold += delta;
    if (state.hold > 6) {
      state.cycle += 1;
      state.typed = 0;
      state.terminal.push(`$ git commit -m "feat: ${state.snippet.file.split('.')[0]} v${state.cycle + 1}"`);
      if (state.terminal.length > 6) state.terminal = state.terminal.slice(-6);
    }
  }
}

export function drawEditor(canvas, state, { image, index, total }) {
  const ctx = canvas.getContext('2d');
  const { project, snippet } = state;
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = C.bg;
  ctx.fillRect(0, 0, W, H);

  // Title bar
  ctx.fillStyle = C.bar;
  ctx.fillRect(0, 0, W, 26);
  ['#ff5f57', '#febc2e', '#28c840'].forEach((color, dot) => {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(16 + dot * 18, 13, 5, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.fillStyle = '#25272b';
  rr(ctx, W / 2 - 170, 4, 340, 18, 6);
  ctx.fill();
  text(ctx, `${snippet.folder} — Visual Studio Code`, W / 2, 17, C.dim, `500 11px ${UI}`, 'center');
  text(ctx, `${String(index + 1).padStart(2, '0')} / ${String(total).padStart(2, '0')}`, W - 14, 17, C.dim, `600 11px ${UI}`, 'right');

  // Activity bar
  ctx.fillStyle = C.side;
  ctx.fillRect(0, 26, 40, H - 48);
  [0, 1, 2, 3, 4].forEach((kind) => icon(ctx, kind, 20, 56 + kind * 40, kind === 0));
  ctx.fillStyle = '#e6e6e6';
  ctx.fillRect(0, 42, 2, 28);

  // Explorer
  const sideW = 170;
  ctx.fillStyle = C.side;
  ctx.fillRect(40, 26, sideW, H - 48);
  ctx.fillStyle = C.border;
  ctx.fillRect(40 + sideW, 26, 1, H - 48);
  text(ctx, 'EXPLORER', 54, 46, C.dim, `600 10px ${UI}`);
  text(ctx, `▾ ${snippet.folder.toUpperCase()}`.slice(0, 24), 50, 68, C.text, `700 10px ${UI}`);
  snippet.tree.forEach((name, row) => {
    const y = 90 + row * 21;
    const nested = !name.endsWith('/') && row > 0;
    const active = name === snippet.file;
    if (active) {
      ctx.fillStyle = C.select;
      ctx.fillRect(41, y - 14, sideW - 1, 20);
    }
    const x = nested ? 74 : 60;
    ctx.fillStyle = fileColor(name);
    rr(ctx, x, y - 9, 9, 10, 2);
    ctx.fill();
    text(ctx, name, x + 15, y, active ? '#ffffff' : C.text, `${active ? 600 : 400} 12px ${UI}`);
  });
  // Outline / timeline headers at the bottom
  text(ctx, '› OUTLINE', 50, H - 64, C.dim, `600 10px ${UI}`);
  text(ctx, '› TIMELINE', 50, H - 44, C.dim, `600 10px ${UI}`);

  // Editor column
  const ex = 40 + sideW + 1;
  const previewW = 340;
  const ew = W - ex - previewW;
  ctx.fillStyle = C.bar;
  ctx.fillRect(ex, 26, ew, 30);
  ctx.fillStyle = C.bg;
  ctx.fillRect(ex, 26, 150, 30);
  ctx.fillStyle = project.color;
  ctx.fillRect(ex, 26, 150, 2);
  ctx.fillStyle = fileColor(snippet.file);
  rr(ctx, ex + 12, 36, 9, 10, 2);
  ctx.fill();
  text(ctx, snippet.file, ex + 28, 46, '#ffffff', `500 12px ${UI}`);
  text(ctx, state.saved ? '×' : '●', ex + 136, 46, C.dim, `600 12px ${UI}`, 'center');
  text(ctx, 'README.md', ex + 172, 46, C.dim, `400 12px ${UI}`);
  text(ctx, `${snippet.folder} › src › ${snippet.file}`, ex + 14, 72, C.dim, `400 11px ${UI}`);

  // Code with typing cursor
  const codeTop = 92;
  const lineH = 17;
  const panelTop = 456;
  let remaining = Math.floor(state.typed);
  let cursor = null;
  ctx.font = `13px ${MONO}`;
  const charW = ctx.measureText('m').width;
  const maxLines = Math.floor((panelTop - codeTop - 8) / lineH);
  const lines = snippet.code;
  const typedLines = [];
  for (let i = 0; i < lines.length; i += 1) {
    if (remaining <= 0 && i > 0) break;
    const visible = lines[i].slice(0, Math.max(0, remaining));
    typedLines.push(visible);
    if (remaining <= lines[i].length) { cursor = [i, visible.length]; remaining = 0; break; }
    remaining -= lines[i].length + 1;
  }
  if (!cursor) cursor = [typedLines.length - 1, (typedLines[typedLines.length - 1] || '').length];
  const scroll = Math.max(0, cursor[0] - maxLines + 3);
  for (let i = scroll; i < Math.min(typedLines.length, scroll + maxLines); i += 1) {
    const y = codeTop + (i - scroll + 1) * lineH;
    if (i === cursor[0]) {
      ctx.fillStyle = '#26282d';
      ctx.fillRect(ex, y - 13, ew - 56, lineH);
    }
    text(ctx, String(i + 1).padStart(2, ' '), ex + 30, y, i === cursor[0] ? '#c6c6c6' : C.line, `12px ${MONO}`, 'right');
    let x = ex + 46;
    tokenize(typedLines[i], snippet.lang).forEach(([value, color]) => {
      if (color) text(ctx, value, x, y, color, `13px ${MONO}`);
      x += value.length * charW;
    });
  }
  // Blinking cursor
  if (Math.sin(state.time * 8) > -0.2 || !state.saved) {
    const cy = codeTop + (cursor[0] - scroll + 1) * lineH;
    ctx.fillStyle = '#aeafad';
    ctx.fillRect(ex + 46 + cursor[1] * charW, cy - 12, 2, 15);
  }
  // Minimap
  ctx.fillStyle = '#1b1c1f';
  ctx.fillRect(ex + ew - 52, 56, 52, panelTop - 56);
  lines.forEach((line, i) => {
    const typed = i < typedLines.length;
    ctx.fillStyle = typed ? 'rgba(200,205,215,0.35)' : 'rgba(200,205,215,0.1)';
    ctx.fillRect(ex + ew - 46 + (line.length - line.trimStart().length) * 0.8, 62 + i * 4, Math.min(40, line.trim().length * 0.8), 2);
  });
  ctx.fillStyle = 'rgba(255,255,255,0.06)';
  ctx.fillRect(ex + ew - 52, 58 + scroll * 4, 52, maxLines * 4);

  // Terminal panel
  ctx.fillStyle = C.border;
  ctx.fillRect(ex, panelTop, ew, 1);
  ctx.fillStyle = '#1a1b1e';
  ctx.fillRect(ex, panelTop + 1, ew, H - 22 - panelTop - 1);
  ['PROBLEMS', 'OUTPUT', 'TERMINAL', 'PORTS'].forEach((tab, i) => {
    const tx = ex + 14 + i * 78;
    text(ctx, tab, tx, panelTop + 20, i === 2 ? '#e6e6e6' : C.dim, `600 10px ${UI}`);
    if (i === 2) { ctx.fillStyle = '#e6e6e6'; ctx.fillRect(tx, panelTop + 26, 56, 1); }
  });
  state.terminal.slice(-6).forEach((line, i) => {
    const color = line.startsWith('✓') ? '#3fb950' : line.startsWith('$') ? '#e6e6e6' : line.startsWith('ready') ? '#58a6ff' : C.dim;
    text(ctx, line.slice(0, 58), ex + 14, panelTop + 46 + i * 17, color, `12px ${MONO}`);
  });

  // Run / preview pane
  ctx.fillStyle = C.border;
  ctx.fillRect(W - previewW - 1, 26, 1, H - 48);
  drawPreview(ctx, project, snippet, W - previewW, 26, previewW, H - 48, state, image);

  // Status bar
  ctx.fillStyle = state.built ? '#1f6feb' : '#6e40c9';
  ctx.fillRect(0, H - 22, W, 22);
  text(ctx, '⎇ main', 12, H - 7, '#ffffff', `600 11px ${UI}`);
  text(ctx, state.saved ? '✓ 0  ⚠ 0' : '⟳ 0  ⚠ 0', 80, H - 7, '#ffffff', `500 11px ${UI}`);
  text(ctx, project.title, 160, H - 7, 'rgba(255,255,255,0.85)', `500 11px ${UI}`);
  text(ctx, `Ln ${cursor[0] + 1}, Col ${cursor[1] + 1}   Spaces: 2   UTF-8   ${snippet.lang.toUpperCase()}   ${state.built ? '● Live' : '○ Building'}`, W - 12, H - 7, '#ffffff', `500 11px ${UI}`, 'right');
}

export const EDITOR_SIZE = { width: W, height: H };
