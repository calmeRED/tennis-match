const App = {
    currentTab: 'champions',
    currentQueryTab: 'player',
    allMatches: [],
    allPlayers: [],

    async init() {
        this.bindEvents();
        await this.loadAllData();
        await this.loadChampionsData();
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

        if (tabId === 'events') {
            this.loadEventsData();
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

    getBasePath() {
        return window.location.origin + window.location.pathname.replace(/[^/]*$/, '');
    },

    async loadChampionsData() {
        const matchesText = await DataLoader.loadCSV('matches.csv');
        if (!matchesText) return;

        const matches = CSVParser.parse(matchesText);
        const finals = matches.filter(m => m.比赛轮次 === '决赛');
        const base = this.getBasePath();

        const champions = [];
        for (const m of finals) {
            const scoreA = parseInt(m.选手A比分) || 0;
            const scoreB = parseInt(m.选手B比分) || 0;
            const winner = scoreA > scoreB ? m.选手A姓名 : m.选手B姓名;
            const txtPath = `${base}champions/${m.期次}-${m.场次}.txt`;
            let 感言 = '';
            try {
                const response = await fetch(txtPath);
                if (response.ok) {
                    感言 = await response.text();
                }
            } catch (e) {
                // txt file not found, ignore
            }
            champions.push({
                选手姓名: winner,
                期次: m.期次,
                场次: m.场次,
                组别: m.组别,
                比赛日期: m.比赛日期,
                感言: 感言
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

        // 直接从 matches.csv 计算选手数据
        const playerMatches = this.allMatches.filter(m =>
            m.选手A姓名 === name || m.选手B姓名 === name
        );

        if (playerMatches.length === 0) {
            document.getElementById('query-results').innerHTML = '<p class="no-data">未找到该选手</p>';
            return;
        }

        let wins = 0, losses = 0, champions = 0, runnersUp = 0;
        const events = new Set();
        let lastDate = '';

        playerMatches.forEach(m => {
            events.add(m.期次);
            const scoreA = parseInt(m.选手A比分) || 0;
            const scoreB = parseInt(m.选手B比分) || 0;
            const isPlayerA = m.选手A姓名 === name;

            if (m.比赛轮次 === '决赛') {
                const winner = scoreA > scoreB ? m.选手A姓名 : m.选手B姓名;
                if (winner === name) {
                    champions++;
                } else {
                    runnersUp++;
                }
            }

            if (isPlayerA) {
                if (scoreA > scoreB) wins++;
                else losses++;
            } else {
                if (scoreB > scoreA) wins++;
                else losses++;
            }

            if (!lastDate || m.比赛日期 > lastDate) {
                lastDate = m.比赛日期;
            }
        });

        const total = wins + losses;
        const winRate = total > 0 ? Math.round(wins / total * 100, 1) : 0;

        const player = {
            选手姓名: name,
            胜率: winRate,
            冠军数: champions,
            亚军数: runnersUp,
            参赛期数: events.size,
            最近参赛: lastDate
        };

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