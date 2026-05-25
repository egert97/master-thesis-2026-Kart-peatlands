
/*
Before running this script, import manually labelled positive and negative
point geometries in the GEE Code Editor and name them:
- posPts
- negPts

Classes:
0 = active
1 = abandoned
2 = restored
*/

var restoredPts = ee.FeatureCollection(
  'projects/geograafia-uurimisprojekt/assets/restored_points_10_per_polygon'
);

// Convert imported Geometry/MultiPoint into FeatureCollection
function geomToPointFC(g) {
  g = ee.Geometry(g);
  var coords = ee.List(g.coordinates());

  return ee.FeatureCollection(coords.map(function(c) {
    return ee.Feature(ee.Geometry.Point(c));
  }));
}

var posFC = ee.FeatureCollection(
  ee.Algorithms.If(
    ee.Algorithms.ObjectType(posPts).compareTo('FeatureCollection').eq(0),
    posPts,
    geomToPointFC(posPts)
  )
);

var negFC = ee.FeatureCollection(
  ee.Algorithms.If(
    ee.Algorithms.ObjectType(negPts).compareTo('FeatureCollection').eq(0),
    negPts,
    geomToPointFC(negPts)
  )
);

var pos = posFC.map(function(f) {
  return f.set('label', 1);
});

var neg = negFC.map(function(f) {
  return f.set('label', 0);
});

var restored = restoredPts.map(function(f) {
  return f.set('label', 2);
});

var trainingPts = pos.merge(neg).merge(restored);

var samples = stack.sampleRegions({
  collection: trainingPts,
  properties: ['label'],
  scale: targetScale,
  projection: targetCRS,
  geometries: true
});

samples = samples.filter(ee.Filter.notNull(predictors));

var exportSamples = samples.select([
  'NDVI', 'NDWI', 'NDMI', 'SWIR1', 'SWIR2',
  'DEM', 'VV', 'VH', 'TWI',
  'label'
]);

Export.table.toDrive({
  collection: exportSamples,
  description: 'training_points_with_predictors_all_classes',
  folder: 'GEE_exports',
  fileNamePrefix: 'training_points_with_predictors_all_classes',
  fileFormat: 'GeoJSON'
});
