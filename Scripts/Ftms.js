class Ftms {
  constructor(carWidget) {
    this.$ = carWidget
  }

  name = '一汽丰田'
  en = 'ftms'
  logo = 'https://www.toyota.com.cn/favicon.ico'

  baseOpt = {
    headers: {
      Connection: `keep-alive`,
      Host: `appiov.ftms.com.cn`,
      'Content-Type': `application/json`,
    },
    body: ``,
  }

  init = async () => {
    if (this.$.settings.dataSource) {
      this.$.serveInfo = this.$.settings.serveInfo
      this.$.dataSource = this.$.settings.dataSource
    } else {
      await this.cacheData()
    }
    this.cacheData()
  }

  cacheData = async () => {
    try {
      await this.getOilPrice()
      await this.getBmuServeHicleInfo()
      await this.getRemoteInfoDetail()
    } catch (e) {
      console.log(e)
    }
  }

  getBaseOptions(api) {
    const baseURL = `https://appiov.ftms.com.cn`
    return { url: `${baseURL}/${api}`, ...this.baseOpt }
  }

  getRemoteInfoDetail = async () => {
    const options = this.getBaseOptions(
      'ftms-iov-app-gbook/api/gbook/getRemoteInfoDetail'
    )
    const response = await this.$.$request.post(options)
    console.log(response)
    if (response.msg === 'success') {
      this.$.dataSource.remoteInfo = response.result
      const safeData =
        this.$.dataSource.remoteInfo.list.filter(
          (item) => item.security !== 'safe'
        ) || []
      if (safeData.length > 0) {
        if (safeData.length === 1) {
          this.$.dataSource.safeText = `${safeData[0].typeName}：${safeData[0].dataName}`
        } else {
          this.$.dataSource.safeText = `隐患：${safeData.length}`
        }
      }
      const dataTime = this.$.dataSource.remoteInfo.datatime.split('-')
      this.$.dataSource.remoteInfo.datatime = `${dataTime[1] || ''}-${
        dataTime[2] || ''
      }`
    }
    await this.getDrivingMonitorInfo()
  }

  getDrivingMonitorInfo = async () => {
    const options = this.getBaseOptions(
      'ftms-iov-app-gbook/api/gbook/getDrivingMonitorInfo'
    )
    const response = await this.$.$request.post(options)
    console.log(response)
    if (response.msg === 'success') {
      this.$.dataSource.monitorInfo = response.result
    }
    this.$.dataSource.monitorInfo.oilWasteText = `油耗：${this.$.dataSource.monitorInfo.oilWaste}L/100km`
    this.$.settings.dataSource = this.$.dataSource
    this.$.saveSettings(false)
  }

  getBmuServeHicleInfo = async () => {
    let headers = await this.$.getCache('@ftms.headers')
    headers = JSON.parse(headers || '{}')
    this.baseOpt.headers = { token: headers.token, ...this.baseOpt.headers }
    const options = {
      url: `https://superapp.ftms.com.cn/superapp/users/wt/getbmuservehicleinfo?scriptable=1`,
      headers,
    }
    if (!this.$.settings.serveInfo) {
      const response = await this.$.$request.post(options)
      console.log(response)
      if (response.code === '200') {
        this.$.settings.serveInfo = response.data
        this.$.serveInfo = response.data
        this.$.saveSettings(false)
      }
    } else {
      this.$.serveInfo = this.$.settings.serveInfo || {}
    }
    this.baseOpt.headers.userId = this.$.serveInfo.userId
    this.baseOpt.body = JSON.stringify({ vin: this.$.serveInfo.vin })
    this.baseOpt.headers.Authorization = `Bearer ${this.baseOpt.headers.token}`
  }

  getOilPrice = async () => {
    const location = await Location.current()
    const locationText = await Location.reverseGeocode(
      location.latitude,
      location.longitude
    )
    const { administrativeArea = '' } = locationText[0] || {}

    const oilNumber = this.$.settings.oilNumber || '92'
    const oilType = this.$.settings.oilType || '汽油'

    const filter = `(BHNAME="${oilNumber}#${oilType}")(CITYNAME="${administrativeArea.replace(
      '省',
      ''
    )}")`
    const time = Date.now()
    const url = `https://datacenter-web.eastmoney.com/api/data/v1/get?reportName=RPTA_WEB_YJ_DQBD&columns=ALL&filter=${encodeURIComponent(
      filter
    )}&sortColumns=DIM_DATE&sortTypes=-1&pageNumber=1&pageSize=1&source=WEB&_=${time}`

    const options = { url }
    const response = await this.$.$request.post(options)
    if (response.result) {
      this.$.dataSource.oilPrice = response.result.data[0]
      this.$.dataSource.oilPriceText = `油价：${response.result.data[0].VALUE}`
    }
  }
}

module.exports = Ftms
