1. /getResult-成绩查询
Method: GET
req: query
{
    groupName: '企业/团队名称',
    projectName: '项目名称',
    directorName: '负责人姓名',
    directorMobile: '负责人手机号'
}
res: json
{
  code: 0, // 0=成功|-1=未登录|-2=参数错误|500=服务器错误
  message: 'success',
  data: {
    no: 1, // 序号
    id: 'xm01', // 项目ID
    industry: '电子信息', // 行业
    groupType: '企业组', // 组别
    groupName: '1001', // 企业/团队名称
    projectName: '1001', // 项目名称
    directorName: 'aaa', // 负责人
    directorMobile: '18887654320', // 负责人手机号
    preliminaryContest: {
      grades: [ // 评委打分
        {
          name: 'A', // 评委i姓名
          value: 87, // 评委i打分
          comment: 'XXX' // 评委i评语
        },
        {
          name: 'B',
          value: 83,
          comment: 'XXX'
        },
        {
          name: 'C',
          value: 84,
          comment: 'XXX'
        }
      ],
      finalScore: 84.6666666666667 // 最终得分
    }
  }
}

2. /bg/login-登录
Method: POST
res: body
{
  username: '123',
  password: '321'
}
req: json
{
  code: 0, // 0=成功|-1=未登录|-2=参数错误|500=服务器错误
  message: 'success'
}

3. /bg/logout-登出
Method: POST
res: {
  code: 0, // 0=成功|-1=未登录|-2=参数错误|500=服务器错误
  message: 'success'
}

4. /bg/heartBeat
Method: GET
res: {
  code: 0, // 0=成功|-1=未登录|-2=参数错误|500=服务器错误
  message: 'success'
}

5. /bg/getResultList-全部成绩列表
Method: GET
{
  code: 0, // 0=成功|-1=未登录|-2=参数错误|500=服务器错误
  message: 'success',
  total: 12,
  data: [
    {
      no: 1,
      id: 'xm01',
      industry: '电子信息',
      groupType: '企业组',
      groupName: '1001',
      projectName: '1001',
      directorName: 'aaa',
      directorMobile: '18887654320',
      preliminaryContest: {
        grades: [
          {
            name: 'A',
            value: 87,
            comment: 'XXX'
          },
          {
            name: 'B',
            value: 83,
            comment: 'XXX'
          },
          {
            name: 'C',
            value: 84,
            comment: 'XXX'
          },
          {...}
        ],
        finalScore: 84.6666666666667
      }
    }
  ]
}

6. /bg/import-导入成绩
Method: POST
req: multipart/form-data
res: json
{
  code: 0, // 0=成功|-1=未登录|-2=参数错误|500=服务器错误
  message: 'success'
}
server {
    listen       80;
    server_name  cs.tus-street.com;

    location / {
        proxy_pass http://127.0.0.1:6724;
        index  index.html index.htm index.jsp;
    }
}