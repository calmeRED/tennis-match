const App = {
    currentTab: 'events',
    currentQueryTab: 'player',
    allMatches: [],
    allPlayers: [],

    async init() {
        this.bindEvents();
        await this.loadEventsData();
        await this.loadAllData();
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

        if (tabId === 'champions') {
            this.loadChampionsData();
        }
    },

    switchQueryTab(tabId) {
        this.currentQueryTab = tabId;
        document.querySelectorAll('.query-tab').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.query === tabId);
        });
        this.renderQueryForm();
        if (tabId === 'event') {
            document.getElementById('query-results').innerHTML = UI.renderMatchTable(this.allMatches, true);
        } else {
            document.getElementById('query-results').innerHTML = '';
        }
    },

    async loadAllData() {
        const matchesText = await DataLoader.loadCSV('matches.csv');
        if (matchesText) {
            this.allMatches = CSVParser.parse(matchesText);
        }
        const playersText = await DataLoader.loadCSV('players.csv');
        if (playersText) {
            this.allPlayers = CSVParser.parse(playersText);
        }
    },

    async loadEventsData() {
        const text = await DataLoader.loadCSV('sample_events.csv');
        if (text) {
            const events = CSVParser.parse(text);
            const container = document.getElementById('events-list');
            container.innerHTML = events.map(e => UI.renderEventCard(e)).join('');
        }
    },

    async loadChampionsData() {
        const matchesText = await DataLoader.loadCSV('matches.csv');
        if (!matchesText) return;

        const matches = CSVParser.parse(matchesText);
        const finals = matches.filter(m => m.比赛轮次 === '决赛');

        const champions = [];
        for (const m of finals) {
            const scoreA = parseInt(m.选手A比分) || 0;
            const scoreB = parseInt(m.选手B比分) || 0;
            const winner = scoreA > scoreB ? m.选手A姓名 : m.选手B姓名;
            champions.push({
                选手姓名: winner,
                期次: m.期次,
                场次: m.场次,
                比赛日期: m.比赛日期,
                感言: ''
            });
        }

        const container = document.getElementById('champions-list');
        container.innerHTML = champions.map(c => UI.renderChampionCard(c)).join('');
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
                <input type="text" id="event-number" placeholder="输入期次筛选">
                <button onclick="App.searchEvent()">筛选</button>
                <button onclick="App.showAllEvents()">显示全部</button>
            `;
        }
    },

    async searchPlayer() {
        const name = document.getElementById('player-name').value.trim();
        if (!name) return alert('请输入选手姓名');

        const player = this.allPlayers.find(p => p.选手姓名 === name);
        const results = document.getElementById('query-results');
        results.innerHTML = UI.renderPlayerResult(player);
    },

    async searchEvent() {
        const eventNum = document.getElementById('event-number').value.trim();
        if (!eventNum) return alert('请输入期次');

        const eventMatches = this.allMatches.filter(m => m.期次 === eventNum);
        const results = document.getElementById('query-results');
        results.innerHTML = UI.renderMatchTable(eventMatches, true);
    },

    showAllEvents() {
        document.getElementById('event-number').value = '';
        const results = document.getElementById('query-results');
        results.innerHTML = UI.renderMatchTable(this.allMatches, true);
    }
};

document.addEventListener('DOMContentLoaded', () => App.init());