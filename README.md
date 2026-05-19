# WebGate

WebGate is a small Web Application Firewall / reverse proxy lab built as a practical cybersecurity project.

The project runs an intentionally vulnerable web application inside Docker, while a separate proxy container sits in front of it and inspects HTTP traffic before forwarding requests to the application. A React dashboard is included to observe traffic, blocked requests, and anti-flood events.

## Why I Built It

During my B.Sc. in Computer Science and my practical engineering studies in Electronics and Computers, I was exposed to many areas: programming, communication protocols, operating systems, networking, databases, Docker, and cybersecurity.

Over the years, I built several projects, but many of them were academic assignments or exercises. At some point, I realized that I wanted to build something that felt more like a real engineering project: something I could explain, improve, debug, and be proud to show.

So I challenged myself to build a practical cybersecurity project in less than 36 hours.

That is how WebGate was born.

## Project Goal

The goal of WebGate is to understand, hands-on, how a security gateway can sit between a client and a web application, observe HTTP traffic, apply security rules, and make blocking decisions.

WebGate focuses on application-layer HTTP behavior. It is not meant to replace infrastructure-level protections, firewall rules, or edge-provider DDoS protection.

## Project Status

WebGate is still under active development and should be treated as a learning project and security lab, not as a production-ready WAF.

At this stage, the project does not attempt to handle every type of web attack or network-level attack. It currently focuses on a limited set of application-layer behaviors such as basic rate limiting, suspicious User-Agent detection, login parameter validation, and traffic logging.

The goal is to keep improving the project over time by adding more detection rules, stronger request inspection, better reporting, persistent storage, and broader test coverage.

## Architecture

```text
Client Browser
     |
     v
WebGate API / Reverse Proxy
     |
     v
Vulnerable Web Application

Dashboard
     |
     v
WebGate API event endpoints
```

### Containers

| Service | Description | Exposed Port |
| --- | --- | --- |
| `webgate-api` | FastAPI reverse proxy and security inspection layer | `8000` |
| `webapp` | Intentionally vulnerable Node.js / Express application | internal Docker port `3000` |
| `dashboard` | React / Vite traffic monitoring dashboard | `5173` |

## Features

- Reverse proxy routing to a vulnerable application container.
- Per-route rate limiting for basic application-layer flood mitigation.
- Suspicious User-Agent detection, including common scanner tools such as `sqlmap`, `nikto`, `ffuf`, `wfuzz`, `gobuster`, and `dirbuster`.
- Basic login parameter validation for email and password fields.
- Traffic logging for forwarded and blocked requests.
- Anti-flood event logging for rate-limited requests.
- WAF event logging for suspicious requests.
- Dashboard foundation for reporting and investigating suspicious activity.

## What WebGate Can Detect

WebGate currently includes basic application-layer checks such as:

- Requests from suspicious scanner User-Agents.
- Excessive request rate on protected routes.
- Invalid login form parameters.
- HTTP traffic patterns that can be logged and investigated through the dashboard.

## Important Security Boundary

One important lesson from this project was understanding the boundary between different layers of security.

WebGate can inspect and block HTTP-level behavior because it receives and processes complete HTTP requests. However, lower-level attacks such as TCP SYN floods happen before the application receives a normal HTTP request. Those attacks require protections at the OS, firewall, infrastructure, load balancer, or edge-provider level.

In other words:

- WebGate is useful for application-layer inspection.
- WebGate is not a full DDoS protection system.
- Network-layer attacks need network-layer defenses.

## Intentional Vulnerabilities

The web application is intentionally unsafe and should only be used locally for learning and testing.

Examples of vulnerable behavior in the lab include:

- SQL injection in login and customer search flows.
- Reflected XSS in the search page.
- Stored XSS in support ticket comments.
- IDOR in invoice viewing.
- Path traversal in document downloads.
- Command injection in the admin diagnostic tool.
- Weak unsigned session cookie.
- Verbose headers and debug endpoint leakage.

Do not expose this project to the public internet.

## Tech Stack

- Docker and Docker Compose
- FastAPI
- SlowAPI
- HTTPX
- Node.js
- Express
- EJS
- SQLite
- React
- Vite

## Getting Started

### Prerequisites

- Docker
- Docker Compose

### Run the Project

```bash
docker compose up --build
```

Open the protected application through the WebGate proxy:

```text
http://localhost:8000
```

Open the traffic dashboard:

```text
http://localhost:5173
```

The vulnerable web application runs inside the Docker network and is forwarded through the proxy.

## Demo Accounts

| Role | Email | Password |
| --- | --- | --- |
| Admin | `admin@webgate.local` | `admin123` |
| Manager | `maya@webgate.local` | `maya2026` |
| User | `sam@client.example` | `sam123` |

## API Endpoints

The dashboard reads event data from the WebGate API:

| Endpoint | Description |
| --- | --- |
| `/api/traffic` | Recent traffic events |
| `/api/badTraffic` | Rate-limit / anti-flood events |
| `/api/waf-events` | WAF block events |

## Example Tests

### Suspicious User-Agent

```bash
curl -A "sqlmap" http://localhost:8000/login
```

Expected result: the request is blocked with `403 Forbidden` and logged as a WAF event.

### Basic Rate Limiting

Send several rapid requests to a protected route:

```bash
curl http://localhost:8000/login
curl http://localhost:8000/login
curl http://localhost:8000/login
curl http://localhost:8000/login
```

Expected result: once the route limit is exceeded, WebGate returns `429 Too Many Requests` and logs an anti-flood event.

## Repository Structure

```text
.
|-- dashboard/       # React / Vite monitoring dashboard
|-- webapp/          # Intentionally vulnerable Express application
|-- webgate-api/     # FastAPI reverse proxy and security layer
|-- docker-compose.yml
`-- README.md
```

## Future Improvements

- Add configurable WAF rules.
- Improve request body and query-string inspection.
- Add persistent event storage.
- Add authentication for the dashboard.
- Add more detailed reporting and filtering.
- Add tests for proxy behavior and security rules.
- Add infrastructure-level documentation for network-layer protection.

## What I Learned

Beyond the code itself, this project taught me a lot about Docker, reverse proxies, debugging distributed containers, HTTP traffic flow, application security, and the difference between knowing a concept and actually building a working system around it.

The project is still evolving, but for me it marks an important step: moving from learning technologies to using them to build something of my own.
