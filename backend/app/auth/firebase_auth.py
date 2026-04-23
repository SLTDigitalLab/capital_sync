import firebase_admin
from firebase_admin import credentials, auth
from fastapi import HTTPException, Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.config import settings
import time

cred = credentials.Certificate(settings.firebase_credentials_path)
firebase_admin.initialize_app(cred)

security = HTTPBearer()

async def verify_firebase_token(credentials: HTTPAuthorizationCredentials = Security(security)):
    try:
        token = credentials.credentials
        decoded_token = auth.verify_id_token(token)
        
        # Enforce 24-hour session limit based on authentication time
        auth_time = decoded_token.get('auth_time', 0)
        current_time = time.time()
        
        if (current_time - auth_time) > 24 * 60 * 60:
            raise HTTPException(status_code=401, detail="Session expired. Please log in again.")
            
        return decoded_token['uid']
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=401, detail=f"Invalid authentication: {str(e)}")