# 🚀 Guía de Despliegue en Render

Este proyecto ha sido configurado para desplegarse en **Render** con PostgreSQL.

## 📋 Requisitos Previos

1. Cuenta en [GitHub](https://github.com)
2. Cuenta en [Render.com](https://render.com)
3. Tu código subido a un repositorio de GitHub

## 🔧 Cambios Realizados

- ✅ Migración de MySQL a PostgreSQL
- ✅ Actualización de dependencias (`mysql2` → `pg`)
- ✅ Configuración de base de datos para PostgreSQL
- ✅ Script SQL compatible con PostgreSQL (`database_postgres.sql`)
- ✅ Archivo `render.yaml` para despliegue automático

## 📝 Pasos para Desplegar

### 1. Preparar el Repositorio

```bash
# Asegúrate de tener todo commiteado en GitHub
git add .
git commit -m "Migración a PostgreSQL para Render"
git push origin main
```

### 2. Crear Cuenta en Render

- Ve a [render.com](https://render.com)
- Regístrate con tu cuenta de GitHub
- Autoriza a Render acceder a tus repositorios

### 3. Crear el Proyecto en Render

**Opción A: Despliegue Automático (Recomendado)**

1. En Render, haz clic en **"New +"** → **"Blueprint"**
2. Selecciona tu repositorio
3. Render leerá automáticamente `render.yaml`
4. Revisa la configuración y haz clic en **"Deploy"**

**Opción B: Despliegue Manual**

#### Crear Base de Datos PostgreSQL:
1. New → PostgreSQL
2. Name: `asistencia-qr-db`
3. Plan: Free
4. Copia las credenciales

#### Crear Backend:
1. New → Web Service
2. Conecta tu repositorio
3. Configuración:
   - Name: `asistencia-qr-backend`
   - Environment: `Node`
   - Build Command: `cd backend && npm install`
   - Start Command: `cd backend && npm start`
   - Plan: Free

#### Variables de Entorno (Backend):
```
PORT=3000
NODE_ENV=production
DB_HOST=<host_de_postgresql>
DB_PORT=5432
DB_USER=<usuario>
DB_PASSWORD=<contraseña>
DB_NAME=asistencia_qr
JWT_SECRET=<clave_muy_segura_y_aleatoria>
HORA_ENTRADA=08:00:00
HORA_SALIDA=13:00:00
```

#### Crear Frontend:
1. New → Web Service
2. Mismo repositorio
3. Configuración:
   - Name: `asistencia-qr-frontend`
   - Environment: `Node`
   - Build Command: `cd frontend && npm install && npm run build`
   - Start Command: `cd frontend && npm run preview`
   - Plan: Free

#### Variables de Entorno (Frontend):
```
VITE_API_URL=https://asistencia-qr-backend.onrender.com/api
```

### 4. Ejecutar Migraciones de Base de Datos

Una vez que la BD esté creada:

1. En Render, ve a tu servicio PostgreSQL
2. Haz clic en **"Connect"**
3. Usa el cliente psql o cualquier herramienta PostgreSQL
4. Ejecuta el contenido de `database_postgres.sql`

**Alternativa con psql:**
```bash
psql postgresql://usuario:contraseña@host:5432/asistencia_qr < database_postgres.sql
```

### 5. Verificar Despliegue

- Backend: `https://asistencia-qr-backend.onrender.com`
- Frontend: `https://asistencia-qr-frontend.onrender.com`

## 🔐 Credenciales por Defecto

**Admin:**
- Usuario: `admin`
- Contraseña: `admin123`

**Practicantes (3 usuarios de ejemplo):**
- Usuario: `PRACT-001`, `PRACT-002`, `PRACT-003`
- Contraseña: `123456`

## ⚠️ Notas Importantes

- **JWT_SECRET:** Cambia la clave secreta en producción. Usa una clave aleatoria y segura.
- **Primeros despliegues:** Pueden tardar 5-10 minutos
- **Plan Free:** Render pone en sleep los servicios inactivos. Accede regularmente para mantenerlos activos.
- **Backups:** Configura backups automáticos en PostgreSQL si es necesario

## 🐛 Solución de Problemas

### Error: "Cannot find module 'pg'"
```bash
# En Render, asegúrate de que npm install se ejecute correctamente
# Verifica que package.json tenga la dependencia "pg"
```

### Error de conexión a BD
- Verifica que las variables de entorno estén correctas
- Asegúrate de que la BD esté en estado "Available" en Render
- Comprueba que el script SQL se ejecutó correctamente

### Frontend no conecta con Backend
- Verifica que `VITE_API_URL` sea correcto
- Asegúrate de que el Backend esté desplegado y accesible
- Revisa la consola del navegador para errores CORS

## 📚 Recursos Útiles

- [Documentación de Render](https://render.com/docs)
- [Documentación de PostgreSQL](https://www.postgresql.org/docs/)
- [Guía de Node.js en Render](https://render.com/docs/deploy-node-express-app)

## 🎯 Próximos Pasos

1. Personaliza las credenciales de administrador
2. Configura un dominio personalizado (opcional)
3. Implementa HTTPS (automático en Render)
4. Configura monitoreo y alertas

---

¿Necesitas ayuda? Contacta al equipo de desarrollo.
