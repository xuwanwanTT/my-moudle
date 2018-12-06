import * as d3 from 'd3';
/**
 * 伪3d 效果
 * @author xuwanwan
 * 传入图形的轮廓坐标
 */

const path = [[100, 100], [200, 100], [250, 200], [150, 200], [100, 100]];

export default class Shape3d {
  constructor(option) {
    this.option = option;
    this.init();
  }

  _data = [];
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

    me.draw();
  }

  draw() {
    const me = this;
    const option = me.option;
    const svg = me.svg;
    const offsetY = 20;
    const len = path.length;

    // 对点进行处理, 每两个点一组, 画一个面
    let data = [];
    path.forEach((s, i) => {
      if (i < len - 1) {
        data.push([s, path[i + 1]]);
      }
    });

    // 围边
    svg.append('g')
      .selectAll('path').data(data)
      .enter()
      .append('path')
      .attr('d', function (d, i) {
        let temp = '';
        temp += `M${d[0][0]},${d[0][1]} `;
        temp += `L${d[1][0]},${d[1][1]} `;
        temp += `L${d[1][0]},${d[1][1] + offsetY} `;
        temp += `L${d[0][0]},${d[0][1] + offsetY} `;
        temp += `L${d[0][0]},${d[0][1]} z `;
        return temp;
      })
      .attr('fill', 'rgba(255,0,0,.1)');


    // 面
    svg.append('g')
      .append('path')
      .attr('d', function () {
        let temp = '';
        path.forEach((s, i) => {
          if (i == 0) {
            temp += `M${s[0]},${s[1]} `;
          } else {
            temp += `L${s[0]},${s[1]} `;
          }
        });
        return temp;
      })
      .attr('fill', 'rgba(0,0,255,1)');
  }
}
