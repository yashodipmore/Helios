"""
HELIOS AI - Email Alert Service
Sends critical panel alerts via email using SMTP.
"""
import os
import smtplib
import asyncio
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import List, Dict, Any, Optional
from datetime import datetime
from app.utils.logger import logger


class EmailService:
    """Handles email notifications for critical solar panel alerts."""
    
    def __init__(self):
        self.smtp_host = os.getenv("SMTP_HOST", "smtp.gmail.com")
        self.smtp_port = int(os.getenv("SMTP_PORT", "587"))
        self.smtp_user = os.getenv("SMTP_USER", "")
        self.smtp_pass = os.getenv("SMTP_PASS", "")
        self.from_email = os.getenv("EMAIL_FROM", self.smtp_user)
        self.alert_recipients = os.getenv("ALERT_EMAILS", "").split(",")
        
    def is_configured(self) -> bool:
        """Check if email service is properly configured."""
        return bool(self.smtp_user and self.smtp_pass)
    
    async def send_critical_alert(
        self, 
        panel_id: str, 
        diagnosis: str,
        power: float,
        temperature: float,
        zone: str,
        priority: str = "critical",
        estimated_cost: float = 0,
        recommended_action: str = ""
    ) -> bool:
        """
        Send critical panel alert email to all configured recipients.
        
        Returns True if email was sent successfully.
        """
        if not self.is_configured():
            logger.warning("Email service not configured - skipping alert")
            return False
            
        if not self.alert_recipients or self.alert_recipients == [""]:
            logger.warning("No alert recipients configured")
            return False
        
        try:
            subject = f"🚨 CRITICAL ALERT: Solar Panel {panel_id} Requires Immediate Attention"
            
            # HTML Email Content
            html_content = f"""
<!DOCTYPE html>
<html>
<head>
    <style>
        body {{ font-family: 'Segoe UI', Arial, sans-serif; background: #f5f5f5; margin: 0; padding: 20px; }}
        .container {{ max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }}
        .header {{ background: linear-gradient(135deg, #111111 0%, #333333 100%); padding: 30px; text-align: center; }}
        .header h1 {{ color: white; margin: 0; font-size: 24px; }}
        .header p {{ color: #9ca3af; margin: 10px 0 0; font-size: 14px; }}
        .alert-badge {{ display: inline-block; background: #ef4444; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; margin-top: 15px; }}
        .content {{ padding: 30px; }}
        .panel-info {{ background: #f9fafb; border-radius: 12px; padding: 20px; margin-bottom: 20px; }}
        .panel-id {{ font-size: 28px; font-weight: 700; color: #111111; margin: 0 0 5px; }}
        .zone {{ color: #6b7280; font-size: 14px; }}
        .stats {{ display: flex; gap: 15px; margin-top: 20px; }}
        .stat {{ flex: 1; background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 15px; text-align: center; }}
        .stat-value {{ font-size: 20px; font-weight: 700; color: #111111; }}
        .stat-label {{ font-size: 11px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; }}
        .stat.critical .stat-value {{ color: #ef4444; }}
        .diagnosis {{ background: #fef2f2; border-left: 4px solid #ef4444; padding: 15px 20px; border-radius: 0 8px 8px 0; margin: 20px 0; }}
        .diagnosis h3 {{ color: #ef4444; margin: 0 0 10px; font-size: 14px; }}
        .diagnosis p {{ color: #7f1d1d; margin: 0; font-size: 15px; }}
        .action {{ background: #f0fdf4; border-left: 4px solid #10b981; padding: 15px 20px; border-radius: 0 8px 8px 0; margin: 20px 0; }}
        .action h3 {{ color: #10b981; margin: 0 0 10px; font-size: 14px; }}
        .action p {{ color: #14532d; margin: 0; font-size: 15px; }}
        .cta {{ text-align: center; margin-top: 25px; }}
        .cta a {{ display: inline-block; background: #111111; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; }}
        .footer {{ background: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb; }}
        .footer p {{ color: #6b7280; font-size: 12px; margin: 0; }}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>⚡ HELIOS AI</h1>
            <p>Solar Farm Monitoring System</p>
            <span class="alert-badge">CRITICAL ALERT</span>
        </div>
        
        <div class="content">
            <div class="panel-info">
                <h2 class="panel-id">{panel_id}</h2>
                <span class="zone">{zone}</span>
                
                <div class="stats">
                    <div class="stat critical">
                        <div class="stat-value">{power}W</div>
                        <div class="stat-label">Power Output</div>
                    </div>
                    <div class="stat">
                        <div class="stat-value">{temperature}°C</div>
                        <div class="stat-label">Temperature</div>
                    </div>
                    <div class="stat">
                        <div class="stat-value">₹{int(estimated_cost)}</div>
                        <div class="stat-label">Est. Repair Cost</div>
                    </div>
                </div>
            </div>
            
            <div class="diagnosis">
                <h3>🔍 AI DIAGNOSIS</h3>
                <p>{diagnosis}</p>
            </div>
            
            <div class="action">
                <h3>✅ RECOMMENDED ACTION</h3>
                <p>{recommended_action or 'Immediate inspection and maintenance required. Dispatch technician to assess and repair.'}</p>
            </div>
            
            <div class="cta">
                <a href="http://localhost:5173">View in HELIOS Dashboard</a>
            </div>
        </div>
        
        <div class="footer">
            <p>This is an automated alert from HELIOS AI • {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}</p>
            <p>L&T Techgium 2026 • Team R.C. Patel Institute of Technology</p>
        </div>
    </div>
</body>
</html>
"""
            
            # Plain text fallback
            plain_content = f"""
HELIOS AI - CRITICAL ALERT
==========================

Panel: {panel_id}
Zone: {zone}
Priority: {priority.upper()}
Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

METRICS:
- Power Output: {power}W
- Temperature: {temperature}°C
- Estimated Repair Cost: ₹{int(estimated_cost)}

DIAGNOSIS:
{diagnosis}

RECOMMENDED ACTION:
{recommended_action or 'Immediate inspection and maintenance required. Dispatch technician to assess and repair.'}

--
HELIOS AI - Solar Farm Monitoring System
L&T Techgium 2026 • Team R.C. Patel
"""
            
            # Create message
            msg = MIMEMultipart("alternative")
            msg["Subject"] = subject
            msg["From"] = self.from_email
            msg["To"] = ", ".join(self.alert_recipients)
            
            msg.attach(MIMEText(plain_content, "plain"))
            msg.attach(MIMEText(html_content, "html"))
            
            # Send email (run in thread pool to not block async)
            loop = asyncio.get_event_loop()
            await loop.run_in_executor(None, self._send_email, msg)
            
            logger.info(f"Critical alert email sent for panel {panel_id}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to send critical alert email: {e}")
            return False
    
    def _send_email(self, msg: MIMEMultipart):
        """Synchronous email sending (runs in thread pool)."""
        with smtplib.SMTP(self.smtp_host, self.smtp_port) as server:
            server.starttls()
            server.login(self.smtp_user, self.smtp_pass)
            server.send_message(msg)
    
    async def send_daily_summary(
        self,
        total_panels: int,
        healthy_count: int,
        warning_count: int,
        critical_count: int,
        total_power_kw: float,
        avg_efficiency: float,
        critical_panels: List[Dict]
    ) -> bool:
        """Send daily summary email."""
        if not self.is_configured():
            return False
        
        try:
            subject = f"📊 HELIOS Daily Report - {datetime.now().strftime('%Y-%m-%d')}"
            
            critical_list = ""
            for p in critical_panels[:5]:
                critical_list += f"<li><strong>{p.get('id')}</strong>: {p.get('diagnosis', 'Unknown issue')}</li>"
            
            html_content = f"""
<!DOCTYPE html>
<html>
<head>
    <style>
        body {{ font-family: 'Segoe UI', Arial, sans-serif; background: #f5f5f5; margin: 0; padding: 20px; }}
        .container {{ max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; }}
        .header {{ background: linear-gradient(135deg, #111111 0%, #333333 100%); padding: 30px; text-align: center; }}
        .header h1 {{ color: white; margin: 0; }}
        .content {{ padding: 30px; }}
        .stats-grid {{ display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin: 20px 0; }}
        .stat-card {{ background: #f9fafb; padding: 20px; border-radius: 12px; text-align: center; }}
        .stat-value {{ font-size: 28px; font-weight: 700; color: #111111; }}
        .stat-label {{ font-size: 12px; color: #6b7280; text-transform: uppercase; }}
        .critical {{ color: #ef4444 !important; }}
        .warning {{ color: #f59e0b !important; }}
        .healthy {{ color: #10b981 !important; }}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>⚡ HELIOS AI Daily Report</h1>
            <p style="color: #9ca3af;">{datetime.now().strftime('%B %d, %Y')}</p>
        </div>
        <div class="content">
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-value healthy">{healthy_count}</div>
                    <div class="stat-label">Healthy</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value warning">{warning_count}</div>
                    <div class="stat-label">Warning</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value critical">{critical_count}</div>
                    <div class="stat-label">Critical</div>
                </div>
            </div>
            
            <p><strong>Total Power:</strong> {round(total_power_kw, 2)} kW</p>
            <p><strong>Avg Efficiency:</strong> {round(avg_efficiency, 1)}%</p>
            
            {"<h3>Critical Panels Requiring Attention:</h3><ul>" + critical_list + "</ul>" if critical_panels else "<p style='color: #10b981;'>✅ No critical panels today!</p>"}
        </div>
    </div>
</body>
</html>
"""
            
            msg = MIMEMultipart("alternative")
            msg["Subject"] = subject
            msg["From"] = self.from_email
            msg["To"] = ", ".join(self.alert_recipients)
            msg.attach(MIMEText(html_content, "html"))
            
            loop = asyncio.get_event_loop()
            await loop.run_in_executor(None, self._send_email, msg)
            
            logger.info("Daily summary email sent successfully")
            return True
            
        except Exception as e:
            logger.error(f"Failed to send daily summary email: {e}")
            return False


# Singleton instance
email_service = EmailService()
