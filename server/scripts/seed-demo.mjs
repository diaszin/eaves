#!/usr/bin/env node
/**
 * Popula uma instância do Eaves com dados de demonstração.
 *
 * Usa os endpoints reais da API (signup, login, schedules, appointments,
 * personal-journal e survey). Só acessa o banco diretamente para:
 *   1. promover usuários a coordinator / lobby / trainee (o signup só cria
 *      patient e professor);
 *   2. retroagir as datas de diários e respostas PHQ-9 (a API sempre grava
 *      "agora"), para que gráficos e históricos fiquem "recheados".
 *
 * Uso (a API precisa estar rodando):
 *   yarn seed:demo
 *   yarn seed:demo --patients 40 --days 60
 *   yarn seed:demo --no-db        # só endpoints (sem coordinator/lobby/trainee)
 *
 * Variáveis de ambiente: API_URL, SEED_PASSWORD, DATABASE_URL (via .env).
 * O script é idempotente: rodar de novo reaproveita usuários já existentes.
 */
import 'dotenv/config';
import pg from 'pg';

// ───────────────────────── configuração ─────────────────────────
const args = process.argv.slice(2);
const flag = (name) => args.includes(`--${name}`);
const opt = (name, fallback) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 && args[i + 1] ? Number(args[i + 1]) : fallback;
};

const API_URL = (
  process.env.API_URL ?? `http://localhost:${process.env.PORT ?? 3000}`
).replace(/\/$/, '');
const PASSWORD = process.env.SEED_PASSWORD ?? 'demo@12345';
const PATIENT_COUNT = opt('patients', 24);
const HISTORY_DAYS = opt('days', 45);
const FUTURE_DAYS = opt('future', 21);
const USE_DB = !flag('no-db');
const UTC_OFFSET = '-03:00'; // America/Bahia

// PRNG determinístico: mesma seed → mesmos dados.
function mulberry32(seed) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(opt('seed', 20260518));
const pick = (arr) => arr[Math.floor(rand() * arr.length)];
const int = (min, max) => min + Math.floor(rand() * (max - min + 1));
const chance = (p) => rand() < p;
const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

// ───────────────────────── dados-base ─────────────────────────
const FIRST_NAMES = [
  'Ana', 'Beatriz', 'Camila', 'Daniela', 'Eduarda', 'Fernanda', 'Gabriela',
  'Helena', 'Isabela', 'Juliana', 'Larissa', 'Mariana', 'Natália', 'Paula',
  'Rafaela', 'Sofia', 'Tatiane', 'Vanessa', 'Yasmin', 'Alice', 'Bruno',
  'Carlos', 'Diego', 'Eduardo', 'Felipe', 'Gustavo', 'Henrique', 'Igor',
  'João', 'Lucas', 'Matheus', 'Nicolas', 'Otávio', 'Pedro', 'Rafael',
  'Samuel', 'Thiago', 'Vinícius', 'Wellington', 'Caio',
];
const LAST_NAMES = [
  'Silva', 'Santos', 'Oliveira', 'Souza', 'Rodrigues', 'Ferreira', 'Alves',
  'Pereira', 'Lima', 'Gomes', 'Costa', 'Ribeiro', 'Martins', 'Carvalho',
  'Almeida', 'Lopes', 'Soares', 'Fernandes', 'Vieira', 'Barbosa', 'Rocha',
  'Dias', 'Nascimento', 'Andrade', 'Moreira', 'Nunes', 'Marques', 'Machado',
];
const RACES = ['branca', 'parda', 'preta', 'amarela', 'indígena'];
const INCOMES = [
  'Até 1 salário mínimo',
  'De 1 a 2 salários mínimos',
  'De 2 a 3 salários mínimos',
  'De 3 a 5 salários mínimos',
  'Acima de 5 salários mínimos',
];
const CEPS = [
  '40015-970', '41820-021', '40170-110', '41940-050', '40301-110',
  '41650-010', '40140-130', '41810-010', '40279-000', '41500-000',
];

