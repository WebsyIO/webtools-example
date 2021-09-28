const c = new Chart('chart', {
  appId: 'af650d53-f31b-476d-b28b-7db3bd2f620f',
  baseUrl: 'wss://ec2-3-92-185-52.compute-1.amazonaws.com/anon',
  type: 'barchart',
  dimensions: ['Region Name'],
  measures: ['=Sum([Sales Amount])'],
  chartOptions: {    
    chart: { type: 'pie' }
  }
})
const c2 = new Chart('chart2', { 
  appId: '668788ab-421b-443f-83b6-db0234277dee',
  baseUrl: 'wss://ec2-3-92-185-52.compute-1.amazonaws.com/anon',
  objectId: 'qZPdytp',
  chartOptions: {
    colors: ['#ffaa00']    
  }
})