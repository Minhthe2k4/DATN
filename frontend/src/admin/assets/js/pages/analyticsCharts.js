export function mountAnalyticsCharts() {
  let disposed = false
  const chartInstances = []

  const createChart = (selector, options) => {
    const element = document.querySelector(selector)
    if (!element || !window.ApexCharts) {
      return
    }

    const chart = new window.ApexCharts(element, options)
    chart.render()
    chartInstances.push(chart)
  }

  const initCharts = async () => {
    if (!window.ApexCharts) {
      await import('../../libs/apexcharts/apexcharts.min.js')
    }

    if (disposed || !window.ApexCharts) {
      return
    }

    createChart('#ana_dash_1', {
      series: [
        { name: 'Income', data: [40, 40, 30, 30, 10, 10, 10, 30, 30, 40, 40, 51] },
        { name: 'Expenses', data: [20, 20, 10, 10, 40, 40, 60, 60, 20, 20, 20, 40] },
      ],
      chart: { type: 'area', height: 275, toolbar: { show: false } },
      dataLabels: { enabled: false },
      stroke: { curve: 'straight', width: 2 },
      colors: ['#06afdd', '#f4a14d'],
      xaxis: { categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'] },
      legend: { show: false },
    })

    createChart('#sessions_device', {
      series: [50, 25, 25],
      chart: { type: 'donut', height: 250 },
      labels: ['Current', 'New', 'Retargeted'],
      colors: ['#6f6af8', '#08b0e7', '#f4a14d'],
      legend: { position: 'bottom' },
      dataLabels: { enabled: false },
    })

    createChart('#monthly_income', {
      series: [
        { name: 'New Visits', data: [0, 40, 90, 40, 50, 30, 35, 20, 10, 0, 0, 0] },
        { name: 'Unique Visits', data: [20, 80, 120, 60, 70, 50, 55, 40, 50, 30, 35, 0] },
      ],
      chart: { type: 'area', height: 315, stacked: true, toolbar: { show: false } },
      dataLabels: { enabled: false },
      stroke: { curve: 'straight', width: 2 },
      colors: ['#2a77f4', 'rgba(42, 118, 244, .4)'],
      xaxis: { categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'] },
      legend: { position: 'top', horizontalAlign: 'right' },
    })
  }

  initCharts()

  return () => {
    disposed = true
    chartInstances.forEach((chart) => chart.destroy())
  }
}