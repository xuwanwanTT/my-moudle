import * as d3 from 'd3';
import uuid from 'uuid';
import img from './map.png';
const PI = Math.PI;
const cos = Math.cos;
const sin = Math.sin;
const listName = ['劳动保障', '法律诉讼', '公证服务', '调解服务', '法律援助', '仲裁服务', '债务清偿'];

class Page {
  constructor(option) {
    this.state = {
      data: [10, 20, 30, 40, 30, 20, 10]
    };
    this.arc = d3.arc;
  }

  setData(d) {
    this.lock = true;
    this.setState({
      data: d.data
    })
  }

  componentDidUpdate() {
    if (!this.lock) { return false; }
    const me = this;
    me.bar.remove();
    me.drawBar(me.state.data, me.barColorId, me.barColorHoverId);
    me.lock = false;
  }

  componentDidMount() {
    const me = this;
    const props = me.props;
    const height = props.height;
    const svg = d3.select(me.wrapRef.current).append('svg').attr('width', height * 2 + 100).attr('height', height + 100);
    me.svg = svg;
    me.height = height;
    me.R = height - 20;
    me.r = me.R * 2 / 5;

    me.drawBorder(me.r, me.R - 1, 'rgba(0,186,255,1)');
    const circleOutId = me.colorX(svg, [
      { color: '#0285f3', rate: 0 },
      { color: '#00ffff', rate: 50 },
      { color: '#00ffba', rate: 100 }
    ]);
    me.drawOutCircle(circleOutId);
    const colorId = ['rgba(10,253,255,.2)', 'rgba(10,253,255,.16)', 'rgba(10,253,255,.12)'];
    for (let i = 0; i < 3; i++) {
      me.drawCircle(me.r + (me.R - me.r) * i / 4, me.r + (me.R - me.r) / 4 * (i + 1), colorId[i]);
    }
    const barColorId = me.colorY(svg, [
      { color: 'rgba(89,254,232,0)', rate: 0 },
      { color: 'rgba(89,254,232,.5)', rate: 100 }
    ]);
    const barColorHoverId = me.colorY(svg, [
      { color: 'rgba(0,255,144,0)', rate: 0 },
      { color: 'rgba(0,255,144,.5)', rate: 100 }
    ]);
    me.drawBar(me.state.data, barColorId, barColorHoverId);
    me.barColorId = barColorId;
    me.barColorHoverId = barColorHoverId;
  }

  drawOutCircle(id) {
    const me = this;
    const svg = me.svg;
    const R = me.R;
    const r = me.r;
    let path = this.arc()
      .cornerRadius(10)
      .innerRadius(R - 10)
      .outerRadius(R)
      .startAngle(-PI / 2)
      .endAngle(PI / 2);
    const g = svg.append('g').attr('transform', `translate(${me.height + 20} ${me.height + 20})`);
    g.append('path').attr('d', path())
      .attr('fill', `url(#${id})`)
  }

  drawCircle(r, R, id) {
    const me = this;
    const svg = me.svg;
    const g = svg.append('g').attr('transform', `translate(${me.height + 20} ${me.height + 20})`);
    g.append('path').attr('d', me.createCirclePath(r, R, -PI / 2, PI / 2))
      .attr('fill', id)
  }

  drawBorder(r, R, id) {
    const me = this;
    const svg = me.svg;
    const g = svg.append('g').attr('transform', `translate(${me.height + 20} ${me.height + 20})`);
    g.append('path').attr('d', me.createCirclePath(r, R, -PI / 2, PI / 2))
      .attr('fill', 'transparent')
      .attr('stroke-width', 1)
      .attr('stroke', id);
  }

