import { useCallback, useEffect, useRef, useState } from "react";
import reactLogo from "./assets/react.svg";
import "./App.css";
import data from "./csvjson.json";
import {
  Chart as ChartJS,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Bubble } from "react-chartjs-2";
import { END_DATE, formatter, FORMAT_PROP, numFormatter, POPULATION_LABEL, START_DATE, transformData } from "./utils/utils";
import useInterval from "./hooks/useInterval";
const ONE_MILLION = 1_000_000;

ChartJS.register(LinearScale, PointElement, Tooltip, Legend);


function App() {
  const {obj, chartObj: testData} = transformData(data, 0, 20, []);
  const [sliderValue, setSliderValue] = useState(START_DATE);
  const [sliderMax, setSliderMax] = useState(20);
  const [chartData, setChartData] = useState(testData);
  const [autoIncrement, setAutoIncrement] = useState(null);
  const [population, setPopulation] = useState(0);
  const [fertility, setFertility] = useState(0);
  const [lifeExpectancy, setLifeExpectancy] = useState(0);
  const yearSliderRef = useRef(null);
  const [xAxisOnHover, setXAxisOnHover] = useState(null);
  const [yAxisOnHover, setYAxisOnHover] = useState(null);
  const [xAxisHoverValue, setXAxisHoverValue] = useState(null);
  const [yAxisHoverValue, setYAxisHoverValue] = useState(null);
  const [listSelectedCountry, setListSelectedCountry] = useState([]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    animation: false,
    legend: {
      display: false,
    },
    scales: {
      yAxis: {
        title: {
          text: "Fetility",
          display: true,
        },
        max: 9,
        min: 0.5,
      },
      x: {
        title: {
          text: "Life Expectancy",
          display: true,
        },
        max: 90,
        min: 50,
      },
    },
    plugins: {
      tooltip: {
        callbacks: {
          label: (context) => {
            return context.dataset.label;
          },
        },
      },
    },
    onClick: (e, elements) => {
      if (elements.length <= 0) return;
      const index = elements[0].datasetIndex;
      const dataIndex = elements[0].index;
      const datasetLabel = e.chart.data.datasets[index].label;
      const value = e.chart.data.datasets[index].data[dataIndex];
      if (listSelectedCountry.map(e => e.label).includes(datasetLabel)) {
        setListSelectedCountry(listSelectedCountry.filter((item) => item.label !== datasetLabel));
      } else {
        setListSelectedCountry([...listSelectedCountry, { label: datasetLabel, x: elements[0].element.x, y: elements[0].element.y }]);
      }
      setPopulation(value.r < sliderMax ? value.r * ONE_MILLION : obj[datasetLabel][POPULATION_LABEL][FORMAT_PROP.replace(/{{year}}/g, sliderValue)]);
      setFertility(value.y);
      setLifeExpectancy(value.x);
    },
    onHover: (e, elements) => {
      if (elements.length > 0) {
        const xPosition = elements[0].element.x;
        const yPosition = elements[0].element.y;
        const index = elements[0].datasetIndex;
        const dataIndex = elements[0].index;
        const value = e.chart.data.datasets[index].data[dataIndex];  
        setXAxisOnHover(xPosition);
        setYAxisOnHover(yPosition);
        setXAxisHoverValue(value.x);
        setYAxisHoverValue(value.y); 
        return
      }
      setXAxisOnHover(null);
      setYAxisOnHover(null);
    }
  };

  // useEffect(() => {
  //   const newData = transformData(data, sliderValue, sliderMax, listSelectedCountry.filter(e => e.label));
  //   setChartData(newData.chartObj);
  //   console.log(newData.chartObj);
  // }, [listSelectedCountry])


  const increaseYears = () => {
    const newValue = parseInt(sliderValue) + 1;
    if (newValue > END_DATE) {
      setAutoIncrement(null);
      return;
    };
    const { chartObj: newData} = transformData(data, newValue - START_DATE, sliderMax, listSelectedCountry.filter(e => e.label));
    setSliderValue(newValue);
    setChartData(newData);
  };

  useInterval(increaseYears, autoIncrement);

  const handleAutoIncrement = () => {
    if (autoIncrement) {
      setAutoIncrement(null);
    } else {
      setAutoIncrement(400);
    }
  };

  const handleChangeYears = useCallback(
    (e) => {
      const years = e.target.value;
      setSliderValue(years);
      const { chartObj: newData } = transformData(data, years - START_DATE, sliderMax, listSelectedCountry.filter(e => e.label));
      setChartData(newData);
    },
    [sliderValue, chartData]
  );

  const handleChangeMax = useCallback(
    (e) => {
      const max = e.target.value;
      setSliderMax(max);
      const { chartObj: newData } = transformData(data, sliderValue - START_DATE, max, listSelectedCountry);
      setChartData(newData);
    },
    [chartData, sliderMax]
  );

  return (
    <div className="App">
      <p className="text-left">{`Population: ${numFormatter.format(population)}`}</p>
      <p className="text-left">{`Fetility: ${formatter.format(fertility)}`}</p>
      <p className="text-left">{`Life expectancy: ${formatter.format(lifeExpectancy)}`}</p>
      <div className="wrapper">
        <div id="chartjs-chart-id">
          {<Bubble options={options} data={chartData} />}
          <div className="bubble-left-arrow" style={{
            position: "absolute",
            top: yAxisOnHover,
            left: yAxisOnHover ? -12 : -1000,
            width: "52px",
            height: "24px",
            borderColor: "black",
            borderWidth: "1px",
            borderStyle: "solid",
            minWidth: "24px",
            padding: "4px",
            backgroundColor: "white",
          }}>{yAxisHoverValue ? Number(yAxisHoverValue?.toFixed(3)) : 0}</div>
          <div className="bubble-top-arrow" style={{
            position: "absolute",
            top: xAxisOnHover ? "calc(100% - 32px)" : -99999,
            left: xAxisOnHover - 24,
            width: "24px",
            height: "24px",
            width: "52px",
            height: "24px",
            borderColor: "black",
            borderWidth: "1px",
            borderStyle: "solid",
            minWidth: "24px",
            padding: "4px",
            backgroundColor: "white",
          }}>{xAxisHoverValue ? Number(xAxisHoverValue?.toFixed(3)) : 0}</div>
          {listSelectedCountry.map((item) => {
            return <div key={item.label} className="bubble-selected" style={{
              position: "absolute",
              top: item.y - 32,
              left: item.x + 16,
              height: "24px",
              borderColor: "black",
              borderWidth: "1px",
              borderStyle: "solid",
              minWidth: "24px",
              padding: "4px",
              backgroundColor: "white",
            }}>{item.label}</div>
          })}
        </div>
        <div  className="year-input">
          <button style={{marginRight: "12px"}} onClick={handleAutoIncrement}>Play</button>
          <div style={{ flexGrow: 1 }} ref={yearSliderRef}>
            <input
              type={"range"}
              min={START_DATE}
              max={END_DATE}
              style={{
                width: "100%",
                height: "20px",
              }}
              value={sliderValue}
              onChange={handleChangeYears}
            />
            <div
              style={{
                position: "relative",
                width: "100%",
                left: `${
                  (sliderValue - START_DATE) / (END_DATE - START_DATE)
                }px`,
              }}
            >
              <p
                style={{
                  position: "absolute",
                  left: `calc(${
                    ((sliderValue - START_DATE) / (END_DATE - START_DATE)) *
                    yearSliderRef?.current?.offsetWidth
                  }px - 18px)`,
                  marginTop: 0,
                  marginBottom: 0,
                }}
              >
                {sliderValue}
              </p>
            </div>
          </div>
        </div>
        <input
          type={"range"}
          min={2}
          max={150}
          style={{
            width: "100%",
            height: "20px",
            marginTop: "50px",
          }}
          onChange={handleChangeMax}
        />
      </div>
    </div>
  );
}

export default App;
