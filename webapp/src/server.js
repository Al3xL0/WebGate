const express = require("express");
const path = require("path");
const fs = require("fs");
const { exec } = require("child_process");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const { v4: uuidv4 } = require("uuid");
const { db, seedDatabase } = require("./storage");

const app = express();
const port = Number(process.env.PORT || 3000);
const publicDir = path.join(__dirname, "..", "public");
const docsDir = path.join(__dirname, "..", "documents");

seedDatabase();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(morgan("combined"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(express.static(publicDir));

app.use((req, res, next) => {
  res.setHeader("X-Powered-By", "WebGate-Core/2.7.13");
  res.locals.currentUser = getCurrentUser(req);
  res.locals.notice = req.query.notice || "";
  next();
});

function getCurrentUser(req) {
  const raw = req.cookies.session;
  if (!raw) return null;

  try {
    const decoded = Buffer.from(raw, "base64").toString("utf8");
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

function setWeakSession(res, user) {
  const payload = Buffer.from(JSON.stringify({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role
  })).toString("base64");

  res.cookie("session", payload, {
    httpOnly: false,
    sameSite: "lax"
  });
}

function requireLogin(req, res, next) {
  if (!res.locals.currentUser) {
    return res.redirect("/login?notice=Please sign in to continue");
  }
  next();
}

function requireAdmin(req, res, next) {
  if (!res.locals.currentUser || res.locals.currentUser.role !== "admin") {
    return res.status(403).render("error", {
      title: "Access denied",
      message: "This area is reserved for administrators."
    });
  }
  next();
}

app.get("/", (req, res) => {
  if (!res.locals.currentUser) return res.redirect("/login");
  res.redirect("/dashboard");
});

app.get("/login", (req, res) => {
  res.render("login", { title: "Sign in", error: "" });
});

app.post("/login", (req, res) => {
  const { email = "", password = "" } = req.body;
  const query = `SELECT * FROM users WHERE email = '${email}' AND password = '${password}'`;

  try {
    const user = db.prepare(query).get();
    if (!user) {
      return res.status(401).render("login", {
        title: "Sign in",
        error: "Invalid email or password"
      });
    }

    setWeakSession(res, user);
    res.redirect("/dashboard");
  } catch (error) {
    res.status(500).render("error", {
      title: "Login query failed",
      message: error.message
    });
  }
});

app.post("/logout", (req, res) => {
  res.clearCookie("session");
  res.redirect("/login?notice=Signed out");
});

app.get("/dashboard", requireLogin, (req, res) => {
  const metrics = {
    openTickets: db.prepare("SELECT COUNT(*) count FROM tickets WHERE status != 'Closed'").get().count,
    invoicesDue: db.prepare("SELECT COUNT(*) count FROM invoices WHERE status = 'Due'").get().count,
    activeCustomers: db.prepare("SELECT COUNT(*) count FROM customers").get().count,
    recentEvents: db.prepare("SELECT * FROM audit_events ORDER BY id DESC LIMIT 5").all()
  };

  res.render("dashboard", { title: "Operations dashboard", metrics });
});

app.get("/customers", requireLogin, (req, res) => {
  const q = req.query.q || "";
  let customers = [];
  let query = "SELECT * FROM customers ORDER BY name";

  if (q) {
    query = `SELECT * FROM customers WHERE name LIKE '%${q}%' OR owner LIKE '%${q}%' ORDER BY name`;
  }

  try {
    customers = db.prepare(query).all();
  } catch (error) {
    return res.status(500).render("error", {
      title: "Customer search failed",
      message: error.message
    });
  }

  res.render("customers", { title: "Customers", customers, q });
});

app.get("/invoices", requireLogin, (req, res) => {
  const invoices = db.prepare(`
    SELECT invoices.*, customers.name customer_name
    FROM invoices
    JOIN customers ON customers.id = invoices.customer_id
    ORDER BY invoices.id
  `).all();

  res.render("invoices", { title: "Invoices", invoices });
});

app.get("/invoices/:id", requireLogin, (req, res) => {
  const invoice = db.prepare(`
    SELECT invoices.*, customers.name customer_name, customers.owner
    FROM invoices
    JOIN customers ON customers.id = invoices.customer_id
    WHERE invoices.id = ?
  `).get(req.params.id);

  if (!invoice) {
    return res.status(404).render("error", {
      title: "Invoice not found",
      message: "No invoice exists with that identifier."
    });
  }

  res.render("invoice", { title: `Invoice ${invoice.invoice_no}`, invoice });
});

app.get("/tickets", requireLogin, (req, res) => {
  const tickets = db.prepare("SELECT * FROM tickets ORDER BY id DESC").all();
  res.render("tickets", { title: "Support tickets", tickets });
});

app.get("/tickets/:id", requireLogin, (req, res) => {
  const ticket = db.prepare("SELECT * FROM tickets WHERE id = ?").get(req.params.id);
  const comments = db.prepare("SELECT * FROM ticket_comments WHERE ticket_id = ? ORDER BY id").all(req.params.id);

  if (!ticket) {
    return res.status(404).render("error", {
      title: "Ticket not found",
      message: "The requested ticket does not exist."
    });
  }

  res.render("ticket", { title: ticket.subject, ticket, comments });
});

app.post("/tickets/:id/comments", requireLogin, (req, res) => {
  const { body = "" } = req.body;
  const user = res.locals.currentUser;

  db.prepare(`
    INSERT INTO ticket_comments (ticket_id, author, body, created_at)
    VALUES (?, ?, ?, datetime('now'))
  `).run(req.params.id, user.name, body);

  res.redirect(`/tickets/${req.params.id}`);
});

app.get("/documents", requireLogin, (req, res) => {
  const files = [
    "contracts/acme-renewal.txt",
    "contracts/northwind-onboarding.txt",
    "reports/q2-risk-summary.txt"
  ];

  res.render("documents", { title: "Documents", files });
});

app.get("/download", requireLogin, (req, res) => {
  const file = req.query.file || "";
  const target = path.join(docsDir, file);
  res.download(target, path.basename(file), (error) => {
    if (error && !res.headersSent) {
      res.status(404).render("error", {
        title: "Download failed",
        message: `Unable to download ${file}`
      });
    }
  });
});

app.get("/admin", requireLogin, requireAdmin, (req, res) => {
  res.render("admin", {
    title: "Admin diagnostics",
    output: "",
    target: "localhost"
  });
});

app.post("/admin/ping", requireLogin, requireAdmin, (req, res) => {
  const target = req.body.target || "localhost";
  const command = `ping -c 2 ${target}`;

  exec(command, { timeout: 3500 }, (error, stdout, stderr) => {
    res.render("admin", {
      title: "Admin diagnostics",
      target,
      output: stdout || stderr || (error ? error.message : "No output")
    });
  });
});

app.get("/debug/status", (req, res) => {
  res.json({
    app: "WebGate",
    version: "2.7.13",
    env: process.env.NODE_ENV,
    baseUrl: process.env.APP_BASE_URL,
    requestId: uuidv4(),
    headers: req.headers,
    cwd: process.cwd()
  });
});

app.use((req, res) => {
  res.status(404).render("error", {
    title: "Not found",
    message: "The requested route does not exist."
  });
});

app.listen(port, () => {
  console.log(`WebGate listening on http://0.0.0.0:${port}`);
});
