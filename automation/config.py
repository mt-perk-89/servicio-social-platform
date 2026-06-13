"""
Configuración compartida para los scripts de automatización con Selenium.

Crea y configura el WebDriver de Chrome, expone la URL base de la aplicación
y utilidades comunes (esperas explícitas, login, etc.) reutilizadas por las
distintas pruebas de automatización.
"""

import os
import time

from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait

# URL base de la app. Cámbiala con la variable de entorno BASE_URL si es necesario.
BASE_URL = os.environ.get("BASE_URL", "http://localhost:3000")

# Tiempo máximo (segundos) para las esperas explícitas.
TIMEOUT = 20


def crear_driver(headless: bool = True) -> webdriver.Chrome:
    """Inicializa un WebDriver de Chrome listo para usarse."""
    options = Options()
    if headless:
        options.add_argument("--headless=new")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    options.add_argument("--disable-gpu")
    options.add_argument("--window-size=1366,900")

    # Intenta usar webdriver-manager si está disponible; si no, usa el chromedriver del PATH.
    try:
        from webdriver_manager.chrome import ChromeDriverManager

        service = Service(ChromeDriverManager().install())
        return webdriver.Chrome(service=service, options=options)
    except Exception:
        return webdriver.Chrome(options=options)


def esperar(driver, by, selector, timeout: int = TIMEOUT):
    """Espera a que un elemento sea visible y lo devuelve."""
    return WebDriverWait(driver, timeout).until(
        EC.visibility_of_element_located((by, selector))
    )


def esperar_clickable(driver, by, selector, timeout: int = TIMEOUT):
    """Espera a que un elemento sea clickable y lo devuelve."""
    return WebDriverWait(driver, timeout).until(
        EC.element_to_be_clickable((by, selector))
    )


def esperar_url_contiene(driver, fragmento: str, timeout: int = TIMEOUT):
    """Espera a que la URL contenga el fragmento dado."""
    return WebDriverWait(driver, timeout).until(EC.url_contains(fragmento))


def login(driver, correo: str, password: str):
    """Realiza el flujo de inicio de sesión en la pantalla principal."""
    driver.get(BASE_URL)
    esperar(driver, By.ID, "correo").clear()
    driver.find_element(By.ID, "correo").send_keys(correo)
    driver.find_element(By.ID, "password").clear()
    driver.find_element(By.ID, "password").send_keys(password)
    esperar_clickable(driver, By.CSS_SELECTOR, "button[type='submit']").click()
    # Espera a que el navegador navegue tras el submit.
    WebDriverWait(driver, TIMEOUT).until(EC.url_changes(driver.current_url))