const STAFF = [
  { role: 'coordinator', name: 'Marina Albuquerque Cunha', email: 'coordenacao@eaves.demo' },
  { role: 'lobby', name: 'Patrícia Menezes Prado', email: 'recepcao1@eaves.demo' },
  { role: 'lobby', name: 'Renato Teixeira Braga', email: 'recepcao2@eaves.demo' },
  { role: 'professor', name: 'Dr. Ricardo Fontes Medeiros', email: 'ricardo.fontes@professores.eaves.demo' },
  { role: 'professor', name: 'Dra. Cláudia Barreto Neves', email: 'claudia.barreto@professores.eaves.demo' },
  { role: 'professor', name: 'Dr. Márcio Sampaio Leal', email: 'marcio.sampaio@professores.eaves.demo' },
  { role: 'trainee', name: 'Letícia Araújo Freitas', email: 'leticia.araujo@estagio.eaves.demo' },
  { role: 'trainee', name: 'Gabriel Monteiro Pinto', email: 'gabriel.monteiro@estagio.eaves.demo' },
  { role: 'trainee', name: 'Bianca Campos Duarte', email: 'bianca.campos@estagio.eaves.demo' },
  { role: 'trainee', name: 'Rodrigo Esteves Lacerda', email: 'rodrigo.esteves@estagio.eaves.demo' },
];

// Fixo e memorável para a apresentação.
const DEMO_PATIENT = {
  role: 'patient',
  name: 'Paciente Demonstração',
  email: 'paciente@eaves.demo',
};

const NOTES = [
  'Primeira sessão — acolhimento e levantamento de demanda.',
  'Retorno: paciente relata melhora no sono.',
  'Sessão focada em manejo de ansiedade.',
  'Acompanhamento semanal.',
  'Revisão do plano terapêutico.',
  'Paciente solicitou reagendamento anterior; sessão de retomada.',
  'Trabalho de psicoeducação sobre ciclo emocional.',
  'Sessão de devolutiva do PHQ-9.',
  null,
  null,
];

const JOURNAL_TEXTS = {
  medo: [
    'Fiquei com receio da apresentação de amanhã. O coração acelerou só de pensar.',
    'Tive medo de sair sozinho(a) hoje, mas respirei fundo e consegui ir até o mercado.',
    'Acordei no meio da noite com uma sensação de aperto. Tentei os exercícios de respiração.',
  ],
  raiva: [
    'Discuti com um colega de turma e fiquei o dia inteiro remoendo. Preciso aprender a pausar antes de responder.',
    'Me irritei com o trânsito e acabei descontando em quem não tinha nada a ver.',
    'Senti muita raiva ao lembrar de uma conversa antiga. Escrever aqui ajudou a aliviar.',
  ],
  felicidade: [
    'Dia ótimo! Encontrei minhas amigas e rimos muito. Fazia tempo que não me sentia tão leve.',
    'Consegui terminar o trabalho que estava atrasado. Orgulho de mim.',
    'Fui caminhar na orla ao fim da tarde e me senti em paz.',
    'Recebi uma boa notícia da família hoje. Gratidão.',
  ],
  tristeza: [
    'Acordei sem vontade de fazer nada. Fiquei boa parte do dia deitado(a).',
    'Senti saudade de casa e chorei um pouco. Depois conversei com minha mãe e melhorou.',
    'Um dia cinzento por dentro. Não sei explicar exatamente o motivo.',
  ],
  nojo: [
    'Passei por uma situação desconfortável no ônibus e fiquei enjoado(a) o resto do dia.',
    'Me senti incomodado(a) com uma atitude que presenciei. Ainda estou processando.',
  ],
  surpresa: [
    'Fui surpreendido(a) com uma visita inesperada de um amigo antigo!',
    'Descobri que passei na seleção do estágio. Nem acreditei quando vi o resultado.',
    'Mudaram os planos de última hora e, para minha surpresa, deu tudo certo.',
  ],
};