  drawBar(dataArr, id, hoverId) {
    const me = this;
    const data = dataArr;
    const max = d3.max(data);
    const min = d3.min(data);
    const n = 7;
    const len = 2 * n - 1;
    const angle = PI / len;
    const bar = me.svg.append('g').attr('transform', `translate(${me.height + 20} ${me.height + 20})`);
    me.bar = bar;
    const scale = d3.scaleLinear().range([me.r + 10, me.R - 60]).domain([min, max]);

    const barG = bar.selectAll('g').data(data).enter()
      .append('g')

    // 背景
    barG.append('path')
      .attr('class', 'bar-bg')
      .attr('d', function (d, i) {
        let angleS = -PI / 2 + angle * (2 * i) - angle / 4;
        let angleE = -PI / 2 + angle * (2 * i + 1) + angle / 4;
        if (i === 0) {
          angleS = -PI / 2 + angle * (2 * i);
        }
        if (i === data.length - 1) {
          angleE = -PI / 2 + angle * (2 * i + 1);
        }
        return [
          `M${me.r * sin(angleS)}, ${-me.r * cos(angleS)} `,
          `L${(me.R - 12) * sin(angleS)}, ${-(me.R - 12) * cos(angleS)} `,
          `L${(me.R - 12) * sin(angleE)}, ${-(me.R - 12) * cos(angleE)} `,
          `L${me.r * sin(angleE)}, ${-me.r * cos(angleE)} `,
          'Z'
        ].join('')
      })
      .attr('fill', 'transparent');

    // 图形
    barG.append('path')
      .attr('class', 'bar-shape')
      .attr('fill', `url(#${id})`)
      .attr('stroke-width', 2)
      .attr('stroke', 'rgba(89,254,232,1)')
      .attr('d', function (d, i) {
        return [
          `M${me.r * sin(-PI / 2 + angle * (2 * i))}, ${-me.r * cos(-PI / 2 + angle * (2 * i))} `,
          `L${scale(min) * sin(-PI / 2 + angle * (2 * i))}, ${-scale(min) * cos(- PI / 2 + angle * (2 * i))} `,
          `L${scale(min) * sin(-PI / 2 + angle * (2 * i + 1))}, ${-scale(min) * cos(- PI / 2 + angle * (2 * i + 1))} `,
          `L${me.r * sin(-PI / 2 + angle * (2 * i + 1))}, ${-me.r * cos(-PI / 2 + angle * (2 * i + 1))} `,
          'Z'
        ].join('')
      })
      .transition()
      .duration(1000)
      .delay(300)
      .attr('d', function (d, i) {
        return [
          `M${me.r * sin(-PI / 2 + angle * (2 * i))}, ${-me.r * cos(-PI / 2 + angle * (2 * i))} `,
          `L${scale(d) * sin(-PI / 2 + angle * (2 * i))}, ${-scale(d) * cos(- PI / 2 + angle * (2 * i))} `,
          `L${scale(d) * sin(-PI / 2 + angle * (2 * i + 1))}, ${-scale(d) * cos(- PI / 2 + angle * (2 * i + 1))} `,
          `L${me.r * sin(-PI / 2 + angle * (2 * i + 1))}, ${-me.r * cos(-PI / 2 + angle * (2 * i + 1))} `,
          'Z'
        ].join('')
      });

    // 文字
    barG.append('text').text(function (d) { return d + '条' })
      .attr('font-size', 14)
      .style('text-anchor', 'middle')
      .attr('x', function (d, i) {
        return (scale(d) + 10) * sin(-PI / 2 + angle * (2 * i + 1) - angle / 2);
      })
      .attr('y', function (d, i) {
        return -(scale(d) + 10) * cos(- PI / 2 + angle * (2 * i + 1) - angle / 2);
      })
      .attr('transform', function (d, i) {
        return `rotate(${(- PI / 2 + angle * (2 * i + 1) - angle / 2) * 180 / PI},${[(scale(d) + 10) * sin(-PI / 2 + angle * (2 * i + 1) - angle / 2), -(scale(d) + 10) * cos(- PI / 2 + angle * (2 * i + 1) - angle / 2)]})`;
      })
      .attr('fill', 'rgba(0,255,255,0)')
      .transition()
      .duration(800)
      .delay(800)
      .attr('fill', 'rgba(0,255,255,1)');

    // 选项文字
    barG.append('text').text(function (d, i) { return listName[i]; })
      .attr('font-size', 14)
      .attr('fill', '#fff')
      .style('text-anchor', 'middle')
      .attr('x', function (d, i) {
        return (me.R + 10) * sin(-PI / 2 + angle * (2 * i + 1) - angle / 2);
      })
      .attr('y', function (d, i) {
        return -(me.R + 10) * cos(- PI / 2 + angle * (2 * i + 1) - angle / 2);
      })
      .attr('transform', function (d, i) {
        return `rotate(${(- PI / 2 + angle * (2 * i + 1) - angle / 2) * 180 / PI},${[(me.R + 10) * sin(-PI / 2 + angle * (2 * i + 1) - angle / 2), -(me.R + 10) * cos(- PI / 2 + angle * (2 * i + 1) - angle / 2)]})`;
      });

    // 事件
    barG.on('mouseover', function (d, i) {
      const selected = d3.select(this);
      selected.selectAll('.bar-shape')
        .attr('fill', `url(#${hoverId})`)
        .attr('stroke', 'rgba(0,255,144,1)')
        .attr('stroke-width', 3);

      selected.select('.bar-bg')
        .attr('fill', 'rgba(32,83,210,.4)');

      selected.select('text')
        .attr('font-size', 16)
        .attr('fill', '#fff');
    })
      .on('mouseout', function (d, i) {
        const selected = d3.select(this);
        selected.select('.bar-shape')
          .attr('fill', `url(#${id})`)
          .attr('stroke', 'rgba(89,254,232,1)')
          .attr('stroke-width', 2);

        selected.select('.bar-bg')
          .attr('fill', 'transparent');

        selected.select('text')
          .attr('font-size', 14)
          .attr('fill', '#00ffff');
      });
  }

  createCirclePath(r, R, start, end) {
    let path = this.arc()
      .innerRadius(r)
      .outerRadius(R)
      .startAngle(start)
      .endAngle(end);
    return path();
  }

  colorX(svg, color) {
    let id = uuid();
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
  }

  colorY(svg, color) {
    let id = uuid();
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

  render() {
    return (
      <div ref={this.wrapRef} style={{
        position: 'absolute',
        top: this.props.top,
        left: this.props.left
      }}>
        <img style={{
          position: 'absolute',
          top: this.props.height - 258 / 2 - 20,
          left: this.props.height - 316 / 2 + 20,
          pointerEvents: 'none'
        }} src={img} alt={'map'} />
      </div>
    );
  }
};

export default Page;
