module.exports = {
    devServer: {
        https: true,
        host : 'localhost',
        port : 8080
    },
    publicPath: process.env.NODE_ENV === 'development' ? '/' : './',
}