// Perfis de humor: probabilidade de cada emoção + tendência do PHQ-9.
const MOOD_PROFILES = [
  // baseline = pontuação média por pergunta (0-3); trend = variação ao longo do histórico
  { name: 'estável', baseline: 0.3, trend: 0, emotions: { felicidade: 5, surpresa: 2, tristeza: 1, medo: 1 } },
  { name: 'melhorando', baseline: 1.8, trend: -1.4, emotions: { felicidade: 3, tristeza: 3, surpresa: 1, medo: 1 } },
  { name: 'piorando', baseline: 0.6, trend: 1.5, emotions: { tristeza: 4, medo: 3, raiva: 2, felicidade: 1 } },
  { name: 'ansioso', baseline: 1.2, trend: 0, emotions: { medo: 5, tristeza: 2, raiva: 1, felicidade: 1 } },
  { name: 'moderado', baseline: 1.6, trend: 0.1, emotions: { tristeza: 4, raiva: 2, medo: 2, felicidade: 1 } },
  { name: 'volátil', baseline: 1.0, trend: 0, emotions: { felicidade: 2, tristeza: 2, raiva: 2, medo: 2, surpresa: 2, nojo: 1 } },
];

// ───────────────────────── utilidades ─────────────────────────
const slug = (s) =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '.').replace(/^\.|\.$/g, '');

function cpf(n) {
  const d = Array.from({ length: 9 }, (_, i) => (n * 7919 + i * 104729 + 13) % 10);
  const calc = (digits) => {
    const f = digits.length + 1;
    const sum = digits.reduce((acc, v, i) => acc + v * (f - i), 0);
    const r = (sum * 10) % 11;
    return r === 10 ? 0 : r;
  };
  d.push(calc(d));
  d.push(calc(d));
  return d.join('');
}

const ymd = (date) => date.toISOString().slice(0, 10);
const addDays = (date, n) => {
  const d = new Date(date);
  d.setUTCDate(d.getUTCDate() + n);
  return d;
};

function log(msg) {
  console.log(msg);
}
function step(title) {
  console.log(`\n━━ ${title}`);
}

async function mapPool(items, limit, fn) {
  const results = new Array(items.length);
  let next = 0;
  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, async () => {
      while (next < items.length) {
        const i = next++;
        results[i] = await fn(items[i], i);
      }
    }),
  );
  return results;
}

// ───────────────────────── cliente HTTP ─────────────────────────
class ApiError extends Error {
  constructor(status, body, path) {
    super(`${status} ${path}: ${typeof body === 'string' ? body : JSON.stringify(body)}`);
    this.status = status;
    this.body = body;
  }
}

async function request(method, path, { body, token } = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const text = await res.text();
  let data = text;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    /* corpo não-JSON */
  }
  if (!res.ok) throw new ApiError(res.status, data, `${method} ${path}`);
  return data;
}

/** Sessão autenticada que renova o token automaticamente em caso de 401. */
class Session {
  constructor(user) {
    this.user = user;
    this.token = null;
  }
  async login() {
    const r = await request('POST', '/auth/login', {
      body: { email: this.user.email, password: PASSWORD },
    });
    this.token = r.access_token;
    return this;
  }
  async call(method, path, body) {
    try {
      return await request(method, path, { body, token: this.token });
    } catch (e) {
      if (e instanceof ApiError && e.status === 401) {
        await this.login();
        return request(method, path, { body, token: this.token });
      }
      throw e;
    }
  }
  get(path) {
    return this.call('GET', path);
  }
  post(path, body) {
    return this.call('POST', path, body);
  }
}

