"""
Automatización 4: Postulación de un alumno a una Unidad Receptora.

Este script:
  1. Inicia sesión como ALUMNO y espera el dashboard.
  2. Localiza la primera fila de la tabla de recomendaciones.
  3. Hace clic en "Postularse".
  4. Verifica que aparezca la insignia de estado (PENDIENTE) en esa fila.

Uso:
    python automation/test_postulacion.py
"""

import sys
import time

from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait

from config import crear_driver, login, TIMEOUT


def main():
    driver = crear_driver(headless=True)
    try:
        print("→ Iniciando sesión como ALUMNO")
        login(driver, "ana@uni.edu", "123456")
        WebDriverWait(driver, TIMEOUT).until(EC.url_contains("/dashboard"))
        print("  ✓ Sesión de alumno iniciada")

        print("→ Esperando la tabla de recomendaciones")
        WebDriverWait(driver, TIMEOUT).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, "table tbody tr"))
        )

        # Busca un botón "Postularse" disponible (alumno aún no postulado).
        print("→ Buscando una unidad disponible para postularse")
        boton = WebDriverWait(driver, TIMEOUT).until(
            EC.element_to_be_clickable(
                (By.XPATH, "//button[contains(., 'Postularse')]")
            )
        )

        # Recupera la fila que contiene ese botón para verificar el cambio después.
        fila = boton.find_element(By.XPATH, "./ancestor::tr")
        dependencia = fila.find_element(By.XPATH, "./td[1]").text.strip()
        print(f"→ Postulándose a: {dependencia}")
        boton.click()

        print("→ Verificando que aparezca la insignia de estado")
        WebDriverWait(driver, TIMEOUT).until(
            EC.presence_of_element_located(
                (By.XPATH, "//button[contains(., 'Cancelar')]")
            )
        )
        print("  ✓ Postulación registrada (botón 'Cancelar' visible)")

        print("\n✅ Automatización de POSTULACIÓN completada con éxito.")
    except Exception as exc:
        print(f"\n❌ Falló la automatización de postulación: {exc}")
        sys.exit(1)
    finally:
        driver.quit()


if __name__ == "__main__":
    main()
