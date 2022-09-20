import { useCallback, useState } from "react";
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
import { END_DATE, START_DATE, transformData } from "./utils/utils";

ChartJS.register(LinearScale, PointElement, Tooltip, Legend);

const options = {
  responsive: true,
  maintainAspectRatio: false,
  animation: false,
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
        }
      }
    },
    legend: {
      display: true,
    }
  }
};

function App() {
  const testData = transformData(data, 0, 20);
  const [sliderValue, setSliderValue] = useState(START_DATE);
  const [sliderMax, setSliderMax] = useState(20);
  const [chartData, setChartData] = useState(testData);


  const handleChangeYears = useCallback(
    (e) => {
      const years = e.target.value;
      console.log(years);
      setSliderValue(years);
      const newData = transformData(data, years - START_DATE, sliderMax);
      setChartData(newData);
    },
    [sliderValue, chartData, sliderMax]
  );

  const handleChangeMax = useCallback(
    (e) => {
      const max = e.target.value;
      setSliderMax(max);
      const newData = transformData(data, sliderValue - START_DATE, max);
      setChartData(newData);
    },
    [sliderValue, chartData, sliderMax]
  );

  return (
    <div className="App">
      <div className="wrapper">
        {<Bubble options={options} data={chartData} />}
        <input
          type={"range"}
          min={START_DATE}
          max={END_DATE}
          style={{
            width: "100%",
            height: "20px",
          }}
          defaultValue={sliderValue}
          onChange={handleChangeYears}
        />
        <div
          style={{
            position: "relative",
            width: "100%",
            left: `${(sliderValue - START_DATE) / (END_DATE - START_DATE)}px`,
          }}
        >
          <p
            style={{
              position: "absolute",
              left: `calc(${
                ((sliderValue - START_DATE) / (END_DATE - START_DATE)) * 1000
              }px - 18px)`,
              marginTop: 0,
              marginBottom: 0,
            }}
          >
            {sliderValue}
          </p>
        </div>
        <input
          type={"range"}
          min={2}
          max={87}
          style={{
            width: "100%",
            height: "20px",
            marginTop: "50px"
          }}
          defaultValue={sliderMax}
          onChange={handleChangeMax}
        />
      </div>
    </div>
  );
}

export default App;
