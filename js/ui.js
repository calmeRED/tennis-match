const UI = {
    renderEventCard(event) {
        return `
            <div class="card">
                <h3>${event.名称 || '未命名赛事'}</h3>
                <p><strong>期次：</strong>${event.期次}</p>
                <p><strong>日期：</strong>${event.日期}</p>
                <p><strong>地点：</strong>${event.地点}</p>
                <p><strong>规模：</strong>${event.规模}人</p>
                <p><strong>组别：</strong>${event.组别}</p>
                <div class="register-info">
                    <p><strong>报名方式：</strong>${event.报名方式}</p>
                    ${event.二维码链接 ? `<img src="${event.二维码链接}" alt="报名二维码" style="max-width:150px;margin-top:0.5rem;">` : ''}
                </div>
            </div>
        `;
    },

    renderChampionCard(champion) {
        return `
            <div class="card champion-card">
                <h3>🏆 ${champion.选手姓名}</h3>
                <p><strong>组别：</strong>${champion.组别}</p>
                <p><strong>夺冠期次：</strong>${champion.期次}</p>
            </div>
        `;
    },

    renderMatchTable(matches) {
        if (!matches || matches.length === 0) {
            return '<p class="no-data">暂无数据</p>';
        }
        let html = `
            <table class="data-table">
                <thead>
                    <tr>
                        <th>场次</th>
                        <th>轮次</th>
                        <th>组别</th>
                        <th>选手A</th>
                        <th>比分</th>
                        <th>选手B</th>
                        <th>日期</th>
                    </tr>
                </thead>
                <tbody>
        `;
        matches.forEach(m => {
            html += `
                <tr>
                    <td>${m.场次}</td>
                    <td>${m.比赛轮次}</td>
                    <td>${m.组别}</td>
                    <td>${m.选手A姓名}</td>
                    <td>${m.选手A比分}-${m.选手B比分}</td>
                    <td>${m.选手B姓名}</td>
                    <td>${m.比赛日期}</td>
                </tr>
            `;
        });
        html += '</tbody></table>';
        return html;
    },

    renderPlayerCard(player) {
        return `
            <div class="card player-card">
                <h3>${player.选手姓名}</h3>
                <p><strong>性别：</strong>${player.性别 || '未知'}</p>
                <p><strong>胜率：</strong>${player.胜率}%</p>
                <p><strong>冠军数：</strong>${player.冠军数}</p>
                <p><strong>亚军数：</strong>${player.亚军数}</p>
                <p><strong>参赛期数：</strong>${player.参赛期数}</p>
                <p><strong>最近参赛：</strong>${player.最近参赛}</p>
            </div>
        `;
    }
};