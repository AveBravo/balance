import React, { useState } from 'react';

/**
 * Example: AS350 B2 IGE & OGE Hover Performance Calculator
 */
function HoverCalculator() {
  // -------------------------------
  // 1. State for user inputs
  // -------------------------------
  const [pressureAlt, setPressureAlt] = useState(5000);
  const [oat, setOat] = useState(15);
  const [actualWeight, setActualWeight] = useState(4800);

  // -------------------------------
  // 2. Chart Data (approx.) 
  // -------------------------------
  // IGE chart data (Figure 2)
  const chartDataIge = {
    "-20": {
      pa: [0, 2000, 4000, 6000, 8000, 10000, 12000, 14000, 16000, 18000, 20000],
      wt: [5250, 5200, 5100, 5000, 4900, 4800, 4700, 4600, 4450, 4300, 4100]
    },
    "0": {
      pa: [0, 2000, 4000, 6000, 8000, 10000, 12000, 14000, 16000, 18000, 20000],
      wt: [5250, 5150, 5050, 4950, 4800, 4650, 4500, 4350, 4200, 4050, 3900]
    },
    "20": {
      pa: [0, 2000, 4000, 6000, 8000, 10000, 12000, 14000, 16000, 18000, 20000],
      wt: [5250, 5050, 4850, 4650, 4450, 4250, 4050, 3900, 3700, 3500, 3350]
    },
    "35": {
      pa: [0, 2000, 4000, 6000, 8000, 10000, 12000, 14000],
      wt: [5200, 4900, 4600, 4300, 4000, 3700, 3400, 3100]
    },
    "40": {
      pa: [0, 2000, 4000, 6000, 8000, 10000, 12000, 14000],
      wt: [5150, 4850, 4550, 4200, 3850, 3500, 3150, 2800]
    },
    "50": {
      pa: [0, 2000, 4000, 6000, 8000, 10000, 12000, 14000],
      wt: [5000, 4650, 4300, 3950, 3600, 3200, 2800, 2400]
    }
  };

  // OGE chart data (Figure 4)
  const chartDataOge = {
    "-20": {
      pa: [0, 2000, 4000, 6000, 8000, 10000, 12000, 14000, 16000, 18000, 20000],
      wt: [5250, 5200, 5100, 5000, 4900, 4800, 4700, 4600, 4450, 4300, 4150]
    },
    "0": {
      pa: [0, 2000, 4000, 6000, 8000, 10000, 12000, 14000, 16000, 18000, 20000],
      wt: [5250, 5150, 5050, 4950, 4800, 4650, 4500, 4350, 4200, 4050, 3900]
    },
    "20": {
      pa: [0, 2000, 4000, 6000, 8000, 10000, 12000, 14000, 16000, 18000, 20000],
      wt: [5250, 5050, 4850, 4650, 4450, 4250, 4050, 3900, 3750, 3550, 3400]
    },
    "35": {
      pa: [0, 2000, 4000, 6000, 8000, 10000, 12000, 14000],
      wt: [5200, 4900, 4600, 4300, 4000, 3700, 3400, 3100]
    },
    "40": {
      pa: [0, 2000, 4000, 6000, 8000, 10000, 12000, 14000],
      wt: [5150, 4850, 4550, 4200, 3850, 3500, 3150, 2800]
    },
    "50": {
      pa: [0, 2000, 4000, 6000, 8000, 10000, 12000, 14000],
      wt: [5000, 4650, 4300, 3950, 3600, 3200, 2800, 2400]
    }
  };

  // -------------------------------
  // 3. Interpolation Helpers
  // -------------------------------
  const linearInterpolate = (x, x0, y0, x1, y1) => {
    if (x1 === x0) return y0;
    return y0 + (y1 - y0) * ((x - x0) / (x1 - x0));
  };

  // Simple bisectLeft for sorted arrays
  const bisectLeft = (array, value) => {
    for (let i = 0; i < array.length; i++) {
      if (array[i] >= value) return i;
    }
    return array.length;
  };

  // Interpolate max hover weight for a given altitude, from a single temperature line
  const interpolatePressureAlt = (pa, paList, wtList) => {
    if (pa <= paList[0]) return wtList[0];
    if (pa >= paList[paList.length - 1]) return wtList[wtList.length - 1];
    const idx = bisectLeft(paList, pa);
    const x0 = paList[idx - 1];
    const x1 = paList[idx];
    const y0 = wtList[idx - 1];
    const y1 = wtList[idx];
    return linearInterpolate(pa, x0, y0, x1, y1);
  };

  // Main function: get max permissible weight for a given altitude & temperature
  const getMaxHoverWeight = (pa, oat, chartData) => {
    // Sort temperature lines
    const temps = Object.keys(chartData)
      .map(Number)
      .sort((a, b) => a - b);

    // Clamp if OAT below/above chart range
    if (oat <= temps[0]) {
      const lineData = chartData[temps[0]];
      return interpolatePressureAlt(pa, lineData.pa, lineData.wt);
    }
    if (oat >= temps[temps.length - 1]) {
      const lineData = chartData[temps[temps.length - 1]];
      return interpolatePressureAlt(pa, lineData.pa, lineData.wt);
    }

    // Otherwise, find bounding temps & interpolate
    const idx = bisectLeft(temps, oat);
    const tLow = temps[idx - 1];
    const tHigh = temps[idx];

    const lowData = chartData[tLow];
    const wtLow = interpolatePressureAlt(pa, lowData.pa, lowData.wt);

    const highData = chartData[tHigh];
    const wtHigh = interpolatePressureAlt(pa, highData.pa, highData.wt);

    return linearInterpolate(oat, tLow, wtLow, tHigh, wtHigh);
  };

  // -------------------------------
  // 4. Calculate IGE / OGE results
  // -------------------------------
  const maxWeightIge = getMaxHoverWeight(Number(pressureAlt), Number(oat), chartDataIge);
  const maxWeightOge = getMaxHoverWeight(Number(pressureAlt), Number(oat), chartDataOge);

  const canHoverIge = Number(actualWeight) <= maxWeightIge;
  const canHoverOge = Number(actualWeight) <= maxWeightOge;

  // -------------------------------
  // 5. Render the UI
  // -------------------------------
  return (
    <div style={{ fontFamily: 'Arial, sans-serif', maxWidth: '480px', margin: '20px auto' }}>
      <h2>AS350 B2 - IGE/OGE Hover Calculator</h2>
      <label style={{ display: 'block', marginBottom: 8 }}>
        Pressure Altitude (ft):
        <input
          type="number"
          value={pressureAlt}
          onChange={(e) => setPressureAlt(e.target.value)}
          style={{ marginLeft: 8, width: 100 }}
        />
      </label>
      <label style={{ display: 'block', marginBottom: 8 }}>
        Outside Air Temperature (°C):
        <input
          type="number"
          value={oat}
          onChange={(e) => setOat(e.target.value)}
          style={{ marginLeft: 8, width: 100 }}
        />
      </label>
      <label style={{ display: 'block', marginBottom: 8 }}>
        Actual Weight (lbs):
        <input
          type="number"
          value={actualWeight}
          onChange={(e) => setActualWeight(e.target.value)}
          style={{ marginLeft: 8, width: 100 }}
        />
      </label>

      <div style={{ padding: '10px', background: '#f2f2f2', marginTop: 16 }}>
        <h4>Results</h4>
        <p>
          <strong>IGE Max Weight:</strong> {maxWeightIge.toFixed(0)} lbs <br />
          {canHoverIge
            ? <span style={{ color: 'green' }}>You CAN hover IGE.</span>
            : <span style={{ color: 'red' }}>You CANNOT hover IGE.</span>}
        </p>
        <p>
          <strong>OGE Max Weight:</strong> {maxWeightOge.toFixed(0)} lbs <br />
          {canHoverOge
            ? <span style={{ color: 'green' }}>You CAN hover OGE.</span>
            : <span style={{ color: 'red' }}>You CANNOT hover OGE.</span>}
        </p>
      </div>
    </div>
  );
}

export default HoverCalculator;
