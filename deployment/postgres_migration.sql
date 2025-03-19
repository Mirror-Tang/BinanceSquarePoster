-- 创建 PostgreSQL 数据库
CREATE DATABASE twitter_binance_sync;

-- 切换到新数据库
\c twitter_binance_sync;

-- 创建用户表
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE,
    access_token TEXT NOT NULL,
    access_secret TEXT NOT NULL,
    authorized BOOLEAN DEFAULT TRUE,
    last_notified INTEGER DEFAULT 0
);

-- 创建同步日志表
CREATE TABLE sync_logs (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    tweet_text TEXT NOT NULL,
    status VARCHAR(50) NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 添加索引优化查询性能
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_sync_logs_username ON sync_logs(username);