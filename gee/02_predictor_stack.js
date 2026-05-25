var peatAreas = ee.FeatureCollection(
  'projects/geograafia-uurimisprojekt/assets/peat_areas_wgs84'
);

var region = ee.Geometry.Polygon([
  [[21.5, 57.5], [28.0, 57.5], [28.0, 59.5], [21.5, 59.5]]
]);

var start = '2025-03-01';
var end = '2025-08-31';

var targetCRS = 'EPSG:3301';
var targetScale = 10;

var bufferM = 30;

var peatAreasBuffered = peatAreas.map(function(f) {
  return f.buffer(bufferM);
});

var peat = ee.Image(0).byte()
  .paint(peatAreasBuffered, 1)
  .selfMask()
  .clip(region);

function toTarget(img) {
  return img.reproject({
    crs: targetCRS,
    scale: targetScale
  });
}

// Sentinel-2 cloud mask
function maskS2sr(img) {
  var qa = img.select('QA60');
  var cloudBitMask  = 1 << 10;
  var cirrusBitMask = 1 << 11;

  var mask = qa.bitwiseAnd(cloudBitMask).eq(0)
    .and(qa.bitwiseAnd(cirrusBitMask).eq(0));

  return img.updateMask(mask);
}

var s2 = ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED')
  .filterBounds(region)
  .filterDate(start, end)
  .map(maskS2sr)
  .median()
  .clip(region);

var ndvi = s2.normalizedDifference(['B8', 'B4']).rename('NDVI');
var ndwi = s2.normalizedDifference(['B3', 'B8']).rename('NDWI');
var ndmi = s2.normalizedDifference(['B8', 'B11']).rename('NDMI');

var swir1 = s2.select('B11').rename('SWIR1');
var swir2 = s2.select('B12').rename('SWIR2');

var s1col = ee.ImageCollection('COPERNICUS/S1_GRD')
  .filterBounds(region)
  .filterDate(start, end)
  .filter(ee.Filter.eq('instrumentMode', 'IW'))
  .filter(ee.Filter.listContains('transmitterReceiverPolarisation', 'VV'))
  .filter(ee.Filter.listContains('transmitterReceiverPolarisation', 'VH'))
  .select(['VV', 'VH']);

var s1med = s1col.median().clip(region);

var vv = s1med.select('VV').rename('VV');
var vh = s1med.select('VH').rename('VH');

var dem = ee.Image('projects/geograafia-uurimisprojekt/assets/DTM_10m_eesti')
  .rename('DEM')
  .clip(region);

var twi = ee.Image('projects/geograafia-uurimisprojekt/assets/TWI_Maaamet_DTM')
  .rename('TWI')
  .clip(region);

var stack = ee.Image.cat([
  toTarget(ndvi),
  toTarget(ndwi),
  toTarget(ndmi),
  toTarget(swir1),
  toTarget(swir2),
  toTarget(dem),
  toTarget(vv),
  toTarget(vh),
  toTarget(twi)
]).clip(region);

var predictors = stack.bandNames();

Map.addLayer(s2.select(['B4', 'B3', 'B2']).updateMask(peat), {min: 0, max: 3000}, 'S2 RGB');
Map.addLayer(ndvi.updateMask(peat), {min: 0, max: 1}, 'NDVI');
Map.addLayer(twi.updateMask(peat), {min: 0, max: 10}, 'TWI');