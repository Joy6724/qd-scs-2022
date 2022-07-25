// 请求成绩结果列表
function queryResultList() {
  showLoading()

  $.ajax({
    url: config.domain + '/bg/getResultList',
    method: 'get',
    dataType: 'json',
    success: function (res) {
      if (res.code === 0) {
        let str1 = ''
        let str2 = ''
        let str3 = ''

        // 渲染数据
        res.data.forEach(function (item) {
          str1 += '<tr><th scope="row">' + item.id + '</th><td>' + item.groupType + '</td><td>' + item.projectName + '</td><td>' + item.preliminaryContest.finalScore + '</td><td>' + item.preliminaryContest.industryRanking + '</td><td>' + item.preliminaryContest.promotionResult + '</td></tr>'
          if (item.hasOwnProperty('semifinalsContest')) {
            str2 += '<tr><th scope="row">' + item.id + '</th><td>' + item.groupType + '</td><td>' + item.projectName + '</td><td>' + item.semifinalsContest.finalScore + '</td><td>' + item.semifinalsContest.industryRanking + '</td><td>' + item.semifinalsContest.promotionResult + '</td></tr>'
          }
          if (item.hasOwnProperty('finalsContest')) {
            str3 += '<tr><th scope="row">' + item.id + '</th><td>' + item.groupType + '</td><td>' + item.projectName + '</td><td>' + item.finalsContest.finalScore + '</td><td>' + item.finalsContest.industryRanking + '</td><td>' + item.finalsContest.promotionResult + '</td></tr>'
          }
        })

        const $list1 = $('#list1')
        const $list2 = $('#list2')
        const $list3 = $('#list3')

        $list1.children().remove() // 清空表格已有内容
        $list1.append(str1)
        $list2.children().remove() // 清空表格已有内容
        $list2.append(str2)
        $list3.children().remove() // 清空表格已有内容
        $list3.append(str3)
      } else {
        setResult('error', res.message)
      }

      hideLoading()
    },
    error: function () {
      setResult('error', '查询失败，请重试')
      hideLoading()
    }
  })
}

// 导入文件
function uploadFile(data, callback) {
  hideResult()
  showLoading()
  $('#error').remove()

  const formData = new FormData()

  formData.append('file', data)

  $.ajax({
    url: config.domain + '/bg/import',
    method: 'post',
    mimeType: 'multipart/form-data',
    dataType: 'json',
    contentType: false,
    processData: false,
    data: formData,
    success: function (res) {
      if (res.code === 0) {
        setResult('success', '上传成功')
        if (res.errorRows && res.errorRows.length) {
          let errorHtml = []

          res.errorRows.forEach(row => {
            errorHtml.push(`<p>${row.message}</p>`)
          })
          $('#table').after(`
            <div class="alert alert-success" role="alert" id="error">
              <h4 class="alert-heading">数据错误信息</h4>
              ${errorHtml.join('\n<hr>\n')}
              <hr>
            </div>
          `)
        }
      } else {
        setResult('error', res.message)
      }

      hideLoading()
      queryResultList() // 导入文件后，重新请求列表
      callback()
    },
    error: function () {
      setResult('error', '上传失败，请重试')
      hideLoading()
      callback()
    }
  })
}

; (function () {
  queryResultList()

  $('#importTrigger').on('change', function () {
    /**
     * 上传完成后的回调函数
     * 清空上传按钮选中的值
     */
    function callback() {
      this.value = ''
    }

    uploadFile(this.files[0], callback.bind(this))
  })

  $('#import').on('click', function () {
    $('#importTrigger').click()
  })
})()
