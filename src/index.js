import './index.css';
import Map from './components/map/MapD3';
import axios from 'axios';

const mapOption = {
  width: 800,
  height: 600,
  top: 50,
  left: 50
};
const map = new Map(mapOption);
axios({
  method: 'get',
  url: 'http://localhost:7777/static/json/china.json',
}).then(res => {
  map.json = res.data;
});

document.querySelector('#root').appendChild(map.domElement);
