# Itaca

Dashboard personal de noticias — versión reducida inspirada en la arquitectura de
[World Monitor](https://github.com/koala73/worldmonitor), pero enfocada solo en lo
que hace falta para uso propio: agregación de fuentes confiables por tema y un
resumen generado con IA local.

## Qué toma prestado de World Monitor y qué no

- **Sí**: sistema de fuentes por *tier* de confiabilidad (1 = agencias/oficiales,
  2 = medios mayores), proxy propio para RSS (evita CORS y permite cachear),
  cadena de proveedores de IA con fallback (`server/ai.js`).
- **No**: mapa 3D, 35+ capas de datos, app de escritorio (Tauri), contratos
  proto-first, múltiples variantes de sitio. Esas piezas son las que hacían
  gigante al original y no aportan a un dashboard de uso personal.

## Estructura

```
server/         API en Express (agregación RSS, cache en memoria, IA)
  sources.js    Fuentes curadas por tema, con tier de confiabilidad
  ai.js         Cadena de proveedores de IA (hoy: Ollama local)
  index.js      Rutas: /api/feeds, /api/topics, /api/brief
src/            Frontend React + TypeScript
```

## Arrancar

```bash
cp .env.example .env
npm install
npm run dev
```

Abre `http://localhost:5173`. La API corre en `http://localhost:8787` (proxeada
por Vite bajo `/api`).

El resumen con IA usa [Ollama](https://ollama.com) local — necesitas tenerlo
corriendo con el modelo configurado en `.env` (por defecto `llama3.2:1b`, rápido
incluso en CPU; modelos más grandes como `llama3:8b` dan mejor calidad pero
pueden tardar más de un minuto por respuesta en máquinas sin GPU dedicada).

## Agregar fuentes o temas

Edita `server/sources.js`. Cada fuente necesita `name`, `url` (RSS) y `tier`
(1 o 2 — evita agregar fuentes de baja confiabilidad sin revisar).

## Agregar un proveedor de IA en la nube (opcional)

`server/ai.js` tiene la cadena de fallback (`PROVIDERS`). Para sumar Groq u
OpenRouter, agrega una función `tryGroq(prompt)` con la misma forma que
`tryOllama` y súmala a la lista — si Ollama no responde, sigue con el
siguiente proveedor automáticamente.
