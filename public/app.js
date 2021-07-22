const session = enigma.create({
  schema, 
  url: 'wss://ec2-3-92-185-52.compute-1.amazonaws.com/anon/app/af650d53-f31b-476d-b28b-7db3bd2f620f'
})

let qlikApp

session.open().then(global => {
  global.openDoc('af650d53-f31b-476d-b28b-7db3bd2f620f').then(app => {
    qlikApp = app
    const c = new Chart('chart', {
      type: 'barchart',
      dimensions: ['Region Name'],
      measures: ['=Sum([Sales Amount])']
    })
    const c2 = new Chart('chart2', { objectId: 'fPzFZu' })
  })
})