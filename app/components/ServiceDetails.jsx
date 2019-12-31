import React, { useState } from 'react';
import Modal from './Modal.jsx';
import pieChart from '../assets/pieChart.png'
import RequestTypesChart from '../charts/request-type-chart.jsx';
import ResponseCodesChart from '../charts/response-code-chart.jsx';
import RouteTrace from '../charts/route-trace.jsx';
import SpeedChart from '../charts/speed-chart.jsx';
import ProcessesChart from '../charts/processes-chart.jsx';
import TemperatureChart from '../charts/temperature-chart.jsx'
import LatencyChart from '../charts/latency-chart.jsx';
import MemoryChart from '../charts/memory-chart.jsx';

// Renders charts created with health and communication data for a selected database.
const ServiceDetails = (props) => {
  
  // Renders health info detail buttons
    const { service } = props;
  // Hook used to toggle whether or not the Modal component renders
  const [modalDisplay, toggleModalDisplay] = useState(false);
  // Hook used to set the chart that the Modal displays.  The
  // modalDisplay state is drilled into the Modal component.
  const [modalChart, setModalChart] = useState();
  // Hook used to set the Modal Component title. The "alt" attribute
  // is grabbed from the onClick event via event.path[0].alt
  const [chartTitle, setChartTitle] = useState();
  const { currentMicroservice } = props;

  // Dictionary used by the healthInfoButtons loop below
  //    { id: 'request', alt: 'Request Data', src: 'https://st2.depositphotos.com/3894705/9581/i/950/depositphotos_95816620-stock-photo-round-button-shows-speedometer.jpg' },

  const buttonProperties = [
    { id: 'request', alt: 'Request Data', src: pieChart },
    { id: 'response', alt: 'Response Data', src: 'https://st2.depositphotos.com/3894705/9581/i/950/depositphotos_95816620-stock-photo-round-button-shows-speedometer.jpg' },
    { id: 'speed', alt: 'Speed Data', src: 'https://st2.depositphotos.com/3894705/9581/i/950/depositphotos_95816620-stock-photo-round-button-shows-speedometer.jpg' },
    { id: 'processes', alt: 'Processes Data', src: 'https://st2.depositphotos.com/3894705/9581/i/950/depositphotos_95816620-stock-photo-round-button-shows-speedometer.jpg' },
    { id: 'latency', alt: 'Latency Data', src: 'https://st2.depositphotos.com/3894705/9581/i/950/depositphotos_95816620-stock-photo-round-button-shows-speedometer.jpg' },
    { id: 'temperature', alt: 'Temperature Data', src: 'https://st2.depositphotos.com/3894705/9581/i/950/depositphotos_95816620-stock-photo-round-button-shows-speedometer.jpg' },
    { id: 'memory', alt: 'Memory Data', src: 'https://st2.depositphotos.com/3894705/9581/i/950/depositphotos_95816620-stock-photo-round-button-shows-speedometer.jpg' },
  ];

  // Create the Health Info buttons and their associated properties.  Each time a button is clicked,
  // setChartTitle will grab a title to render in the Modal component, setModalChart will grab the
  // correct chart to render, and toggleModalDisplay will actually render the Modal display
  const healthInfoButtons = [];
  for (let i = 0; i < buttonProperties.length; i += 1) {
    healthInfoButtons.push(
    <div>
      <div className="healthChartContainer">
        <input
          onClick={() => {
            setChartTitle(event.path[0].alt);
            setModalChart(event.path[0].id);
            toggleModalDisplay(!modalDisplay);
          }}
          service={service}
          type="image"
          id={buttonProperties[i].id}
          src={buttonProperties[i].src}
          width="60px"
          alt={buttonProperties[i].alt}
        />
        <br/>
        <div style={{color:'white', paddingLeft:'7px'}}>
        {buttonProperties[i].id}
        </div>
      </div>
      </div>,
    );
  }

  return (
    <div id="serviceDetailsContainer">
      {modalDisplay ? (
        <Modal
          chartTitle={chartTitle}
          service={service}
          modalChart={modalChart}
          toggleModalDisplay={toggleModalDisplay}
          onClick={() => {
            toggleModalDisplay(!modalDisplay);
          }}
        />
      ) : null}
      <button className="backButton" type="button" onClick={() => document.location.reload()}>Back</button>
      <h3 id="microserviceHealthTitle">Microservice Health</h3>
      <div id="healthGrid">
        {healthInfoButtons}
       </div>
      <div>
        <h3>Request Types</h3>
        <RequestTypesChart service={props.service} />
      </div>
      <div>
        <h3>Response Codes </h3>
        <ResponseCodesChart service={props.service} />
      </div>
      <div>
        <h3>Route Trace</h3>
         <RouteTrace service={props.service} />
      </div>
      <div>
        <h3>Speed Chart</h3>
        <SpeedChart service={props.service} />
      </div>
      <div>
        <h3>Processes Chart</h3>
        <ProcessesChart service={props.service} />
      </div>
      <div>
        <h3>Latency</h3>
        <LatencyChart service={props.service} />
      </div>
      <div>
        <h3>Temperature Chart</h3>
        <TemperatureChart service={props.service} />
      </div>
      <div>
        <h3>Memory Chart</h3>
        <MemoryChart service={props.service} />
      </div>
    </div>
  );
};

export default ServiceDetails;
