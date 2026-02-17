import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { 
  Phone, 
  Mail, 
  Building2, 
  MapPin, 
  Globe, 
  Linkedin, 
  Twitter, 
  Facebook, 
  Instagram,
  Download,
  Share2
} from 'lucide-react';
import { Button } from './ui/button';
import { cn } from '../lib/utils';

const generateVCardString = (vcard) => {
  const lines = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `FN:${vcard.full_name || ''}`,
    `TEL;TYPE=CELL:${vcard.phone || ''}`,
    `EMAIL:${vcard.email || ''}`,
  ];
  
  if (vcard.company) {
    lines.push(`ORG:${vcard.company}`);
  }
  
  if (vcard.job_title) {
    lines.push(`TITLE:${vcard.job_title}`);
  }
  
  const addressParts = [];
  if (vcard.address) addressParts.push(vcard.address);
  if (vcard.city) addressParts.push(vcard.city);
  if (vcard.country) addressParts.push(vcard.country);
  
  if (addressParts.length > 0) {
    lines.push(`ADR;TYPE=WORK:;;${addressParts.join(';')};;;;`);
  }
  
  const social = vcard.social_links || {};
  if (social.website) {
    lines.push(`URL:${social.website}`);
  }
  
  if (vcard.notes) {
    lines.push(`NOTE:${vcard.notes}`);
  }
  
  lines.push("END:VCARD");
  
  return lines.join("\n");
};

