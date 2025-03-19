from fastapi import FastAPI, Request, Depends, BackgroundTasks, HTTPException
from fastapi.responses import RedirectResponse
from sqlalchemy import create_engine, Column, String, Integer, Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
import tweepy
import uvicorn
import os
from dotenv import load_dotenv
import requests
import json
import time
import pickle
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
from typing import List
import logging

# 加载环境变量
load_dotenv()

TWITTER_CLIENT_ID = os.getenv("TWITTER_CLIENT_ID")
TWITTER_CLIENT_SECRET = os.getenv("TWITTER_CLIENT_SECRET")
CALLBACK_URL = os.getenv("CALLBACK_URL", "http://localhost:8000/callback")
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./users.db")
WEBHOOK_SECRET = os.getenv("WEBHOOK_SECRET", "your_webhook_secret")
BINANCE_EMAIL = os.getenv("BINANCE_EMAIL")
BINANCE_PASSWORD = os.getenv("BINANCE_PASSWORD")
COOKIES_FILE = "binance_cookies.pkl"

# 初始化日志
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

# 初始化数据库
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# 定义用户模型
class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    access_token = Column(String)
    access_secret = Column(String)
    authorized = Column(Boolean, default=True)  # 是否仍然有 Twitter 授权

class SyncLog(Base):
    __tablename__ = "sync_logs"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, index=True)
    tweet_text = Column(String)
    status = Column(String)
    timestamp = Column(String)

Base.metadata.create_all(bind=engine)

app = FastAPI()

auth = tweepy.OAuthHandler(TWITTER_CLIENT_ID, TWITTER_CLIENT_SECRET, CALLBACK_URL)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/login")
def login():
    try:
        redirect_url = auth.get_authorization_url()
        return RedirectResponse(redirect_url)
    except tweepy.TweepError:
        return {"error": "无法获取 Twitter 授权 URL"}

@app.get("/callback")
def callback(request: Request, db: Session = Depends(get_db)):
    oauth_verifier = request.query_params.get("oauth_verifier")
    auth.get_access_token(oauth_verifier)
    
    user_api = tweepy.API(auth)
    user = user_api.me()
    
    db_user = db.query(User).filter(User.username == user.screen_name).first()
    if db_user:
        db_user.access_token = auth.access_token
        db_user.access_secret = auth.access_secret
        db_user.authorized = True
    else:
        db_user = User(
            username=user.screen_name,
            access_token=auth.access_token,
            access_secret=auth.access_secret,
            authorized=True,
        )
        db.add(db_user)
    db.commit()
    
    return {"message": "登录成功", "username": user.screen_name}

@app.post("/webhook/twitter")
def twitter_webhook(request: Request, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    payload = request.json()
    
    if request.headers.get("X-Twitter-Webhook-Secret") != WEBHOOK_SECRET:
        return {"error": "Unauthorized"}
    
    if "tweet_create_events" in payload:
        for tweet in payload["tweet_create_events"]:
            username = tweet["user"]["screen_name"]
            text = tweet["text"]
            
            db_user = db.query(User).filter(User.username == username).first()
            if db_user and db_user.authorized:
                background_tasks.add_task(sync_to_binance, username, text, db)
    
    return {"message": "Webhook received"}

def sync_to_binance(username: str, tweet_text: str, db: Session):
    logger.info(f"开始同步 {username} 的推文到 Binance Square: {tweet_text}")
    
    options = webdriver.ChromeOptions()
    options.add_argument("--headless")
    options.add_argument("--disable-gpu")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=options)
    
    try:
        driver.get("https://www.binance.com/")
        time.sleep(5)
        
        if os.path.exists(COOKIES_FILE):
            with open(COOKIES_FILE, "rb") as f:
                cookies = pickle.load(f)
                for cookie in cookies:
                    driver.add_cookie(cookie)
            driver.refresh()
            time.sleep(5)
        else:
            username_input = driver.find_element(By.NAME, "email")
            password_input = driver.find_element(By.NAME, "password")
            username_input.send_keys(BINANCE_EMAIL)
            password_input.send_keys(BINANCE_PASSWORD)
            password_input.send_keys(Keys.RETURN)
            time.sleep(10)
            with open(COOKIES_FILE, "wb") as f:
                pickle.dump(driver.get_cookies(), f)
        
        driver.get("https://www.binance.com/square/create-post")
        time.sleep(5)
        title_input = driver.find_element(By.NAME, "title")
        content_input = driver.find_element(By.NAME, "content")
        title_input.send_keys(f"{username} 的推文同步")
        content_input.send_keys(tweet_text)
        
        submit_button = driver.find_element(By.CSS_SELECTOR, "button[type='submit']")
        submit_button.click()
        time.sleep(5)
        
        db.add(SyncLog(username=username, tweet_text=tweet_text, status="成功", timestamp=time.strftime('%Y-%m-%d %H:%M:%S')))
        db.commit()
        logger.info(f"推文已同步至 Binance Square: {tweet_text}")
    except Exception as e:
        db.add(SyncLog(username=username, tweet_text=tweet_text, status=f"失败: {e}", timestamp=time.strftime('%Y-%m-%d %H:%M:%S')))
        db.commit()
        logger.error(f"同步失败: {e}")
    finally:
        driver.quit()

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)

