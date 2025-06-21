# ./backend/Dockerfile

FROM node:22.16.0-alpine AS builder

WORKDIR /app

# Instala dependencias
COPY package*.json ./
RUN npm ci

# Copia todo el código
COPY . .

# Genera los tipos de Prisma antes del build
RUN npx prisma generate

# Opcional: aplica migraciones si vas a conectar a BD real
# RUN npx prisma migrate deploy

# Compila el proyecto (ahora sí, ya existen los tipos)
RUN npm run build

# Etapa final: solo para producción
FROM node:22.16.0-alpine

WORKDIR /app

# Copia solo lo necesario
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./

EXPOSE 3000
CMD ["node", "dist/main.js"]
