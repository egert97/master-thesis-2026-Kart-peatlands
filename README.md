# Mapping Abandoned Peat Extraction Areas in Estonia Using Machine Learning

This repository documents the code workflow developed for the master’s thesis **“Mapping abandoned peat extraction areas using machine learning”** at the University of Tartu.

The aim of the thesis was to evaluate whether abandoned peat extraction areas in Estonia can be identified using remote sensing data, topographic variables and a Random Forest classifier. The workflow combines Google Earth Engine and Python-based processing.

The model distinguishes three classes:

- `0` = active peat extraction area
- `1` = abandoned peat extraction area
- `2` = restored peat extraction area

## Abbreviations

- RF - Random Forest
- GEE - Google Earth Engine
- S1 - Sentinel-1
- S2 - Sentinel-2
- DEM - Digital Elevation Model
- TWI - Topographic Wetness Index
- NDVI - Normalized Difference Vegetation Index
- NDWI - Normalized Difference Water Index
- NDMI - Normalized Difference Moisture Index
- SHAP - Shapley Additive exPlanations

## Requirements

The workflow was developed using:

- Google Earth Engine Code Editor
- Python 3.8
- QGIS 3.34.6
- rasterio
- geopandas
- numpy
- pandas
- scikit-learn
- shap
- matplotlib
- joblib
- scipy

The exact Python environment may differ depending on the local setup. Large raster datasets and training data are not included in this repository.

## Research design

The workflow consists of four main stages:

1. Preparation of the study area and peat extraction area mask.
2. Creation of remote sensing and topographic predictor variables.
3. Training and validation of Random Forest classification models.
4. Generation of abandoned-class probability maps and interpretation using SHAP.

## Data and methods

The analysis used Sentinel-1 radar data, Sentinel-2 multispectral imagery, a digital elevation model and topographic wetness index data. Predictor variables included spectral indices, radar backscatter values, SWIR bands, DEM, TWI and local spatial variability features calculated with 3×3 and 5×5 moving windows.

Random Forest classification was used to distinguish active, abandoned and restored peat extraction areas. SHAP analysis was applied to evaluate the contribution of individual predictors to model outputs.

## Code availability note

This repository contains the shareable scripts used to document the main thesis workflow. Some auxiliary processing scripts are not included because they are part of an ongoing collaborative research workflow and may be used in a forthcoming research article by other authors.

The omitted scripts were used for local raster-tile processing, including:

- extracting predictor values and focal-window statistics from local raster tiles;
- applying trained Random Forest models to raster tiles;
- generating abandoned-class probability raster outputs.

Their role in the workflow is described in the thesis, but the source code is not redistributed in this repository.

## Notes on reproducibility

The Google Earth Engine scripts use project-specific asset paths. These paths need to be changed before the scripts can be run in another Earth Engine account.

The Python scripts also assume a local folder structure for input data and outputs. Paths should be adjusted according to the user’s local environment.
