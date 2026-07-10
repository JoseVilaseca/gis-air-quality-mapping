/* =============================================================
   WebGIS — OpenLayers setup
   -------------------------------------------------------------
   Everything you need to change lives in the CONFIG block below.
   Add a layer = add one object to PRODUCED_LAYERS. The panel and
   the legend build themselves from that array.

   Two ways to serve the produced layers:
   (A) GeoServer WMS  — recommended ("online solution highly
       rewarded"). Set GEOSERVER once, then give each layer a
       `wmsLayer` name.  type: 'wms'
   (B) Local vector   — a GeoJSON file in assets/data/.  type: 'geojson'
       (Raster GeoTIFFs should be published via GeoServer or
        pre-rendered to PNG/GeoJSON — the browser can't read .tif
        directly with plain OpenLayers.)
   ============================================================= */

/* ---- CONFIG ---------------------------------------------------- */

const GEOSERVER = {
  wmsUrl:    'https://www.gis-geoserver.polimi.it/geoserver/gisgeoserver_10/wms', // TODO: set WORKSPACE
  workspace: 'gisgeoserver_10'                                                    // TODO: set WORKSPACE
};

// Map starts centred on Romania.
const VIEW = { lon: 25.0, lat: 45.9, zoom: 6 };

/* Produced layers. Order here = order in the panel (top = first).
   `visible: false` keeps the map clean until a layer is configured.
   Each `legend` entry becomes a swatch + label in the Legend panel. */

const PRODUCED_LAYERS = [

  // --- STEP 2 . Average 2023 Pollutan ---
  {
    id: 'avg_2023_no2', title: 'NO₂ Average 2023',
    type: 'wms', wmsLayer: 'ROMANIA_average_NO2_2023', visible: false,
  },
    {
    id: 'avg_2023_pm25', title: 'PM2.5 Average 2023',
    type: 'wms', wmsLayer: 'ROMANIA_average_pm2p_2023', visible: false
  },
  {
    id: 'avg_2023_pm10', title: 'PM10 Average 2023',
    type: 'wms', wmsLayer: 'ROMANIA_average_pm10_2023', visible: false
  },
  // --- STEP 3 . Pollutant Concentration Maps 2023  ---
  {
    id: 'conc_2023_no2', title: 'NO₂ Concentration 2023',
    type: 'wms', wmsLayer: 'ROMANIA_no2_concentration_map_2023', visible: false,
  },
    {
    id: 'conc_2023_pm25', title: 'PM2.5 Concentration 2023',
    type: 'wms', wmsLayer: 'ROMANIA_pm2p5_concentration_map_2023', visible: false
  },
  {
    id: 'conc_2023_pm10', title: 'PM10 Concentration 2023',
    type: 'wms', wmsLayer: 'ROMANIA_pm10_concentration_map_2023', visible: false
  },
  // --- STEP 4 · AMAC change maps (minimum required) ---
  {
    id: 'amac_no2', title: 'NO₂ change 2021→2023 (AMAC)',
    type: 'wms', wmsLayer: 'ROMANIA_no2_2021_2023_AMAC_map ', visible: false
  },
  {
    id: 'amac_pm25', title: 'PM2.5 change 2021→2023 (AMAC)',
    type: 'wms', wmsLayer: 'ROMANIA_pm2p5 _ 2021_2023_AMAC_map', visible: false
  },
  {
    id: 'amac_pm10', title: 'PM10 change 2021→2023 (AMAC)',
    type: 'wms', wmsLayer: 'ROMANIA_pm10_2021_2023_AMAC_map ', visible: false
  },

  // --- STEP 5 · Land cover change ---
  {
    id: 'lcc', title: 'Land cover change 2021→2023',
    type: 'wms', wmsLayer: 'ROMANIA_LCC_2021_2023_resampled1km', visible: false,
  },

  // --- STEP 7 · Bivariate exposure ---
  {
    id: 'bivariate_no2', title: 'NO₂ bivariate exposure',
    type: 'wms', wmsLayer: 'ROMANIA_no2_2023_bivariate', visible: false
  },
  {
    id: 'bivariate_pm25', title: 'PM2.5 bivariate exposure',
    type: 'wms', wmsLayer: '', visible: false
  },
  {
    id: 'bivariate_pm10', title: 'PM10 bivariate exposure',
    type: 'wms', wmsLayer: 'ROMANIA_pm10_2023_bivariate', visible: false
  },

  // --- Optional context layers (uncomment / add as needed) ---
  // { id: 'population', title: 'Population 2023', type: 'wms', wmsLayer: 'ROU_population_2023', visible: false, legend: [...] },

  // --- DEMO local layer so the map isn't empty before GeoServer is set.
  //     Delete once your real layers are live. ---
  // {
  //   id: 'boundary', title: 'Romania boundary (placeholder)',
  //   type: 'geojson', url: 'assets/data/romania_boundary_placeholder.geojson',
  //   visible: true,
  //   style: { stroke: '#1f6e7c', width: 1.5, fill: 'rgba(31,110,124,0.06)' },
  //   legend: [{ color: '#1f6e7c', label: 'Study-area boundary (placeholder)' }]
  // }
];

