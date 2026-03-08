# CPSY300 Project 2 – Setup Guide

## Prerequisites

- **Node.js** (v18+)
- **PostgreSQL** (v15+)

## 1. Clone the Repo

```bash
git clone https://github.com/sinferna/cpsy300-project2.git
cd cpsy300-project2
git checkout backend-api
```

## 2. Install Frontend Dependencies

```bash
npm install
```

## 3. Install Backend Dependencies

```bash
cd backend
npm install
```

## 4. Set Up the Database

### Create a PostgreSQL database:

**macOS:**

```bash
createdb nutritional_insights
```

**Windows (PowerShell):**

If `createdb` is not recognized, use the full path (adjust version number if needed):

```powershell
& "C:\Program Files\PostgreSQL\17\bin\createdb.exe" -U postgres nutritional_insights
```

Or open **pgAdmin** and create a database named `nutritional_insights`.

### Configure environment variables:

**macOS/Linux:**

```bash
cp .env.example .env
```

**Windows (PowerShell):**

```powershell
copy .env.example .env
```

Edit `backend/.env` with your local PostgreSQL credentials:

```
DB_HOST=localhost
DB_PORT=5432
DB_USER=your_username
DB_PASSWORD=your_password
DB_NAME=nutritional_insights
PORT=5001
```

> **macOS:** Your username is usually your macOS username and password can be left blank.
>
> **Windows:** Username is usually `postgres` and the password is what you set during PostgreSQL installation.

### Seed the database:

```bash
npm run seed
```

This creates the `recipes` table and loads 75 sample recipes from `data/recipes.csv`.

## 5. Run the App

You need **two terminals** running at the same time:

**Terminal 1 – Backend (port 5001):**

```bash
cd backend
npm run dev
```

**Terminal 2 – Frontend (port 5173):**

```bash
npm run dev
```

Open **http://localhost:5173** in your browser.

## API Endpoints

| Endpoint | Description |
|---|---|
| `GET /api/insights?diet_type=Keto` | Average protein, carbs, fat by diet type |
| `GET /api/scatter?diet_type=Vegan` | Protein vs carbs data for scatter plot |
| `GET /api/correlations` | Correlation matrix (protein, carbs, fat) |
| `GET /api/distribution` | Recipe count per diet type |
| `GET /api/recipes?page=1&limit=10&diet_type=Paleo&search=chicken` | Paginated recipes with filters |
| `GET /api/clusters?k=3` | K-Means clustering by macros |
| `GET /api/health` | Health check |

## Project Structure

```
cpsy300-project2/
├── src/                  # React frontend
│   └── App.jsx
├── backend/
│   ├── server.js         # Express server
│   ├── db.js             # PostgreSQL connection
│   ├── seed.js           # Database seeder
│   ├── data/
│   │   └── recipes.csv   # Sample dataset (75 recipes)
│   └── routes/
│       ├── insights.js
│       ├── scatter.js
│       ├── correlations.js
│       ├── distribution.js
│       ├── recipes.js
│       └── clusters.js
├── vite.config.js        # Vite config (proxies /api to backend)
└── package.json
```
