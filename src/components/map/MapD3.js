import * as d3 from 'd3';

export default class Map {
  constructor(option) {
    this.option = option;
    this.init();
  }

  get json() {
    return this._json;
  }

  set json(data) {
    this.lock = true;
    this._json = data;
    this.update();
  }

  get data() {
    return this._data;
  }

  set data(data) {
    this.lock = true;
    this._data = data;
    this.update();
  }

  init() {
    const me = this;
    const option = me.option;
    const width = option.width;
    const height = option.height;
    const domElement = document.createElement('div');
    const style = domElement.style;
    style.width = width + 'px';
    style.height = height + 'px';
    style.position = 'absolute';
    style.top = option.top + 'px';
    style.left = option.left + 'px';
    let svg = d3.select(domElement).append('svg').attr('width', width).attr('height', height);

    me.domElement = domElement;
    me.svg = svg;
  }

  update() {
    if (this.lock) {
      clearTimeout(this.timer);
    }
    this.timer = setTimeout(() => {
      this.lock = false;
      this.drawMap();
    }, 100);

  }

  drawMap() {
    const me = this;
    const option = me.option;
    const json = me._json;
    const data = me._data;
    const svg = me.svg;
    let offsetY = 0;

    let projection = d3.geoMercator()
      .fitExtent([[0, 20], [option.width, option.height]], json);

    d3.geoPath()
      .projection(projection);
    let g = svg.selectAll('g').data(json.features).enter();

    // path
    let map = g.append('g').append('path')
      .style('cursor', 'pointer')
      .attr('class', function (d) {
        return 'map' + d.id;
      })
      .attr('stroke', '#fff')
      .attr('stroke-width', 1)
      // .attr('fill', function (d, i) {
      //   let str = JSON.stringify(provinceName);
      //   if (str.indexOf(d.properties.name) != -1) {
      //     let index = 3;
      //     let value = me.valueScale(Number(d.properties.value));
      //     if (value > 66) {
      //       index = 0;
      //     } else if (value > 33) {
      //       index = 1;
      //     } else if (value > 2) {
      //       index = 2;
      //     }
      //     return color[index];
      //   } else {
      //     return color[3];
      //   }
      // })
      .attr('d', function (d, i) {
        if (option.up) {
          let temp = {};
          temp.cp = projection(d.properties.cp);
          temp.name = d.properties.name;
          me.cpData.push(temp);
        }
        let site = d.geometry.coordinates[0];
        let path = '';
        if (d.geometry.type == 'MultiPolygon') {
          site = d.geometry.coordinates;
          for (let i = 0; i < site.length; i++) {
            for (let k = 0; k < site[i][0].length; k++) {
              let dot = projection(site[i][0][k]);
              if (k === 0) {
                path += 'M' + dot[0] + ',' + (dot[1] + offsetY) + ' ';
              } else {
                path += 'L' + dot[0] + ',' + (dot[1] + offsetY) + ' ';
              }
            }
          }
        } else {
          for (let i = 0; i < site.length; i++) {
            let dot = projection(site[i]);
            if (i === 0) {
              path += 'M' + dot[0] + ',' + (dot[1] + offsetY) + ' ';
            } else {
              path += 'L' + dot[0] + ',' + (dot[1] + offsetY) + ' ';
            }
          }
        }
        return path;
      });
  }

}