// ───────────────────────── etapas ─────────────────────────
async function ensureUser(user) {
  const birth = new Date(Date.UTC(int(1965, 2005), int(0, 11), int(1, 28)));
  const signupBody = {
    email: user.email,
    password: PASSWORD,
    fullname: user.name,
    document: cpf(user.id ?? int(1, 999999)),
    race: pick(RACES),
    incomeBraket: pick(INCOMES),
    emergencyPhone: `+5571${int(90000, 99999)}${int(1000, 9999)}`,
    cep: pick(CEPS),
    birthDate: birth.toISOString(),
  };

  let created = false;
  try {
    await request('POST', '/auth/signup', { body: signupBody });
    created = true;
  } catch (e) {
    // "e-mail já cadastrado" (400) ou falha no e-mail de boas-vindas (5xx):
    // em ambos os casos o usuário pode existir, então segue para o login.
    if (!(e instanceof ApiError)) throw e;
  }

  const session = new Session(user);
  try {
    await session.login();
  } catch (e) {
    throw new Error(`Não foi possível criar/entrar com ${user.email}: ${e.message}`);
  }
  const profile = await session.get('/auth/profile');
  return { ...user, id: profile.id, session, created };
}

async function promoteRoles(db, users) {
  const wanted = users.filter((u) => ['coordinator', 'lobby', 'trainee'].includes(u.role));
  for (const u of wanted) {
    await db.query('UPDATE "User" SET role = $1 WHERE id = $2', [u.role, u.id]);
  }
  // Os tokens guardam só o id; o papel é lido do banco a cada request.
  log(`  ${wanted.length} usuários promovidos (coordinator/lobby/trainee)`);
}

function shiftsFor(kind) {
  const weekdays = [1, 2, 3, 4, 5];
  const rooms = ['Sala 01', 'Sala 02', 'Sala 03', 'Consultório 1', 'Consultório 2'];
  const chosen = shuffle(weekdays).slice(0, kind === 'professor' ? 3 : 4);
  return chosen.flatMap((dayOfWeek) => {
    const room = pick(rooms);
    const morning = chance(0.5);
    return [
      {
        dayOfWeek,
        startTime: morning ? '08:00' : '14:00',
        endTime: morning ? '12:00' : '18:00',
        location: room,
        notes: morning ? 'Turno da manhã' : 'Turno da tarde',
        maxCapacity: 1,
      },
    ];
  });
}

async function seedSchedules(coordinator, providers) {
  const today = new Date();
  const start = ymd(addDays(today, -(HISTORY_DAYS + 7)));
  let created = 0;
  for (const p of providers) {
    const existing = await coordinator.session.get(`/schedules?userId=${p.id}&isActive=true`);
    if (existing.length > 0) continue;
    await coordinator.session.post('/schedules', {
      title: p.role === 'professor' ? 'Plantão de supervisão e atendimento' : 'Escala de estágio supervisionado',
      description: `Escala semanal de ${p.name}`,
      userId: p.id,
      startDate: start,
      endDate: null,
      isActive: true,
      shifts: shiftsFor(p.role),
    });
    created++;
  }
  log(`  ${created} escalas criadas (${providers.length - created} já existiam)`);
}

async function seedAppointments(lobbyUsers, patients, providers) {
  const today = new Date();
  const days = [];
  for (let d = -HISTORY_DAYS; d <= FUTURE_DAYS; d++) days.push(addDays(today, d));
  const slotCache = new Map();
  const reader = lobbyUsers[0];

  const getSlots = async (providerId, date) => {
    const key = `${providerId}:${date}`;
    if (!slotCache.has(key)) {
      slotCache.set(key, await reader.session.get(`/schedules/user/${providerId}/slots?date=${date}`));
    }
    return slotCache.get(key);
  };

  let created = 0;
  let skipped = 0;
  for (const day of days) {
    const dayStr = ymd(day);
    const dow = day.getUTCDay();
    if (dow === 0 || dow === 6) continue;

    const dayProviders = shuffle(providers).slice(0, int(2, providers.length));
    for (const provider of dayProviders) {
      const slots = await getSlots(provider.id, dayStr);
      if (slots.length === 0) continue;
      // Ocupa entre 40% e 85% da agenda do dia.
      const taken = shuffle(slots).slice(0, Math.max(1, Math.round(slots.length * (0.4 + rand() * 0.45))));
      for (const slot of taken) {
        const patient = pick(patients);
        const byPatient = chance(0.3);
        const actor = byPatient ? patient : pick(lobbyUsers);
        try {
          await actor.session.post('/appointments', {
            initialDate: new Date(`${dayStr}T${slot.startTime}:00${UTC_OFFSET}`).toISOString(),
            professionalId: provider.id,
            ...(byPatient ? {} : { patientEmail: patient.email }),
            notes: pick(NOTES) ?? undefined,
          });
          created++;
        } catch (e) {
          if (e instanceof ApiError && e.status === 400) skipped++; // horário já ocupado
          else throw e;
        }
      }
    }
  }
  log(`  ${created} consultas criadas (${skipped} puladas por conflito de horário)`);
}

