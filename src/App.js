import Map from './components/map/MapD3';
import axios from 'axios';
import Shape3d from './components/map/Shape3d';

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

const shape = new Shape3d({
  width: 800,
  height: 600,
  top: 50,
  left: 850
});

const appDom = document.createElement('div');
appDom.appendChild(map.domElement);
setTimeout(() => {
  appDom.appendChild(shape.domElement);
}, 2000)
export default appDom;
