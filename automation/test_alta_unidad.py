"""
Automatización 2: Alta de una Unidad Receptora como administrador.

Este script:
  1. Inicia sesión como ADMIN.
  2. Llena el formulario "Dar de alta una unidad receptora".
  3. Envía el formulario y verifica que la nueva unidad aparezca en la lista.

Uso:
    python automation/test_alta_unidad.py
"""

import sys
import time

from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait

from config import crear_driver, login, esperar, esperar_clickable, TIMEOUT

# ID único basado en timestamp para evitar colisiones entre ejecuciones.
ID_UNIDAD = f"UA{int(time.time()) % 100000}"
NOMBRE_DEP = "Dirección de Automatización QA"
VACANTES = "4"
LAT = "19.4400"
LNG = "-99.1400"
TECNOLOGIAS = "Python, Selenium, SQL"


def main():
    driver = crear_driver(headless=True)
    try:
        print("→ Iniciando sesión como ADMINISTRADOR")
        login(driver, "admin@uni.edu", "admin123")
        WebDriverWait(driver, TIMEOUT).until(EC.url_contains("/admin"))
        print("  ✓ Sesión de administrador iniciada")

        print(f"→ Llenando formulario para la unidad {ID_UNIDAD}")
        esperar(driver, By.ID, "idUnidad").send_keys(ID_UNIDAD)
        driver.find_element(By.ID, "vacantes").send_keys(VACANTES)
        driver.find_element(By.ID, "nombre").send_keys(NOMBRE_DEP)
        driver.find_element(By.ID, "lat").send_keys(LAT)
        driver.find_element(By.ID, "lng").send_keys(LNG)
        driver.find_element(By.ID, "tecnologias").send_keys(TECNOLOGIAS)

        print("→ Enviando el formulario")
        esperar_clickable(
            driver, By.CSS_SELECTOR, "form button[type='submit']"
        ).click()

        # Verifica que la nueva dependencia aparezca en la lista de unidades.
        print("→ Verificando que la unidad aparezca en la lista")
        WebDriverWait(driver, TIMEOUT).until(
            EC.presence_of_element_located(
                (By.XPATH, f"//*[contains(text(), '{NOMBRE_DEP}')]")
            )
        )
        print(f"  ✓ La unidad '{NOMBRE_DEP}' fue dada de alta correctamente")

        print("\n✅ Automatización de ALTA DE UNIDAD completada con éxito.")
    except Exception as exc:
        print(f"\n❌ Falló la automatización de alta de unidad: {exc}")
        sys.exit(1)
    finally:
        driver.quit()


if __name__ == "__main__":
    main()
