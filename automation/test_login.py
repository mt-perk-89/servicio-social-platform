"""
Automatización 1: Inicio de sesión y verificación de redirección por rol.

Este script:
  1. Siembra la base de datos (si hace falta) iniciando sesión como alumno.
  2. Inicia sesión como ADMIN y verifica que sea redirigido a /admin.
  3. Inicia sesión como ALUMNO y verifica que sea redirigido a /dashboard.

Uso:
    python automation/test_login.py
"""

import sys

from selenium.webdriver.common.by import By

from config import crear_driver, login, esperar_url_contiene, esperar, TIMEOUT


def probar_login(driver, correo, password, ruta_esperada, descripcion):
    print(f"→ Probando login {descripcion}: {correo}")
    login(driver, correo, password)
    esperar_url_contiene(driver, ruta_esperada)
    assert ruta_esperada in driver.current_url, (
        f"Se esperaba '{ruta_esperada}' pero la URL es {driver.current_url}"
    )
    print(f"  ✓ Redirigido correctamente a {ruta_esperada}")


def main():
    driver = crear_driver(headless=True)
    try:
        # Login de administrador → debe ir a /admin
        probar_login(
            driver,
            "admin@uni.edu",
            "admin123",
            "/admin",
            "ADMINISTRADOR",
        )

        # Cierra sesión limpiando el almacenamiento local antes del siguiente caso.
        driver.delete_all_cookies()
        driver.execute_script("window.localStorage.clear();")

        # Login de alumno → debe ir a /dashboard
        probar_login(
            driver,
            "ana@uni.edu",
            "123456",
            "/dashboard",
            "ALUMNO",
        )

        print("\n✅ Automatización de LOGIN completada con éxito.")
    except Exception as exc:
        print(f"\n❌ Falló la automatización de login: {exc}")
        sys.exit(1)
    finally:
        driver.quit()


if __name__ == "__main__":
    main()
