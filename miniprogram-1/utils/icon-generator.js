// utils/icon-generator.js
// 图标生成工具 - 基于UI设计的Font Awesome图标

const fs = require('fs');
const path = require('path');

// 基于UI设计的图标SVG定义
const iconSVGs = {
  // 搜索图标 (fa-search)
  search: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="32" height="32">
    <path fill="#9ca3af" d="M416 208c0 45.9-14.9 88.3-40 122.7L502.6 457.4c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L330.7 376c-34.4 25.2-76.8 40-122.7 40C93.1 416 0 322.9 0 208S93.1 0 208 0S416 93.1 416 208zM208 352a144 144 0 1 0 0-288 144 144 0 1 0 0 288z"/>
  </svg>`,
  
  // 搜索图标激活状态
  'search-active': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="32" height="32">
    <path fill="#105286" d="M416 208c0 45.9-14.9 88.3-40 122.7L502.6 457.4c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L330.7 376c-34.4 25.2-76.8 40-122.7 40C93.1 416 0 322.9 0 208S93.1 0 208 0S416 93.1 416 208zM208 352a144 144 0 1 0 0-288 144 144 0 1 0 0 288z"/>
  </svg>`,
  
  // 地图图标 (fa-map)
  map: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512" width="32" height="32">
    <path fill="#9ca3af" d="M384 476.1L192 421.2V35.9L384 90.8V476.1zm32-1.2V88.4L543.1 37.5c15.8-6.3 32.9 5.3 32.9 22.3V394.6c0 9.8-6 18.6-15.1 22.3L416 474.9zM15.1 95.1L160 37.2V423.6L32.9 474.5C17.1 480.8 0 469.2 0 452.2V117.4c0-9.8 6-18.6 15.1-22.3z"/>
  </svg>`,
  
  // 地图图标激活状态
  'map-active': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512" width="32" height="32">
    <path fill="#105286" d="M384 476.1L192 421.2V35.9L384 90.8V476.1zm32-1.2V88.4L543.1 37.5c15.8-6.3 32.9 5.3 32.9 22.3V394.6c0 9.8-6 18.6-15.1 22.3L416 474.9zM15.1 95.1L160 37.2V423.6L32.9 474.5C17.1 480.8 0 469.2 0 452.2V117.4c0-9.8 6-18.6 15.1-22.3z"/>
  </svg>`,
  
  // 用户图标 (fa-user)
  user: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" width="32" height="32">
    <path fill="#9ca3af" d="M224 256A128 128 0 1 0 224 0a128 128 0 1 0 0 256zm-45.7 48C79.8 304 0 383.8 0 482.3C0 498.7 13.3 512 29.7 512H418.3c16.4 0 29.7-13.3 29.7-29.7C448 383.8 368.2 304 269.7 304H178.3z"/>
  </svg>`,
  
  // 用户图标激活状态
  'user-active': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" width="32" height="32">
    <path fill="#105286" d="M224 256A128 128 0 1 0 224 0a128 128 0 1 0 0 256zm-45.7 48C79.8 304 0 383.8 0 482.3C0 498.7 13.3 512 29.7 512H418.3c16.4 0 29.7-13.3 29.7-29.7C448 383.8 368.2 304 269.7 304H178.3z"/>
  </svg>`
};

// 生成PNG图标的Base64数据
function generateIconBase64(iconName) {
  const svg = iconSVGs[iconName];
  if (!svg) {
    throw new Error(`Icon ${iconName} not found`);
  }
  
  // 将SVG转换为Base64
  const base64 = Buffer.from(svg).toString('base64');
  return `data:image/svg+xml;base64,${base64}`;
}

// 创建简单的PNG文件
function createPNGIcon(iconName, outputPath) {
  // 这里创建一个最小的PNG文件头
  // 实际项目中应该使用真实的PNG图标文件
  const minimalPNG = Buffer.from([
    0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, // PNG signature
    0x00, 0x00, 0x00, 0x0D, // IHDR chunk length
    0x49, 0x48, 0x44, 0x52, // IHDR
    0x00, 0x00, 0x00, 0x20, // width: 32
    0x00, 0x00, 0x00, 0x20, // height: 32
    0x08, 0x02, 0x00, 0x00, 0x00, // bit depth, color type, compression, filter, interlace
    0xFC, 0x18, 0xED, 0xA3, // CRC
    0x00, 0x00, 0x00, 0x0C, // IDAT chunk length
    0x49, 0x44, 0x41, 0x54, // IDAT
    0x08, 0x1D, 0x01, 0x01, 0x00, 0x00, 0xFE, 0xFF, 0x00, 0x00, 0x00, 0x02, // minimal image data
    0x00, 0x01, 0x79, 0x3C, // CRC
    0x00, 0x00, 0x00, 0x00, // IEND chunk length
    0x49, 0x45, 0x4E, 0x44, // IEND
    0xAE, 0x42, 0x60, 0x82  // CRC
  ]);
  
  fs.writeFileSync(outputPath, minimalPNG);
}

// 生成所有图标
function generateAllIcons() {
  const iconsDir = path.join(__dirname, '../assets/icons');
  
  // 确保目录存在
  if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true });
  }
  
  // 生成每个图标
  Object.keys(iconSVGs).forEach(iconName => {
    const outputPath = path.join(iconsDir, `${iconName}.png`);
    createPNGIcon(iconName, outputPath);
    console.log(`Generated icon: ${iconName}.png`);
  });
  
  console.log('All icons generated successfully!');
}

module.exports = {
  generateIconBase64,
  createPNGIcon,
  generateAllIcons,
  iconSVGs
};

// 如果直接运行此文件，生成所有图标
if (require.main === module) {
  generateAllIcons();
}
