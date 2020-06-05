const webpack = require('webpack')
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')

module.exports = {
    lintOnSave: false,
    runtimeCompiler: true,
    filenameHashing: false,
    chainWebpack: config => {
        config.module.rules.delete('svg'), config.optimization.minimize(false)
    },
    configureWebpack: {
        output: {
            filename: '[name].js',
            chunkFilename: '[name].js'
        },
        plugins: [new webpack.optimize.LimitChunkCountPlugin({ maxChunks: 1 })],
        optimization: {
            // minimizer: [
            //     new UglifyJsPlugin({
            //         uglifyOptions: {
            //             compress: {
            //                 drop_console: false
            //             }
            //         }
            //     })
            // ]
        },
        module: {
            rules: [
                {
                    test: /\.svg$/,
                    use: ['vue-svg-loader']
                }
            ]
        }
    },
    pluginOptions: {
        // express: {
        //     shouldServeApp: true,
        //     serverDir: './srv'
        // }
    },
    devServer: {
        setup(app) {
            app.post('*', (req, res) => {
                res.redirect(req.originalUrl)
            })
        }
    }
}
