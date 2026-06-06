"""
Automatización 3 (extra): Registro de un nuevo alumno.

Este script:
  1. Abre la pantalla de inicio de sesión.
  2. Navega a "Crea una aquí" (/registro).
  3. Llena el formulario de registro con un correo único.
  4. Agrega habilidades y crea la cuenta.
  5. Verifica que sea redirigido a /dashboard.

Uso:
    python automation/test_registro.py
"""

import sys
import time

from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait

from config import BASE_URL, crear_driver, esperar, esperar_clickable, TIMEOUT

CORREO = f"auto{int(time.time()) % 100000}@uni.edu"
NOMBRE = "Alumno Automatizado"
PASSWORD = "123456"
HABILIDADES = ["React", "Python", "SQL"]


def main():
    driver = crear_driver(headless=True)
    try:
        print("→ Abriendo la pantalla de registro")
        driver.get(f"{BASE_URL}/registro")

        print(f"→ Registrando al alumno {CORREO}")
        esperar(driver, By.ID, "nombre").send_keys(NOMBRE)
        driver.find_element(By.ID, "correo").send_keys(CORREO)
        driver.find_element(By.ID, "password").send_keys(PASSWORD)

        # Agrega cada habilidad usando el campo + botón "Agregar".
        for h in HABILIDADES:
            campo = driver.find_element(By.ID, "habilidad")
            campo.send_keys(h)
            driver.find_element(
                By.CSS_SELECTOR, "button[aria-label='Agregar habilidad']"
            ).click()

        print("→ Creando la cuenta")
        esperar_clickable(
            driver, By.CSS_SELECTOR, "form button[type='submit']"
        ).click()

        print("→ Verificando redirección al dashboard")
        WebDriverWait(driver, TIMEOUT).until(EC.url_contains("/dashboard"))
        print("  ✓ Cuenta creada y sesión iniciada en /dashboard")

        print("\n✅ Automatización de REGISTRO completada con éxito.")
    except Exception as exc:
        print(f"\n❌ Falló la automatización de registro: {exc}")
        sys.exit(1)
    finally:
        driver.quit()


if __name__ == "__main__":
    main()
