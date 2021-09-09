const loader = require('ejs-compiled-loader');
module.exports = {
    process: function(src, filename, config, options) {
        const self = this;
        self.resourcePath = filename;
        self.loader = loader;
        return self.loader(src);
    }
};
