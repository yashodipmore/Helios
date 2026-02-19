"""
HELIOS AI - OTP Authentication Service
Provides email-based OTP login/register functionality.
"""
import os
import random
import smtplib
import asyncio
from datetime import datetime, timedelta
from typing import Dict, Optional
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.utils.logger import logger


class OTPService:
    """Handles OTP generation, verification, and email delivery."""
    
    def __init__(self):
        # SMTP Configuration
        self.smtp_host = os.getenv("SMTP_HOST", "smtp.gmail.com")
        self.smtp_port = int(os.getenv("SMTP_PORT", "587"))
        self.smtp_user = os.getenv("SMTP_USER", "")
        self.smtp_pass = os.getenv("SMTP_PASS", "")
        self.from_email = os.getenv("EMAIL_FROM", self.smtp_user)
        
        # OTP Storage (In production, use Redis)
        self._otp_store: Dict[str, Dict] = {}
        
        # Configuration
        self.otp_length = 6
        self.otp_expiry_minutes = 5
        self.max_attempts = 3
    
    def is_configured(self) -> bool:
        """Check if email service is configured."""
        return bool(self.smtp_user and self.smtp_pass)
    
    def _generate_otp(self) -> str:
        """Generate a random 6-digit OTP."""
        return ''.join([str(random.randint(0, 9)) for _ in range(self.otp_length)])
    
    def _get_otp_email_html(self, otp: str, email: str, is_registration: bool = False) -> str:
        """Generate HTML email content for OTP."""
        action = "Register" if is_registration else "Login"
        return f"""
<!DOCTYPE html>
<html>
<head>
    <style>
        body {{ font-family: 'Segoe UI', Arial, sans-serif; background: #f5f5f5; margin: 0; padding: 20px; }}
        .container {{ max-width: 500px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }}
        .header {{ background: linear-gradient(135deg, #111111 0%, #333333 100%); padding: 30px; text-align: center; }}
        .header h1 {{ color: white; margin: 0; font-size: 24px; }}
        .header p {{ color: #9ca3af; margin: 10px 0 0; font-size: 14px; }}
        .content {{ padding: 40px 30px; text-align: center; }}
        .otp-box {{ background: #f9fafb; border: 2px dashed #e5e7eb; padding: 25px; border-radius: 12px; margin: 25px 0; }}
        .otp-code {{ font-size: 36px; font-weight: 700; letter-spacing: 8px; color: #111111; font-family: 'Courier New', monospace; }}
        .expiry {{ color: #f59e0b; font-size: 13px; margin-top: 15px; }}
        .footer {{ background: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb; }}
        .footer p {{ color: #6b7280; font-size: 12px; margin: 0; }}
        .warning {{ color: #ef4444; font-size: 12px; margin-top: 20px; }}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>⚡ HELIOS AI</h1>
            <p>Solar Farm Monitoring System</p>
        </div>
        
        <div class="content">
            <h2 style="color: #111111; margin: 0 0 10px;">Your {action} OTP</h2>
            <p style="color: #6b7280; margin: 0;">Use this code to {action.lower()} to your account</p>
            
            <div class="otp-box">
                <div class="otp-code">{otp}</div>
                <div class="expiry">⏱ Valid for {self.otp_expiry_minutes} minutes</div>
            </div>
            
            <p style="color: #6b7280; font-size: 14px;">
                If you didn't request this code, please ignore this email.
            </p>
            
            <p class="warning">
                🔒 Never share this code with anyone. HELIOS AI team will never ask for your OTP.
            </p>
        </div>
        
        <div class="footer">
            <p>This is an automated message from HELIOS AI</p>
            <p>L&T Techgium 2026 • Team R.C. Patel Institute of Technology</p>
        </div>
    </div>
</body>
</html>
"""
    
    def _send_email_sync(self, to_email: str, subject: str, html_content: str):
        """Synchronous email sending (runs in thread pool)."""
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = self.from_email
        msg["To"] = to_email
        msg.attach(MIMEText(html_content, "html"))
        
        with smtplib.SMTP(self.smtp_host, self.smtp_port) as server:
            server.starttls()
            server.login(self.smtp_user, self.smtp_pass)
            server.send_message(msg)
    
    async def send_otp(self, email: str, is_registration: bool = False) -> Dict:
        """
        Generate and send OTP to the given email.
        
        Returns:
            Dict with success status and message
        """
        if not self.is_configured():
            # For demo/development, return OTP without sending email
            otp = self._generate_otp()
            expiry = datetime.now() + timedelta(minutes=self.otp_expiry_minutes)
            
            self._otp_store[email.lower()] = {
                "otp": otp,
                "expiry": expiry,
                "attempts": 0,
                "is_registration": is_registration
            }
            
            logger.info(f"Demo mode - OTP for {email}: {otp}")
            return {
                "success": True,
                "message": "OTP generated (email not configured - check logs)",
                "demo_otp": otp,  # Only for demo mode
                "expires_in": self.otp_expiry_minutes * 60
            }
        
        try:
            # Generate OTP
            otp = self._generate_otp()
            expiry = datetime.now() + timedelta(minutes=self.otp_expiry_minutes)
            
            # Store OTP
            self._otp_store[email.lower()] = {
                "otp": otp,
                "expiry": expiry,
                "attempts": 0,
                "is_registration": is_registration
            }
            
            # Send email
            subject = f"HELIOS AI - Your {'Registration' if is_registration else 'Login'} OTP: {otp}"
            html = self._get_otp_email_html(otp, email, is_registration)
            
            loop = asyncio.get_event_loop()
            await loop.run_in_executor(None, self._send_email_sync, email, subject, html)
            
            logger.info(f"OTP sent to {email}")
            return {
                "success": True,
                "message": f"OTP sent to {email}",
                "expires_in": self.otp_expiry_minutes * 60
            }
            
        except Exception as e:
            logger.error(f"Failed to send OTP to {email}: {e}")
            # Fallback: Return OTP even if email fails (for demo/testing)
            return {
                "success": True,
                "message": "Email delivery failed, but OTP generated for demo",
                "demo_otp": otp,  # Show OTP since email failed
                "expires_in": self.otp_expiry_minutes * 60,
                "email_error": str(e)
            }
    
    def verify_otp(self, email: str, otp: str) -> Dict:
        """
        Verify the OTP for the given email.
        
        Returns:
            Dict with success status, user info if verified
        """
        email_lower = email.lower()
        
        if email_lower not in self._otp_store:
            return {
                "success": False,
                "message": "No OTP found. Please request a new one."
            }
        
        stored = self._otp_store[email_lower]
        
        # Check expiry
        if datetime.now() > stored["expiry"]:
            del self._otp_store[email_lower]
            return {
                "success": False,
                "message": "OTP expired. Please request a new one."
            }
        
        # Check attempts
        if stored["attempts"] >= self.max_attempts:
            del self._otp_store[email_lower]
            return {
                "success": False,
                "message": "Too many attempts. Please request a new OTP."
            }
        
        # Verify OTP
        if otp != stored["otp"]:
            stored["attempts"] += 1
            remaining = self.max_attempts - stored["attempts"]
            return {
                "success": False,
                "message": f"Invalid OTP. {remaining} attempts remaining."
            }
        
        # OTP verified - clean up
        is_registration = stored["is_registration"]
        del self._otp_store[email_lower]
        
        logger.info(f"OTP verified for {email}")
        return {
            "success": True,
            "message": "OTP verified successfully",
            "is_new_user": is_registration,
            "email": email
        }
    
    def cleanup_expired(self):
        """Remove expired OTPs from storage."""
        now = datetime.now()
        expired = [email for email, data in self._otp_store.items() 
                   if now > data["expiry"]]
        for email in expired:
            del self._otp_store[email]


# Singleton instance
otp_service = OTPService()
