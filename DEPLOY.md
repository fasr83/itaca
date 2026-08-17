# Desplegar Itaca en tu servidor CasaOS

Dos formas de hacerlo. Si tu CasaOS tiene la opción de "Custom Install" /
"Instalar app personalizada" con docker-compose, es la más simple. Si no,
la terminal funciona siempre.

## Opción A — Terminal de CasaOS (o SSH)

1. Abre la terminal de CasaOS (ícono de Terminal en el dashboard) o conéctate
   por SSH a tu servidor.

2. Cloná el repositorio:
   ```bash
   git clone https://github.com/fasr83/itaca.git
   cd itaca
   ```

3. Creá tu archivo de configuración:
   ```bash
   cp .env.example .env
   nano .env
   ```
   Agregá las keys que ya tengas (por ejemplo `NASA_FIRMS_KEY`). Dejá las
   demás comentadas — cada panel se muestra deshabilitado hasta que le
   agregues su key, no rompe nada.

   Importante: **no pongas `OLLAMA_HOST` apuntando a tu Mac** — el servidor
   no va a poder alcanzarlo. Si tu CasaOS no tiene Ollama instalado, dejá esa
   línea tal cual (comentada); los resúmenes/traducción con IA simplemente
   no van a estar disponibles ahí, el resto de Itaca (noticias, radar, TV,
   mapa, búsqueda de vuelos) funciona igual.

4. Construí y levantá el contenedor:
   ```bash
   docker compose up -d --build
   ```

5. Encontrá la IP local de tu servidor (si no la sabés ya):
   ```bash
   hostname -I
   ```

6. Desde tu teléfono, conectado al mismo WiFi que el servidor, abrí:
   ```
   http://<ip-del-servidor>:8787
   ```

## Opción B — CasaOS "Custom Install"

Si tu versión de CasaOS tiene un botón de instalar app personalizada por
docker-compose, pegá el contenido de [`docker-compose.yml`](./docker-compose.yml)
ahí. Vas a necesitar que la imagen se construya desde este repo (build
context), o si tu CasaOS solo acepta imágenes ya publicadas, avisame y armo
una imagen y la subo a Docker Hub o GitHub Container Registry para que sea
un simple `docker pull`.

## Actualizar Itaca más adelante

```bash
cd itaca
git pull
docker compose up -d --build
```

## Acceso desde fuera de tu red WiFi

Lo de arriba solo funciona en la misma red local. Para acceder desde
cualquier lado (datos móviles, otra red), hay que exponer el servidor hacia
afuera — normalmente con:
- Port forwarding en tu router (abrir el puerto 8787 hacia la IP del
  servidor) + DNS dinámico si tu IP pública cambia, o
- Una VPN personal tipo Tailscale/WireGuard (más seguro — no expone el
  puerto directo a Internet), o
- Si tu CasaOS ya tiene un reverse proxy / túnel configurado para otras
  apps (como BoxDental), el mismo mecanismo sirve para Itaca.

Decime cuál de estas ya tenés armada para BoxDental y usamos la misma para
Itaca.
