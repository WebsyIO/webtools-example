class Chart {
  constructor (elementId, options) {
    this.elementId = elementId
    this.options = Object.assign({}, options)
    this.init()
  }
  createDefinition () {
    return {
      qInfo: { qType: this.options.type },
      qHyperCubeDef: {
        qDimensions: (this.options.dimensions || []).map(d => {
          return this.createDimensionDef(d)
        }),
        qMeasures: (this.options.measures || []).map(m => {
          return this.createMeasureDef(m)
        })
      }
    }
  }
  createDimensionDef (dim) {
    if (typeof dim === 'string') {
      return {
        qDef: { qFieldDefs: [dim]}
      }
    }
    return dim
  }
  createMeasureDef (meas) {
    if (typeof meas === 'string') {
      return {
        qDef: { qDef: meas}
      }
    }
    return meas
  }
  getData () {
    return new Promise((resolve, reject) => {
      const pageDefs = [{
        qTop: 0,
        qLeft: 0,
        qWidth: this.layout.qHyperCube.qSize.qcx,
        qHeight: Math.floor(10000 / this.layout.qHyperCube.qSize.qcx)
      }]
      this.model.getHyperCubeData('/qHyperCubeDef', pageDefs).then(pages => {
        resolve(pages[0])
      })
    })    
  }
  init () {
    if (this.options.objectId) {
      qlikApp.getObject(this.options.objectId).then(model => {
        this.model = model
        this.model.on('changed', this.render.bind(this))
        this.render()
      })
    }
    else if (this.options.type) {
      qlikApp.createSessionObject(this.createDefinition()).then(model => {
        this.model = model
        this.model.on('changed', this.render.bind(this))
        this.render()
      })
    }
  }
  render () {
    this.model.getLayout().then(layout => {
      this.layout = layout
      this.getData().then(data => {
        console.log(data)
        let hcOptions = this.transformData(data.qMatrix)
        if (!this.chart) {
          this.chart = Highcharts.chart(this.elementId, hcOptions)
        }
        else {
          this.chart.update(hcOptions)
        }
      })
    })
  }
  transformData (data) {
    let output = {
      chart: {
        type: "column"
      },
      xAxis: {
        type: "category"
      },
      colors: [
        "#466eb4",
        "#d7642d",
        "#e6a532",
        "#829bcd",
        "#e6aa82",
        "#fae6c3",
        "#aab9e1"
      ]
    }
    output.series = [{
      name: this.layout.qHyperCube.qDimensionInfo[0].qFallbackTitle,
      data: data.map(r => {
        return {
          name: r[0].qText,
          y: r[1].qNum
        }
      })
    }]
    return output   
  }
}