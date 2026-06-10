# Automatización con Selenium

Scripts de automatización de pruebas end-to-end para la plataforma de
Servicio Social, escritos en **Python + Selenium WebDriver**.

## Requisitos

- Python 3.9+
- Google Chrome instalado
- La aplicación corriendo (por defecto en `http://localhost:3000`)

## Instalación

```bash
cd automation
python -m venv .venv
source .venv/bin/activate        # En Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

> `webdriver-manager` descarga automáticamente el `chromedriver` compatible
> con tu versión de Chrome, así que no necesitas instalarlo a mano.

## Configuración

Si tu app no corre en `http://localhost:3000`, define la URL base:

```bash
export BASE_URL="https://tu-app.vercel.app"
```

Antes de correr las pruebas, asegúrate de haber **sembrado la base de datos**
(botón "Sembrar base de datos" en la pantalla de inicio de sesión), para que
existan los usuarios de prueba.

## Scripts disponibles

| Script | Qué automatiza |
|--------|----------------|
| `test_login.py` | Inicio de sesión como **admin** y como **alumno**, verificando la redirección por rol (`/admin` vs `/dashboard`). |
| `test_alta_unidad.py` | Flujo completo de **administrador**: llenar y enviar el formulario para **dar de alta una Unidad Receptora** y verificar que aparezca en la lista. |
| `test_registro.py` | **Registro** de un nuevo alumno con habilidades y verificación de acceso al dashboard. |
| `test_postulacion.py` | **Postulación** de un alumno a una Unidad Receptora desde la tabla de recomendaciones, verificando el cambio de estado. |
| `test_logout.py` | **Cierre de sesión** desde la barra de navegación y verificación de regreso a la pantalla de login. |

## Ejecución

```bash
python test_login.py
python test_alta_unidad.py
python test_registro.py
python test_postulacion.py
python test_logout.py
```

## Integración continua (GitHub Actions)

Estas pruebas se ejecutan **automáticamente** en cada `push` y `pull request`
mediante el workflow [`.github/workflows/selenium.yml`](../.github/workflows/selenium.yml).
El workflow construye y levanta la app, siembra la base de datos y corre cada
prueba como un paso independiente, de modo que en la pestaña **Actions** de
GitHub se ve el resultado de cada una por separado.

> Para que el workflow pueda conectarse a Neo4j Aura, agrega estos **secrets**
> del repositorio (Settings → Secrets and variables → Actions):
> `NEO4J_URI`, `NEO4J_USERNAME`, `NEO4J_PASSWORD`, `NEO4J_DATABASE` y `JWT_SECRET`.

Para agregar una nueva prueba al pipeline, crea tu `test_*.py` en esta carpeta
y añade un paso correspondiente en `selenium.yml`.

Cada script imprime su progreso y termina con un código de salida distinto de
cero si alguna verificación falla, por lo que pueden integrarse en un pipeline
de CI.

## Usuarios de prueba

| Rol | Correo | Contraseña |
|-----|--------|-----------|
| Administrador | `admin@uni.edu` | `admin123` |
| Alumno | `ana@uni.edu` | `123456` |
| Alumno | `carlos@uni.edu` | `123456` |
| Alumno | `sofia@uni.edu` | `123456` |
| Alumno | `diego@uni.edu` | `123456` |
| Alumno | `valeria@uni.edu` | `123456` |
