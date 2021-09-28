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
    this.openQlikApp(this.options.appId).then(() => {
      if (this.options.objectId) {
        window.qlikApps[this.options.appId].getObject(this.options.objectId).then(model => {
          this.model = model
          this.model.on('changed', this.render.bind(this))
          this.render()
        })
      }
      else if (this.options.type) {
        window.qlikApps[this.options.appId].createSessionObject(this.createDefinition()).then(model => {
          this.model = model
          this.model.on('changed', this.render.bind(this))
          this.render()
        })
      }
    })    
  }
  openQlikApp (appId) {
    return new Promise((resolve, reject) => {
      if (!window.qlikApps) {
        window.qlikApps = {}
      }
      if (!window.qlikApps[appId]) {
        const session = enigma.create({
          schema, 
          url: `${this.options.baseUrl}/app/${appId}`
        })
        
        session.open().then(global => {
          global.getActiveDoc().then(app => {
            window.qlikApps[appId] = app
            resolve()
          }, err => {
            return global.openDoc(appId)
          }).then(app => { 
            window.qlikApps[appId] = app
            resolve()
          })
        })
      }
      else {
        resolve()
      }      
    })
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
    const DEFAULTS = {
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
    let output = Object.assign({}, DEFAULTS, this.options.chartOptions)
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