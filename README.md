# FitApp 🏋️‍♂️

FitApp es una aplicación web moderna diseñada para entrenadores personales. Permite a los coaches gestionar de forma integral el progreso de sus clientes, llevar un control de sus métricas corporales (como el cálculo automático del IMC), y utilizar catálogos compartidos de nutrición y rutinas de ejercicio de manera rápida y segura.

## 🛠️ Stack Tecnológico

**Frontend:**
- React 18 + TypeScript
- Vite (Empaquetador optimizado)
- React Router DOM v6 (Enrutamiento del cliente)
- Axios (Cliente HTTP)
- Vanilla CSS (Diseño moderno, accesible y enfocado en colores energéticos)

**Backend:**
- Node.js + Express
- TypeScript
- Base de datos MySQL (driver `mysql2/promise`)
- Autenticación segura mediante JSON Web Tokens (JWT) y bcrypt (hasheo)

---

## ⚙️ Variables de Entorno

Para que el proyecto funcione localmente, necesitas tener creados estos dos archivos:

### 1. Archivo del Backend (`backend/.env`)
```env
PORT=3000
DB_HOST=127.0.0.1
DB_USER=root
DB_PASS=tu_contraseña_mysql
DB_NAME=fitapp_db
JWT_SECRET=supersecretjwtkey_12345
```

### 2. Archivo del Frontend (`frontend/.env`)
```env
VITE_API_URL=http://localhost:3000/api
```

---

## 🚀 Instrucciones de Ejecución

Para iniciar la aplicación completa, debes levantar tanto el Frontend como el Backend en **dos terminales separadas**.

### 1. Iniciar Base de Datos y Backend
1. Asegúrate de tener **MySQL** corriendo en tu entorno local (o servidor) y haber ejecutado previamente el script `backend/schema.sql` para generar las tablas.
2. Abre la **Terminal 1**, ingresa a la carpeta del backend e instala dependencias:
   ```bash
   cd backend
   npm install
   ```
3. Levanta el servidor en modo desarrollo (nodemon recargará ante cualquier cambio):
   ```bash
   npm run dev
   ```
> *Verás un mensaje en consola indicando: 🚀 Servidor corriendo en el puerto 3000.*

### 2. Iniciar Frontend (Vite)
1. Abre la **Terminal 2**, ingresa a la carpeta del frontend e instala dependencias:
   ```bash
   cd frontend
   npm install
   ```
2. Arranca el servidor de React:
   ```bash
   npm run dev
   ```
3. Tu terminal te dará una URL (por defecto `http://localhost:5173`). Haz clic en ella (o cópiala en tu navegador) para ver y usar FitApp.
