-- 테이블 생성
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT DEFAULT 'user',
  created_at INTEGER DEFAULT (strftime('%s', 'now'))
);

CREATE TABLE guides (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL,
  views INTEGER DEFAULT 0,
  popularity_score INTEGER DEFAULT 0
);

CREATE TABLE game_results (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT,
  correct INTEGER DEFAULT 0,
  incorrect INTEGER DEFAULT 0,
  created_at INTEGER DEFAULT (strftime('%s', 'now')),
  FOREIGN KEY(user_id) REFERENCES users(id)
);

CREATE TABLE og_image_cache (
  id TEXT PRIMARY KEY,
  url TEXT NOT NULL,
  sha TEXT NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE TABLE github_failure_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  timestamp INTEGER DEFAULT (strftime('%s', 'now')),
  file_path TEXT NOT NULL,
  error_message TEXT NOT NULL,
  status INTEGER,
  notified BOOLEAN DEFAULT 0
);

-- 초기 가이드 데이터 (50개 중 샘플 5개, 나머지는 패턴 반복)
INSERT INTO guides (slug, title, content, category) VALUES 
('plastic-bottle', '투명 페트병', '라벨을 떼고 압착하여 플라스틱으로 배출하세요.', '플라스틱'),
('delivery-box', '택배 종이 박스', '테이프와 송장을 제거한 뒤 종이로 배출하세요.', '종이'),
('green-glass-bottle', '초록색 소주병', '내용물을 비우고 유리로 배출하거나 소매점에 반납하세요.', '유리'),
('aluminum-can', '알루미늄 캔', '이물질을 씻어내고 캔류로 배출하세요.', '캔'),
('vinyl-wrap', '라면 봉지/비닐', '투명 비닐이나 전용 수거함에 배출하세요.', '비닐');
