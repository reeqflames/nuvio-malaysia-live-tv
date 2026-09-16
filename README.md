# Nuvio Malaysia Live TV

A lightweight Malaysia Live TV addon for Nuvio/Stremio-compatible clients.

## V1
- Malaysia Live TV catalog
- RTM, Media Prima, News, Sports and Kids categories
- Per-channel metadata
- Stream endpoint with safe environment-variable configuration
- EPG-ready channel IDs
- Modern status/preview page
- Render deployment blueprint

## Run
```bash
npm start
```
Open `http://localhost:3000/manifest.json`.

## Playback configuration
Direct live URLs are intentionally not committed to the public repository. Configure only official/authorized streams in Render environment variables, for example `STREAM_TV1`, `STREAM_TV2`, `STREAM_TV3`.

## Deploy on Render
Create a Blueprint/Web Service from this repository. Set `PUBLIC_URL` to the final HTTPS service URL. Render will run `npm start` and check `/health`.

## Nuvio
After deployment, install the addon using:
`https://YOUR-SERVICE.onrender.com/manifest.json`
