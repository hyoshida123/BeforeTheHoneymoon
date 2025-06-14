// Web build用のフォント修正スクリプト
// このファイルは app.json の web.build に追加可能

const fs = require('fs');
const path = require('path');

// HTMLファイルを修正してフォント読み込みを追加
function fixWebBuild() {
    const distPath = path.join(__dirname, 'dist');
    const indexPath = path.join(distPath, 'index.html');
    
    if (fs.existsSync(indexPath)) {
        let html = fs.readFileSync(indexPath, 'utf8');
        
        // シンプルなフォント修正
        const metaTags = `
    <meta charset="UTF-8">
    <style>
        * {
            font-family: system-ui, -apple-system, sans-serif !important;
            line-height: 1.5 !important;
        }
        
        body, html {
            font-family: system-ui, -apple-system, sans-serif !important;
            -webkit-font-smoothing: antialiased;
            text-rendering: optimizeLegibility;
        }
    </style>`;
        
        // headタグの終了前に挿入
        html = html.replace('</head>', metaTags + '\n</head>');
        
        fs.writeFileSync(indexPath, html);
        console.log('Web build font fix applied successfully');
    }
}

if (require.main === module) {
    fixWebBuild();
}

module.exports = fixWebBuild;