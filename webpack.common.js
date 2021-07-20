const path = require('path');
const DotenvWebpackPlugin = require('dotenv-webpack');

module.exports = {
    entry: './frontend-src/index.js',
    output: {
        filename: 'main.js',
        path: path.resolve(__dirname, 'public')
    },
    module: {
        rules: [
            {
                test: /\.css$/i,
                use: ['style-loader', 'css-loader']
            }
        ]
    },
    plugins: [
        new DotenvWebpackPlugin()
    ]
};
