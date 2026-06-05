const DataLoader = {
    cache: {},

    async loadCSV(filename) {
        if (this.cache[filename]) {
            return this.cache[filename];
        }
        try {
            const response = await fetch(`data/${filename}`);
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