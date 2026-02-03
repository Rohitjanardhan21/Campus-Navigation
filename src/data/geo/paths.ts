import { FeatureCollection, LineString } from "geojson";

export const CAMPUS_PATHS: FeatureCollection<LineString> = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: {
        fid: 1,
        id: "maingate_to_campus",
        name: "MainGate->Campus",
      },
      geometry: {
        type: "LineString",
        coordinates: [
          [77.434810776285687, 12.863866101271265],
          [77.435884793447798, 12.863482395299314],
          [77.437385749109112, 12.862897079974539],
        ],
      },
    },
    {
      type: "Feature",
      properties: {
        fid: 2,
        id: "Block1_to_Block6",
        name: "Block1 to Block6",
      },
      geometry: {
        type: "LineString",
        coordinates: [
          [77.437385749109112, 12.862897079974539],
          [77.437469194238943, 12.862775782033093],
          [77.438877239777867, 12.862151821217537],
          [77.439280215773863, 12.862054760506782],
          [77.439578892100286, 12.862073248264107],
          [77.439716378028308, 12.862142577341938],
          [77.439972386308142, 12.862077870203224],
        ],
      },
    },
    {
      type: "Feature",
      properties: {
        fid: 3,
        id: "Main_to_PUFountain",
        name: "Main to PU Fountain",
      },
      geometry: {
        type: "LineString",
        coordinates: [
          [77.437469194238943, 12.862775782033093],
          [77.437469194238943, 12.862775782033093],
          [77.437313001985075, 12.862293568248232],
          [77.436952622530811, 12.860694622304834],
          [77.437217391109471, 12.860551218583385],
          [77.437452740957156, 12.86067311175184],
        ],
      },
    },
  ],
};