/* ---- BASE MAPS ------------------------------------------------- */
/* OSM + one other, as required. CartoDB Positron is a clean,
   minimalist second base map — check attribution before publishing. */
const baseMaps = {
  osm: new ol.layer.Tile({
    source: new ol.source.OSM(),
    visible: false
  }),
  positron: new ol.layer.Tile({
    source: new ol.source.XYZ({
      url: 'https://{a-d}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
      attributions: '© OpenStreetMap contributors, © CARTO'
    }),
    visible: true
  })
};

/* ---- BUILD LAYER OBJECTS -------------------------------------- */
const overlayLayers = PRODUCED_LAYERS.map(function (cfg) {
  let layer;

  if (cfg.type === 'wms') {
    layer = new ol.layer.Image({
      visible: cfg.visible,
      source: new ol.source.ImageWMS({
        url: GEOSERVER.wmsUrl,
        params: { 'LAYERS': GEOSERVER.workspace + ':' + cfg.wmsLayer},
        serverType: 'geoserver',
        crossOrigin: 'anonymous'
      })

    });
  } else if (cfg.type === 'geojson') {
    const s = cfg.style || {};
    layer = new ol.layer.Vector({
      visible: cfg.visible,
      source: new ol.source.Vector({
        url: cfg.url,
        format: new ol.format.GeoJSON()
      }),
      style: new ol.style.Style({
        stroke: new ol.style.Stroke({ color: s.stroke || '#333', width: s.width || 1 }),
        fill:   new ol.style.Fill({ color: s.fill || 'rgba(0,0,0,0)' })
      })
    });
  }

  layer.set('cfgId', cfg.id);
  return layer;
});

/* ---- CONTROLS -------------------------------------------------- */
/* Required: Scale Line, Full Screen, Mouse Position. */
const controls = ol.control.defaults.defaults().extend([
  new ol.control.ScaleLine(),
  new ol.control.FullScreen(),
  new ol.control.MousePosition({
    coordinateFormat: ol.coordinate.createStringXY(4),
    projection: 'EPSG:4326',
    className: 'ol-mouse-position',
    placeholder: 'lon, lat'
  })
]);

/* ---- MAP ------------------------------------------------------- */
const map = new ol.Map({
  target: 'map',
  layers: [baseMaps.osm, baseMaps.positron].concat(overlayLayers),
  controls: controls,
  view: new ol.View({
    center: ol.proj.fromLonLat([VIEW.lon, VIEW.lat]),
    zoom: VIEW.zoom
  })
});

