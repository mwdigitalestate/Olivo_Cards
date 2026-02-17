import React from 'react';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { 
  User, 
  Phone, 
  Mail, 
  Building2, 
  Briefcase, 
  MapPin, 
  Globe,
  Image as ImageIcon
} from 'lucide-react';

export const VCardForm = ({ data, onChange }) => {
  const handleChange = (field, value) => {
    if (field.startsWith('social_links.')) {
      const socialField = field.split('.')[1];
      onChange({
        ...data,
        social_links: {
          ...data.social_links,
          [socialField]: value
        }
      });
    } else {
      onChange({ ...data, [field]: value });
    }
  };

  return (
    <div className="space-y-6" data-testid="vcard-form">
      {/* Personal Info */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
          <User className="w-5 h-5" />
          Información Personal
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="full_name">Nombre Completo *</Label>
            <Input
              id="full_name"
              value={data.full_name || ''}
              onChange={(e) => handleChange('full_name', e.target.value)}
              placeholder="Juan Pérez"
              data-testid="input-full-name"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="photo_url">URL de Foto</Label>
            <div className="relative">
              <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                id="photo_url"
                value={data.photo_url || ''}
                onChange={(e) => handleChange('photo_url', e.target.value)}
                placeholder="https://..."
                className="pl-10"
                data-testid="input-photo-url"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Contact Info */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
          <Phone className="w-5 h-5" />
          Contacto
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="phone">Teléfono *</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                id="phone"
                value={data.phone || ''}
                onChange={(e) => handleChange('phone', e.target.value)}
                placeholder="+52 55 1234 5678"
                className="pl-10"
                data-testid="input-phone"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                id="email"
                type="email"
                value={data.email || ''}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="juan@empresa.com"
                className="pl-10"
                data-testid="input-email"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Work Info */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
          <Building2 className="w-5 h-5" />
          Información Laboral
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="company">Empresa</Label>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                id="company"
                value={data.company || ''}
                onChange={(e) => handleChange('company', e.target.value)}
                placeholder="Acme Corp"
                className="pl-10"
                data-testid="input-company"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="job_title">Cargo</Label>
            <div className="relative">
              <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                id="job_title"
                value={data.job_title || ''}
                onChange={(e) => handleChange('job_title', e.target.value)}
                placeholder="Director de Ventas"
                className="pl-10"
                data-testid="input-job-title"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Address */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
          <MapPin className="w-5 h-5" />
          Dirección
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2 md:col-span-3">
            <Label htmlFor="address">Dirección</Label>
            <Input
              id="address"
              value={data.address || ''}
              onChange={(e) => handleChange('address', e.target.value)}
              placeholder="Av. Reforma 123, Col. Centro"
              data-testid="input-address"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="city">Ciudad</Label>
            <Input
              id="city"
              value={data.city || ''}
              onChange={(e) => handleChange('city', e.target.value)}
              placeholder="Ciudad de México"
              data-testid="input-city"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="country">País</Label>
            <Input
              id="country"
              value={data.country || ''}
              onChange={(e) => handleChange('country', e.target.value)}
              placeholder="México"
              data-testid="input-country"
            />
          </div>
        </div>
      </div>

      {/* Social Links */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
          <Globe className="w-5 h-5" />
          Redes Sociales
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="website">Sitio Web</Label>
            <Input
              id="website"
              value={data.social_links?.website || ''}
              onChange={(e) => handleChange('social_links.website', e.target.value)}
              placeholder="https://miempresa.com"
              data-testid="input-website"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="linkedin">LinkedIn</Label>
            <Input
              id="linkedin"
              value={data.social_links?.linkedin || ''}
              onChange={(e) => handleChange('social_links.linkedin', e.target.value)}
              placeholder="https://linkedin.com/in/usuario"
              data-testid="input-linkedin"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="twitter">Twitter</Label>
            <Input
              id="twitter"
              value={data.social_links?.twitter || ''}
              onChange={(e) => handleChange('social_links.twitter', e.target.value)}
              placeholder="https://twitter.com/usuario"
              data-testid="input-twitter"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="instagram">Instagram</Label>
            <Input
              id="instagram"
              value={data.social_links?.instagram || ''}
              onChange={(e) => handleChange('social_links.instagram', e.target.value)}
              placeholder="https://instagram.com/usuario"
              data-testid="input-instagram"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="facebook">Facebook</Label>
            <Input
              id="facebook"
              value={data.social_links?.facebook || ''}
              onChange={(e) => handleChange('social_links.facebook', e.target.value)}
              placeholder="https://facebook.com/usuario"
              data-testid="input-facebook"
            />
          </div>
        </div>
      </div>

      {/* Notes */}
      <div className="space-y-2">
        <Label htmlFor="notes">Notas adicionales</Label>
        <Textarea
          id="notes"
          value={data.notes || ''}
          onChange={(e) => handleChange('notes', e.target.value)}
          placeholder="Información adicional que quieras incluir..."
          rows={3}
          data-testid="input-notes"
        />
      </div>
    </div>
  );
};

export default VCardForm;
