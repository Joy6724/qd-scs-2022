// 获取url带的参数并校验
function getParams() {
  const search = location.search.replace('?', '')
  const params = {}
  let valid = true

  search.split('&').some(function (item) {
    const prop = item.split('=')
    const key = prop[0]
    const value = prop[1]

    if (!value) {
      valid = false
      return true
    }

    params[prop[0]] = key === 'directorMobile' ? Number(prop[1]) : prop[1]
    return false
  })

  if (!valid) {
    setResult('error', '参数错误，请返回重试')
    throw new Error('参数错误')
  }

  return params
}

// 根据url上的参数请求数据
function loadData() {
  const params = getParams()

  if (!params) return

  showLoading()
  $.ajax({
    url: config.domain + '/getResult',
    method: 'get',
    data: params,
    dataType: 'json',
    success: function (res) {
      if (res.code === 0) {
        const data = res.data
        const final = {
          no: data.no,
          groupType: data.groupType,
          projectName: data.projectName,
          prize: data.prize
        }

        // 渲染数据
        Object.keys(final).forEach(function (key) {
          $('#' + key).text(final[key])
        })

        if (data.preliminaryContest) {
          // let htmlTableBody = ''
          // data.preliminaryContest.grades && data.preliminaryContest.grades.forEach((grade, index) => {
          //   htmlTableBody += `
          //     <tr>
          //       <th scope="row">${index + 1}</th>
          //       <td>${grade.name}</td>
          //       <td>${+grade.value ? '通过' : '不通过'}</td>
          //       <td>${grade.comment}</td>
          //     </tr>
          //   `
          // })
          // <table class="table table-striped">
          //   <thead>
          //     <tr>
          //       <th scope="col">#</th>
          //       <th scope="col">评委</th>
          //       <th scope="col">打分</th>
          //       <th scope="col">评语</th>
          //     </tr>
          //   </thead>
          //   <tbody>
          //     ${htmlTableBody}
          //   </tbody>
          // </table>

          // <div class="col-4 text-center">
          //   <span>赛道排名：</span>
          //   <span>${data.preliminaryContest.industryRanking}</span>
          // </div>
          const html = `
          <div class="row justify-content-center mt-3">
            <div class="col-4 text-center">
              <span>平均分：</span>
              <span>${data.preliminaryContest.finalScore}</span>
            </div>
            <div class="col-4 text-center">
              <span>晋级结果：</span>
              <span>${data.preliminaryContest.promotionResult}</span>
            </div>
          </div>
        `
          $('#preliminaryContest').html(html)
        }

        if (data.semifinalsContest) {
          // let htmlTableBody = ''
          // data.semifinalsContest.grades && data.semifinalsContest.grades.forEach((grade, index) => {
          //   htmlTableBody += `
          //     <tr>
          //       <th scope="row">${index + 1}</th>
          //       <td>${grade.name}</td>
          //       <td>${+grade.value}</td>
          //     </tr>
          //   `
          // })

          // <table class="table table-striped">
          //   <thead>
          //     <tr>
          //       <th scope="col">#</th>
          //       <th scope="col">评委</th>
          //       <th scope="col">打分</th>
          //     </tr>
          //   </thead>
          //   <tbody>
          //     ${htmlTableBody}
          //   </tbody>
          // </table>
          const html = `
            <div class="row justify-content-center mt-3">
              <div class="col-4 text-center">
                <span>平均分：</span>
                <span>${data.semifinalsContest.finalScore}</span>
              </div>
              <div class="col-4 text-center">
                <span>晋级结果：</span>
                <span>${data.semifinalsContest.promotionResult}</span>
              </div>
            </div>
          `
          $('#semifinalsContest').html(html)
        }

        if (data.finalsContest) {
          // let htmlTableBody = ''
          // data.finalsContest.grades && data.finalsContest.grades.forEach((grade, index) => {
          //   htmlTableBody += `
          //     <tr>
          //       <th scope="row">${index + 1}</th>
          //       <td>${grade.name}</td>
          //       <td>${+grade.value}</td>
          //     </tr>
          //   `
          // })
          // <table class="table table-striped">
          //   <thead>
          //     <tr>
          //       <th scope="col">#</th>
          //       <th scope="col">评委</th>
          //       <th scope="col">打分</th>
          //     </tr>
          //   </thead>
          //   <tbody>
          //     ${htmlTableBody}
          //   </tbody>
          // </table>
          const html = `
            <div class="row justify-content-center mt-3">
              <div class="col-4 text-center">
                <span>平均分：</span>
                <span>${data.finalsContest.finalScore}</span>
              </div>
              <div class="col-4 text-center">
                <span>奖项：</span>
                <span>${data.finalsContest.promotionResult}</span>
              </div>
            </div>
          `
          $('#finalsContest').html(html)
        }

        hideLoading()
      } else {
        hideLoading()
        setResult('error', res.message)
      }
    },
    error: function () {
      setResult('error', '查询失败，请重试')
      hideLoading()
    }
  })
}

; (function () {
  $('#redirect').attr('href', config.roadMap.index)
  loadData()
})()
