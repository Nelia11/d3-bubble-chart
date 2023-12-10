import React, { useState, useEffect } from 'react';
import data from './data.json';

const d3 = require('d3');

const forceStrength = 0.03;

const width = 333;
const height = 205;
const center = { x: width / 2, y: height / 2 };

const categoryColors = {
  Technology: '#0E1756',
  Health: '#AABD9C',
  Travel: '#DBD3CD',
  Philosophy: '#BE9F83',
};

const categories = data.map((item) => item.category);
const colorFn = d3
  .scaleOrdinal()
  .domain(categories)
  .range(Object.values(categoryColors));

function startSimulation(bubbles, updateState) {
  function charge(d) {
    return -Math.pow(d.radius, 2.0) * forceStrength;
  }

  const simulation = d3
    .forceSimulation()
    .velocityDecay(0.2)
    .force('x', d3.forceX().strength(forceStrength).x(center.x))
    .force('y', d3.forceY().strength(forceStrength).y(center.y))
    .force('charge', d3.forceManyBody().strength(charge))
    .on('tick', () => updateState(bubbles))
    .stop();

  simulation.nodes(bubbles);
  simulation.alpha(1).restart();
}

function formatBubbleData(rawData) {
  const maxValue = d3.max(rawData, function (d) {
    return +d.value;
  });

  const radiusScale = d3
    .scalePow()
    .exponent(0.5)
    .range([2, 85])
    .domain([0, maxValue]);

  const myBubbles = rawData.map((d) => ({
    value: d.value,
    radius: radiusScale(d.value * 0.4),
    category: d.category,
    x: Math.random() * width,
    y: Math.random() * height,
  }));

  // sort them to prevent occlusion of smaller nodes.
  myBubbles.sort(function (a, b) {
    return b.value - a.value;
  });

  return myBubbles;
}

export default function App({ data }) {
  const [bubbles, setBubbles] = useState([]);

  useEffect(() => {
    startSimulation(formatBubbleData(data), (bubbles) => {
      setBubbles(() => [...bubbles]);
    });
  }, [data]);

  return (
    <svg width={width} height={height}>
      {bubbles.map((bubble, index) => {
        return (
          <g
            key={`${bubble.category}-${index}`}
            transform={`translate(${width / 200 + bubble.x}, ${
              height / 200 + bubble.y
            })`}
          >
            <circle
              key={`${bubble.category}-${index}`}
              r={bubble.radius}
              fill={colorFn(bubble.category)}
              strokeWidth={0}
            />
            <text
              dy='0.35em'
              fill='white'
              textAnchor='middle'
              fontSize={`${bubble.radius / 2}px`}
              font-weight='bold'
            >
              {bubble.value}%
            </text>
          </g>
        );
      })}
    </svg>
  );
}
