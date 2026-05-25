// ----------------------
// Choose predictor to export
// ----------------------

var exportImage = twi.updateMask(peat);
var exportPrefix = 'twi';

var exportFolder = 'GEE_raster_inputs_spring_to_summer';

var tileIds = grid.aggregate_array('tile_id').getInfo();

tileIds.forEach(function(tileId) {
  var selectedTile = ee.Feature(
    grid.filter(ee.Filter.eq('tile_id', tileId)).first()
  ).geometry();

  var exportName = exportPrefix + '_' + tileId;

  Export.image.toDrive({
    image: exportImage,
    description: exportName,
    folder: exportFolder,
    fileNamePrefix: exportName,
    region: selectedTile,
    scale: targetScale,
    crs: targetCRS,
    maxPixels: 1e13
  });
});
