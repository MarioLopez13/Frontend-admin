Este proyecto se encuentra en una versión **frontend-first** correspondiente al cierre funcional del **Sprint 1** del admin.

### Alcance actual implementado
- autenticación mock
- persistencia de sesión en frontend
- manejo de roles y permisos
- layout administrativo base
- dashboard base
- gestión básica de usuarios:
  - listar
  - buscar
  - filtrar por estado
  - ver detalle
  - editar
  - activar/desactivar
- pantallas administrativas base para pagos y QR con datos mock

### Importante
El proyecto **todavía no depende de backend real** para funcionar localmente.  
Está preparado para integrarse después mediante contratos claros.

---

## Stack

- React
- Vite
- TypeScript
- React Router
- Zustand
- Tailwind CSS v4

---

## Ejecución local

Instalar dependencias:

npm install

Levantar en desarrollo:

npm run dev

Validar TypeScript:

npx tsc -b

Build de producción:

npm run build
Estructura del proyecto
src/
  app/
    App.tsx
    config/
      env.ts
      navigation.ts
      routes.ts
    router/
      index.tsx

  core/
    api/
      apiClient.ts
      endpoints.ts
    auth/
      auth.guard.tsx
      auth.service.ts
      auth.storage.ts
      auth.types.ts
      permissions.ts

  features/
    auth/
      components/
      pages/
      services/
    dashboard/
      pages/
      services/
    payments/
      pages/
    qr/
      pages/
    users/
      components/
      pages/
      services/
      types/
      utils/

  shared/
    layout/
      AppHeader.tsx
      AppShell.tsx
      AppSidebar.tsx

  store/
    auth/
      auth.store.ts

  index.css
  main.tsx
Arquitectura general

La app está organizada por dominios.

app/

Configuración global:

rutas
navegación
variables de entorno
composición general de la app
core/

Capas transversales:

cliente HTTP
auth
permisos
storage de sesión
endpoints
features/

Módulos funcionales por dominio:

auth
dashboard
payments
qr
users
shared/

Componentes compartidos de layout:

sidebar
header
shell administrativo
store/

Estado global con Zustand, por ahora centrado en autenticación.

Autenticación actual

Actualmente el login funciona con mock.

Regla mock actual
si el correo contiene admin, entra como admin
en caso contrario entra como operator

Ejemplo:

admin@kynsoft.com → admin
operador@kynsoft.com → operator
Qué ya hace el frontend
login
logout
persistencia de sesión
hidratación al recargar
guards de rutas privadas
redirección por sesión
control visual de permisos por rol
Roles actuales

Roles definidos actualmente:

admin
operator
user
Interpretación actual
admin: acceso total al panel
operator: acceso administrativo limitado/ampliable
user: reservado principalmente para la app móvil
Nota

Por acuerdo actual del proyecto:

support se considera equivalente a operator
Permisos actuales

El frontend ya utiliza una matriz de permisos centralizada.

Ejemplos ya usados:

acceso a módulos del sidebar
visibilidad de acciones de usuarios
edición de usuarios
cambio de estado de usuarios

El backend no necesita replicar exactamente esta misma implementación, pero sí debe respetar el modelo de roles y habilitar respuestas coherentes con esos accesos.

Modo mock vs integración real

La app usa env.useMocks para decidir si consume mocks o backend real.

Idea general

Mientras useMocks = true, el frontend trabaja con servicios mock.

Cuando se conecte backend real:

useMocks debe pasar a false
los servicios comenzarán a usar apiClient
los endpoints ya definidos servirán como contrato base
Módulos actuales
1. Auth

Pantallas:

login
unauthorized

Capacidades:

inicio de sesión
validación básica de formulario
persistencia de sesión
control de acceso
2. Dashboard

Pantalla de resumen administrativo base.

Actualmente muestra:

total de usuarios
usuarios activos
usuarios inactivos

Por ahora esos datos provienen del módulo mock de usuarios.

3. Users

Es el módulo más sólido del Sprint 1.

Funcionalidades ya implementadas
listado
búsqueda por nombre/correo
filtro por estado
detalle
edición
activar/desactivar
Alcance funcional actual

Solo gestiona usuarios finales, no administradores ni operadores.

4. Payments

Pantalla administrativa base con datos mock.

Estado

No representa aún una integración real de pagos.
Se dejó como base visual/estructural para evolución posterior.

Advertencia funcional

La semántica final de este módulo todavía debe alinearse con el flujo real del producto:

recarga de saldo por flujo externo
débito de saldo al escanear QR o usar NFC
registro de transacción resultante
5. QR

Pantalla administrativa base relacionada con QR.

Estado

Actualmente es una base visual y de navegación.
No debe asumirse todavía como módulo funcional cerrado del sprint.

Nota de negocio importante

La decisión funcional vigente del producto es:

QR fijo por unidad/bus
no QR dinámico como flujo principal del producto real
Rutas principales

Rutas actuales del panel:

/login
/unauthorized
/
/users
/users/:id
/users/:id/edit
/payments
/qr
Contratos esperados para backend

Estos son los endpoints esperados actualmente por el frontend como contrato razonable.

Auth
POST /auth/login
POST /auth/logout
GET /auth/me
POST /auth/refresh
Users
GET /users
GET /users/:id
PATCH /users/:id
PATCH /users/:id/status
DTOs esperados
LoginRequest
interface LoginRequest {
  email: string;
  password: string;
}
LoginResponse
interface LoginResponse {
  accessToken: string;
  refreshToken?: string;
  user: {
    id: string;
    fullName: string;
    email: string;
    role: "admin" | "operator" | "user";
  };
}
UsersListResponse
interface UsersListResponse {
  items: {
    id: string;
    fullName: string;
    email: string;
    status: "active" | "inactive";
    role: "user";
    createdAt: string;
    updatedAt: string;
  }[];
  total: number;
  page: number;
  pageSize: number;
}
UpdateUserRequest
interface UpdateUserRequest {
  fullName: string;
  email: string;
}
UpdateUserStatusRequest
interface UpdateUserStatusRequest {
  status: "active" | "inactive";
}
Consideraciones para backend
1. No asumir que el frontend actual usa backend real

Hoy la app funciona con mocks.
La integración debe respetar los contratos ya definidos para minimizar refactor.

2. Mantener roles consistentes

El frontend ya espera:

admin
operator
user
3. Users en Sprint 1

El panel actual solo espera administrar usuarios finales.

No se requiere aún:

crear usuarios desde admin
administrar admins
administrar operators
4. Estructura de respuestas

Mientras más se parezcan las respuestas reales a los DTOs ya usados, menos cambios habrá que hacer en frontend.

5. Errores HTTP

El apiClient ya interpreta mensajes estándar de error.
Es recomendable devolver payloads con algo como:

{
  "message": "Texto descriptivo del error"
}
