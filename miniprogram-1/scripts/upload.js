const ci = require('miniprogram-ci')
const path = require('path')

// 解析命令行参数
function parseArgs() {
  const args = process.argv.slice(2)
  const options = {
    action: 'preview', // 默认操作
    version: '1.0.4',
    desc: '探索场馆页面优化'
  }
  
  for (let i = 0; i < args.length; i++) {
    const arg = args[i]
    if (arg === 'upload' || arg === 'preview') {
      options.action = arg
    } else if (arg === '--version' && args[i + 1]) {
      options.version = args[i + 1]
      i++
    } else if (arg === '--desc' && args[i + 1]) {
      options.desc = args[i + 1]
      i++
    }
  }
  
  return options
}

async function createProject() {
  const project = new ci.Project({
    appid: 'wx0a950fd30b3c2146',
    type: 'miniProgram',
    projectPath: path.resolve(__dirname, '../'),
    privateKeyPath: '/Users/tonyfan/Desktop/mobilif-project/config/keys/private.wx0a950fd30b3c2146.key',
    ignores: ['node_modules/**/*']
  })
  return project
}

async function upload(options) {
  try {
    console.log(`开始上传代码... 版本: ${options.version}`)
    const project = await createProject()
    const uploadResult = await ci.upload({
      project,
      version: options.version,
      desc: options.desc,
      setting: {
        es6: true,
        es7: true,
        minify: true,
        codeProtect: false,
        minifyJS: true,
        minifyWXML: true,
        minifyWXSS: true,
        autoPrefixWXSS: true
      },
      onProgressUpdate: console.log,
    })
    console.log('上传成功:', uploadResult)
  } catch (error) {
    console.error('上传失败:', error)
    process.exit(1)
  }
}

async function preview(options) {
  try {
    console.log(`生成预览二维码... 描述: ${options.desc}`)
    const project = await createProject()
    const previewResult = await ci.preview({
      project,
      desc: options.desc,
      setting: {
        es6: true,
        es7: true,
        minify: false,
        codeProtect: false
      },
      qrcodeFormat: 'image',
      qrcodeOutputDest: path.resolve(__dirname, '../preview.jpg'),
      onProgressUpdate: console.log,
      pagePath: 'pages/gyms/gym-list/gym-list'
    })
    console.log('预览成功:', previewResult)
  } catch (error) {
    console.error('预览失败:', error)
    process.exit(1)
  }
}

// 主执行函数
async function main() {
  const options = parseArgs()
  
  console.log('配置参数:', options)
  
  if (options.action === 'upload') {
    await upload(options)
  } else if (options.action === 'preview') {
    await preview(options)
  } else {
    console.log('使用方法: node upload.js [upload|preview] [--version 版本号] [--desc 描述]')
    process.exit(1)
  }
}

// 执行主函数
main().catch(error => {
  console.error('执行失败:', error)
  process.exit(1)
})