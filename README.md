# Food Store — Sistema de Pedidos de Comida

Trabajo Práctico Integrador de **Programación 4** (UTN - Tecnicatura Universitaria en Programación a Distancia).

Aplicación web full-stack para la gestión y realización de pedidos de comida, construida con **FastAPI + SQLModel + SQLite** en el backend y **React + TypeScript + Vite + Tailwind CSS + TanStack + Zustand** en el frontend.

---

## Enlaces de Entrega

- **Repositorio GitHub**: [https://github.com/Mateoserafini/TPI-Programacion-Mateo-Serafini](https://github.com/Mateoserafini/TPI-Programacion-Mateo-Serafini)
- **Video de demostración**: [Ver video en Google Drive](https://drive.google.com/file/d/1BrxFOrek1aydPxBPfbdoA97AmOywe9WL/view?usp=sharing)

---

## Requisitos Previos

- **Python**: 3.11 a 3.13
- **SQLite**: integrado con Python, sin instalación adicional (también puede utilizarse PostgreSQL cambiando `DATABASE_URL`)
- **Node.js**: 20.19 o superior
- **pnpm**: 9 o superior

---

## Estructura del Proyecto

```text
.
├── backend/
│   ├── app/
│   │   ├── core/          # Configuración, DB, seguridad JWT, dependencias, UoW y BaseRepository
│   │   ├── db/            # Seed idempotente (python -m app.db.seed)
│   │   ├── modules/       # Módulos por dominio: auth, usuarios, categorias, productos, pedidos
│   │   └── main.py        # App FastAPI, CORS con credenciales y prefijo /api/v1
│   ├── .env.example
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── features/      # Dominios: auth, categorias, productos, usuarios, pedidos
│   │   ├── routes/        # AppRouter y ProtectedRoute
│   │   ├── shared/        # Axios con interceptor, TanStack QueryClient, UI y layout
│   │   └── store/         # Zustand con persist (authStore y cartStore)
│   ├── .env.example
│   └── package.json
├── GUIA_VIDEO.md          # Guía y orden sugerido para el video de demostración
└── README.md
```

---

## Configuración y Ejecución del Backend

1. Ingresar a la carpeta del backend y crear el entorno virtual:

```bash
cd backend
python -m venv .venv
```

2. Activar el entorno virtual:

- **Windows (PowerShell)**:
  ```powershell
  .\.venv\Scripts\Activate.ps1
  ```
- **Linux / macOS**:
  ```bash
  source .venv/bin/activate
  ```

3. Instalar dependencias:

```bash
pip install -r requirements.txt
```

4. Configurar las variables de entorno copiando `.env.example` a `.env`:

```bash
cp .env.example .env
```

Variables de `backend/.env`:

| Variable                        | Descripción                                          | Ejemplo                                                        |
| ------------------------------- | ----------------------------------------------------- | -------------------------------------------------------------- |
| `DATABASE_URL`                | Cadena de conexión a la base de datos (SQLite por defecto; también admite PostgreSQL) | `sqlite:///./foodstore.db`                           |
| `SECRET_KEY`                  | Clave secreta para firmar JWT (mín. 32 caracteres)                                      | `cambiar-esta-clave-de-al-menos-32-caracteres-seguros` |
| `ALGORITHM`                   | Algoritmo de firma JWT                                                                  | `HS256`                                                |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Duración del token y la cookie HttpOnly (en minutos)                                    | `30`                                                   |
| `FRONTEND_ORIGIN`             | Origen permitido por CORS con credenciales                                              | `http://localhost:5173`                                |

> Con SQLite el archivo de base de datos (`foodstore.db`) se crea automáticamente al ejecutar el seed. Si en cambio configurás PostgreSQL en `DATABASE_URL`, asegurate de haber creado la base de datos previamente.

5. Ejecutar el seed inicial (idempotente):

```bash
python -m app.db.seed
```

6. Levantar el servidor de desarrollo:

```bash
uvicorn app.main:app --reload
```

La API quedará disponible en `http://localhost:8000` y su documentación interactiva en:

- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

---

## Usuario Administrador del Seed

El comando `python -m app.db.seed` crea automáticamente el usuario administrador, 4 categorías y 9 productos con stock:

- **Usuario (`username`)**: `admin`
- **Contraseña**: `Admin1234!`
- **Rol**: `admin`

---

## Configuración y Ejecución del Frontend

1. Ingresar a la carpeta del frontend:

```bash
cd frontend
```

2. Configurar las variables de entorno copiando `.env.example` a `.env`:

```bash
cp .env.example .env
```

Variable de `frontend/.env`:

| Variable         | Descripción                   | Ejemplo                          |
| ---------------- | ------------------------------ | -------------------------------- |
| `VITE_API_URL` | URL base de la API del backend | `http://localhost:8000/api/v1` |

3. Instalar dependencias:

```bash
pnpm install
```

4. Verificar tipos y compilar para producción:

```bash
pnpm build
```

5. Iniciar el servidor de desarrollo:

```bash
pnpm dev
```

La aplicación quedará disponible en `http://localhost:5173`.
