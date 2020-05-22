var path = require('path');

module.exports = {
    mode: 'development',
    entry: './src/index.ts',
    output: {
        path: path.join(__dirname, 'output'),
        filename: 'index.js',
        libraryTarget: 'umd',
        library: 'compressJs',
        globalObject: 'this'
    },
    resolve: {
        extensions: [".ts", ".tsx", ".js"]
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                loader: 'ts-loader',
                options: {
                    configFile: path.join(__dirname, 'tsconfig.json')
                },
                exclude: /node_modules/
            }
        ]
    }
  };