export const VCardPreview = ({ vcard, showActions = true, className }) => {
  const vcardString = generateVCardString(vcard);

  const handleDownloadVCard = () => {
    const blob = new Blob([vcardString], { type: 'text/vcard' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${vcard.full_name?.replace(/\s+/g, '_') || 'contact'}.vcf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const handleDownloadQR = () => {
    const svg = document.getElementById(`qr-${vcard.id}`);
    if (!svg) return;
    
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      
      const pngUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = pngUrl;
      link.download = `qr-${vcard.full_name?.replace(/\s+/g, '_') || 'contact'}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };
    
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/card/${vcard.id}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Tarjeta de ${vcard.full_name}`,
          text: `Mira la tarjeta digital de ${vcard.full_name}`,
          url: shareUrl,
        });
      } catch (err) {
        console.log('Share cancelled');
      }
    } else {
      navigator.clipboard.writeText(shareUrl);
      alert('Enlace copiado al portapapeles');
    }
  };

  const social = vcard.social_links || {};

  return (
    <div 
      className={cn("bg-white shadow-xl border-t-4 border-[#C5C51E] overflow-hidden max-w-md mx-auto", className)}
      data-testid="vcard-preview"
    >
      {/* Header with photo */}
      <div className="bg-[#3C3C3C] p-6 text-center">
        {vcard.photo_url ? (
          <img 
            src={vcard.photo_url} 
            alt={vcard.full_name}
            className="w-24 h-24 rounded-full mx-auto mb-4 object-cover border-4 border-white"
          />
        ) : (
          <div className="w-24 h-24 rounded-full mx-auto mb-4 bg-[#5E5E5E] flex items-center justify-center border-4 border-white">
            <span className="text-3xl font-semibold text-white">
              {vcard.full_name?.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
        <h2 className="text-2xl font-bold text-white" style={{ fontFamily: 'Playfair Display, serif' }}>
          {vcard.full_name || 'Nombre'}
        </h2>
        {vcard.job_title && (
          <p className="text-[#A2A2A2] mt-1">{vcard.job_title}</p>
        )}
        {vcard.company && (
          <p className="text-[#C5C51E] font-medium mt-1">{vcard.company}</p>
        )}
      </div>

      {/* Contact info */}
      <div className="p-6 space-y-4">
        {/* Phone */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#F5F5F5] rounded-full flex items-center justify-center">
            <Phone className="w-5 h-5 text-[#5E5E5E]" />
          </div>
          <div>
            <p className="text-xs text-[#808080] uppercase tracking-wider">Teléfono</p>
            <a href={`tel:${vcard.phone}`} className="text-[#3C3C3C] font-medium hover:text-[#C5C51E]">
              {vcard.phone || '-'}
            </a>
          </div>
        </div>

        {/* Email */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#F5F5F5] rounded-full flex items-center justify-center">
            <Mail className="w-5 h-5 text-[#5E5E5E]" />
          </div>
          <div>
            <p className="text-xs text-[#808080] uppercase tracking-wider">Email</p>
            <a href={`mailto:${vcard.email}`} className="text-[#3C3C3C] font-medium hover:text-[#C5C51E]">
              {vcard.email || '-'}
            </a>
          </div>
        </div>

        {/* Company */}
        {vcard.company && (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#F5F5F5] rounded-full flex items-center justify-center">
              <Building2 className="w-5 h-5 text-[#5E5E5E]" />
            </div>
            <div>
              <p className="text-xs text-[#808080] uppercase tracking-wider">Empresa</p>
              <p className="text-[#3C3C3C] font-medium">{vcard.company}</p>
            </div>
          </div>
        )}

        {/* Address */}
        {(vcard.address || vcard.city || vcard.country) && (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#F5F5F5] rounded-full flex items-center justify-center">
              <MapPin className="w-5 h-5 text-[#5E5E5E]" />
            </div>
            <div>
              <p className="text-xs text-[#808080] uppercase tracking-wider">Dirección</p>
              <p className="text-[#3C3C3C] font-medium">
                {[vcard.address, vcard.city, vcard.country].filter(Boolean).join(', ')}
              </p>
            </div>
          </div>
        )}

        {/* Social Links */}
        {(social.website || social.linkedin || social.twitter || social.facebook || social.instagram) && (
          <div className="pt-4 border-t border-[#C3C3C3]">
            <p className="text-xs text-[#808080] uppercase tracking-wider mb-3">Redes Sociales</p>
            <div className="flex gap-3">
              {social.website && (
                <a 
                  href={social.website} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-[#F5F5F5] rounded-full flex items-center justify-center hover:bg-[#E7E723]/20 transition-colors"
                >
                  <Globe className="w-5 h-5 text-[#5E5E5E]" />
                </a>
              )}
              {social.linkedin && (
                <a 
                  href={social.linkedin} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-[#F5F5F5] rounded-full flex items-center justify-center hover:bg-[#E7E723]/20 transition-colors"
                >
                  <Linkedin className="w-5 h-5 text-[#5E5E5E]" />
                </a>
              )}
              {social.twitter && (
                <a 
                  href={social.twitter} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-[#F5F5F5] rounded-full flex items-center justify-center hover:bg-[#E7E723]/20 transition-colors"
                >
                  <Twitter className="w-5 h-5 text-[#5E5E5E]" />
                </a>
              )}
              {social.facebook && (
                <a 
                  href={social.facebook} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-[#F5F5F5] rounded-full flex items-center justify-center hover:bg-[#E7E723]/20 transition-colors"
                >
                  <Facebook className="w-5 h-5 text-[#5E5E5E]" />
                </a>
              )}
              {social.instagram && (
                <a 
                  href={social.instagram} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-[#F5F5F5] rounded-full flex items-center justify-center hover:bg-[#E7E723]/20 transition-colors"
                >
                  <Instagram className="w-5 h-5 text-[#5E5E5E]" />
                </a>
              )}
            </div>
          </div>
        )}

        {/* QR Code */}
        <div className="pt-4 border-t border-[#C3C3C3]">
          <p className="text-xs text-[#808080] uppercase tracking-wider mb-3 text-center">
            Escanea para guardar contacto
          </p>
          <div className="flex justify-center">
            <div className="bg-white p-4 rounded-sm border border-[#C3C3C3]">
              <QRCodeSVG 
                id={`qr-${vcard.id}`}
                value={vcardString}
                size={160}
                level="M"
                includeMargin={false}
              />
            </div>
          </div>
          <p className="text-xs text-[#A2A2A2] text-center mt-2">
            Funciona sin conexión a internet
          </p>
        </div>

        {/* Actions */}
        {showActions && (
          <div className="pt-4 flex gap-2">
            <Button 
              onClick={handleDownloadVCard}
              className="flex-1 bg-[#3C3C3C] hover:bg-[#5E5E5E] text-white"
              data-testid="download-vcard-btn"
            >
              <Download className="w-4 h-4 mr-2" />
              Descargar
            </Button>
            <Button 
              onClick={handleDownloadQR}
              variant="outline"
              className="flex-1 border-[#A2A2A2]"
              data-testid="download-qr-btn"
            >
              <Download className="w-4 h-4 mr-2" />
              QR
            </Button>
            <Button 
              onClick={handleShare}
              variant="outline"
              className="border-[#A2A2A2]"
              data-testid="share-btn"
            >
              <Share2 className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default VCardPreview;
