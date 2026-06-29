# Setup: MAGIPONS Workbook Platform

Guía paso a paso para configurar la plataforma localmente y deployarla.

## Paso 1: Crear Proyecto Firebase

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Haz clic en **"Crear un proyecto"**
3. Nombre: `magipons-workbook`
4. Deja las opciones por defecto y haz clic en **"Crear proyecto"**
5. Espera a que se cree (toma ~1 minuto)

## Paso 2: Configurar Firestore Database

1. En la sección izquierda, haz clic en **"Firestore Database"**
2. Haz clic en **"Crear base de datos"**
3. Selecciona la región más cercana (ej: `europe-west1`)
4. **Modo inicial**: Selecciona **"Modo de prueba"** (para testing local)
   - Esto permite lecturas/escrituras sin restricciones
   - IMPORTANTE: Cambiar a modo de producción antes de deployar
5. Haz clic en **"Crear"**

### Firestore Rules (para Producción - después)

Una vez que esté listo para producción, reemplaza las reglas con:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{uid} {
      allow read, write: if request.auth.uid == uid;
    }
    
    match /workbooks/{docId} {
      allow read, write: if request.auth.uid == resource.data.userId;
      allow read: if isAdmin(request.auth.token.email);
      allow list: if isAdmin(request.auth.token.email);
    }
    
    match /admins/{email} {
      allow read: if request.auth != null;
    }
  }
  
  function isAdmin(email) {
    return exists(/databases/$(database)/documents/admins/$(email));
  }
}
```

## Paso 3: Habilitar Google OAuth

1. En la sección izquierda, haz clic en **"Authentication"**
2. Haz clic en la pestaña **"Sign-in method"**
3. Haz clic en **"Google"**
4. Enciende el toggle
5. Selecciona tu email como **"Email de soporte del proyecto"**
6. Haz clic en **"Guardar"**

## Paso 4: Copiar Configuración de Firebase

1. En la página de autenticación o inicio, haz clic en el ícono de engranaje (⚙️) → **"Configuración del proyecto"**
2. Desplázate hacia abajo hasta **"Tu apps"**
3. Si no hay una app registrada, haz clic en **"</>  Web"** para crear una
4. Copia la configuración (verás algo como):
   ```javascript
   const firebaseConfig = {
     apiKey: "AIza...",
     authDomain: "magipons-workbook.firebaseapp.com",
     projectId: "magipons-workbook",
     storageBucket: "magipons-workbook.appspot.com",
     messagingSenderId: "123456789",
     appId: "1:123456789:web:abcdef..."
   };
   ```

## Paso 5: Configurar Variables de Entorno Locales

1. En la carpeta `magipons-workbook`, crea un archivo `.env.local`
2. Copia el contenido de `.env.local.example`
3. Reemplaza los valores con los de tu configuración Firebase:

```env
VITE_FIREBASE_API_KEY=AIza...
VITE_FIREBASE_AUTH_DOMAIN=magipons-workbook.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=magipons-workbook
VITE_FIREBASE_STORAGE_BUCKET=magipons-workbook.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef...
```

## Paso 6: Ejecutar Localmente

```bash
cd magipons-workbook
npm install      # (si no lo hiciste)
npm run dev
```

Abre http://localhost:5173 en tu navegador.

### Prueba del Flujo:
1. Haz clic en "Comienza tu Workbook"
2. Haz clic en "Inicia sesión con Google"
3. Selecciona tu cuenta Google
4. Completa el formulario (los datos se guardan automáticamente en Firestore)
5. Haz clic en "Enviar Workbook" al final del Día 2

## Paso 7: Crear Admin Users en Firestore

Para que Marita y Gonzalo puedan ver el admin panel (en fases futuras):

1. En Firestore, crea una colección llamada **"admins"**
2. Crea dos documentos con estos IDs:
   - `marita@funnelcracks.com` (contenido: cualquiera, ej: `{ role: "admin" }`)
   - `gonzalo@funnelcracks.com` (contenido: cualquiera, ej: `{ role: "admin" }`)

Los usuarios con esos emails ahora tendrán acceso admin.

## Paso 8: Deploy a Netlify

### Prerequisitos:
- Cuenta en [Netlify](https://app.netlify.com/)
- Repositorio en GitHub

### Pasos:

1. **Crear repositorio GitHub:**
   ```bash
   cd magipons-workbook
   git init
   git add .
   git commit -m "Initial commit: MAGIPONS Workbook Platform"
   git branch -M main
   git remote add origin https://github.com/tu-usuario/magipons-workbook.git
   git push -u origin main
   ```

2. **Conectar a Netlify:**
   - Ve a [Netlify](https://app.netlify.com/)
   - Haz clic en **"Import from Git"** → **"GitHub"**
   - Selecciona el repositorio `magipons-workbook`
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Haz clic en **"Deploy"**

3. **Agregar Variables de Entorno en Netlify:**
   - Ve a tu sitio en Netlify
   - **Configuración** → **Variables** → **Variables de compilación**
   - Agrega todas las variables de `.env.local`:
     - `VITE_FIREBASE_API_KEY`
     - `VITE_FIREBASE_AUTH_DOMAIN`
     - etc.

4. **Desplegar:**
   - Netlify auto-despliega cuando haces push a GitHub
   - Tu sitio estará disponible en `https://magipons-workbook.netlify.app`

## Cambiar Dominio (Opcional)

Si quieres un dominio personalizado como `workbook.magipons.com`:

1. En Netlify, ve a **Configuración** → **Dominio**
2. Haz clic en **"Agregar dominio personalizado"**
3. Ingresa tu dominio (ej: `workbook.magipons.com`)
4. Sigue las instrucciones para actualizar DNS en tu proveedor de dominios

## Troubleshooting

### Error: "apiKey is invalid"
- Verifica que copiaste correctamente la configuración de Firebase
- Asegúrate de que el `apiKey` comienza con `AIza...`

### Error: "Auth is not initialized"
- Verifica que `.env.local` existe y tiene las variables correctas
- Reinicia el servidor local (`npm run dev`)

### Usuario no puede hacer login
- Verifica que Google OAuth está habilitado en Firebase Console
- Comprueba que el dominio está autorizado (por defecto localhost:5173 debería funcionar)

### Datos no se guardan en Firestore
- Verifica que estás usando el mismo `projectId` que en Firebase Console
- En modo test, las reglas no deberían ser un problema
- Si estás en modo producción, asegúrate de que las reglas permiten escritura

## Próximos Pasos (Phase 2 & 3)

- [ ] Panel de admin para ver todos los workbooks
- [ ] Exportar workbooks a CSV
- [ ] IA para corrección automática (Claude API)
- [ ] Sistema de invitaciones
- [ ] Notificaciones por email

---

¿Preguntas? Revisa el README.md o el archivo de plan en `.claude/plans/optimized-cuddling-sparkle.md`
