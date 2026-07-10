/* =============================================================
   WebGIS — OpenLayers setup
   -------------------------------------------------------------
   Everything you need to change lives in the CONFIG block below.
   Add a layer = add one object to PRODUCED_LAYERS and give it a
   `group` (see LAYER_GROUPS). The panel builds one collapsible
   section per group so the list never feels overwhelming.

   Two ways to serve the produced layers:
   (A) GeoServer WMS  — set GEOSERVER once, then give each layer a
       `wmsLayer` name.  type: 'wms'
   (B) Local vector   — a GeoJSON file in assets/data/.  type: 'geojson'
   ============================================================= */

/* ---- CONFIG ---------------------------------------------------- */

const GEOSERVER = {
  wmsUrl:    'https://www.gis-geoserver.polimi.it/geoserver/gisgeoserver_10/wms',
  workspace: 'gisgeoserver_10'
};

// Map starts centred on Romania.
const VIEW = { lon: 25.0, lat: 45.9, zoom: 7 };

/* Panel groups, in display order. Each layer's `group` must match one
   of these strings (anything that doesn't match lands in "Other"). */
const LAYER_GROUPS = ['NO₂', 'PM2.5', 'PM10', 'Land cover'];

/* Produced layers. `group` decides which collapsible section a layer
   appears under — array order here is preserved *within* each group,
   so you can keep them ordered by processing step as below. */
const PRODUCED_LAYERS = [

  // --- STEP 2 · Average 2023 ---
  { id: 'avg_2023_no2',  group: 'NO₂',   title: 'NO₂ Average 2023',
    type: 'wms', wmsLayer: 'ROMANIA_average_NO2_2023', visible: true },
  { id: 'avg_2023_pm25', group: 'PM2.5', title: 'PM2.5 Average 2023',
    type: 'wms', wmsLayer: 'ROMANIA_average_pm2p_2023', visible: false },
  { id: 'avg_2023_pm10', group: 'PM10',  title: 'PM10 Average 2023',
    type: 'wms', wmsLayer: 'ROMANIA_average_pm10_2023', visible: false },

  // --- STEP 3 · Concentration maps 2023 ---
  { id: 'conc_2023_no2',  group: 'NO₂',   title: 'NO₂ Concentration 2023',
    type: 'wms', wmsLayer: 'ROMANIA_no2_concentration_map_2023', visible: false },
  { id: 'conc_2023_pm25', group: 'PM2.5', title: 'PM2.5 Concentration 2023',
    type: 'wms', wmsLayer: 'ROMANIA_pm2p5_concentration_map_2023', visible: false },
  { id: 'conc_2023_pm10', group: 'PM10',  title: 'PM10 Concentration 2023',
    type: 'wms', wmsLayer: 'ROMANIA_pm10_concentration_map_2023', visible: false },

  // --- STEP 4 · AMAC change maps (minimum required) ---
  { id: 'amac_no2',  group: 'NO₂',   title: 'NO₂ change 2021→2023 (AMAC)',
    type: 'wms', wmsLayer: 'ROMANIA_no2_2021_2023_AMAC_map', visible: false },
  { id: 'amac_pm25', group: 'PM2.5', title: 'PM2.5 change 2021→2023 (AMAC)',
    type: 'wms', wmsLayer: 'ROMANIA_pm2p5 _ 2021_2023_AMAC_map', visible: false }, 
  { id: 'amac_pm10', group: 'PM10',  title: 'PM10 change 2021→2023 (AMAC)',
    type: 'wms', wmsLayer: 'ROMANIA_pm10_2021_2023_AMAC_map', visible: false },

  // --- STEP 5 · Land cover change ---
  { id: 'lcc', group: 'Land cover', title: 'Land cover change 2021→2023',
    type: 'wms', wmsLayer: 'ROMANIA_LCC_2021_2023_resampled1km', visible: false },

  // --- STEP 7 · Bivariate exposure ---
  { id: 'bivariate_no2',  group: 'NO₂',   title: 'NO₂ bivariate exposure',
    type: 'wms', wmsLayer: 'ROMANIA_no2_2023_bivariate', visible: false },
  { id: 'bivariate_pm25', group: 'PM2.5', title: 'PM2.5 bivariate exposure',
    type: 'wms', wmsLayer: 'ROMANIA_pm2p5_2023_bivariate', visible: false },
  { id: 'bivariate_pm10', group: 'PM10',  title: 'PM10 bivariate exposure',
    type: 'wms', wmsLayer: 'ROMANIA_pm10_2023_bivariate', visible: false },

  // --- STEP 8 · Population exposure (charts) ---
  { id: 'exppol_no2',  group: 'NO₂',   title: 'NO₂ exposure (% Population - Level of Pollution)',
    type: 'wms', wmsLayer: 'ROMANIA_no2_2023_CHART', visible: false },   // VERIFY case
  { id: 'exppol_pm25', group: 'PM2.5', title: 'PM2.5 exposure (% Population - Level of Pollution)',
    type: 'wms', wmsLayer: 'ROMANIA_pm2p5_2023_chart', visible: false },
  { id: 'exppol_pm10', group: 'PM10',  title: 'PM10 exposure (% Population - Level of Pollution)',
    type: 'wms', wmsLayer: 'Romania_pm10_2023_chart', visible: false }   // VERIFY case
];

