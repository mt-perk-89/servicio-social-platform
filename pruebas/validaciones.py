"""
validaciones.py
---------------
Reglas de negocio extraídas del proyecto Servicio Social (Next.js + Neo4j).
Aplica el Principio de Responsabilidad Única (SRP): cada función realiza
exactamente una operación de validación.

Fuentes:
  - app/api/registro/route.ts  (validación de contraseña y coordenadas)
  - app/api/unidades/route.ts  (validación de coordenadas de unidades)
"""

# ──────────────────────────────────────────────────────────────
# Constantes de dominio
# ──────────────────────────────────────────────────────────────
MIN_LONGITUD_PASSWORD: int = 6

LAT_MIN: float = -90.0
LAT_MAX: float =  90.0
LNG_MIN: float = -180.0
LNG_MAX: float =  180.0


# ──────────────────────────────────────────────────────────────
# Funciones auxiliares (SRP: una sola responsabilidad cada una)
# ──────────────────────────────────────────────────────────────

def _tiene_longitud_minima(valor: str, minimo: int) -> bool:
    """SRP: Solo verifica si una cadena supera la longitud mínima requerida."""
    return len(valor) >= minimo


def _es_numero_valido(valor) -> bool:
    """SRP: Solo verifica si un valor puede convertirse a float."""
    try:
        float(valor)
        return True
    except (TypeError, ValueError):
        return False


def _esta_en_rango_geografico(valor: float, minimo: float, maximo: float) -> bool:
    """SRP: Solo verifica si un número está dentro de un rango geográfico."""
    return minimo <= valor <= maximo


# ──────────────────────────────────────────────────────────────
# Funciones públicas de validación
# ──────────────────────────────────────────────────────────────

def validar_password(password: str) -> bool:
    """
    SRP: Valida que la contraseña cumpla la política institucional.

    Regla de negocio: mínimo 6 caracteres (app/api/registro/route.ts, línea 30).

    Args:
        password: Contraseña ingresada por el usuario.

    Returns:
        True si la contraseña es válida según la política institucional.
    """
    if not password:
        return False
    return _tiene_longitud_minima(password, MIN_LONGITUD_PASSWORD)


def validar_coordenadas(lat, lng) -> bool:
    """
    SRP: Valida que las coordenadas sean geográficamente correctas.

    Regla de negocio extraída de app/api/registro/route.ts y
    app/api/unidades/route.ts: lat ∈ [-90, 90], lng ∈ [-180, 180].

    Args:
        lat: Latitud (cualquier tipo; se intenta convertir a float).
        lng: Longitud (cualquier tipo; se intenta convertir a float).

    Returns:
        True si ambas coordenadas están en rango válido.
    """
    if not (_es_numero_valido(lat) and _es_numero_valido(lng)):
        return False
    return (
        _esta_en_rango_geografico(float(lat), LAT_MIN, LAT_MAX) and
        _esta_en_rango_geografico(float(lng), LNG_MIN, LNG_MAX)
    )