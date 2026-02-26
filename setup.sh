#!/bin/bash

# Script de configuración inicial del proyecto
# Ejecutar: bash setup.sh

set -e

echo "🚀 Configurando Sistema de Autenticación OAuth 2.0"
echo "=================================================="
echo ""

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para imprimir mensajes
print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Verificar Node.js
print_info "Verificando Node.js..."
if ! command -v node &> /dev/null; then
    print_error "Node.js no está instalado. Por favor instala Node.js 18+"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    print_error "Node.js 18+ requerido. Versión actual: $(node -v)"
    exit 1
fi
print_success "Node.js $(node -v) detectado"

# Verificar npm
print_info "Verificando npm..."
if ! command -v npm &> /dev/null; then
    print_error "npm no está instalado"
    exit 1
fi
print_success "npm $(npm -v) detectado"

echo ""
echo "📦 Instalando dependencias..."
echo ""

# Instalar API
print_info "Instalando dependencias de API..."
cd api-auth
npm install
print_success "API listo"
cd ..

# Instalar Web Public
print_info "Instalando dependencias de Astro..."
cd web-public
npm install
print_success "Astro listo"
cd ..

# Instalar Web Admin
print_info "Instalando dependencias de Next.js..."
cd web-admin
npm install
print_success "Next.js listo"
cd ..

echo ""
echo "⚙️  Configurando archivos de entorno..."
echo ""

# Crear .env files si no existen
if [ ! -f "api-auth/.env" ]; then
    cp api-auth/.env.example api-auth/.env
    print_success "Creado api-auth/.env"
else
    print_warning "api-auth/.env ya existe"
fi

if [ ! -f "web-public/.env" ]; then
    cp web-public/.env.example web-public/.env
    print_success "Creado web-public/.env"
else
    print_warning "web-public/.env ya existe"
fi

if [ ! -f "web-admin/.env.local" ]; then
    cp web-admin/.env.example web-admin/.env.local
    print_success "Creado web-admin/.env.local"
else
    print_warning "web-admin/.env.local ya existe"
fi

echo ""
echo "🗄️  Configurando base de datos..."
echo ""

# Instalar Prisma CLI globalmente si no está instalado
if ! command -v prisma &> /dev/null; then
    print_info "Instalando Prisma CLI..."
    npm install -g prisma
    print_success "Prisma CLI instalado"
fi

# Generar cliente Prisma
cd api-auth
print_info "Generando cliente Prisma..."
npx prisma generate
print_success "Cliente Prisma generado"
cd ..

echo ""
echo "=================================================="
print_success "¡Configuración completada!"
echo ""
echo "📋 Próximos pasos:"
echo ""
echo "1. Configura tus credenciales de Google OAuth:"
echo "   - Sigue la guía en GOOGLE_CLOUD_SETUP.md"
echo "   - Edita api-auth/.env con tus credenciales"
echo ""
echo "2. Configura Turso (base de datos):"
echo "   - Crea una base de datos en turso.tech"
echo "   - Edita api-auth/.env con las credenciales"
echo ""
echo "3. Inicia los servicios en terminales separadas:"
echo ""
echo "   Terminal 1 - API:"
echo "   cd api-auth && npm run dev"
echo ""
echo "   Terminal 2 - Astro:"
echo "   cd web-public && npm run dev"
echo ""
echo "   Terminal 3 - Next.js:"
echo "   cd web-admin && npm run dev"
echo ""
echo "4. Abre http://localhost:4321/login para probar"
echo ""
echo "📖 Documentación:"
echo "   - README.md - Guía completa"
echo "   - GOOGLE_CLOUD_SETUP.md - Configuración OAuth"
echo ""
