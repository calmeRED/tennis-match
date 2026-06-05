const App = {
    currentTab: 'events',
    currentQueryTab: 'player',

    async init() {
        this.bindEvents();
        await this.loadEventsData();
    },

    bindEvents() {
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.tab);
            });
        });

        document.querySelectorAll('.query-tab').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchQueryTab(e.target.dataset.query);
            });
        });
    },

    switchTab(tabId) {
        this.currentTab = tabId;
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tabId);
        });
        document.querySelectorAll('.tab-content').forEach(section => {
            section.classList.toggle('active', section.id === tabId);
        });
    },

    switchQueryTab(tabId) {
        this.currentQueryTab = tabId;
        document.querySelectorAll('.query-tab').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.query === tabId);
        });
        this.renderQueryForm();
    },

    async loadEventsData() {
        const text = await DataLoader.loadCSV('sample_events.csv');
        if (text) {
            const events = CSVParser.parse(text);
            const container = document.getElementById('events-list');
            container.innerHTML = events.map(e => UI.renderEventCard(e)).join('');
        }
    },

    renderQueryForm() {
        const form = document.getElementById('query-form');
        if (this.currentQueryTab === 'player') {
            form.innerHTML = `
                <input type="text" id="player-name" placeholder="输入选手姓名">
                <button onclick="App.searchPlayer()">查询</button>
            `;
        } else {
            form.innerHTML = `
                <input type="text" id="event-number" placeholder="输入期次">
                <button onclick="App.searchEvent()">查询</button>
            `;
        }
    },

    async searchPlayer() {
        const name = document.getElementById('player-name').value.trim();
        if (!name) return alert('请输入选手姓名');

        // Load and search from players data
        const matchesText = await DataLoader.loadCSV('sample_matches.csv');
        if (!matchesText) return alert('数据加载失败');

        const matches = CSVParser.parse(matchesText);
        const playerMatches = matches.filter(m =>
            m.选手A姓名 === name || m.选手B姓名 === name
        );

        const results = document.getElementById('query-results');
        results.innerHTML = UI.renderMatchTable(playerMatches);
    },

    async searchEvent() {
        const eventNum = document.getElementById('event-number').value.trim();
        if (!eventNum) return alert('请输入期次');

        const matchesText = await DataLoader.loadCSV('sample_matches.csv');
        if (!matchesText) return alert('数据加载失败');

        const matches = CSVParser.parse(matchesText);
        const eventMatches = matches.filter(m => m.期次 === eventNum);

        const results = document.getElementById('query-results');
        results.innerHTML = UI.renderMatchTable(eventMatches);
    }
};

document.addEventListener('DOMContentLoaded', () => App.init());