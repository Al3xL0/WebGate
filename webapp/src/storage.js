const fs = require("fs");
const path = require("path");
const Database = require("better-sqlite3");

const dataDir = path.join(__dirname, "..", "data");
const dbPath = path.join(dataDir, "webgate.sqlite");

fs.mkdirSync(dataDir, { recursive: true });

const db = new Database(dbPath);

function seedDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS customers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      industry TEXT NOT NULL,
      owner TEXT NOT NULL,
      risk TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS invoices (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      invoice_no TEXT NOT NULL,
      customer_id INTEGER NOT NULL,
      amount TEXT NOT NULL,
      due_date TEXT NOT NULL,
      status TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS tickets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      subject TEXT NOT NULL,
      account TEXT NOT NULL,
      priority TEXT NOT NULL,
      status TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS ticket_comments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ticket_id INTEGER NOT NULL,
      author TEXT NOT NULL,
      body TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS audit_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      actor TEXT NOT NULL,
      action TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
  `);

  const seeded = db.prepare("SELECT COUNT(*) count FROM users").get().count > 0;
  if (seeded) return;

  const insertUser = db.prepare("INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)");
  insertUser.run("Ari Kaplan", "admin@webgate.local", "admin123", "admin");
  insertUser.run("Maya Chen", "maya@webgate.local", "maya2026", "manager");
  insertUser.run("Sam Rivera", "sam@client.example", "sam123", "user");

  const insertCustomer = db.prepare("INSERT INTO customers (name, industry, owner, risk) VALUES (?, ?, ?, ?)");
  insertCustomer.run("Acme Freight", "Logistics", "Maya Chen", "Medium");
  insertCustomer.run("Northwind Health", "Healthcare", "Ari Kaplan", "High");
  insertCustomer.run("Bluepeak Retail", "Retail", "Sam Rivera", "Low");
  insertCustomer.run("HelioGrid Energy", "Energy", "Maya Chen", "Medium");

  const insertInvoice = db.prepare("INSERT INTO invoices (invoice_no, customer_id, amount, due_date, status) VALUES (?, ?, ?, ?, ?)");
  insertInvoice.run("WG-2026-1001", 1, "$18,420.00", "2026-06-01", "Due");
  insertInvoice.run("WG-2026-1002", 2, "$43,870.00", "2026-05-29", "Due");
  insertInvoice.run("WG-2026-1003", 3, "$7,950.00", "2026-06-12", "Paid");
  insertInvoice.run("WG-2026-1004", 4, "$24,300.00", "2026-06-18", "Draft");

  const insertTicket = db.prepare("INSERT INTO tickets (subject, account, priority, status, created_at) VALUES (?, ?, ?, ?, ?)");
  insertTicket.run("VPN enrollment intermittently fails", "Northwind Health", "High", "Open", "2026-05-16 09:12");
  insertTicket.run("Renewal export has stale billing contact", "Acme Freight", "Medium", "Waiting", "2026-05-15 14:44");
  insertTicket.run("Quarterly access review request", "HelioGrid Energy", "Low", "Closed", "2026-05-12 10:30");

  const insertComment = db.prepare("INSERT INTO ticket_comments (ticket_id, author, body, created_at) VALUES (?, ?, ?, ?)");
  insertComment.run(1, "Maya Chen", "Customer reports failures after the latest SSO change.", "2026-05-16 09:18");
  insertComment.run(1, "Ari Kaplan", "Asked infrastructure to compare proxy logs with IdP timestamps.", "2026-05-16 10:02");
  insertComment.run(2, "Sam Rivera", "Billing contact updated in CRM. Export job still needs a refresh.", "2026-05-15 15:05");

  const insertEvent = db.prepare("INSERT INTO audit_events (actor, action, created_at) VALUES (?, ?, ?)");
  insertEvent.run("system", "nightly invoice sync completed", "2026-05-18 03:10");
  insertEvent.run("maya@webgate.local", "searched customer portfolio", "2026-05-18 08:42");
  insertEvent.run("admin@webgate.local", "opened diagnostics panel", "2026-05-18 09:21");
  insertEvent.run("sam@client.example", "downloaded q2-risk-summary.txt", "2026-05-18 10:04");
  insertEvent.run("system", "support queue SLA recalculated", "2026-05-18 10:30");
}

module.exports = { db, seedDatabase };
