# Mapping Air Quality — project website

Static website + WebGIS for the GIS laboratory (Romania, 2021–2023).
Plain HTML / CSS / JS — no build step. Open `index.html` in a browser, or
publish the whole folder to GitHub Pages.

## Pages
| File | Purpose |
|------|---------|
| `index.html` | Home — overview, study area, scorecard, objectives |
| `methodology.html` | Datasets + the 8-step processing pipeline |
| `results.html` | Results — figure / chart / table placeholders + analysis |
| `webgis.html` | Interactive OpenLayers map |

## Where to put your deliverables
```
assets/
├── figures/   ← static maps & charts as .jpg   (Fig. 1–8)
├── charts/    ← interactive charts as .html     (DataPlotly / Plotly exports)
└── data/      ← WebGIS vector layers (.geojson) if not using GeoServer
```

### Swapping a placeholder (Results page)
Every placeholder is a `.ph-drop` block that prints the expected filename.
- **Static image** → replace the block with `<img src="assets/figures/NAME.jpg" alt="…">`
- **Interactive chart** → `<iframe class="chart-frame" src="assets/charts/NAME.html"></iframe>`
- **Table** → the table structure is already there; fill the `[—]` cells.

## WebGIS layers — two options
Edit **only** `js/webgis.js` (the `CONFIG` block at the top).

**A · GeoServer WMS (recommended, "online solution").**
1. Set `GEOSERVER.wmsUrl` and `GEOSERVER.workspace` to your Polimi group's workspace.
2. For each layer set `type: 'wms'` and `wmsLayer: '<published layer name>'`.
3. Flip `visible: true` once it loads.

**B · Local GeoJSON (no server).**
Set `type: 'geojson'` and `url: 'assets/data/NAME.geojson'`.
> Raster GeoTIFFs (`.tif`) can't be read directly by plain OpenLayers —
> publish them via GeoServer, or pre-render to PNG/GeoJSON.

The layer panel and legend build themselves from the `PRODUCED_LAYERS` array,
so adding a layer = adding one object. The demo "Romania boundary (placeholder)"
layer is only there so the map isn't empty — delete it when your layers are live.

## Retheming
All colours, fonts and spacing are CSS variables in `:root` at the top of
`css/style.css`. Change them there and the whole site follows.

## Still to fill in
Search the files for `TODO`, `[NAME]` and `[—]`:
- Team member names (footer, every page)
- GeoServer workspace (`js/webgis.js`)
- NO₂ / PM2.5 analysis text (Step 6) and exposure charts (Step 8)
- Step-5 statistics table numbers