function weightedPick(weights) {
  const entries = Object.entries(weights);
  let r = rand() * entries.reduce((s, [, w]) => s + w, 0);
  for (const [k, w] of entries) {
    if ((r -= w) <= 0) return k;
  }
  return entries[0][0];
}

/** Executa `create()` (chamada de API que grava "agora") e retroage as linhas novas. */
async function backdated(db, table, ownerColumn, ownerId, daysAgo, create) {
  if (!db) return create();
  const { rows } = await db.query(`SELECT COALESCE(MAX(id), 0) AS max FROM "${table}"`);
  const before = rows[0].max;
  await create();
  const hour = int(7, 22);
  const minute = int(0, 59);
  await db.query(
    `UPDATE "${table}"
        SET "${table === 'survey' ? 'answeredDate' : 'createdDate'}" =
            date_trunc('day', now()) - make_interval(days => $1)
            + make_interval(hours => $2, mins => $3)
      WHERE id > $4 AND "${ownerColumn}" = $5`,
    [daysAgo, hour, minute, before, ownerId],
  );
}

async function seedJournals(db, patients, emotions) {
  const emotionId = new Map(emotions.map((e) => [e.emotion, e.id]));
  let total = 0;
  for (const patient of patients) {
    const profile = patient.mood;
    const existing = await patient.session.get('/personal-journal');
    if (existing.length >= 3) continue; // já populado
    const entryCount = int(5, 16);
    const daysAgoList = [...new Set(Array.from({ length: entryCount }, () => int(0, HISTORY_DAYS - 1)))].sort((a, b) => b - a);
    for (const daysAgo of daysAgoList) {
      const emotion = weightedPick(profile.emotions);
      await backdated(db, 'personal_journal', 'createdById', patient.id, db ? daysAgo : 0, () =>
        patient.session.post('/personal-journal', {
          content: pick(JOURNAL_TEXTS[emotion]),
          emotion: emotionId.get(emotion),
        }),
      );
      total++;
    }
  }
  log(`  ${total} entradas de diário criadas${db ? ' (com datas retroativas)' : ' (todas com data de hoje: use sem --no-db para histórico)'}`);
}

async function seedSurveys(db, patients, questions) {
  let total = 0;
  for (const patient of patients) {
    const { rows } = db
      ? await db.query('SELECT COUNT(DISTINCT CAST("answeredDate" AS DATE))::int AS n FROM survey WHERE "answeredById" = $1', [patient.id])
      : { rows: [{ n: 0 }] };
    if (rows[0].n >= 3) continue;

    const profile = patient.mood;
    // Sem acesso ao banco só dá para responder uma vez (a API limita 1/dia).
    const dayCount = db ? int(Math.floor(HISTORY_DAYS / 6), Math.floor(HISTORY_DAYS / 2)) : 1;
    const daysAgoList = db
      ? [...new Set(Array.from({ length: dayCount }, () => int(db ? 1 : 0, HISTORY_DAYS - 1)))].sort((a, b) => b - a)
      : [0];
    // Parte dos pacientes responde também hoje (aparece como "já respondeu").
    if (db && chance(0.6)) daysAgoList.push(0);

    for (const daysAgo of daysAgoList) {
      const progress = 1 - daysAgo / HISTORY_DAYS; // 0 = início do histórico, 1 = hoje
      const mean = Math.min(3, Math.max(0, profile.baseline + profile.trend * progress + (rand() - 0.5) * 0.7));
      const payload = questions.map((q) => {
        const raw = Math.round(mean + (rand() - 0.5) * 1.6);
        const score = Math.min(3, Math.max(0, raw));
        return { questionId: q.id, answerId: q.answers.find((a) => a.score === score).id };
      });
      const run = () => patient.session.post('/survey/phq/daily/answer', payload);
      if (daysAgo === 0) await run();
      else await backdated(db, 'survey', 'answeredById', patient.id, daysAgo, run);
      total++;
    }
  }
  log(`  ${total} questionários PHQ-9 respondidos${db ? '' : ' (sem --no-db há apenas 1 por paciente)'}`);
}

