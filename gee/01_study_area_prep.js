// Load peat areas
var peatAreas = ee.FeatureCollection(
  'projects/geograafia-uurimisprojekt/assets/peat_areas_wgs84'
);

// Study region
var region = ee.Geometry.Polygon([
  [[21.5, 57.5], [28.0, 57.5], [28.0, 59.5], [21.5, 59.5]]
]);

var targetCRS = 'EPSG:3301';
var targetScale = 10;

// Buffer distance in meters
var bufferM = 30;

var peatAreasBuffered = peatAreas.map(function(f) {
  return f.buffer(bufferM);
});

// Build peat mask
var peat = ee.Image(0).byte()
  .paint(peatAreasBuffered, 1)
  .selfMask()
  .clip(region);

function makeGrid(region, nCols, nRows) {
  region = ee.Geometry(region).bounds();
  var coords = ee.List(region.coordinates().get(0));

  var xs = coords.map(function(pt) { return ee.Number(ee.List(pt).get(0)); });
  var ys = coords.map(function(pt) { return ee.Number(ee.List(pt).get(1)); });

  var xmin = ee.Number(xs.reduce(ee.Reducer.min()));
  var xmax = ee.Number(xs.reduce(ee.Reducer.max()));
  var ymin = ee.Number(ys.reduce(ee.Reducer.min()));
  var ymax = ee.Number(ys.reduce(ee.Reducer.max()));

  var dx = xmax.subtract(xmin).divide(nCols);
  var dy = ymax.subtract(ymin).divide(nRows);

  var cells = ee.List.sequence(0, nCols - 1).map(function(col) {
    col = ee.Number(col);
    return ee.List.sequence(0, nRows - 1).map(function(row) {
      row = ee.Number(row);

      var x1 = xmin.add(dx.multiply(col));
      var x2 = xmin.add(dx.multiply(col.add(1)));
      var y1 = ymin.add(dy.multiply(row));
      var y2 = ymin.add(dy.multiply(row.add(1)));

      return ee.Feature(
        ee.Geometry.Rectangle([x1, y1, x2, y2]),
        {
          tile_id: ee.String('tile_')
            .cat(col.format('%02d'))
            .cat('_')
            .cat(row.format('%02d')),
          col: col,
          row: row
        }
      );
    });
  }).flatten();

  return ee.FeatureCollection(cells);
}

var gridRegion = peatAreasBuffered.geometry().bounds();
var grid = makeGrid(gridRegion, 4, 2);

Map.addLayer(grid, {color: 'red'}, 'Export grid');

Export.table.toDrive({
  collection: grid,
  description: 'tile_geometries',
  folder: 'GEE_exports',
  fileNamePrefix: 'tile_geometries',
  fileFormat: 'GeoJSON',
  priority: 400
});