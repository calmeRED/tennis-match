const DataLoader = {
    cache: {},
    basePath: window.location.origin + window.location.pathname.replace(/[^/]*$/, ''),

    async loadCSV(filename) {
        if (this.cache[filename]) {
            return this.cache[filename];
        }
        try {
            const response = await fetch(`${this.basePath}data/${filename}`);
            const text = await response.text();
            this.cache[filename] = text;
            return text;
        } catch (error) {
            console.error(`Failed to load ${filename}:`, error);
            return null;
        }
    },

    clearCache() {
        this.cache = {};
    }
};