from fastapi import FastAPI, Request, Depends
from fastapi.responses import RedirectResponse
from sqlalchemy import create_engine, Column, String, Integer
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
import tweepy
import uvicorn
import os
from dotenv import load_dotenv

# 加载环境变量
load_dotenv()

TWITTER_CLIENT_ID = os.getenv("TWITTER_CLIENT_ID")
TWITTER_CLIENT_SECRET = os.getenv("TWITTER_CLIENT_SECRET")
CALLBACK_URL = os.getenv("CALLBACK_URL", "http://localhost:8000/callback")
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./users.db")

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
        db_user.access_secret = auth.access_token_secret
    else:
        db_user = User(
            username=user.screen_name,
            access_token=auth.access_token,
            access_secret=auth.access_token_secret,
        )
        db.add(db_user)
    db.commit()
    
    return {"message": "登录成功", "username": user.screen_name}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
