import * as d3 from 'd3';
import { colorY } from '../common/color';

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
      this.drawText();
    }, 100);

  }

  drawMap() {
    const me = this;
    const option = me.option;
    const json = me._json;
    const data = me._data;
    const svg = me.svg;
    svg.append('g');
    let offsetY = 20;
    const mapAroundGColor = colorY(svg, [{ color: 'rgba(14,135,255,1)', rate: 0 }, { color: 'rgba(53,205,255,1)', rate: 100 }]);

    const projection = d3.geoMercator()
      .fitExtent([[0, 0], [option.width - 20, option.height - 20]], json);

    // 围边 map
    const mapAroundG = svg.append('g');
    json.features.forEach(arr => {
      if (arr.geometry.type === 'Polygon') {
        const site = arr.geometry.coordinates[0];
        const len = site.length;
        site.forEach((s, i) => {
          if (i == len - 1) { return false; }
          const temp1 = projection(s);
          const temp2 = projection(site[i + 1]);
          mapAroundG.append('g')
            .append('path')
            .attr('d', [
              `M${temp1[0]} ${temp1[1]} `,
              `L${temp2[0]} ${temp2[1]} `,
              `L${temp2[0]} ${temp2[1] + offsetY} `,
              `L${temp1[0]} ${temp1[1] + offsetY} `,
              `L${temp1[0]} ${temp1[1]} Z `
            ].join(''))
            .attr('fill', `url(#${mapAroundGColor})`);
        });
      } else if (arr.geometry.type === 'MultiPolygon') {
        let tempArr = arr.geometry.coordinates;
        tempArr.forEach(site => {
          const len = site.length;
          site.forEach((s, i) => {
            if (i == len - 1) { return false; }
            const temp1 = projection(s);
            const temp2 = projection(site[i + 1]);
            mapAroundG.append('g')
              .append('path')
              .attr('d', [
                `M${temp1[0]} ${temp1[1]} `,
                `L${temp2[0]} ${temp2[1]} `,
                `L${temp2[0]} ${temp2[1] + offsetY} `,
                `L${temp1[0]} ${temp1[1] + offsetY} `,
                `L${temp1[0]} ${temp1[1]} Z `
              ].join(''))
              .attr('fill', `url(#${mapAroundGColor})`);
          });
        });
      }
    });

    // 顶层 map
    const mapTopG = svg.append('g').selectAll('g').data(json.features).enter();
    // path
    let mapTop = mapTopG.append('g').append('path')
      .style('cursor', 'pointer')
      .attr('class', function (d) {
        return 'map' + d.id;
      })
      .attr('stroke', '#fff')
      .attr('stroke-width', 1)
      .attr('fill', function (d, i) {
        return 'rgba(53, 205, 255, .8)';
        let str = JSON.stringify(provinceName);
        if (str.indexOf(d.properties.name) != -1) {
          let index = 3;
          let value = me.valueScale(Number(d.properties.value));
          if (value > 66) {
            index = 0;
          } else if (value > 33) {
            index = 1;
          } else if (value > 2) {
            index = 2;
          }
          return color[index];
        } else {
          return color[3];
        }
      })
      .attr('d', function (d, i) {
        if (option.up) {
          let temp = {};
          temp.cp = projection(d.properties.cp);
          temp.name = d.properties.name;
          me.cpData.push(temp);
        }
        let path = '';
        if (d.geometry.type === 'Polygon') {
          let site = d.geometry.coordinates[0];
          for (let i = 0; i < site.length; i++) {
            const temp = projection(site[i]);
            if (i == 0) {
              path += `M${temp[0]},${temp[1]} `;
            } else {
              path += `L${temp[0]},${temp[1]} `;
            }
          }
        } else if (d.geometry.type === 'MultiPolygon') {
          let site = d.geometry.coordinates;
          site.forEach(arr => {
            arr[0].forEach((s, i) => {
              const temp = projection(s);
              if (i == 0) {
                path += `M${temp[0]},${temp[1]} `;
              } else {
                path += `L${temp[0]},${temp[1]} `;
              }
            });
          });
        }
        return path;
      });

    // 事件
    mapTop
      .on('click', function (d, i) {
        console.log(d);
      })
      .on('mouseover', function (d, i) {
        console.log(d);
        d3.select(this).attr('fill', 'rgba(26, 160, 255, .9)');
      })
      .on('mouseout', function (d, i) {
        console.log(d);
        d3.select(this).attr('fill', 'rgba(53, 205, 255, .8)');
      });

    me.projection = projection;
  }

  drawText() {
    const me = this;
    const svg = me.svg.append('g');
    const json = me._json;
    const projection = me.projection;

    const text = svg.selectAll('text').data(json.features).enter().append('text');
    text.text(function (d) {
      return d.properties.name;
    })
      .style('font-size', 14)
      .style('text-anchor', 'middle')
      .style('pointer-events', 'none')
      .attr('x', function (d) {
        return projection(d.properties.cp)[0];
      })
      .attr('y', function (d) {
        return projection(d.properties.cp)[1];
      })
  }

}