/* ---- BASE MAPS ------------------------------------------------- */
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
        // .trim() guards against stray spaces in a layer name.
        params: { 'LAYERS': GEOSERVER.workspace + ':' + cfg.wmsLayer.trim() },
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

/* ---- PANEL: produced-layer toggles (grouped) ------------------ */
/* One collapsible <details> section per group. The first group starts
   open; the rest start collapsed so the panel stays tidy. */
(function buildLayerControls() {
  const box = document.getElementById('layer-controls');

  // Helper: build one collapsible group from a list of {cfg, i}.
  function makeGroup(name, members, open) {
    const details = document.createElement('details');
    details.className = 'layer-group';
    details.open = open;

    const summary = document.createElement('summary');
    summary.innerHTML = name + ' <span class="group-count">' + members.length + '</span>';
    details.appendChild(summary);

    members.forEach(function (m) {
      const row = document.createElement('div');
      row.className = 'layer-row';
      row.innerHTML =
        '<input type="checkbox" id="ly-' + m.cfg.id + '"' + (m.cfg.visible ? ' checked' : '') + '>' +
        '<label for="ly-' + m.cfg.id + '">' + m.cfg.title + '</label>';
      details.appendChild(row);
      row.querySelector('input').addEventListener('change', function (e) {
        overlayLayers[m.i].setVisible(e.target.checked);
        renderLegend();
      });
    });

    box.appendChild(details);
  }

  const placed = new Set();

  // Known groups, in LAYER_GROUPS order.
  LAYER_GROUPS.forEach(function (groupName, gi) {
    const members = [];
    PRODUCED_LAYERS.forEach(function (cfg, i) {
      if (cfg.group === groupName) { members.push({ cfg: cfg, i: i }); placed.add(i); }
    });
    if (members.length) makeGroup(groupName, members, gi === 0);
  });

  // Safety net: any layer with a missing/unknown group still shows up.
  const others = [];
  PRODUCED_LAYERS.forEach(function (cfg, i) {
    if (!placed.has(i)) others.push({ cfg: cfg, i: i });
  });
  if (others.length) makeGroup('Other', others, false);
})();

/* ---- LEGEND --------------------------------------------------- */
/* For WMS layers we ask GeoServer to draw the legend from the
   layer's own SLD (WMS "GetLegendGraphic") via source.getLegendUrl().
   For local GeoJSON layers we fall back to the manual `legend` array. */

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
      const url = source.getLegendUrl(resolution, {
        LEGEND_OPTIONS: LEGEND_OPTIONS,
        TRANSPARENT: true
      });
      const img = document.createElement('img');
      img.src = url;
      img.alt = cfg.title + ' legend';
      img.style.cssText = 'max-width:100%;display:block;';
      img.onerror = function () {
        if (cfg.legend) img.replaceWith(manualSwatches(cfg));
        else img.replaceWith(document.createTextNode('Legend unavailable — is GeoServer configured?'));
      };
      box.appendChild(img);
    } else {
      box.appendChild(manualSwatches(cfg));
    }
  });

  if (!any) {
    box.innerHTML = '<p style="font-size:.82rem;color:var(--muted);">Toggle a layer to show its legend.</p>';
  }
}
renderLegend();

/* Legends can be scale-dependent. Uncomment to refresh on zoom:
// map.getView().on('change:resolution', renderLegend);
*/