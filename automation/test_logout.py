"""
Automatización 5: Cierre de sesión.

Este script:
  1. Inicia sesión como ALUMNO y espera el dashboard.
  2. Hace clic en el botón "Cerrar sesión" de la barra de navegación.
  3. Verifica que se regrese a la pantalla de login (campo de correo visible).

Uso:
    python automation/test_logout.py
"""

import sys

from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait

from config import crear_driver, login, esperar, TIMEOUT


def main():
    driver = crear_driver(headless=True)
    try:
        print("→ Iniciando sesión como ALUMNO")
        login(driver, "ana@uni.edu", "123456")
        WebDriverWait(driver, TIMEOUT).until(EC.url_contains("/dashboard"))
        print("  ✓ Sesión de alumno iniciada")

        print("→ Haciendo clic en 'Cerrar sesión'")
        boton = WebDriverWait(driver, TIMEOUT).until(
            EC.element_to_be_clickable(
                (By.XPATH, "//button[contains(., 'Cerrar sesión')]")
            )
        )
        boton.click()

        print("→ Verificando regreso a la pantalla de login")
        WebDriverWait(driver, TIMEOUT).until(EC.url_matches(r".*/$"))
        # El campo de correo del login debe estar visible nuevamente.
        esperar(driver, By.ID, "correo")
        assert "/dashboard" not in driver.current_url, (
            f"Se esperaba salir de /dashboard pero la URL es {driver.current_url}"
        )
        print("  ✓ Sesión cerrada y formulario de login visible")

        print("\n✅ Automatización de CIERRE DE SESIÓN completada con éxito.")
    except Exception as exc:
        print(f"\n❌ Falló la automatización de cierre de sesión: {exc}")
        sys.exit(1)
    finally:
        driver.quit()


if __name__ == "__main__":
    main()
