import React, { useState } from 'react'
import { useAuthorization } from '../auth/useAuthorization';
import { HelpCircle, Lock, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';

export const LoginScreen = () => {
 const { processLogin } = useAuthorization();

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle login logic here
    console.log('Login attempt:', { email, password, rememberMe })
    processLogin(email,password);
  }
  return (
     <form onSubmit={handleSubmit} className="space-y-6">
      {/* Email Field */}
      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-medium text-gray-900">
          Correo Electrónico
        </label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            id="email"
            type="text"
            placeholder="ejemplo@empresa.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="pl-10 h-11 border-gray-200"
            required
          />
        </div>
      </div>

      {/* Password Field */}
      <div className="space-y-2">
        <label htmlFor="password" className="text-sm font-medium text-gray-900">
          Contraseña
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="pl-10 h-11 border-gray-200"
            required
          />
        </div>
      </div>

      {/* Remember Me & Forgot Password */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="remember"
            checked={rememberMe}
            onCheckedChange={(checked) => setRememberMe(checked as boolean)}
          />
          <label htmlFor="remember" className="text-sm text-gray-600 cursor-pointer">
            Recordarme
          </label>
        </div>
        <a href="#" className="text-sm font-medium text-blue-600 hover:text-blue-700">
          ¿Olvidó su contraseña?
        </a>
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-semibold"
      >
        Ingresar
      </Button>

      {/* Support Section */}
      <div className="pt-2 text-center space-y-3 border-t border-gray-200">
        <p className="text-sm text-gray-600">¿Necesita asistencia?</p>
        <button
          type="button"
          className="flex items-center justify-center gap-2 text-sm text-gray-700 hover:text-blue-600 font-medium"
        >
          <HelpCircle className="w-4 h-4" />
          Contactar Soporte IT
        </button>
      </div>
    </form>
  )
}

export default LoginScreen