import uuid from 'uuid';
/**
 * 基于 d3 的添加渐变色的方法
 * @author xuwanwan
 * @param {*} svg d3 dom 对象
 * @param { array } color 颜色配置 [{ color: 'red', rate: 0 },{ color: 'blue', rate: 100 }]
 */

const colorX = function (svg, color) {
  let id = 'x' + uuid();
  let linear = svg.append('defs').append("linearGradient")
    .attr("id", id)
    .attr("x1", "0%")
    .attr("y1", "0%")
    .attr("x2", "100%")
    .attr("y2", "0%");
  color.forEach(s => {
    linear.append('stop')
      .attr("offset", `${s.rate}% `)
      .style("stop-color", s.color);
  });
  return id;
};

const colorY = function (svg, color) {
  let id = 'y' + uuid();
  let linear = svg.append('defs').append("linearGradient")
    .attr("id", id)
    .attr("x1", "0%")
    .attr("y1", "0%")
    .attr("x2", "0%")
    .attr("y2", "100%");
  color.forEach(s => {
    linear.append('stop')
      .attr("offset", `${s.rate}% `)
      .style("stop-color", s.color);
  });
  return id;
}

export { colorX, colorY };
