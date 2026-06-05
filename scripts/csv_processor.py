#!/usr/bin/env python3
"""CSV数据处理脚本 - 自动从 matches.csv 生成 players.csv"""

import csv
import os
from collections import defaultdict
from datetime import datetime

def parse_score(score_str):
    """解析比分字符串，返回分数"""
    try:
        return int(score_str.strip())
    except:
        return 0

def infer_winner(score_a, score_b):
    """推断胜者"""
    if score_a > score_b:
        return "A"
    elif score_b > score_a:
        return "B"
    return None

def process_matches(input_file, output_file):
    """处理比赛数据，生成选手数据"""
    if not os.path.exists(input_file):
        print(f"文件不存在: {input_file}")
        return

    players = defaultdict(lambda: {
        "wins": 0, "losses": 0, "champions": 0,
        "runners_up": 0, "events": set(), "last_date": None
    })

    with open(input_file, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            player_a = row.get('选手A姓名', '').strip()
            player_b = row.get('选手B姓名', '').strip()
            score_a = parse_score(row.get('选手A比分', '0'))
            score_b = parse_score(row.get('选手B比分', '0'))
            round_type = row.get('比赛轮次', '').strip()
            event = row.get('期次', '').strip()
            date_str = row.get('比赛日期', '').strip()

            # 记录参赛期次
            if player_a:
                players[player_a]["events"].add(event)
                if player_a not in players:
                    players[player_a]["gender"] = ""
            if player_b:
                players[player_b]["events"].add(event)

            # 推断胜负
            winner = infer_winner(score_a, score_b)

            if round_type == "决赛":
                if winner == "A":
                    players[player_a]["champions"] += 1
                    players[player_b]["runners_up"] += 1
                elif winner == "B":
                    players[player_b]["champions"] += 1
                    players[player_a]["runners_up"] += 1

            if winner == "A":
                if player_a:
                    players[player_a]["wins"] += 1
                if player_b:
                    players[player_b]["losses"] += 1
            elif winner == "B":
                if player_b:
                    players[player_b]["wins"] += 1
                if player_a:
                    players[player_a]["losses"] += 1

            # 更新最近参赛日期
            if date_str:
                try:
                    date = datetime.strptime(date_str, '%Y-%m-%d')
                    for p in [player_a, player_b]:
                        if p and (not players[p]["last_date"] or date > players[p]["last_date"]):
                            players[p]["last_date"] = date
                except:
                    pass

    # 生成players.csv
    with open(output_file, 'w', encoding='utf-8', newline='') as f:
        writer = csv.writer(f)
        writer.writerow(['选手姓名', '性别', '胜率', '冠军数', '亚军数', '参赛期数', '最近参赛'])

        for name, data in sorted(players.items()):
            total = data["wins"] + data["losses"]
            win_rate = round(data["wins"] / total * 100, 1) if total > 0 else 0.0
            last_date = data["last_date"].strftime('%Y-%m-%d') if data["last_date"] else ""

            writer.writerow([
                name,
                data.get("gender", ""),
                win_rate,
                data["champions"],
                data["runners_up"],
                len(data["events"]),
                last_date
            ])

    print(f"已生成 {output_file}")

if __name__ == "__main__":
    import sys
    input_file = sys.argv[1] if len(sys.argv) > 1 else "data/matches.csv"
    output_file = sys.argv[2] if len(sys.argv) > 2 else "data/players.csv"
    process_matches(input_file, output_file)