// ───────────────────────── principal ─────────────────────────
async function main() {
  log(`Eaves · seed de demonstração\n  API: ${API_URL}\n  Senha de todos os usuários: ${PASSWORD}`);

  try {
    await fetch(`${API_URL}/auth/login`, { method: 'OPTIONS' });
  } catch {
    throw new Error(`API inacessível em ${API_URL}. Suba o servidor (yarn start:dev) e tente de novo.`);
  }

  let db = null;
  if (USE_DB) {
    if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL não definida (use --no-db para pular).');
    db = new pg.Client({ connectionString: process.env.DATABASE_URL });
    await db.connect();
  }

  try {
    step('Usuários (POST /auth/signup + /auth/login)');
    const staffDefs = USE_DB ? STAFF : STAFF.filter((s) => s.role === 'professor');
    const patientDefs = [
      DEMO_PATIENT,
      ...Array.from({ length: PATIENT_COUNT - 1 }, (_, i) => {
        const name = `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)} ${pick(LAST_NAMES)}`;
        return { role: 'patient', name, email: `${slug(name)}.${i + 1}@exemplo.com` };
      }),
    ];
    const allDefs = [...staffDefs, ...patientDefs].map((u, i) => ({ ...u, id: 1000 + i }));
    const users = await mapPool(allDefs, 4, async (def) => {
      const u = await ensureUser(def);
      return u;
    });
    log(`  ${users.filter((u) => u.created).length} criados, ${users.filter((u) => !u.created).length} já existentes`);

    if (db) await promoteRoles(db, users);

    const byRole = (role) => users.filter((u) => u.role === role);
    const patients = byRole('patient');
    patients.forEach((p, i) => (p.mood = MOOD_PROFILES[i % MOOD_PROFILES.length]));
    const providers = [...byRole('professor'), ...byRole('trainee')];
    const coordinator = byRole('coordinator')[0];
    const lobby = byRole('lobby');

    if (db && coordinator) {
      step('Escalas (POST /schedules)');
      await seedSchedules(coordinator, providers);

      step('Consultas (GET /schedules/user/:id/slots + POST /appointments)');
      await seedAppointments(lobby, patients, providers);
    } else {
      log('\n(Escalas e consultas puladas: exigem coordinator/lobby — rode sem --no-db)');
    }

    step('Diário emocional (POST /personal-journal)');
    const emotions = await patients[0].session.get('/personal-journal/emotions');
    await seedJournals(db, patients, emotions);

    step('Questionários PHQ-9 (POST /survey/phq/daily/answer)');
    const questions = await patients[0].session.get('/survey/phq');
    await seedSurveys(db, patients, questions);

    step('Pronto!');
    log('Contas para a demo (senha: ' + PASSWORD + ')');
    const show = (u) => log(`  ${u.role.padEnd(11)} ${u.email}`);
    [coordinator, lobby[0], byRole('professor')[0], byRole('trainee')[0], patients[0]].filter(Boolean).forEach(show);
  } finally {
    await db?.end();
  }
}

main().catch((e) => {
  console.error(`\n✖ ${e.message}`);
  process.exit(1);
});
