const path = require('path');
const DotenvWebpackPlugin = require('dotenv-webpack');

module.exports = {
    entry: './src/frontend-src/index.js',
    output: {
        filename: 'main.js',
        path: path.resolve(__dirname, 'src', 'public')
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
