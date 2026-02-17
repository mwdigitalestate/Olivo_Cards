import aiosmtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import logging
import os

logger = logging.getLogger(__name__)

# Get app URL from environment variable for email links
APP_URL = os.environ.get('APP_URL', os.environ.get('REACT_APP_BACKEND_URL', 'https://olivocards.com'))

class EmailService:
    def __init__(self, smtp_email: str = None, smtp_password: str = None):
        self.smtp_email = smtp_email
        self.smtp_password = smtp_password
        self.smtp_host = "smtp.gmail.com"
        self.smtp_port = 587
        
    def is_configured(self) -> bool:
        return bool(self.smtp_email and self.smtp_password)
    
    async def send_email(self, to_email: str, subject: str, html_content: str) -> bool:
        if not self.is_configured():
            logger.warning("Email service not configured, skipping email send")
            return False
            
        try:
            message = MIMEMultipart("alternative")
            message["From"] = f"Olivo Cards <{self.smtp_email}>"
            message["To"] = to_email
            message["Subject"] = subject
            
            html_part = MIMEText(html_content, "html")
            message.attach(html_part)
            
            await aiosmtplib.send(
                message,
                hostname=self.smtp_host,
                port=self.smtp_port,
                username=self.smtp_email,
                password=self.smtp_password,
                start_tls=True,
            )
            
            logger.info(f"Email sent successfully to {to_email}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to send email to {to_email}: {str(e)}")
            return False

    # Email Templates
    def get_welcome_template(self, user_name: str) -> tuple:
        subject = "¡Bienvenido a Olivo Cards!"
        html = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{ font-family: 'Inter', Arial, sans-serif; background-color: #f5f5f5; margin: 0; padding: 20px; }}
                .container {{ max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; }}
                .header {{ background: #3C3C3C; padding: 30px; text-align: center; }}
                .header img {{ height: 50px; }}
                .content {{ padding: 40px 30px; }}
                .btn {{ display: inline-block; background: #C5C51E; color: #000; padding: 14px 30px; text-decoration: none; border-radius: 4px; font-weight: 600; }}
                .footer {{ background: #f5f5f5; padding: 20px; text-align: center; color: #808080; font-size: 12px; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <img src="https://customer-assets.emergentagent.com/job_offline-qr-cards/artifacts/hhh3zakr_LOGO%20OLIVO%20CARDS.png" alt="Olivo Cards">
                </div>
                <div class="content">
                    <h1 style="color: #3C3C3C; margin-bottom: 20px;">¡Hola {user_name}!</h1>
                    <p style="color: #5E5E5E; line-height: 1.6;">
                        Te damos la bienvenida a <strong>Olivo Cards</strong>, tu plataforma de tarjetas digitales profesionales.
                    </p>
                    <p style="color: #5E5E5E; line-height: 1.6;">
                        Ya puedes crear tu primera tarjeta digital con código QR que funciona sin internet.
                    </p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="{APP_URL}/dashboard" class="btn">Crear mi primera tarjeta</a>
                    </div>
                    <p style="color: #808080; font-size: 14px;">
                        Si tienes alguna pregunta, no dudes en contactarnos.
                    </p>
                </div>
                <div class="footer">
                    <p>© 2026 Olivo Cards. Todos los derechos reservados.</p>
                    <p>Desarrollado por <a href="https://maldivasweb.com" style="color: #C5C51E;">MW Digital Estate</a></p>
                </div>
            </div>
        </body>
        </html>
        """
        return subject, html

    def get_subscription_template(self, user_name: str, plan_name: str, price: float, end_date: str) -> tuple:
        subject = f"¡Gracias por suscribirte al plan {plan_name}!"
        html = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{ font-family: 'Inter', Arial, sans-serif; background-color: #f5f5f5; margin: 0; padding: 20px; }}
                .container {{ max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; }}
                .header {{ background: #3C3C3C; padding: 30px; text-align: center; }}
                .header img {{ height: 50px; }}
                .content {{ padding: 40px 30px; }}
                .plan-box {{ background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #C5C51E; }}
                .btn {{ display: inline-block; background: #C5C51E; color: #000; padding: 14px 30px; text-decoration: none; border-radius: 4px; font-weight: 600; }}
                .footer {{ background: #f5f5f5; padding: 20px; text-align: center; color: #808080; font-size: 12px; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <img src="https://customer-assets.emergentagent.com/job_offline-qr-cards/artifacts/hhh3zakr_LOGO%20OLIVO%20CARDS.png" alt="Olivo Cards">
                </div>
                <div class="content">
                    <h1 style="color: #3C3C3C; margin-bottom: 20px;">¡Gracias por tu compra, {user_name}!</h1>
                    <p style="color: #5E5E5E; line-height: 1.6;">
                        Tu suscripción al plan <strong>{plan_name}</strong> ha sido activada exitosamente.
                    </p>
                    <div class="plan-box">
                        <h3 style="margin: 0 0 10px 0; color: #3C3C3C;">Detalles de tu plan:</h3>
                        <p style="margin: 5px 0; color: #5E5E5E;"><strong>Plan:</strong> {plan_name}</p>
                        <p style="margin: 5px 0; color: #5E5E5E;"><strong>Precio:</strong> ${price} USD</p>
                        <p style="margin: 5px 0; color: #5E5E5E;"><strong>Válido hasta:</strong> {end_date}</p>
                    </div>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="{APP_URL}/dashboard" class="btn">Ir a mi Dashboard</a>
                    </div>
                </div>
                <div class="footer">
                    <p>© 2026 Olivo Cards. Todos los derechos reservados.</p>
                    <p>Desarrollado por <a href="https://maldivasweb.com" style="color: #C5C51E;">MW Digital Estate</a></p>
                </div>
            </div>
        </body>
        </html>
        """
        return subject, html

    def get_new_card_template(self, user_name: str, card_name: str, card_id: str) -> tuple:
        subject = f"Tu nueva tarjeta '{card_name}' ha sido creada"
        html = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{ font-family: 'Inter', Arial, sans-serif; background-color: #f5f5f5; margin: 0; padding: 20px; }}
                .container {{ max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; }}
                .header {{ background: #3C3C3C; padding: 30px; text-align: center; }}
                .header img {{ height: 50px; }}
                .content {{ padding: 40px 30px; }}
                .card-box {{ background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center; }}
                .btn {{ display: inline-block; background: #C5C51E; color: #000; padding: 14px 30px; text-decoration: none; border-radius: 4px; font-weight: 600; margin: 5px; }}
                .btn-outline {{ display: inline-block; background: white; color: #3C3C3C; padding: 14px 30px; text-decoration: none; border-radius: 4px; font-weight: 600; border: 1px solid #C3C3C3; margin: 5px; }}
                .footer {{ background: #f5f5f5; padding: 20px; text-align: center; color: #808080; font-size: 12px; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <img src="https://customer-assets.emergentagent.com/job_offline-qr-cards/artifacts/hhh3zakr_LOGO%20OLIVO%20CARDS.png" alt="Olivo Cards">
                </div>
                <div class="content">
                    <h1 style="color: #3C3C3C; margin-bottom: 20px;">¡Nueva tarjeta creada!</h1>
                    <p style="color: #5E5E5E; line-height: 1.6;">
                        Hola {user_name}, tu tarjeta digital <strong>"{card_name}"</strong> ha sido creada exitosamente.
                    </p>
                    <div class="card-box">
                        <p style="color: #808080; margin-bottom: 15px;">Ya puedes compartir tu tarjeta con el código QR</p>
                        <a href="https://olivocards.com/card/{card_id}" class="btn">Ver mi tarjeta</a>
                        <a href="https://olivocards.com/dashboard" class="btn-outline">Ir al Dashboard</a>
                    </div>
                    <p style="color: #808080; font-size: 14px;">
                        Tip: Puedes descargar el código QR e imprimirlo o compartirlo digitalmente.
                    </p>
                </div>
                <div class="footer">
                    <p>© 2026 Olivo Cards. Todos los derechos reservados.</p>
                    <p>Desarrollado por <a href="https://maldivasweb.com" style="color: #C5C51E;">MW Digital Estate</a></p>
                </div>
            </div>
        </body>
        </html>
        """
        return subject, html

    def get_plan_expiring_template(self, user_name: str, plan_name: str, days_remaining: int, end_date: str) -> tuple:
        subject = f"Tu plan {plan_name} está por vencer"
        html = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{ font-family: 'Inter', Arial, sans-serif; background-color: #f5f5f5; margin: 0; padding: 20px; }}
                .container {{ max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; }}
                .header {{ background: #3C3C3C; padding: 30px; text-align: center; }}
                .header img {{ height: 50px; }}
                .content {{ padding: 40px 30px; }}
                .warning-box {{ background: #FFF3CD; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #C5C51E; }}
                .btn {{ display: inline-block; background: #C5C51E; color: #000; padding: 14px 30px; text-decoration: none; border-radius: 4px; font-weight: 600; }}
                .footer {{ background: #f5f5f5; padding: 20px; text-align: center; color: #808080; font-size: 12px; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <img src="https://customer-assets.emergentagent.com/job_offline-qr-cards/artifacts/hhh3zakr_LOGO%20OLIVO%20CARDS.png" alt="Olivo Cards">
                </div>
                <div class="content">
                    <h1 style="color: #3C3C3C; margin-bottom: 20px;">Tu plan está por vencer</h1>
                    <p style="color: #5E5E5E; line-height: 1.6;">
                        Hola {user_name}, queremos recordarte que tu suscripción al plan <strong>{plan_name}</strong> vence pronto.
                    </p>
                    <div class="warning-box">
                        <p style="margin: 0; color: #856404;">
                            <strong>⏰ Te quedan {days_remaining} día(s)</strong><br>
                            Tu plan vence el <strong>{end_date}</strong>
                        </p>
                    </div>
                    <p style="color: #5E5E5E; line-height: 1.6;">
                        Para continuar disfrutando de todos los beneficios de tu plan, te invitamos a renovar tu suscripción.
                    </p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="https://olivocards.com/dashboard/subscription" class="btn">Renovar mi plan</a>
                    </div>
                </div>
                <div class="footer">
                    <p>© 2026 Olivo Cards. Todos los derechos reservados.</p>
                    <p>Desarrollado por <a href="https://maldivasweb.com" style="color: #C5C51E;">MW Digital Estate</a></p>
                </div>
            </div>
        </body>
        </html>
        """
        return subject, html

# Global instance
email_service = EmailService()
