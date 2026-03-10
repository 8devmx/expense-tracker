# Dockerfile

# Usa una imagen base con Node.js y npm ya instalados
FROM node:20-alpine

# Establece el directorio de trabajo dentro del contenedor
WORKDIR /app

# Copia los archivos de configuración de dependencias
COPY package*.json ./

# Instala las dependencias del proyecto
# Este paso se beneficia del cache de Docker
RUN npm install

# Copia el resto del código de la aplicación
# (Este paso se ejecuta después de que el volumen está montado)
COPY . .

# Exponemos el puerto de la aplicación de React
EXPOSE 3000

# Comando por defecto para iniciar el servidor de desarrollo
# Es sobreescrito por la directiva 'command' de docker-compose.yml
CMD ["npm", "run", "dev"]
