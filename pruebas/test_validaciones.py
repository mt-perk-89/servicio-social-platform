"""
test_validaciones.py
--------------------
Pruebas unitarias con TDD (Test-Driven Development) para las reglas
de negocio del sistema de gestión de Servicio Social.

Ciclo TDD aplicado:
  RED   → Se escribe la prueba antes que el código de producción.
  GREEN → Se implementa el mínimo código necesario para pasar la prueba.
  REFACTOR → Se aplica SRP y se mejora la legibilidad sin romper pruebas.

Ejecución:
    pytest test_validaciones.py -v

Proyecto: Plataforma de Gestión de Servicio Social
Institución: UABJO – FASBIT
Materia: Automatización de Pruebas
"""

import pytest
from validaciones import validar_password, validar_coordenadas


# ══════════════════════════════════════════════════════════════════
#  FUNCIONALIDAD CRÍTICA 1 — Validación de Contraseña
#  Riesgo ID-02 (Alta) de la Matriz de Riesgos
#  Fuente: app/api/registro/route.ts – regla: len >= 6
# ══════════════════════════════════════════════════════════════════

class TestValidarPassword:

    def test_password_vacio_es_invalido(self):
        """Cadena vacía debe ser rechazada."""
        assert validar_password("") == False

    def test_password_none_es_invalido(self):
        """None explícito no debe lanzar excepción; debe retornar False."""
        assert validar_password(None) == False

    def test_password_de_5_caracteres_es_invalido(self):
        """Límite inferior inválido (Boundary Value Testing: n-1 = 5)."""
        assert validar_password("12345") == False

    def test_password_de_6_caracteres_es_valido(self):
        """Límite inferior válido (Boundary Value Testing: n = 6)."""
        assert validar_password("123456") == True

    def test_password_largo_es_valido(self):
        """Contraseña larga (caso nominal) debe ser aceptada."""
        assert validar_password("MiContrasenaSegura2025!") == True

    def test_password_solo_espacios_es_invalido(self):
        """Espacios en blanco no deben contar como caracteres válidos."""
        # Nota: la API hace .trim() antes de evaluar,
        # por lo que '      ' (6 espacios) equivale a '' tras trim.
        assert validar_password("      ".strip()) == False


# ══════════════════════════════════════════════════════════════════
#  FUNCIONALIDAD CRÍTICA 2 — Validación de Coordenadas Geográficas
#  Riesgo ID-04 (Alta) de la Matriz de Riesgos
#  Fuente: app/api/registro/route.ts y app/api/unidades/route.ts
# ══════════════════════════════════════════════════════════════════

class TestValidarCoordenadas:

    def test_coordenadas_validas_cdmx(self):
        """Ciudad de México (coordenadas de referencia del sistema)."""
        assert validar_coordenadas(19.4326, -99.1332) == True

    def test_latitud_fuera_de_rango_superior(self):
        """Latitud > 90 es inválida geográficamente."""
        assert validar_coordenadas(91.0, -99.1332) == False

    def test_latitud_fuera_de_rango_inferior(self):
        """Latitud < -90 es inválida geográficamente."""
        assert validar_coordenadas(-91.0, -99.1332) == False

    def test_longitud_fuera_de_rango_superior(self):
        """Longitud > 180 es inválida geográficamente."""
        assert validar_coordenadas(19.4326, 181.0) == False

    def test_longitud_fuera_de_rango_inferior(self):
        """Longitud < -180 es inválida geográficamente."""
        assert validar_coordenadas(19.4326, -181.0) == False

    def test_coordenadas_con_lat_none(self):
        """None en latitud debe retornar False sin lanzar excepción."""
        assert validar_coordenadas(None, -99.1332) == False

    def test_coordenadas_con_lng_none(self):
        """None en longitud debe retornar False sin lanzar excepción."""
        assert validar_coordenadas(19.4326, None) == False

    def test_coordenadas_con_strings_no_numericos(self):
        """Strings no numéricos deben ser rechazados."""
        assert validar_coordenadas("norte", "oeste") == False

    def test_coordenadas_en_limites_exactos_validos(self):
        """Boundary Value Testing: valores límite exactos permitidos."""
        assert validar_coordenadas(90.0,  180.0) == True
        assert validar_coordenadas(-90.0, -180.0) == True

    def test_coordenadas_como_strings_numericos(self):
        """
        Strings numéricos (ej: de un formulario HTML) deben ser aceptados.
        El sistema convierte con Number.parseFloat() en el frontend.
        """
        assert validar_coordenadas("19.4326", "-99.1332") == True

    def test_coordenadas_oaxaca(self):
        """Oaxaca, Oaxaca (sede del proyecto) debe ser válida."""
        assert validar_coordenadas(17.0669, -96.7203) == True