const LIFE_EXPECTANCY_LABEL = "Life expectancy at birth, total (years)";
const ACCESS_TO_ELECTRICITY_LABEL = "Fertility rate, total (births per woman)";
const POPULATION_LABEL = "Population ages 15-64, total";
export const START_DATE = 1997;
export const END_DATE = 2020;
const FORMAT_PROP = "{{year}} [YR{{year}}]";

const BACKGROUND_COLOR_MAP = {
  Vietnam: "rgba(255, 99, 132)",
  "Hong Kong SAR, China": "rgba(54, 162, 235)",
  "Macao SAR, China": "rgba(255, 206, 86)",
  "Korea, Rep.": "rgba(75, 192, 192)",
  "Korea, Dem. People’s Rep.": "rgba(153, 102, 255)",
  Japan: "rgba(255, 159, 64)",
  Singapore: "rgba(255, 99, 132)",
};

export const generateRandomBackground = () => {
  // generate random color
};

export const transformData = (data, addedYears = 0, maxRadius) => {
  console.log(data);
  const testData = data.filter((e) => e["Country Name"] && e["Country Code"]);
  const obj = {};
  for (const entry of testData) {
    obj[entry["Country Name"]] = {
      ...obj[entry["Country Name"]],
      [entry["Series Name"]]: {
        ...entry,
      },
    };
  }
  const chartObj = {
    datasets: [],
  };
  for (const country in obj) {
    const dataObject = [];
    const year = START_DATE + addedYears;
    dataObject[0] = {
      r: maxRadius
        ? obj[country][POPULATION_LABEL][
            FORMAT_PROP.replace(/{{year}}/g, year)
          ] * 2 /
            1_000_000 <
          maxRadius
          ? obj[country][POPULATION_LABEL][
              FORMAT_PROP.replace(/{{year}}/g, year)
            ] * 2 / 1_000_000
          : maxRadius
        : obj[country][POPULATION_LABEL][
            FORMAT_PROP.replace(/{{year}}/g, year)
          ] / 1_000_000,
      x: obj[country][LIFE_EXPECTANCY_LABEL][
        FORMAT_PROP.replace(/{{year}}/g, year)
      ],
      y: obj[country][ACCESS_TO_ELECTRICITY_LABEL][
        FORMAT_PROP.replace(/{{year}}/g, year)
      ],
    };
    chartObj.datasets.push({
      label: country,
      data: [...dataObject],
      backgroundColor: BACKGROUND_COLOR_MAP[country],
      hoverBorderColor: "rgba(0, 0, 0, 0.5)",
      hoverBorderWidth: 2,
    });
  }
  // sort object.datasets.data by population
  chartObj.datasets.sort((a, b) => {
    return a.data[0].r - b.data[0].r;
  });
  return chartObj;
};