/* ---- PANEL: base map switcher --------------------------------- */
(function buildBaseControls() {
  const box = document.getElementById('basemap-controls');
  const options = [
    { key: 'osm',      label: 'OpenStreetMap', checked: false },
    { key: 'positron', label: 'CARTO Light',   checked: true }
  ];
  options.forEach(function (o) {
    const row = document.createElement('div');
    row.className = 'base-row';
    row.innerHTML =
      '<input type="radio" name="basemap" id="bm-' + o.key + '"' + (o.checked ? ' checked' : '') + '>' +
      '<label for="bm-' + o.key + '">' + o.label + '</label>';
    box.appendChild(row);
    row.querySelector('input').addEventListener('change', function () {
      baseMaps.osm.setVisible(o.key === 'osm');
      baseMaps.positron.setVisible(o.key === 'positron');
    });
  });
})();

/* ---- PANEL: produced-layer toggles ---------------------------- */
(function buildLayerControls() {
  const box = document.getElementById('layer-controls');
  PRODUCED_LAYERS.forEach(function (cfg, i) {
    const row = document.createElement('div');
    row.className = 'layer-row';
    row.innerHTML =
      '<input type="checkbox" id="ly-' + cfg.id + '"' + (cfg.visible ? ' checked' : '') + '>' +
      '<label for="ly-' + cfg.id + '">' + cfg.title + '</label>';
    box.appendChild(row);
    row.querySelector('input').addEventListener('change', function (e) {
      overlayLayers[i].setVisible(e.target.checked);
      renderLegend();
    });
  });
})();

/* ---- LEGEND --------------------------------------------------- */
/* For WMS layers we ask GeoServer to draw the legend from the
   layer's own SLD (WMS "GetLegendGraphic"). OpenLayers builds that
   URL for us via source.getLegendUrl(). This means the legend always
   matches the server-side style — no hardcoded swatches to maintain.
   For the local GeoJSON layer (no server), we fall back to the manual
   `legend` array in its config. */

// GeoServer vendor options that style the generated legend PNG to
// match the site. Colours are 0xRRGGBB. See:
// docs.geoserver.org/latest/en/user/services/wms/get_legend_graphic
const LEGEND_OPTIONS = 'forceLabels:on;fontName:Arial;fontColor:0x16232b;fontAntiAliasing:true';

function manualSwatches(cfg) {
  const ul = document.createElement('ul');
  ul.className = 'legend-list';
  (cfg.legend || []).forEach(function (item) {
    const li = document.createElement('li');
    li.innerHTML = '<span class="swatch" style="background:' + item.color + '"></span>' + item.label;
    ul.appendChild(li);
  });
  return ul;
}

function renderLegend() {
  const box = document.getElementById('legend');
  box.innerHTML = '';
  const resolution = map.getView().getResolution();
  let any = false;

  PRODUCED_LAYERS.forEach(function (cfg, i) {
    const layer = overlayLayers[i];
    if (!layer.getVisible()) return;
    any = true;

    const title = document.createElement('p');
    title.style.cssText = 'font-family:var(--font-mono);font-size:.72rem;margin:.6rem 0 .4rem;color:var(--ink);';
    title.textContent = cfg.title;
    box.appendChild(title);

    const source = layer.getSource();
    if (cfg.type === 'wms' && typeof source.getLegendUrl === 'function') {
      // Fetch the legend image straight from GeoServer's GetLegendGraphic.
      const url = source.getLegendUrl(resolution, {
        LEGEND_OPTIONS: LEGEND_OPTIONS,
        TRANSPARENT: true
      });
      const img = document.createElement('img');
      img.src = url;
      img.alt = cfg.title + ' legend';
      img.style.cssText = 'max-width:100%;display:block;';
      // If GeoServer isn't reachable yet, fall back to manual swatches (if any).
      img.onerror = function () {
        if (cfg.legend) img.replaceWith(manualSwatches(cfg));
        else img.replaceWith(document.createTextNode('Legend unavailable — is GeoServer configured?'));
      };
      box.appendChild(img);
    } else {
      // Local GeoJSON (or any layer without a WMS source): manual swatches.
      box.appendChild(manualSwatches(cfg));
    }
  });

  if (!any) {
    box.innerHTML = '<p style="font-size:.82rem;color:var(--muted);">Toggle a layer to show its legend.</p>';
  }
}
renderLegend();
